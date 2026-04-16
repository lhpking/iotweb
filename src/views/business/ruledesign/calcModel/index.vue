<template>
  <div style="margin: 20px">
    <div style="margin-top: 5px">
      <el-form ref="gridHeadLayout" :inline="true" :model="formInline" class="demo-form-inline custom-form">
        <el-form-item>
          <el-input
            v-model="formInline.code"
            size="mini"
            placeholder="请输入模型编码">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="formInline.name"
            size="mini"
            placeholder="请输入模型名称">
          </el-input>
        </el-form-item>
        <el-form-item class="top-button">
          <el-button size="mini" @click="handleSearch" icon="el-icon-search"></el-button>
          <el-button size="mini" @click="handleEmpty" icon="el-icon-refresh-right"></el-button>
        </el-form-item>
        <el-button size="mini" type="primary" @click="handleAdd" class="add-button">新增计算模型</el-button>
      </el-form>
    </div>

    <div>
      <div style="height: calc(100vh - 285px);" v-if="tableData.length!=0">
        <el-row :gutter="10">
          <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="(item, index) in tableData" :key="index">
            <el-card shadow="always" style="margin: 5px; padding-bottom: 10px;" :class="{'record-success': item.status == 1, 'record-danger': item.status == 0}">
              <div style="position: relative; border-bottom: 1px solid #ccc; padding-bottom: 20px;height: 100px;">
              <span style="position:absolute; top: 10px">
                <!-- 根据 appType 的值显示不同的图片 -->
                <img style="height: 70px; width: 70px" :src="require(`@/assets/calcModel.png`)" alt="图片" />
                <!-- 添加更多条件根据需要显示不同的图片 -->
              </span>
                <span style="position: absolute; top: 0; left: 80px; margin-left: 10px">
                <strong style="font-size: 18px">{{ item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name }}</strong>
                </span>
                <el-tooltip class="item" effect="dark" content="编辑" placement="top" v-if="item.status == 0">
                  <a style="font-size: 14px; position: absolute; right: 0" @click="handleEdit(item)">
                    <span class="el-icon-setting" style="font-size: 18px;color: #1677FF"></span>
                  </a>
                </el-tooltip>
                <span style="position: absolute; top: 39px; left: 80px; margin-left: 10px;font-size: 14px">
                <span style="color: #646a73">编码：</span>
                <span style="color: #1677ff;">
                  {{ item.code }}
                </span>
              </span>
                <span style="position: absolute; top: 69px; left: 80px; margin-left: 10px;font-size: 14px">
                <span style="color: #1677ff;">
                  {{ item.description }}
                </span>
              </span>
              </div>
              <div style="margin-top: 10px;">
                <div style="float: left">
                  <el-button type="primary" size="small" @click="updateStatus(item)" v-if="item.status == 1">禁 用</el-button>
                  <el-button type="primary" @click="updateStatus(item)" size="small" v-if="item.status == 0">启 用</el-button>
                  <el-button @click="handleClone(item)" size="small" type="primary">克 隆</el-button>
                  <el-button size="small" @click="handleDeleted(item)" v-if="item.status == 0">删 除</el-button>
                </div>
                <div style="float: right">
                  <el-button type="text" @click="handleView(item)" size="small">更多信息</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <el-pagination
        v-if="tableData.length!=0"
        background
        :current-page="page.currentPage"
        :page-sizes="[12, 24, 36, 48, 120]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="page.total"
        :page-size="page.pageSize"
        :pager-count="5"
        @size-change="changeSize"
        @current-change="changeCurrent"
        style="float: right; margin: 20px 0;">
      </el-pagination>
      <el-empty
        v-if="tableData.length==0"
        style="width: 100%; margin-top: 50px"
        description="暂无数据"
        :image-size="120"
      ></el-empty>
    </div>

    <el-dialog
        v-dialog-drag
        :title="'计算模型'"
        :modal-append-to-body="false"
        :close-on-click-modal="false"
        :visible.sync="calcModelAddShow"
        width="30%"
        @close="cancelDialog"
        class="custom-dialog"
        style="height: 80vh; overflow-y: auto;"
    >
      <CalcModelAddDialog
          ref="calcModelAdd">
      </CalcModelAddDialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDialog">取 消</el-button>
        <el-button type="primary" @click="save" v-if="showType != 'view'">保 存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import {getCalcModelPage, remove, submit, updateStatusById} from '@/api/ruledesign/calcModel'
import CalcModelAddDialog from "./component/calcModelAddDialog.vue";

export default {
  name: "calcModelIndex",
  components: {
    CalcModelAddDialog
  },
  data() {
    return {
      showType: 'add',
      tableLoading: false,
      calcModelAddShow: false,
      formInline: {
        name: '',
        code: ''
      }, // 搜索过滤数据
      tableData: [], // 列表数据
      selectionList: [], // 选择列表数据
      pushMethodDict: [], // 推送方式字典
      userTypeDict: [], // 用户类型字典
      page: {
        pageSize: 12 ,
        currentPage: 1,
        total: 0
      }
    }
  },
  mounted() {
    this.onLoad()
  },
  methods: {
    cancelDialog() {
      this.calcModelAddShow = false;
      this.$refs.calcModelAdd.$refs.ruleForm?.resetFields();
    },
    // 点击确定
    save() {
      const editor = window.ace.edit("javaScriptEditor");
      this.$refs.calcModelAdd.dataForm.calc = editor.getValue();
      // this.dataForm.calc = this.$refs.calcModelAdd.getEditorValue()
      this.$refs.calcModelAdd.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          // 校验模板参数是否合规
          if (!this.$refs.calcModelAdd.checkCalcModelParam()) {
            return
          }
          this.$refs.calcModelAdd.dataForm.calcModelParam = JSON.stringify(this.$refs.calcModelAdd.calcModelParam)
          submit(this.$refs.calcModelAdd.dataForm).then(res => {
            if (res.code === 0) {
              this.$message.success("操作成功")
              this.cancelDialog()
              this.onLoad()
            } else {
              this.$message.error("操作失败")
            }
          }).catch(error => {
          })
        }
      })
    },
    // 点击新增
    handleAdd() {
      this.showType = 'add'
      this.calcModelAddShow = true
      this.$nextTick(() => {
        this.$refs.calcModelAdd.initCalcModelForm({
          id: null,
          code: '',
          name: '',
          status: 0,
          description: '',
          calcModelParam: "[]",
          calc: ''
        }, this.showType)
      })
    },
    // 点击编辑
    handleEdit(row) {
      this.showType = 'edit'
      const data = {...row}
      this.calcModelAddShow = true
      this.$nextTick(() => {
        this.$refs.calcModelAdd.initCalcModelForm(data, this.showType)
      })
    },
    handleView(row) {
      this.showType = 'view'
      const data = {...row}
      this.calcModelAddShow = true
      this.$nextTick(() => {
        this.$refs.calcModelAdd.initCalcModelForm(data, this.showType)
      })
    },
    // 点击克隆
    handleClone(row) {
      this.showType = 'add'
      const data = {...row }
      data.id = null
      data.code = ''
      data.status = 0
      this.calcModelAddShow = true
      this.$nextTick(() => {
        this.$refs.calcModelAdd.initCalcModelForm(data, this.showType)
      })
    },
    // 点击启用禁用
    updateStatus(row) {
      updateStatusById(row.id).then(res => {
        if (res.data) {
          this.$message.success("操作成功")
          this.onLoad()
        } else {
          this.$message.error("操作失败")
        }
      })
    },
    // 点击行删除
    handleDeleted(row) {
      this.$confirm("确定将选择数据删除", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        remove(row.id).then(res => {
          if (res.data) {
            this.$message.success("删除成功")
            this.onLoad()
          } else {
            this.$message.error("删除失败")
          }
        })
      })
    },
    changeCurrent (val) {
      this.page.currentPage = val
      this.onLoad()
    },
    changeSize (val) {
      this.page.pageSize = val
      this.onLoad()
    },
    handleSearch() {
      this.onLoad()
    },
    handleEmpty() {
      this.formInline = {}
      this.onLoad()
    },
    onLoad() {
      this.tableLoading = true
      getCalcModelPage(this.page.currentPage, this.page.pageSize, this.formInline).then(res => {
        const data = res.data
        this.tableData = data.records
        this.page.total = data.total
        this.tableLoading = false
      })
    }
  }
};
</script>
<style scoped>
.custom-form {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.top-button ::v-deep .el-button + .el-button {
  margin-left: 0;
}

.add-button {
  margin-top: -20px;
  margin-left: auto;
}
.record-danger {
  background: linear-gradient(40deg, #fff, #f4f4f5, #e9e9ed);
}

.record-success {
  background: linear-gradient(40deg, #fff, #eef6ff, #b3d9ff);;
}
</style>
