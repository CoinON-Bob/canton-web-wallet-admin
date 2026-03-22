<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import PoolDualBar from '../components/common/PoolDualBar.vue';
import { activeRound, roundHistory, contractRules, type ContractRound } from '../api/mock';
import { ElMessage } from 'element-plus';
import { Document, Cpu, List, Timer } from '@element-plus/icons-vue';

const router = useRouter();

const mainTab = ref<'current' | 'history'>('current');
const showRules = ref(false);
const showSim = ref(false);
const simWinner = ref<'bull' | 'bear'>('bull');
const detailRound = ref<ContractRound | null>(null);
const showRoundDetail = ref(false);

const statusLabel = (r: ContractRound) => {
  if (r.status === 'settling') return '结算中';
  return '已结算';
};

const winnerLabel = (w?: 'bull' | 'bear') => (w === 'bull' ? '看涨胜出' : w === 'bear' ? '看跌胜出' : '—');

const runSimulate = () => {
  ElMessage.success(`模拟完成：${simWinner.value === 'bull' ? '看涨' : '看跌'} 侧胜出（Mock，未上链）`);
  showSim.value = false;
};

const openDetail = (row: ContractRound) => {
  detailRound.value = row;
  showRoundDetail.value = true;
};
</script>

<template>
  <div class="contract-page">
    <div class="page-header">
      <h1 class="page-title">预测合约</h1>
      <div class="header-actions page-header-actions">
        <el-button :icon="Document" @click="showRules = true">规则说明</el-button>
        <el-button type="primary" :icon="Cpu" @click="showSim = true">模拟结算</el-button>
        <el-button text @click="router.push('/dashboard')">返回总览</el-button>
      </div>
    </div>

    <div class="kpi-row">
      <el-card class="kpi" shadow="never">
        <div class="kpi-ic"><el-icon><Timer /></el-icon></div>
        <div>
          <div class="kpi-lab">当前轮次</div>
          <div class="kpi-val font-mono">#{{ activeRound.roundId }}</div>
        </div>
      </el-card>
      <el-card class="kpi" shadow="never">
        <div class="kpi-ic gold"><el-icon><List /></el-icon></div>
        <div>
          <div class="kpi-lab">池子总规模</div>
          <div class="kpi-val font-mono">{{ activeRound.poolTotal }}</div>
        </div>
      </el-card>
      <el-card class="kpi" shadow="never">
        <div class="kpi-ic teal"><el-icon><Cpu /></el-icon></div>
        <div>
          <div class="kpi-lab">状态</div>
          <div class="kpi-val">{{ statusLabel(activeRound) }}</div>
        </div>
      </el-card>
    </div>

    <el-card class="panel" shadow="never">
      <div class="seg">
        <button type="button" :class="['seg-btn', { on: mainTab === 'current' }]" @click="mainTab = 'current'">当前轮次</button>
        <button type="button" :class="['seg-btn', { on: mainTab === 'history' }]" @click="mainTab = 'history'">历史记录</button>
      </div>

      <template v-if="mainTab === 'current'">
        <div class="head-row">
          <span class="section-label">活跃资金池</span>
          <div class="round-row">
            <span class="round font-mono">Round #{{ activeRound.roundId }}</span>
            <span v-if="activeRound.countdown" class="countdown-badge font-mono">{{ activeRound.countdown }}</span>
            <el-tag type="warning" size="small" effect="dark">结算窗口</el-tag>
          </div>
        </div>
        <PoolDualBar
          :bull-pct="activeRound.bullPct"
          :bull-label="`看涨 ${activeRound.bullPct}% · ${activeRound.bullVol}`"
          :bear-label="`看跌 ${100 - activeRound.bullPct}% · ${activeRound.bearVol}`"
        />
        <p class="flow-tip font-mono">
          流程：用户下注 → 倒计时结束 → 进入结算锁定 → 出块确认 → 历史归档。以下为后台只读监控与演练入口。
        </p>
      </template>

      <template v-else>
        <div class="head-row">
          <span class="section-label">历史轮次</span>
          <el-button size="small" @click="showRules = true">查看规则</el-button>
        </div>
        <el-table :data="roundHistory" stripe @row-click="openDetail">
          <el-table-column prop="roundId" label="轮次" width="100">
            <template #default="s">
              <span class="font-mono">#{{ s.row.roundId }}</span>
            </template>
          </el-table-column>
          <el-table-column label="结果" width="120">
            <template #default="s">
              <el-tag :type="s.row.winner === 'bull' ? 'success' : 'info'" size="small" effect="plain">
                {{ winnerLabel(s.row.winner) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="poolTotal" label="池子规模" />
          <el-table-column label="多空">
            <template #default="s"> {{ s.row.bullVol }} / {{ s.row.bearVol }} </template>
          </el-table-column>
          <el-table-column prop="settledAt" label="结算时间" min-width="160">
            <template #default="s">
              <span class="font-mono">{{ s.row.settledAt }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="right">
            <template #default="s">
              <el-button type="primary" link @click.stop="openDetail(s.row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <p class="table-hint">点击行查看该轮完整信息（Mock）。</p>
      </template>
    </el-card>

    <!-- 规则 -->
    <el-dialog v-model="showRules" title="预测合约规则" width="480px" destroy-on-close>
      <ol class="rules-list">
        <li v-for="(line, i) in contractRules" :key="i">{{ line }}</li>
      </ol>
      <template #footer>
        <el-button type="primary" @click="showRules = false">知道了</el-button>
      </template>
    </el-dialog>

    <!-- 模拟结算 -->
    <el-dialog v-model="showSim" title="模拟结算（Mock）" width="400px" destroy-on-close>
      <p class="dialog-p">选择胜出方向，用于运营演练与报表对齐，不会产生链上交易。</p>
      <el-radio-group v-model="simWinner" class="sim-rg">
        <el-radio-button value="bull">看涨胜出</el-radio-button>
        <el-radio-button value="bear">看跌胜出</el-radio-button>
      </el-radio-group>
      <template #footer>
        <el-button @click="showSim = false">取消</el-button>
        <el-button type="primary" @click="runSimulate">执行模拟</el-button>
      </template>
    </el-dialog>

    <!-- 轮次详情 -->
    <el-dialog
      v-model="showRoundDetail"
      :title="detailRound ? `轮次 #${detailRound.roundId} 详情` : ''"
      width="440px"
      destroy-on-close
      @closed="detailRound = null"
    >
      <template v-if="detailRound">
        <dl class="detail-dl">
          <dt>状态</dt>
          <dd>{{ statusLabel(detailRound) }}</dd>
          <dt>池子</dt>
          <dd class="font-mono">{{ detailRound.poolTotal }}</dd>
          <dt>看涨 / 看跌</dt>
          <dd class="font-mono">{{ detailRound.bullVol }} · {{ detailRound.bearVol }}（{{ detailRound.bullPct }}% / {{ 100 - detailRound.bullPct }}%）</dd>
          <dt>胜出方</dt>
          <dd>{{ winnerLabel(detailRound.winner) }}</dd>
          <dt v-if="detailRound.settledAt">结算时间</dt>
          <dd v-if="detailRound.settledAt" class="font-mono">{{ detailRound.settledAt }}</dd>
        </dl>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.contract-page {
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

.header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi {
  --el-card-padding: 16px 20px;
}

.kpi :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
}

.kpi-ic {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(91, 124, 255, 0.12);
  color: #5b7cff;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.kpi-ic.gold {
  background: var(--gold-dim);
  color: var(--gold);
}

.kpi-ic.teal {
  background: rgba(0, 212, 177, 0.12);
  color: var(--teal);
}

.kpi-lab {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kpi-val {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-top: 4px;
}

.panel {
  --el-card-padding: 20px 24px 24px;
}

.seg {
  display: inline-flex;
  padding: 4px;
  border-radius: 8px;
  background: var(--bg-card2);
  border: 1px solid var(--border);
  margin-bottom: 20px;
}

.seg-btn {
  border: none;
  background: transparent;
  color: #9aacca;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.seg-btn:hover {
  color: var(--text);
}

.seg-btn.on {
  color: var(--gold);
  background: var(--gold-dim);
}

.head-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.section-label {
  font-size: 12px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.round-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.round {
  font-size: 13px;
  color: var(--text);
}

.countdown-badge {
  font-size: 11px;
  font-weight: 700;
  color: #000;
  background: var(--gold);
  padding: 4px 10px;
  border-radius: 4px;
}

.flow-tip {
  margin: 20px 0 0;
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.6;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.02);
}

.table-hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-dim);
}

.rules-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text);
  line-height: 1.7;
  font-size: 13px;
}

.dialog-p {
  margin: 0 0 16px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.5;
}

.sim-rg {
  width: 100%;
  display: flex;
}

.sim-rg :deep(.el-radio-button) {
  flex: 1;
}

.sim-rg :deep(.el-radio-button__inner) {
  width: 100%;
}

.detail-dl {
  margin: 0;
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px 16px;
  font-size: 13px;
}

.detail-dl dt {
  color: var(--text-dim);
  font-weight: 600;
}

.detail-dl dd {
  margin: 0;
  color: var(--text);
}

@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
