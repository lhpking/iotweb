<template>
  <div>
    <el-row>
      <el-col>
        <div style="display: flex; justify-content: space-between; font-size: 16px; padding-bottom: 5px; margin-top: 20px">
          <div>
            <el-form ref="gridHeadLayout" :inline="true" :model="queryParams" class="demo-form-inline" style="margin-left: 20px">
              <el-form-item>
                <el-input
                  v-model="queryParams.ruleName"
                  size="mini"
                  placeholder="请输入规则名称">
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-select v-model="queryParams.status" size="mini" placeholder="请选择是否启用">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="top-button">
                <el-button size="mini" icon="el-icon-search" @click="handleQuery"></el-button>
                <el-button size="mini" icon="el-icon-refresh-right" @click="resetQuery"></el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="top-button">
            <el-button size="mini" type="primary" style="margin-right: 20px" @click="handleAdd">新增规则编排</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <div style="margin-left: 20px">
      <div style="max-height: calc(100vh - 285px);height: calc(100vh - 285px); overflow: auto;" v-if="ruleDesignList.length!=0">
        <el-row>
          <el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="6" v-for="(item, index) in ruleDesignList" :key="index">
            <el-card shadow="always" style="margin: 5px; padding-bottom: 10px;" :class="{'record-success': item.status == 1, 'record-danger': item.status == 0}">
              <div style="position: relative; border-bottom: 1px solid #ccc; padding-bottom: 20px;height: 90px;">
                      <span style="position:absolute; top: 10px">
                        <img style="height: 70px; width: 70px" src="@/assets/ruleDesign.png"/>
                      </span>
                <span style="position: absolute; top: 10px; left: 80px; margin-left: 10px">
                        <strong style="font-size: 18px">{{
                            item.ruleName.length > 15 ? item.ruleName.substring(0, 15) + '...' : item.ruleName
                          }}</strong>
                      </span>
                <el-tooltip class="item" effect="dark" content="编辑" placement="top" v-if="item.status == 0">
                  <a style="font-size: 14px; position: absolute; right: 0" @click="handleUpdate(item)">
                    <span class="el-icon-setting" style="font-size: 18px;color: #1677FF"></span>
                  </a>
                </el-tooltip>
                <span style="position: absolute; top: 54px; left: 80px; margin-left: 10px;font-size: 14px">
                        <span style="color: #646a73">最近操作时间：</span>
                        <span style="color: #1677ff">{{ parseTime(item.updateTime) }}</span>
                      </span>
              </div>
              <div style="margin-top: 10px;">
                <div style="float: left">
                  <el-button size="mini" style="margin: 5px" type="primary" v-if="item.status == 0"
                             @click="updateStatus(item)">运行
                  </el-button>
                  <el-button size="mini" style="margin: 5px" type="primary" v-if="item.status == 1"
                             @click="updateStatus(item)">停止
                  </el-button>
                  <el-button size="mini" style="margin: 5px" v-if="item.status == 0"
                             @click="handleDelete(item)">删除
                  </el-button>
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
        v-if="ruleDesignList.length!=0"
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
        v-if="ruleDesignList.length==0"
        style="width: 100%; margin-top: 50px"
        description="暂无数据"
        :image-size="120"
      ></el-empty>
    </div>

  </div>
</template>

<script>
import {getRuleDesignPage, remove, runRule} from "@/api/ruledesign/ruledesign";
import {parseTime} from "@/utils/ruoyi";

export default {
  name: "SystemRole",
  data() {
    return {
      page: {
        pageSize: 12,
        currentPage: 1,
        total: 0
      },
      options: [],
      ruleDesignList: [], // 分页数据
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 查询参数
      queryParams: {
        ruleName: "",
        status: null,
      },
    };
  },
  created() {
    this.options = this.$store.state.dict.dictDatas.is_enable;
    this.getList();
  },
  methods: {
    parseTime,
    /** 查询规则编排列表 */
    getList() {
      this.loading = true;
      getRuleDesignPage(this.page.pageNo, this.page.pageSize, this.queryParams).then(
        response => {
          this.ruleDesignList = response.data.records;
          this.page.total = response.data.total;
          this.loading = false;
        }
      );
    },
    //运行规则
    updateStatus(row) {
      runRule(row.id).then((res) => {
        res.data ? this.$message.success("操作成功") : this.$message.warning("操作失败")
        this.getList()
      }).catch(() => {
        this.$message.warning("操作失败")
      })
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.page.pageNo = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.queryParams = {
        ruleName: "",
        status: null,
      }
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      // 进入规则编排页面
      this.$router.push({
        path: `/business/ruledesign/design`,
        query: {
          id: null,
          type: "add"
        }
      })
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      // 进入规则编排页面
      this.$router.push({
        path: `/business/ruledesign/design`,
        query: {
          id: row.id,
          type: "edit"
        }
      })
    },
    /** 查看按钮操作 */
    handleView(row) {
      // 进入规则编排页面
      this.$router.push({
        path: `/business/ruledesign/design`,
        query: {
          id: row.id,
          type: "view"
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      this.$modal.confirm('是否确认删除?').then(function () {
        return remove(row.id);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {
      });
    },
    changeSize(val) {
      this.page.pageSize = val
      this.getList()
    },
    changeCurrent(val) {
      this.page.currentPage = val
      this.getList()
    },
  }
};
</script>
<style scoped>

.top-button ::v-deep .el-button + .el-button {
  margin-left: 0;
}

.record-danger {
  background: linear-gradient(40deg, #fff, #f4f4f5, #e9e9ed);
}

.record-success {
  background: linear-gradient(40deg, #fff, #eef6ff, #b3d9ff);;
}
</style>
