<template>
  <el-container class="el-container">
    <el-header style="padding: 20px 0px;">
      <el-form ref="gridHeadLayout" :inline="true" :model="dataForm" class="demo-form-inline" style="margin-left: 20px">
        <el-form-item>
          <el-input
            style="width: 370px;"
            :disabled="nameEdit"
            v-model="dataForm.ruleName"
            placeholder="请输入规则名称">
            <el-button v-if="type != 'view'" slot="append" icon="el-icon-edit" @click="nameEdit = !nameEdit"></el-button>
          </el-input>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <div class="flow">
        <flow-sidebar class="sidebar" :type="type"></flow-sidebar>
        <div id="drawflow" @drop="drop" @dragover="allowDrop"></div>
        <div class="config-card">
          <ConfigCard
            :node="selectNode"
            :type="type"
            @save="onSave"
            @restore="onRestore"
            @upload="uploadNodes"
            @saveSchemaForm="saveSchemaForm"
          ></ConfigCard>
        </div>
        <div class="controls">
          <a v-if="isLock" @click="changeLock" title="解锁" class="el-icon-unlock"/>
          <a v-else @click="changeLock" title="锁定" class="el-icon-lock"/>
          <a @click="zoomReset" title="恢复" class="el-icon-refresh"/>
          <a @click="zoomOut" title="缩小" class="el-icon-zoom-out"/>
          <a @click="zoomIn" title="放大" class="el-icon-zoom-in"/>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import Vue from 'vue'
import Drawflow from 'drawflow'
import FlowSidebar from './components/FlowSidebar.vue'
import ConfigCard from './components/ConfigCard.vue'
import BasicNode from './components/BasicNode.vue'
import serializedUpload from '@/utils/uploadData'
import {getRule, submit, runRule} from '@/api/ruledesign/ruledesign'

export default {
  components: {
    FlowSidebar,
    ConfigCard,
  },
  data() {
    return {
      nameEdit: true,
      editor: {},
      lang: 'zh',
      id: null,
      type: 'add',
      isLock: false,
      properties: [],
      schemaDesc: '',
      selectNode: {},
      dataForm: {
        ruleName: ''
      },
      isSelectNode: false,
      flowData: {}
    }
  },
  mounted() {
    const drawflow = document.getElementById('drawflow')
    this.editor = new Drawflow(drawflow, Vue)
    this.editor.registerNode('BasicNode', BasicNode, {}, {})
    this.editor.start()
    // 使用 Vue.prototype 添加全局属性
    Vue.prototype.$df = this.editor;
    // 监听节点选中事件
    this.editor.on('nodeSelected', (nodeId) => {
      const data = this.editor.getNodeFromId(nodeId)
      this.selectNode = data
      this.isSelectNode = true
    })

    // 监听节点取消选中事件
    this.editor.on('nodeUnselected', () => {
      this.isSelectNode = false
      this.selectNode = {}
    })

    // 获取query参数，根据id渲染画布
    this.id = this.$route.query.id;
    this.type = this.$route.query.type;
    if (this.id) {
      this.loadRule(this.id)
    }
  },
  watch: {
    editor: {
      handler(newVal) {
        if (newVal.editor_mode === 'fixed') {
          this.isLock = true
        } else {
          this.isLock = false
        }
      },
      deep: true,
    },
  },
  methods: {
    loadRule(id) {
      getRule(id).then(res => {
        this.dataForm = res.data
        this.flowData = JSON.parse(res.data.drawFlowJson)
        // const nodes = deserializeNodes(flowData.graph)
        this.editor.import(this.flowData)
      })
    },
    allowDrop(ev) {
      ev.preventDefault()
    },
    drop(ev) {
      ev.preventDefault()
      const name = ev.dataTransfer.getData('getNodeName')
      const label = ev.dataTransfer.getData('getNodeLabel')
      const type = ev.dataTransfer.getData('getType')
      const nodeType = ev.dataTransfer.getData('getNodeType')
      const Schema = JSON.parse(localStorage.getItem('nodeGroups'))
      const _schema = Schema[type]
      const currentSchema = _schema[name]
      this.properties = JSON.parse(currentSchema.properties)
      this.schemaDesc = currentSchema.description
      this.addNodeToDrawFlow(name, ev.clientX, ev.clientY, label, type, nodeType, this.properties, this.schemaDesc)
    },
    addNodeToDrawFlow(name, pos_x, pos_y, label, type, nodeType, properties, schemaDesc) {
      if (this.editor.editor_mode !== 'fixed') {
        pos_x =
          pos_x * (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom)) -
          this.editor.precanvas.getBoundingClientRect().x *
          (this.editor.precanvas.clientWidth / (this.editor.precanvas.clientWidth * this.editor.zoom))
        pos_y =
          pos_y * (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom)) -
          this.editor.precanvas.getBoundingClientRect().y *
          (this.editor.precanvas.clientHeight / (this.editor.precanvas.clientHeight * this.editor.zoom))
        // 此处input代表画布中一个节点的输入端点个数 output代表输出端点个数
        // type值的配置在loadDndNode.js中
        let input = 0
        let output = 0
        let className = ''
        switch (type) {
          //节点类型为输出类  即源类型
          case 'source':
            input = 0
            output = 1
            className = 'is-source'
            break
          //节点类型为输入类  即sink
          case 'sink':
            input = 1
            output = 0
            className = 'is-sink'
            break
          //节点类型为处理类型  即operator
          case 'operator':
            input = 1
            output = 1
            className = 'is-operator'
            break
          default:
            break
        }

        this.editor.addNode(
          name,
          input,
          output,
          pos_x,
          pos_y,
          `BasicNode ${className}`,
          {
            name,
            label,
            type,
            nodeType,
            properties,
            schemaDesc,
          },
          'BasicNode',
          'vue',
        )
      }
    },
    //画布右侧配置面板保存
    saveSchemaForm(id, data, record) {
      this.editor.updateNodeDataFromId(id, {
        ...data,
        record: record,
      });
      this.$message.success('节点配置保存成功');
    },
    //保存在浏览器缓存
    onSave() {
      const exportValue = this.editor.export()
      console.log('原始数据', exportValue)
      this.$message.success('本地保存成功')
      localStorage.setItem('flowKey', JSON.stringify(exportValue))
    },
    //从浏览器缓存恢复到画布
    onRestore() {
      this.$message.success('数据恢复成功')
      const flow = JSON.parse(localStorage.getItem('flowKey'))
      this.editor.import(flow)
    },
    //调用后端接口保存配置信息
    uploadNodes() {
      //规则名称校验
      if (!this.dataForm.ruleName) {
        this.$message.warning("请填写规则名称")
        return;
      }
      //获取画布整体json数据
      const exportValue = this.editor.export()
      //获取画布数据中的节点数据
      const data = exportValue.drawflow.Home.data
      //将drawflow组件的json数据转换为规则引擎所需json格式即规则引擎的图规则json
      const flowData = serializedUpload(data)
      console.log('接口保存数据', flowData)
      localStorage.setItem('flowData', JSON.stringify(flowData))

      const body = {
        id: this.id,
        ruleName: this.dataForm.ruleName,
        flowData: JSON.stringify(flowData),
        drawFlowJson: JSON.stringify(exportValue)
      }
      submit(body).then((res) => {
        this.$message.success("保存成功")
        this.id = res.data.id
        this.loadRule(res.data.id)
      }).catch(() => {
      })
    },
    changeLock() {
      this.isLock = !this.isLock
      if (this.isLock) {
        this.editor.editor_mode = 'fixed'
      } else {
        this.editor.editor_mode = 'edit'
      }
    },
    zoomOut() {
      this.editor.zoom_out()
    },
    zoomReset() {
      this.editor.zoom_reset()
    },
    zoomIn() {
      this.editor.zoom_in()
    },
  },
}
</script>

<style lang="scss">
.flow {
  display: flex;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  height: calc(86vh - 10px);
  .sidebar {
    width: 16%;
    height: 100%;
    border-right: 1px solid #ccc;
    padding: 0 12px;
  }
  .config-card {
    width: 20%;
    height: 100%;
  }
  #drawflow {
    display: block;
    position: relative;
    width: 64%;
    height: 100%;
  }
  .controls {
    position: absolute;
    top: 8%;
    right: 21%;
    font-size: 25px;
    a {
      margin-right: 20px;
      cursor: pointer;
    }
  }
}
.drawflow .drawflow-node{
  min-height: 50px;
  border-width: 4px 1px 1px 1px;
}
.drawflow .drawflow-node.is-source, .drawflow .drawflow-node.is-source.selected {
  border-color: #0082ff;
}
.drawflow .drawflow-node.is-operator, .drawflow .drawflow-node.is-operator.selected{
  border-color: #d7651f;
}
.drawflow .drawflow-node.is-sink, .drawflow .drawflow-node.is-sink.selected {
    border-color: #00b173;
}
</style>
