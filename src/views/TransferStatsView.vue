<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import EChart from '../components/common/EChart.vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const trend = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' },
    trigger: 'axis',
  },
  grid: { left: 48, right: 20, top: 24, bottom: 28 },
  xAxis: {
    type: 'category',
    data: Array.from({ length: 24 }).map((_, i) => `${i}:00`),
    axisLine: { lineStyle: { color: '#1e2d4a' } },
    axisLabel: { color: '#9aacca', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#1e2d4a', type: 'dashed' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      data: Array.from({ length: 24 }).map(() => Math.floor(300 + Math.random() * 500)),
      lineStyle: { color: '#c9a227', width: 2 },
      areaStyle: { color: 'rgba(201,162,39,0.08)' },
    },
  ],
}));

const typePie = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', backgroundColor: '#0f1629', borderColor: '#c9a227', textStyle: { color: '#e8edf5' } },
  series: [
    {
      type: 'pie',
      radius: ['40%', '65%'],
      data: [
        { value: 52, name: '链上转账', itemStyle: { color: '#c9a227' } },
        { value: 28, name: '合约调用', itemStyle: { color: '#00d4b1' } },
        { value: 20, name: '内部转账', itemStyle: { color: '#5b7cff' } },
      ],
    },
  ],
}));

const showExport = ref(false);
const exportFormat = ref('csv');
const exportRange = ref('7d');

const doExport = () => {
  ElMessage.success(`已生成 ${exportFormat.value.toUpperCase()}（${exportRange.value}）下载任务 — Mock`);
  showExport.value = false;
};
</script>

<template>
  <div class="stats-page">
    <div class="page-header">
      <h1 class="page-title">CC 转账统计</h1>
      <div class="actions">
        <el-button @click="showExport = true">导出报表</el-button>
        <el-button type="primary" link @click="router.push('/transfer/list')">查看转账明细</el-button>
      </div>
    </div>

    <div class="kpi-row">
      <el-card v-for="(x, i) in [
        { t: '今日笔数', v: '6,483' },
        { t: '本周笔数', v: '45,922' },
        { t: '本月笔数', v: '186,302' },
      ]" :key="i" class="kpi" shadow="never">
        <div class="kpi-label">{{ x.t }}</div>
        <div class="kpi-val gold font-mono">{{ x.v }}</div>
      </el-card>
    </div>

    <div class="charts-grid">
      <el-card class="chart-wide" shadow="never">
        <template #header>
          <div class="card-h">
            <span>24h 转账趋势</span>
            <span class="hint font-mono">Mock 随机波动</span>
          </div>
        </template>
        <EChart :option="trend" height="300px" />
      </el-card>
      <el-card class="chart-side" shadow="never">
        <template #header>
          <div class="card-h">
            <span>类型占比</span>
          </div>
        </template>
        <EChart :option="typePie" height="300px" />
      </el-card>
    </div>

    <el-dialog v-model="showExport" title="导出报表" width="400px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="格式">
          <el-radio-group v-model="exportFormat">
            <el-radio-button value="csv">CSV</el-radio-button>
            <el-radio-button value="xlsx">Excel</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-select v-model="exportRange" style="width: 100%">
            <el-option label="近 24 小时" value="24h" />
            <el-option label="近 7 天" value="7d" />
            <el-option label="近 30 天" value="30d" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showExport = false">取消</el-button>
        <el-button type="primary" @click="doExport">开始导出</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.stats-page {
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kpi-val {
  font-size: 28px;
  font-weight: 700;
  margin-top: 8px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.card-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
}

.hint {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
}

@media (max-width: 1000px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
