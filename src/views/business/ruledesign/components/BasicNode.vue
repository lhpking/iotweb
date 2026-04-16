<template>
  <div>
    <div ref="el" class="basic-node">
      <div class="node-name">
        {{ name }}
        <el-button v-if="isChart" class="show-chart" type="primary" link @click="dialogVisible = true"
        >查看图表</el-button
        >
      </div>
    </div>
    <el-dialog :visible.sync="dialogVisible" title="折线图" width="90%" draggable @opened="initEchart" append-to-body @closed="chartClosed">
      <div ref="lineChartDom" style="width: 100%; height: 400px"></div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      name: '',
      el: null,
      lineChartDom: null,
      isChart: false,
      dialogVisible: false,
      lineChartOption: {},
      lineChart: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      const { id } = this.$refs.el.parentElement.parentElement.parentElement
      const data = this.$df.getNodeFromId(id.slice(5))
      this.name = data.data.label
      // 图表
      this.isChart = data.data.group === 'chart'
    })
  },
  methods: {
    initEchart() {
      if (!this.lineChart) {
        this.lineChart = echarts.init(this.lineChartDom)
      }
      this.lineChartOption = {
        title: {
          text: 'Stacked Line',
        },
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine'],
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: 'Email',
            type: 'line',
            stack: 'Total',
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: 'Union Ads',
            type: 'line',
            stack: 'Total',
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: 'Video Ads',
            type: 'line',
            stack: 'Total',
            data: [150, 232, 201, 154, 190, 330, 410],
          },
          {
            name: 'Direct',
            type: 'line',
            stack: 'Total',
            data: [320, 332, 301, 334, 390, 330, 320],
          },
          {
            name: 'Search Engine',
            type: 'line',
            stack: 'Total',
            data: [820, 932, 901, 934, 1290, 1330, 1320],
          },
        ],
      }
      this.lineChart.setOption(this.lineChartOption)
    },
    chartClosed() {
      if (this.lineChart) {
        this.lineChart.dispose()
        this.lineChart = null
      }
    },
  },
}
</script>

<style>
.node-name {
  text-align: center;
  font-weight: bold;
  font-size: 18px;
}
</style>
