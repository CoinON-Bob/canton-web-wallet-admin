<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { dashboardKpis, transfers, formatHash, formatNumber } from '../api/mock';
import StatCard from '../components/common/StatCard.vue';
import EChart from '../components/common/EChart.vue';
import StatusBadge from '../components/common/StatusBadge.vue';
import PoolDualBar from '../components/common/PoolDualBar.vue';
import { CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();
const goTransfers = () => router.push('/transfer/list');
const goContracts = () => router.push('/contracts');
const goMonitor = () => router.push('/monitor');
const goUsers = () => router.push('/users');

const copyHash = (hash: string) => {
  navigator.clipboard.writeText(hash);
  ElMessage.success('已复制');
};

const trendOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' },
    formatter: (params: any) => {
      const p = params[0];
      return `<div style="font-weight:600">${p.name}</div>
              <div style="color:#c9a227">CC 转账: ${p.value.toLocaleString()}</div>`;
    }
  },
  grid: { left: 50, right: 20, top: 30, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['2/1','2/5','2/9','2/13','2/17','2/21','2/25','2/29'],
    axisLine: { lineStyle: { color: '#1e2d4a' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#1e2d4a', type: 'dashed' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v/1000) + 'K' : v }
  },
  series: [{
    type: 'line',
    smooth: true,
    data: [280, 720, 450, 810, 560, 920, 640, 500],
    lineStyle: { color: '#c9a227', width: 3 },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(201,162,39,0.35)' },
          { offset: 1, color: 'rgba(201,162,39,0.02)' }
        ]
      }
    },
    showSymbol: false,
  }],
}));

const donutOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' }
  },
  legend: {
    bottom: 0,
    textStyle: { color: '#7a8ba8', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10
  },
  series: [{
    type: 'pie',
    radius: ['50%', '72%'],
    center: ['50%', '45%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 4, borderColor: '#0f1629', borderWidth: 2 },
    label: { show: false },
    data: [
      { value: 40, name: '0-1K', itemStyle: { color: '#2b6aff' } },
      { value: 32, name: '1K-10K', itemStyle: { color: '#c9a227' } },
      { value: 18, name: '10K-100K', itemStyle: { color: '#00d4b1' } },
      { value: 10, name: '100K+', itemStyle: { color: '#ff4d6d' } }
    ]
  }],
}));

const barOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' }
  },
  grid: { left: 40, right: 20, top: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: ['W1', 'W2', 'W3', 'W4'],
    axisLine: { lineStyle: { color: '#1e2d4a' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#1e2d4a', type: 'dashed' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 }
  },
  series: [{
    type: 'bar',
    data: [1200, 1820, 1650, 2300],
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#c9a227' },
          { offset: 1, color: '#8b6914' }
        ]
      },
      borderRadius: [4, 4, 0, 0]
    },
    barWidth: '40%'
  }],
}));

const pieOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' }
  },
  legend: {
    bottom: 0,
    textStyle: { color: '#7a8ba8', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10
  },
  series: [{
    type: 'pie',
    radius: ['45%', '65%'],
    center: ['50%', '45%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 4, borderColor: '#0f1629', borderWidth: 2 },
    label: { show: false },
    data: [
      { value: 58, name: '买入', itemStyle: { color: '#00d4b1' } },
      { value: 42, name: '卖出', itemStyle: { color: '#ff4d6d' } }
    ]
  }],
}));

const recentTransfers = computed(() => transfers.slice(0, 6));
const poolBull = 62;
</script>

<template>
  <div class="dashboard">
    <div class="page-header">
      <span class="page-subtitle">实时数据 · 与链上同步</span>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <StatCard
        v-for="kpi in dashboardKpis"
        :key="kpi.title"
        :title="kpi.title"
        :value="kpi.value"
        :trend="kpi.trend"
        :subline="kpi.subline"
        :variant="kpi.variant"
      />
    </div>

    <!-- Charts Row -->
    <div class="chart-row">
      <el-card class="chart-card large">
        <template #header>
          <div class="card-header">
            <span class="card-title">CC 转账量趋势</span>
            <span class="card-subtitle">近30天</span>
          </div>
        </template>
        <EChart :option="trendOption" height="280px" />
      </el-card>

      <el-card class="chart-card small">
        <template #header>
          <div class="card-header">
            <span class="card-title">用户余额分布</span>
          </div>
        </template>
        <EChart :option="donutOption" height="280px" />
      </el-card>
    </div>

    <!-- Middle Row: Table + Side Cards -->
    <div class="middle-row">
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">最近转账记录</span>
            <el-button link type="primary" size="small" @click="goTransfers">查看全部</el-button>
          </div>
        </template>
        <div class="table-wrapper">
          <table class="custom-table">
            <thead>
              <tr>
                <th>TxHash</th>
                <th>金额(CC)</th>
                <th>状态</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in recentTransfers" :key="t.hash">
                <td class="hash-cell">
                  <span class="hash-text">{{ formatHash(t.hash) }}</span>
                  <el-button
                    class="copy-btn"
                    link
                    :icon="CopyDocument"
                    @click="copyHash(t.hash)"
                  />
                </td>
                <td class="amount-cell">{{ formatNumber(t.amount) }}</td>
                <td>
                  <StatusBadge :status="t.status" />
                </td>
                <td class="time-cell">{{ t.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-card>

      <div class="side-cards">
        <el-card class="side-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">活跃合约池</span>
              <div class="round-row">
                <span class="round-label">Round #2041</span>
                <span class="countdown-badge font-mono">00:14:22</span>
              </div>
            </div>
          </template>
          <div class="contract-pool">
            <PoolDualBar
              :bull-pct="poolBull"
              :bull-label="`看涨 ${poolBull}% · 4.8M CC`"
              :bear-label="`看跌 ${100 - poolBull}% · 2.9M CC`"
            />
            <div class="pool-actions">
              <el-button link type="primary" size="small" @click="goContracts">进入预测合约管理</el-button>
            </div>
          </div>
        </el-card>

        <el-card class="side-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">系统健康</span>
            </div>
          </template>
          <div class="health-bars">
            <div class="health-item">
              <div class="health-label">
                <span>API 可用率</span>
                <span class="health-value success">99.8%</span>
              </div>
              <div class="progress-bg thin">
                <div class="progress-fill success" style="width: 99.8%"></div>
              </div>
            </div>
            <div class="health-item">
              <div class="health-label">
                <span>结算成功率</span>
                <span class="health-value success">100%</span>
              </div>
              <div class="progress-bg thin">
                <div class="progress-fill success" style="width: 100%"></div>
              </div>
            </div>
            <div class="health-item">
              <div class="health-label">
                <span>内存使用</span>
                <span class="health-value warning">74.5%</span>
              </div>
              <div class="progress-bg thin">
                <div class="progress-fill warning" style="width: 74.5%"></div>
              </div>
            </div>
            <div class="health-item">
              <div class="health-label">
                <span>磁盘使用</span>
                <span class="health-value normal">48.1%</span>
              </div>
              <div class="progress-bg thin">
                <div class="progress-fill normal" style="width: 48.1%"></div>
              </div>
            </div>
            <el-button class="health-link" link type="primary" size="small" @click="goMonitor">查看节点监控</el-button>
          </div>
        </el-card>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="bottom-row">
      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">新增注册用户</span>
            <div class="hdr-right">
              <span class="card-subtitle">近30天</span>
              <el-button link type="primary" size="small" @click="goUsers">用户列表</el-button>
            </div>
          </div>
        </template>
        <EChart :option="barOption" height="220px" />
      </el-card>

      <el-card class="chart-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">合约方向分布</span>
            <div class="hdr-right">
              <span class="card-subtitle">近7天</span>
              <el-button link type="primary" size="small" @click="goContracts">合约详情</el-button>
            </div>
          </div>
        </template>
        <EChart :option="pieOption" height="220px" />
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding-bottom: 24px;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.page-subtitle {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.chart-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.chart-card {
  --el-card-padding: 0;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.chart-card :deep(.el-card__body) {
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.card-subtitle {
  font-size: 11px;
  color: var(--text-dim);
}

.hdr-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pool-actions {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  text-align: right;
}

.health-link {
  margin-top: 12px;
  padding-left: 0 !important;
}

.middle-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.table-card {
  --el-card-padding: 0;
}

.table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.table-wrapper {
  padding: 0;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-table th {
  text-align: left;
  padding: 12px 20px;
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.01);
}

.custom-table td {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(30, 45, 74, 0.5);
  color: var(--text);
  font-size: 13px;
}

.custom-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.1s ease;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

.hash-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hash-text {
  font-family: 'Space Mono', monospace;
  color: #2b6aff;
  font-size: 13px;
  text-decoration: underline;
  cursor: default;
}

.copy-btn {
  padding: 2px !important;
  height: auto !important;
  color: #5e6673;
}

.copy-btn:hover {
  color: #2b6aff;
}

.amount-cell {
  color: var(--gold);
  font-weight: 700;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  text-align: right;
}

.time-cell {
  font-size: 12px;
  color: var(--text-dim);
  font-family: 'Space Mono', monospace;
}

.side-cards {
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
}

.side-card {
  --el-card-padding: 0;
}

.side-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.round-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.round-label {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  color: var(--text-dim);
}

.countdown-badge {
  font-size: 11px;
  font-weight: 700;
  color: #000;
  background: var(--gold);
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.06em;
}

.contract-pool {
  padding: 16px 20px;
}

.progress-bg {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bg.thin {
  height: 6px;
  border-radius: 3px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.progress-fill.success {
  background: linear-gradient(90deg, #00d4b1, #00b89a);
}
.progress-fill.warning {
  background: linear-gradient(90deg, #ffab00, #c9a227);
}
.progress-fill.normal {
  background: linear-gradient(90deg, #2b6aff, #1e4fcc);
}

.health-bars {
  padding: 16px 20px;
}

.health-item {
  margin-bottom: 16px;
}

.health-item:last-child {
  margin-bottom: 0;
}

.health-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-dim);
}

.health-value {
  font-weight: 600;
  font-size: 12px;
}

.health-value.success {
  color: var(--teal);
}
.health-value.warning {
  color: #ffab00;
}
.health-value.normal {
  color: #2b6aff;
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .chart-row {
    grid-template-columns: 1fr;
  }
  .middle-row {
    grid-template-columns: 1fr;
  }
  .side-cards {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
  }
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .bottom-row {
    grid-template-columns: 1fr;
  }
  .side-cards {
    grid-template-columns: 1fr;
  }
}
</style>
