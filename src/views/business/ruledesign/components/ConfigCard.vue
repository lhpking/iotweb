<template>
  <div class="flow-config-card">
    <div class="config-header" v-if="type != 'view'">
      <a @click="upload" title="保存配置" class="el-icon-receiving">
      </a>
      <a @click="save" title="暂存至浏览器" class="el-icon-folder-checked">
      </a>
      <a @click="restore" title="恢复浏览器数据" class="el-icon-refresh-left">
      </a>
    </div>
    <div class="config-body">
      <el-divider><div class="config-title">{{ title }}</div></el-divider>
      <SchemaForm :node="node" :type="type" @saveSchemaForm="saveSchemaForm"/>
    </div>
  </div>
</template>

<script>
import SchemaForm from './SchemaForm.vue'

export default {
  components: {
    SchemaForm,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      title: '',
    }
  },
  watch: {
    node: {
      handler(newVal) {
        if (newVal.data) {
          if (newVal.data.label) {
            this.title = newVal.data.label
          } else {
            this.title = '请选择节点'
          }
        } else {
          this.title = '请选择节点'
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    save() {
      this.$emit('save')
    },
    upload() {
      this.$emit('upload')
    },
    restore() {
      this.$emit('restore')
    },
    saveSchemaForm(id, data, record) {
      this.$emit('saveSchemaForm', id, data, record)
    },
  },
}
</script>

<style lang="scss">
.flow-config-card {
  color: #fff;
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  position: relative;
  border-left: 1px solid #ccc;
  .config-header {
    padding: 12px 24px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    font-size: 20px;
    position: sticky; /* 固定头部 */
    top: 0; /* 固定在顶部 */
    background-color: #409eff; /* 确保背景颜色覆盖 */
    z-index: 10; /* 确保在内容之上 */
    a {
      color: #fff;
      cursor: pointer;
    }
  }
  .config-title {
    margin-bottom: 12px;
    text-align: center;
    font-size: 20px;
    white-space: nowrap;
  }
  .config-body {
    padding: 0 12px;
    color: #000000b3;
  }
  .ant-btn-primary {
    margin-top: 12px;
  }
  .schema-form {
    .ant-form {
      color: #fff;
    }
  }
}
</style>
