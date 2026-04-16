<template>
  <div>
    <div style="margin: 10px 20px;">
      <el-form :rules="rules" ref="ruleForm" :model="dataForm" label-width="80px" class="template-form">
        <div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="编码:" prop="code">
                <el-input v-model="dataForm.code" :disabled="type == 'view' || type == 'edit'" size="small" placeholder="请输入模型编码"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="名称:" prop="name">
                <el-input v-model="dataForm.name" :disabled="type == 'view'" size="small" placeholder="请输入模型名称"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="描述:" prop="description">
                <el-input v-model="dataForm.description" :disabled="type == 'view'" size="small" placeholder="请输入模型描述"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div style="margin-left: 20px">
        <div style="margin-top: 10px">
          函数中仅能使用 ECMA 5.1 标准 支持的语法和函数。
        </div>
        <div id="javaScriptEditor" style="height: 300px; width: 100%; margin-top: 20px"></div>
      </div>

      <div style="margin-left: 20px">
        <div style="margin-top: 20px">
          函数参数列表
        </div>
        <el-table
          :data="calcModelParam"
          style="width: 100%; margin-top: 10px;  text-align: center">
          <el-table-column label="参数编码" width="150" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.code" :disabled="true" size="small" placeholder="请输入参数编码"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="参数说明" align="center">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name" :disabled="type == 'view'" size="small" placeholder="请输入参数说明"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="参数来源" align="center">
            <template slot-scope="scope">
              <el-select v-model="scope.row.from" style="width: 100%;">
                <el-option
                  v-for="item in paramsFrom"
                  :disabled="type == 'view'"
                  size="small"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import 'ace-builds/src-noconflict/ace.js';
import 'ace-builds/src-noconflict/mode-javascript.js';
import 'ace-builds/src-noconflict/theme-chrome.js';

export default {
  name: "calcModelAdd",
  data() {
    return {
      type: 'add',
      hasJsonFlag: true, // json是否验证通过 （true为通过，false为失败）
      jsonobj: {},
      dataForm: {
        code: '',
        name: '',
        description: '',
        calc: '',
      },
      calcModelParam: [], // 自定义参数
      paramsFrom: [], // 参数来源
      rules: {
        code: [
          {
            required: true,
            message: "请输入模型编码",
            trigger: 'blur'
          },
          { max: 50, message: '输入内容超出限制，请重新编辑。', trigger: 'blur' },
          {
            pattern: /^[a-zA-Z]+$/,
            message: '输入内容必须是字母',
            trigger: 'blur'
          }
        ],
        name: [
          {
            required: true,
            message: "请输入模型名称",
            trigger: 'blur'
          },
          { max: 100, message: '输入内容超出限制，请重新编辑。', trigger: 'blur' }
        ],
        description: [
          {
            required: true,
            message: "请输入模板描述",
            trigger: 'blur'
          },
          { max: 150, message: '输入内容超出限制，请重新编辑。', trigger: 'blur' }
        ]
      },
    }
  },
  mounted() {
    this.paramsFrom = this.$store.state.dict.dictDatas.calc_model_param_from
    this.initJavaScriptEditor();
  },
  methods: {
    initJavaScriptEditor() {
      const editor = window.ace.edit("javaScriptEditor");
      editor.setTheme("ace/theme/textmate"); // 设置主题为"chrome"
      editor.session.setMode("ace/mode/javascript");
      let timeoutId;
      editor.on('change', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.updateCalcModelParamFromEditor(editor.getValue());
        }, 100); // 延迟 100ms 处理
      });
    },
    updateJavaScriptEditor(data) {
      const editor = window.ace.edit("javaScriptEditor");
      // 设置编辑器的只读状态
      editor.setReadOnly(this.type == 'view');
      if (data && data != '') {
        editor.setValue(data, -1);
      } else {
        editor.setValue("//示例\n" +
          "function TriangleArea(a, b, c) {\n" +
          "    // 计算三角形的半周长\n" +
          "    var p = (a + b + c) / 2;\n" +
          "\n" +
          "    // 使用海伦公式计算面积\n" +
          "    var area = Math.sqrt(p * (p - a) * (p - b) * (p - c));\n" +
          "\n" +
          "    return area;\n" +
          "}", -1);
      }
    },
    // 更新 calcModelParam 从编辑器内容
    updateCalcModelParamFromEditor(content) {
      const functionRegex = /function\s+\w+\s*\(([^)]*)\)/;
      const match = content.match(functionRegex);

      if (!match) {
        this.calcModelParam = [];
        return;
      }

      const paramList = match[1].split(',').map(param => param.trim()).filter(param => param);
      this.calcModelParam = paramList.map((code, index) => ({
        code: code,
        name: this.calcModelParam.find(p => p.code === code)?.name || '',
        from: this.calcModelParam.find(p => p.code === code)?.from || 'default'
      }));
    },
    // 初始化form
    initCalcModelForm(data, type) {
      this.type = type;
      this.dataForm = data;
      this.calcModelParam = data.calcModelParam ? JSON.parse(data.calcModelParam) : [];
      this.updateJavaScriptEditor(data.calc); // 设置初始值
    },
    // 校验模型参数是否合规
    checkCalcModelParam() {
      const editor = window.ace.edit("javaScriptEditor");
      const content = editor.getValue();

      // 格式校验
      if (!this.validateFunctionFormat(content)) {
        this.$message.warning("函数格式不正确，请检查");
        return false;
      }

      // 入参命名唯一性校验
      if (!this.validateUniqueParams(this.calcModelParam)) {
        this.$message.warning("函数参数命名重复，请检查");
        return false;
      }

      // 校验模型参数说明是否合规
      let status = true;
      this.calcModelParam.forEach(item => {
        if (item.name == '') {
          status = false;
        }
      });

      if (!status) {
        this.$message.warning("模型参数说明不合规，请检查");
      }
      return status;
    },
    // 校验函数格式
    validateFunctionFormat(content) {
      const functionRegex = /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*return\s+[^;]+;[\s\S]*\}/;
      return functionRegex.test(content);
    },
    // 校验入参命名唯一性
    validateUniqueParams(params) {
      const paramSet = new Set();
      for (const param of params) {
        if (paramSet.has(param.code)) {
          return false;
        }
        paramSet.add(param.code);
      }
      return true;
    },
  }
}
</script>

<style scoped>
.template-form ::v-deep .el-textarea__inner {
  resize: none;
  min-height: 111.6px !important;
}

.product-form ::v-deep .el-form-item__label {
  color: #3f4448;
  font-weight: 400;
}

.el-form-item .el-select {
  width: 100%;
}

.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
