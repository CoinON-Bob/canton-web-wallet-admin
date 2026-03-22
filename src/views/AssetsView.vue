<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllUsers } from '../api/userDirectory';
import EChart from '../components/common/EChart.vue';

const router = useRouter();

const allUsers = computed(() => getAllUsers());

const top10 = computed(() => [...allUsers.value].sort((a, b) => b.asset - a.asset).slice(0, 10));

const totalCc = computed(() => allUsers.value.reduce((s, u) => s + u.asset, 0));

const kpiCards = computed(() => [
  { title: '平台 CC 总量', value: totalCc.value.toLocaleString(undefined, { maximumFractionDigits: 0 }), sub: '所有用户主账户合计（Mock）' },
  { title: '持仓用户数', value: String(allUsers.value.length), sub: '含邀请码注册用户' },
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

const goUser = (id: number) => router.push(`/users/${id}`);
</script>

<template>
  <div class="assets-page">
    <div class="page-header">
      <h1 class="page-title">资产管理</h1>
      <div class="page-header-actions">
        <el-button class="header-action-btn" text @click="router.push('/users')">用户管理</el-button>
      </div>
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
        <div class="rank-sheet">
          <div class="rank-row rank-row-head font-mono">
            <span class="col-rank">#</span>
            <span class="col-id">用户 ID</span>
            <span class="col-email">邮箱</span>
            <span class="col-bal">余额 (CC)</span>
          </div>
          <div
            v-for="(u, idx) in top10"
            :key="u.id"
            class="rank-row rank-row-data"
            @click="goUser(u.id)"
          >
            <span class="col-rank font-mono dim">{{ idx + 1 }}</span>
            <span class="col-id">
              <button type="button" class="id-btn font-mono" @click.stop="goUser(u.id)">#{{ u.id }}</button>
            </span>
            <span class="col-email">
              <span class="email-cell font-mono" :title="u.email">{{ u.email }}</span>
              <span class="invite-sub font-mono" :title="u.inviteCode">邀请 {{ u.inviteCode }}</span>
            </span>
            <span class="col-bal font-mono gold">{{ u.asset.toLocaleString() }}</span>
          </div>
        </div>
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
  flex-wrap: wrap;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-action-btn {
  color: #dce8ff !important;
  font-weight: 600 !important;
  font-size: 13px !important;
}

.header-action-btn:hover {
  color: var(--gold) !important;
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

.rank-card :deep(.el-card__body) {
  padding: 0 !important;
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

/* 排行表：栅格对齐，与全局深色表风格一致 */
.rank-sheet {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rank-row {
  display: grid;
  grid-template-columns: 44px minmax(88px, 0.9fr) minmax(0, 1.4fr) minmax(120px, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(30, 45, 74, 0.65);
  font-size: 13px;
}

.rank-row-head {
  padding-top: 14px;
  padding-bottom: 10px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border);
}

.rank-row-data {
  cursor: pointer;
  color: var(--text);
  transition: background 0.12s ease;
}

.rank-row-data:hover {
  background: rgba(255, 255, 255, 0.03);
}

.rank-row-data:last-child {
  border-bottom: none;
}

.col-bal {
  text-align: right;
  font-weight: 700;
}

.dim {
  color: #8b9cbb;
}

.col-email {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.email-cell {
  font-size: 12px;
  color: #b8c5df;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.invite-sub {
  font-size: 10px;
  color: rgba(201, 162, 39, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.id-btn {
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  color: var(--gold);
  font-size: 13px;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.id-btn:hover {
  color: #f0dc82;
}

@media (max-width: 1100px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .kpi-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .rank-sheet {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .rank-row {
    min-width: 520px;
  }
}
</style>
