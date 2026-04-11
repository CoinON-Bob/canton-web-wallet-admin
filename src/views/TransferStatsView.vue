<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import EChart from '../components/common/EChart.vue';
import { ElMessage } from 'element-plus';
import { adminTransactionApi } from '../api/admin';
import { ApiError } from '../api/http';
import type { ApiEnvelope } from '../api/http';
import { parseOverviewKpis, parsePieFromOverview, parsePieFromTopUsers, parseTrendLineSeries } from '../api/txStatsChart';

const router = useRouter();

const trendMock = computed(() => ({
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

const typePieMock = computed(() => ({
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

const apiTab = ref('ov');
const apiLoading = ref(false);
const syncLoading = ref(false);
const apiErr = ref('');
const overviewJson = ref('');
const trendJson = ref('');
const topUsersJson = ref('');
const overviewEnv = ref<ApiEnvelope<unknown> | null>(null);
const trendEnv = ref<ApiEnvelope<unknown> | null>(null);
const topUsersEnv = ref<ApiEnvelope<unknown> | null>(null);

const defaultKpis = [
  { t: '今日笔数', v: '6,483' },
  { t: '本周笔数', v: '45,922' },
  { t: '本月笔数', v: '186,302' },
];

const displayKpis = computed(() => {
  const parsed = overviewEnv.value ? parseOverviewKpis(overviewEnv.value) : null;
  if (parsed && parsed.length) {
    return parsed.map((k) => ({ t: k.label, v: k.value }));
  }
  return defaultKpis;
});

const trendChartOption = computed(() => {
  const parsed = trendEnv.value ? parseTrendLineSeries(trendEnv.value) : null;
  if (parsed && parsed.categories.length) {
    return {
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
        data: parsed.categories,
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
          data: parsed.values,
          lineStyle: { color: '#c9a227', width: 2 },
          areaStyle: { color: 'rgba(201,162,39,0.08)' },
        },
      ],
    };
  }
  return trendMock.value;
});

const pieChartOption = computed(() => {
  let slices =
    (topUsersEnv.value ? parsePieFromTopUsers(topUsersEnv.value) : null) ||
    (overviewEnv.value ? parsePieFromOverview(overviewEnv.value) : null);
  if (slices && slices.length) {
    const colors = ['#c9a227', '#00d4b1', '#5b7cff', '#9aacca', '#e85d6f', '#6b9fff', '#788c5d', '#b0aea5'];
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: '#0f1629', borderColor: '#c9a227', textStyle: { color: '#e8edf5' } },
      series: [
        {
          type: 'pie',
          radius: ['40%', '65%'],
          data: slices.map((s, i) => ({
            value: s.value,
            name: s.name,
            itemStyle: { color: colors[i % colors.length] },
          })),
        },
      ],
    };
  }
  return typePieMock.value;
});

const trendHint = computed(() =>
  trendEnv.value && parseTrendLineSeries(trendEnv.value) ? '接口 stats/trend' : 'Mock 随机波动'
);

const pieHint = computed(() =>
  topUsersEnv.value && parsePieFromTopUsers(topUsersEnv.value)
    ? '接口 top-users'
    : overviewEnv.value && parsePieFromOverview(overviewEnv.value)
      ? '接口 overview 占比'
      : 'Mock 演示'
);

async function loadTxStats() {
  apiLoading.value = true;
  apiErr.value = '';
  try {
    const [o, t, u] = await Promise.all([
      adminTransactionApi.statsOverview({ days: 7, latest_limit: 10 }),
      adminTransactionApi.statsTrend({ days: 7 }),
      adminTransactionApi.statsTopUsers({ days: 7, limit: 10, sort_by: 'amount' }),
    ]);
    overviewEnv.value = o;
    trendEnv.value = t;
    topUsersEnv.value = u;
    overviewJson.value = JSON.stringify(o, null, 2);
    trendJson.value = JSON.stringify(t, null, 2);
    topUsersJson.value = JSON.stringify(u, null, 2);
  } catch (e) {
    apiErr.value = e instanceof ApiError ? e.message : String(e);
    overviewEnv.value = null;
    trendEnv.value = null;
    topUsersEnv.value = null;
  } finally {
    apiLoading.value = false;
  }
}

async function runSync() {
  syncLoading.value = true;
  apiErr.value = '';
  try {
    const r = await adminTransactionApi.sync({});
    ElMessage.success(r.msg || '同步请求已提交');
    await loadTxStats();
  } catch (e) {
    apiErr.value = e instanceof ApiError ? e.message : String(e);
    ElMessage.error(apiErr.value);
  } finally {
    syncLoading.value = false;
  }
}

onMounted(() => {
  void loadTxStats();
});
</script>

<template>
  <div class="stats-page">
    <div class="page-header">
      <h1 class="page-title">CC 转账统计</h1>
      <div class="page-header-actions">
        <el-button @click="showExport = true">导出报表</el-button>
        <el-button text @click="router.push('/transfer/list')">查看转账明细</el-button>
      </div>
    </div>

    <div class="kpi-row">
      <el-card v-for="(x, i) in displayKpis" :key="i" class="kpi" shadow="never">
        <div class="kpi-label">{{ x.t }}</div>
        <div class="kpi-val gold font-mono">{{ x.v }}</div>
      </el-card>
    </div>

    <div class="charts-grid">
      <el-card class="chart-wide" shadow="never">
        <template #header>
          <div class="card-h">
            <span>转账趋势</span>
            <span class="hint font-mono">{{ trendHint }}</span>
          </div>
        </template>
        <EChart :option="trendChartOption" height="300px" />
      </el-card>
      <el-card class="chart-side" shadow="never">
        <template #header>
          <div class="card-h">
            <span>占比 / 排行</span>
            <span class="hint font-mono">{{ pieHint }}</span>
          </div>
        </template>
        <EChart :option="pieChartOption" height="300px" />
      </el-card>
    </div>

    <el-card shadow="never" class="api-card">
      <template #header>
        <div class="card-h">
          <span>接口数据（文档 Admin Transaction）</span>
          <div class="api-actions">
            <el-button size="small" :loading="apiLoading" @click="loadTxStats">刷新 JSON</el-button>
            <el-button size="small" type="primary" :loading="syncLoading" @click="runSync">POST 同步</el-button>
          </div>
        </div>
      </template>
      <p class="api-note font-mono">
        与文档 Admin Transaction 一致；KPI/折线/饼图在能解析 data 时使用接口值，否则回退为占位 Mock。
      </p>
      <el-alert v-if="apiErr" :title="apiErr" type="error" class="api-err" :closable="false" />
      <el-tabs v-model="apiTab">
        <el-tab-pane label="stats/overview" name="ov">
          <pre class="json-block font-mono">{{ overviewJson || '—' }}</pre>
        </el-tab-pane>
        <el-tab-pane label="stats/trend" name="tr">
          <pre class="json-block font-mono">{{ trendJson || '—' }}</pre>
        </el-tab-pane>
        <el-tab-pane label="stats/top-users" name="tu">
          <pre class="json-block font-mono">{{ topUsersJson || '—' }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-card>

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

.page-header-actions {
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

.api-card {
  margin-top: 16px;
  border-radius: 8px;
}

.api-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.api-note {
  margin: 0 0 12px;
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.5;
}

.api-err {
  margin-bottom: 12px;
}

.json-block {
  margin: 0;
  max-height: min(420px, 50vh);
  overflow: auto;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
