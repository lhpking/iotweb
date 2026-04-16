<template>
  <div>
    <template v-for="menu in menuData">
      <el-submenu :key="menu.id" :index="menu.id" v-if="menu.children">
        <template #title>
          <span>{{ menu.label }}</span>
        </template>
        <menu-tree :menuData="menu.children" :type="type"></menu-tree>
      </el-submenu>
      <el-menu-item :key="menu.id + 'key'" :index="menu.id" v-else :draggable="type != 'view'"
        @dragstart.native="dragstart(menu, $event)" @dragover.prevent class="dbnode" :class="formatClass(menu.group)">
        <template #title>
          <span>{{ menu.label }}</span>
        </template>
      </el-menu-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'MenuTree',
  props: {
    menuData: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  methods: {
    dragstart(node, event) {
      event.dataTransfer.setData('getNodeName', node.name);
      event.dataTransfer.setData('getNodeLabel', node.label);
      event.dataTransfer.setData('getType', node.type);
      event.dataTransfer.setData('getNodeType', node.nodeType);
      event.dataTransfer.effectAllowed = 'move';
    },
    formatClass(group) {
      let className = ''
      if (group == 'source') {
        className = 'source-node'
      } else if (group == 'operator') {
        className = 'operator-node'
      } else if (group == 'sink') {
        className = 'sink-node'
      }
      return className
    }
  },
}
</script>

<style lang="scss">
.dbnode {
  height: 46px !important;
  line-height: 46px !important;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: move;
  background-color: #fff;
  border-radius: 8px;
  color: #000000b3;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #e2e6f0;
  border-width: 4px 1px 1px 1px;
  &:hover {
    background-color: transparent !important;
  }
}

.dbnode.source-node{
  border-color: #0082ff;
}

.dbnode.operator-node{
  border-color: #d7651f;
}

.dbnode.sink-node{
  border-color: #00b173;
}
</style>
