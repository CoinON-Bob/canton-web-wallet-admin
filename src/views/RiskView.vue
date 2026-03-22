<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { riskEvents } from '../api/mock';
import { WarningFilled, InfoFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const router = useRouter();

const rules = reactive({
  maxPerMin: 20,
  maxAmount: 500000,
  ipCheck: true,
  behaviorCheck: true,
});

const iconFor = (s: string) => {
  if (s === 'warning') return WarningFilled;
  if (s === 'info') return InfoFilled;
  return null;
};

const showProcess = ref(false);
const processIdx = ref<number | null>(null);
const processForm = reactive({ action: 'mark_done', note: '' });

const openProcess = (idx: number) => {
  processIdx.value = idx;
  processForm.action = 'mark_done';
  processForm.note = '';
  showProcess.value = true;
};

const submitProcess = () => {
  ElMessage.success(`已记录处理：${processForm.action}（Mock）`);
  showProcess.value = false;
  processIdx.value = null;
};

const saveRules = () => {
  ElMessage.success('风控规则已保存（Mock）');
};
</script>

<template>
  <div class="risk-page">
    <div class="page-title">风控安全</div>

    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="never"><div class="kpi-label">风险事件</div><div class="kpi-val font-mono">3</div></el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never"><div class="kpi-label">严重</div><div class="kpi-val kpi-red font-mono">1</div></el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never"><div class="kpi-label">处理中</div><div class="kpi-val kpi-teal font-mono">2</div></el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt">
      <el-col :span="14">
        <el-card shadow="never">
          <div class="section-title">风险告警</div>
          <div
            v-for="(ev, idx) in riskEvents"
            :key="idx"
            :class="['alert-card', ev.severity]"
          >
            <div class="alert-icon">
              <span v-if="ev.severity === 'critical'" class="rad-icon" aria-hidden="true">☢</span>
              <el-icon v-else :size="22"><component :is="iconFor(ev.severity)" /></el-icon>
            </div>
            <div class="alert-body">
              <div class="alert-head">
                <span class="alert-title">{{ ev.type }}</span>
                <span class="alert-time font-mono">{{ ev.time }}</span>
              </div>
              <p class="alert-desc font-mono">{{ ev.desc }}</p>
              <el-button size="small" class="alert-btn" type="primary" plain @click="openProcess(idx)">处理</el-button>
            </div>
          </div>
        </el-card>
        <el-button class="risk-link" text @click="router.push('/transfer/list')">关联查看转账明细</el-button>
      </el-col>
      <el-col :span="10">
        <el-card shadow="never">
          <div class="section-title">风控规则配置</div>
          <el-form label-width="140px" label-position="left">
            <el-form-item label="每分钟最大转账数">
              <el-input-number v-model="rules.maxPerMin" controls-position="right" />
            </el-form-item>
            <el-form-item label="单笔最大金额">
              <el-input-number v-model="rules.maxAmount" controls-position="right" />
            </el-form-item>
            <el-form-item label="IP 风险检测">
              <el-switch v-model="rules.ipCheck" />
            </el-form-item>
            <el-form-item label="行为风控">
              <el-switch v-model="rules.behaviorCheck" />
            </el-form-item>
          </el-form>
          <el-button type="primary" class="save-rules" @click="saveRules">保存规则</el-button>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="showProcess"
      title="处理风险事件"
      width="420px"
      destroy-on-close
      @closed="processIdx = null"
    >
      <template v-if="processIdx !== null && riskEvents[processIdx]">
        <p class="proc-desc font-mono">{{ riskEvents[processIdx].desc }}</p>
        <el-form label-position="top">
          <el-form-item label="处理方式">
            <el-select v-model="processForm.action" style="width: 100%">
              <el-option label="标记已处理" value="mark_done" />
              <el-option label="升级工单" value="escalate" />
              <el-option label="仅备注观察" value="observe" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="processForm.note" type="textarea" rows="3" placeholder="可选" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="showProcess = false">取消</el-button>
        <el-button type="primary" @click="submitProcess">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.risk-page {
  padding-bottom: 24px;
}

.kpi-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.kpi-val {
  font-size: 28px;
  font-weight: 700;
  color: var(--gold);
  margin-top: 8px;
}

.kpi-red {
  color: var(--red);
}

.kpi-teal {
  color: var(--teal);
}

.mt {
  margin-top: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 16px;
}

.risk-link {
  margin-top: 12px;
  margin-left: 0 !important;
  height: auto !important;
  padding: 6px 0 !important;
}

.save-rules {
  margin-top: 8px;
  width: 100%;
}

.proc-desc {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
  margin: 0 0 16px;
}

.alert-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.alert-card:last-child {
  margin-bottom: 0;
}

.alert-card.critical {
  border-left: 3px solid var(--red);
  background: rgba(255, 77, 109, 0.07);
}

.alert-card.critical .alert-icon {
  color: var(--red);
}

.rad-icon {
  font-size: 22px;
  line-height: 1;
  display: block;
}

.alert-card.warning {
  border-left: 3px solid #ffab00;
  background: rgba(255, 171, 0, 0.07);
}

.alert-card.warning .alert-icon {
  color: #ffab00;
}

.alert-card.info {
  border-left: 3px solid var(--teal);
  background: rgba(0, 212, 177, 0.07);
}

.alert-card.info .alert-icon {
  color: var(--teal);
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.alert-title {
  font-weight: 700;
  color: var(--text);
}

.alert-time {
  font-size: 10px;
  color: var(--text-dim);
  flex-shrink: 0;
}

.alert-desc {
  margin: 8px 0 12px;
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.5;
}

.alert-btn {
  border-radius: 6px;
}
</style>
