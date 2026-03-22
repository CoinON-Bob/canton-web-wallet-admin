<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { users } from '../api/mock';
import EChart from '../components/common/EChart.vue';

const router = useRouter();

const top10 = computed(() => [...users].sort((a, b) => b.asset - a.asset).slice(0, 10));

const totalCc = computed(() => users.reduce((s, u) => s + u.asset, 0));

const kpiCards = computed(() => [
  { title: '平台 CC 总量', value: totalCc.value.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: '所有用户主账户合计（Mock）' },
  { title: '持仓用户数', value: String(users.length), sub: '当前演示数据集' },
  { title: '大户占比 (TOP10)', value: '38.2%', sub: '相对总锁仓估算' },
]);

const chartTooltip = {
  backgroundColor: '#0f1629',
  borderColor: '#c9a227',
  textStyle: { color: '#e8edf5' },
};

const distPie = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { ...chartTooltip, trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['44%', '70%'],
      center: ['50%', '52%'],
      label: { color: '#9aacca', fontSize: 11 },
      data: [
        { value: 42, name: 'CC', itemStyle: { color: '#c9a227' } },
        { value: 28, name: 'USDT', itemStyle: { color: '#00d4b1' } },
        { value: 18, name: 'BTC', itemStyle: { color: '#5b7cff' } },
        { value: 12, name: 'ETH', itemStyle: { color: '#a78bfa' } },
      ],
    },
  ],
}));

const distBar = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { ...chartTooltip, trigger: 'axis' },
  grid: { left: 48, right: 16, top: 24, bottom: 28 },
  xAxis: {
    type: 'category',
    data: ['CC', 'USDT', 'BTC', 'ETH'],
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
      type: 'bar',
      data: [320, 260, 220, 200],
      barWidth: '48%',
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#c9a227' },
            { offset: 1, color: 'rgba(201,162,39,0.25)' },
          ],
        },
        borderRadius: [4, 4, 0, 0],
      },
    },
  ],
}));
</script>

<template>
  <div class="assets-page">
    <div class="page-header">
      <h1 class="page-title">资产管理</h1>
      <el-button type="primary" link @click="router.push('/users')">跳转用户管理</el-button>
    </div>

    <div class="kpi-row">
      <el-card v-for="(k, i) in kpiCards" :key="i" class="kpi-card" shadow="never">
        <div class="kpi-label">{{ k.title }}</div>
        <div class="kpi-value gold font-mono">{{ k.value }}</div>
        <div class="kpi-sub">{{ k.sub }}</div>
      </el-card>
    </div>

    <div class="main-grid">
      <el-card class="rank-card" shadow="never">
        <template #header>
          <div class="card-h">
            <span>大户排行 TOP10</span>
            <span class="hint font-mono">按 CC 余额</span>
          </div>
        </template>
        <el-table :data="top10" stripe class="rank-table">
          <el-table-column type="index" label="#" width="48" />
          <el-table-column prop="id" label="用户 ID" width="100">
            <template #default="s">
              <el-button type="primary" link class="id-link" @click="router.push(`/users/${s.row.id}`)">
                #{{ s.row.id }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" min-width="120" />
          <el-table-column label="余额" min-width="140">
            <template #default="s">
              <span class="gold font-mono">{{ s.row.asset.toLocaleString() }} CC</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <div class="charts-col">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-h">
              <span>资产分布</span>
              <span class="hint">占比（演示）</span>
            </div>
          </template>
          <div class="chart-box">
            <EChart :option="distPie" height="260px" />
          </div>
        </el-card>
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-h">
              <span>币种规模</span>
              <span class="hint">相对量</span>
            </div>
          </template>
          <div class="chart-box">
            <EChart :option="distBar" height="260px" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.assets-page {
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-card {
  min-height: 120px;
}

.kpi-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  margin: 10px 0 6px;
}

.kpi-sub {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.4;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.rank-card,
.chart-card {
  height: 100%;
  min-height: 0;
}

.card-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.hint {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
}

.charts-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.chart-box {
  min-height: 260px;
}

.id-link {
  padding: 0;
  font-family: 'Space Mono', monospace;
}

@media (max-width: 1100px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
