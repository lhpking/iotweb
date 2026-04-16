<template>
  <div class="flow-sidebar">
    <el-menu
      background-color="#ffffff"
      text-color="#000000b3"
      active-text-color="#000000b3"
      :default-openeds="defaultOpeneds"
    >
      <menu-tree :menuData="nodeGroups" :type="type"></menu-tree>
    </el-menu>
  </div>
</template>

<script>
import {loadNodes} from '@/api/ruledesign/ruledesign'
import { arrToTree } from '@/utils'
import MenuTree from './MenuTree.vue'
import loadDndNodes from "@/utils/loadDndNodes";

export default {
  components: {
    MenuTree,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      nodeGroups: [],
      defaultOpeneds: ['1', '2', '3', '4'],
    }
  },
  created() {
    loadNodes().then((res) => {
      this.nodeGroups = arrToTree(loadDndNodes(res.data))
      localStorage.setItem('nodeGroups', JSON.stringify(res.data))
    }).catch(() => {
    })
  },
}
</script>

<style lang="scss">
.flow-sidebar {
  background-color: #fff;
  font-size: 14px;
  height: 100%;
  overflow-y: auto;
  .el-menu {
    border-right: none;
  }
  .el-submenu .el-menu-item{
  min-width: 0 !important;
 }
 .el-submenu__title{
  height: 46px;
  line-height: 46px;
  &:hover{
    background-color: transparent !important;
  }
 }
  .description {
    margin-bottom: 10px;
  }
  .group-name {
    color: #cfcfcf;
    font-size: 14px;
    padding: 12px 0;
  }
}
</style>
