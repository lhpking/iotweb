<template>
  <div class="schema-form">
    <p class="schema-form-desc">{{ schemaDesc }}</p>
    <el-form ref="form" :rules="rules" :model="record" v-if="schema.length" label-position="top" :disabled="type == 'view'">
      <el-row :gutter="20">
        <el-col v-for="(property, index) in schema" :key="property.name" :span="24">
          <el-form-item :prop="property.name" :show-message="true">
            <template v-slot:label>
              {{ property.label }}
              <el-tooltip max-width="150px" effect="light" placement="top" :content="property.hint">
                <i class="el-icon-question"></i>
              </el-tooltip>
            </template>
            <!-- String -->
            <el-input
              v-if="property.control === 'text' && property.type !== 'int'"
              v-model="record[property.name]"
              :type="property.name === 'password' ? 'password' : 'text'"
              :password="property.name === 'password'"
              :placeholder="property.default ? property.default.toString() : ''"
            ></el-input>
            <!-- Textarea -->
            <el-input
              v-if="property.control === 'textarea' && property.type !== 'int'"
              v-model="record[property.name]"
              type="textarea"
              :rows="3"
              :placeholder="property.default ? property.default.toString() : ''"
            ></el-input>
            <!-- Number -->
            <el-input
              v-model.number="record[property.name]"
              v-if="property.control === 'text' && property.type === 'int'"
              type="number"
              :placeholder="property.default ? property.default.toString() : ''"
            ></el-input>
            <!-- Boolean -->
            <div class="radio-control" v-if="property.control === 'radio' && property.type === 'bool'">
              <span class="radio-item">
                <input :id="`true-${index}-radio`" type="radio" v-model="record[property.name]" :value="true" />
                <label :for="`true-${index}-radio`">True</label>
              </span>
              <span class="radio-item">
                <input :id="`false-${index}-radio`" type="radio" v-model="record[property.name]" :value="false" />
                <label :for="`false-${index}-radio`">False</label>
              </span>
            </div>
            <el-select
              v-if="property.control === 'select'"
              v-model="record[property.name]"
              :placeholder="property.default ? property.default.toString() : ''"
              clearable
            >
              <el-option
                v-for="(item, index) in property.values"
                :key="index"
                :value="item.label ? item.value : item"
                :label="item.label ? item.label : item"
              ></el-option>
            </el-select>
            <!--下拉字典-->
            <el-select
              v-if="property.control === 'selectDict'"
              v-model="record[property.name]"
              :placeholder="property.default ? property.default.toString() : ''"
              clearable
            >
              <el-option
                v-for="(item, index) in property.values"
                :key="index"
                :value="item.label ? Number(item.value) : item"
                :label="item.label ? item.label : item"
              >
                <span style="float: left">{{ item.label }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
              </el-option>
            </el-select>
            <el-select
              v-if="property.control === 'col_selector' && property.type === 'array'"
              v-model="record[property.name]"
              :placeholder="property.default ? property.default.toString() : ''"
              filterable
              multiple
              allow-create
              @change="(val) => handleCreateColSelector(val, property.name)"
            >
              <el-option v-for="(value, index) in property.values" :key="index" :value="value">{{ value }}</el-option>
            </el-select>
            <el-select
              v-if="property.control === 'list' && property.type === 'list_string'"
              v-model="record[property.name]"
              :placeholder="property.default ? property.default.toString() : ''"
              filterable
              multiple
              allow-create
              @change="(val) => handleCreateColSelector(val, property.name)"
            >
              <el-option v-for="(value, index) in property.values" :key="index" :value="value">{{ value }}</el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="schema.length && type != 'view'">
        <el-button type="primary" size="small" html-type="submit" @click="save"> 保存 </el-button>
      </el-form-item>
    </el-form>
    <p v-if="!schema.length" class="no-config">暂无配置项</p>
  </div>
</template>

<script>
export default {
  name: 'SchemaForm',
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
      lang: 'zh',
      schema: [],
      schemaDesc: '',
      record: {},
      rules: {}
    }
  },
  watch: {
    node: {
      handler(newVal) {
        if (newVal.data) {
          if (newVal.data.properties) {
            this.schema = newVal.data.properties;
            this.rules = {}
            this.schema.forEach((item) => {
              //如果当前对象的控件类型为selectDict,则通过type获取对应的字典数据并加载到item.values属性中
              if (item.control === 'selectDict') {
                item.values = this.$store.state.dict.dictDatas[item.type]
              }
              //遍历schema，将schema数组中的每个对象的optional属性进行判断，如果是false,则将对应的属性的rules属性设置为{required:true,message:`${item.label}不能为空`,trigger:'blur'}
              if (item.optional === false) {
                this.rules[item.name] = [{ required: true, message: `${item.label}不能为空`, trigger: 'blur' }];
              }
            });
          } else {
            this.schema = [];
            this.rules = {}
          }
          if (newVal.data.schemaDesc) {
            this.schemaDesc = newVal.data.schemaDesc;
          } else {
            this.schemaDesc = '';
          }
          if (newVal.data.record) {
            this.record = newVal.data.record;
          } else {
            this.record = {};
          }
        } else {
          this.schema = [];
          this.schemaDesc = '';
          this.rules = {}
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    handleCreateColSelector(val, name) {
      this.schema.forEach((item) => {
        if (item.name === name) {
          if (!item.values.includes(val)) {
            item.values.push(val);
          }
        }
      });
    },
    save() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.$emit('saveSchemaForm', this.node.id, this.node.data, this.record)
        }
      });
    },
  },
}
</script>

<style lang="scss">
.schema-form {
  .schema-form-desc {
    text-align: left;
  }
  .el-form {
    .el-form-item__label {
      color: #000000b3;
    }
    .el-tooltip__trigger {
      &.field-help {
        cursor: pointer;
        font-size: 16px;
        position: relative;
        top: 3px;
        left: 2px;
      }
    }
    .el-button {
      margin-bottom: 10px;
    }
  }
  .no-config {
    text-align: left;
  }
}
</style>
