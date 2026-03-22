<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import EChart from '../components/common/EChart.vue';
import { Monitor } from '@element-plus/icons-vue';

const router = useRouter();

type NodeRow = {
  id: string;
  region: string;
  status: string;
  line: 'ok' | 'warn';
  height: number;
  latency: string;
  cpu: number;
  blocks: number;
};

const nodes: NodeRow[] = [
  {
    id: 'Node-Primary-01',
    region: 'Singapore',
    status: 'online',
    line: 'ok' as const,
    height: 9412367,
    latency: '12ms',
    cpu: 38,
    blocks: 41280,
  },
  {
    id: 'Node-Replica-02',
    region: 'Frankfurt',
    status: 'online',
    line: 'ok' as const,
    height: 9412365,
    latency: '57ms',
    cpu: 52,
    blocks: 41002,
  },
  {
    id: 'Node-Edge-03',
    region: 'Tokyo',
    status: 'degraded',
    line: 'warn' as const,
    height: 9412201,
    latency: '210ms',
    cpu: 88,
    blocks: 40112,
  },
];

const selectedNode = ref<NodeRow | null>(null);
const showNodeDetail = ref(false);

const openNode = (n: NodeRow) => {
  selectedNode.value = n;
  showNodeDetail.value = true;
};

const curve = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f1629',
    borderColor: '#c9a227',
    textStyle: { color: '#e8edf5' },
  },
  grid: { left: 48, right: 20, top: 24, bottom: 28 },
  xAxis: {
    type: 'category',
    data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25'],
    axisLine: { lineStyle: { color: '#1e2d4a' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#1e2d4a', type: 'dashed' } },
    axisLabel: { color: '#7a8ba8', fontSize: 11 },
  },
  series: [
    {
      name: 'CPU',
      type: 'line',
      data: [42, 51, 48, 63, 57, 44],
      lineStyle: { color: '#2b6aff' },
      showSymbol: false,
    },
    {
      name: 'Memory',
      type: 'line',
      data: [65, 67, 62, 71, 69, 66],
      lineStyle: { color: '#c9a227' },
      showSymbol: false,
    },
  ],
}));
</script>

<template>
  <div class="monitor-page">
    <div class="page-title">节点监控</div>

    <div class="node-grid">
      <el-card
        v-for="n in nodes"
        :key="n.id"
        class="node-card"
        shadow="never"
        role="button"
        tabindex="0"
        @click="openNode(n)"
        @keydown.enter="openNode(n)"
      >
        <div :class="['node-status-line', n.line]" />
        <div class="node-inner">
          <div class="node-icon-wrap">
            <el-icon :size="24"><Monitor /></el-icon>
          </div>
          <div class="node-main">
            <div class="node-name">{{ n.id }}</div>
            <div class="node-meta">
              <span>状态 <b :class="n.line === 'ok' ? 'ok' : 'warn'">{{ n.status }}</b></span>
              <span class="font-mono">延迟 {{ n.latency }}</span>
            </div>
            <div class="node-meta font-mono">
              <span>CPU {{ n.cpu }}%</span>
              <span>出块 {{ n.blocks.toLocaleString() }}</span>
            </div>
            <div class="bar-wrap">
              <div class="bar-fill" :style="{ width: `${n.cpu}%` }" />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="chart-wrap" shadow="never">
      <div class="chart-head page-header-actions">
        <div class="chart-title">系统资源实时曲线</div>
        <el-button text @click="router.push('/dashboard')">返回总览</el-button>
      </div>
      <EChart :option="curve" height="280px" />
    </el-card>

    <el-dialog v-model="showNodeDetail" :title="selectedNode ? selectedNode.id : ''" width="420px" destroy-on-close @closed="selectedNode = null">
      <template v-if="selectedNode">
        <dl class="node-dl">
          <dt>区域</dt>
          <dd>{{ selectedNode.region }}</dd>
          <dt>同步高度</dt>
          <dd class="font-mono">{{ selectedNode.height.toLocaleString() }}</dd>
          <dt>延迟</dt>
          <dd class="font-mono">{{ selectedNode.latency }}</dd>
          <dt>CPU</dt>
          <dd class="font-mono">{{ selectedNode.cpu }}%</dd>
          <dt>状态</dt>
          <dd>
            <span :class="selectedNode.line === 'ok' ? 'ok' : 'warn'">{{ selectedNode.status }}</span>
          </dd>
        </dl>
        <p class="node-tip">点击卡片可快速巡检；以上为 Mock 数据。</p>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.monitor-page {
  padding-bottom: 24px;
}

.node-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.node-card {
  position: relative;
  overflow: hidden;
  --el-card-padding: 0;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.node-card:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

.node-card :deep(.el-card__body) {
  padding: 0;
}

.node-status-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
}

.node-status-line.ok {
  background: var(--teal);
}

.node-status-line.warn {
  background: #ffab00;
}

.node-inner {
  display: flex;
  gap: 14px;
  padding: 20px;
  padding-top: 22px;
}

.node-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: rgba(201, 162, 39, 0.12);
  color: var(--gold);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.node-name {
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.node-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 6px;
}

.node-meta b.ok {
  color: var(--teal);
}

.node-meta b.warn {
  color: #ffab00;
}

.bar-wrap {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 10px;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--teal), #00b89a);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.chart-wrap {
  margin-top: 0;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 4px 0;
  margin-bottom: 8px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.node-dl {
  margin: 0;
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 10px 16px;
  font-size: 13px;
}

.node-dl dt {
  color: var(--text-dim);
  font-weight: 600;
}

.node-dl dd {
  margin: 0;
  color: var(--text);
}

.node-dl .ok {
  color: var(--teal);
  font-weight: 700;
}

.node-dl .warn {
  color: #ffab00;
  font-weight: 700;
}

.node-tip {
  margin: 16px 0 0;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
