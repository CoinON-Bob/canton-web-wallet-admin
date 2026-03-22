<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  loadInviteCodes,
  generateInviteCodes,
  revokeInviteCode,
  inviteStats,
  type InviteCodeRow,
} from '../api/inviteCodes';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, DocumentCopy, Delete } from '@element-plus/icons-vue';

const rows = ref<InviteCodeRow[]>([]);

const refresh = () => {
  rows.value = loadInviteCodes();
};

onMounted(refresh);

const stats = computed(() => inviteStats(rows.value));

const form = ref({ count: 5, maxUses: 10 });

const generating = ref(false);
const onGenerate = () => {
  generating.value = true;
  try {
    const batch = generateInviteCodes(form.value.count, form.value.maxUses);
    refresh();
    ElMessage.success(`已生成 ${batch.length} 个邀请码`);
  } finally {
    generating.value = false;
  }
};

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code);
  ElMessage.success('已复制邀请码');
};

const onRevoke = (row: InviteCodeRow) => {
  ElMessageBox.confirm(`确定作废邀请码「${row.code}」？已注册用户使用记录不受影响。`, '作废邀请码', {
    type: 'warning',
    confirmButtonText: '作废',
    cancelButtonText: '取消',
  })
    .then(() => {
      revokeInviteCode(row.id);
      refresh();
      ElMessage.success('已作废');
    })
    .catch(() => {});
};

const statusLabel = (r: InviteCodeRow) => (r.usedCount >= r.maxUses ? '已用尽' : '有效');
</script>

<template>
  <div class="invite-page">
    <div class="page-header">
      <h1 class="page-title">邀请码管理</h1>
      <p class="page-desc">仅后台可生成邀请码；用户须凭邀请码完成前台注册，无邀请码无法注册。</p>
    </div>

    <div class="kpi-row">
      <el-card shadow="never" class="kpi">
        <div class="kpi-lab">邀请码批次数</div>
        <div class="kpi-val font-mono">{{ stats.total }}</div>
      </el-card>
      <el-card shadow="never" class="kpi">
        <div class="kpi-lab">仍有效</div>
        <div class="kpi-val kpi-teal font-mono">{{ stats.active }}</div>
      </el-card>
      <el-card shadow="never" class="kpi">
        <div class="kpi-lab">剩余总次数</div>
        <div class="kpi-val gold font-mono">{{ stats.remainingUses }}</div>
      </el-card>
    </div>

    <el-card class="gen-card" shadow="never">
      <template #header>
        <span class="card-title">批量生成</span>
      </template>
      <div class="gen-row">
        <el-form inline label-position="left">
          <el-form-item label="生成数量">
            <el-input-number v-model="form.count" :min="1" :max="200" controls-position="right" />
          </el-form-item>
          <el-form-item label="每个可用次数">
            <el-input-number v-model="form.maxUses" :min="1" :max="99999" controls-position="right" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Plus" :loading="generating" @click="onGenerate">生成</el-button>
          </el-form-item>
        </el-form>
        <p class="hint font-mono">生成后请将邀请码分发给用户；用户在前台「用户注册」页填写后方可注册。</p>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-title">邀请码列表</span>
      </template>
      <el-table :data="rows" stripe class="invite-table">
        <el-table-column prop="code" label="邀请码" min-width="200">
          <template #default="s">
            <span class="code-cell font-mono">{{ s.row.code }}</span>
            <el-button :icon="DocumentCopy" link class="copy-btn" @click="copyCode(s.row.code)" />
          </template>
        </el-table-column>
        <el-table-column label="可用 / 已用" width="140">
          <template #default="s">
            <span class="font-mono">{{ s.row.maxUses }} / {{ s.row.usedCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="s">
            <el-tag :type="s.row.usedCount >= s.row.maxUses ? 'info' : 'success'" size="small" effect="plain">
              {{ statusLabel(s.row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="160">
          <template #default="s">
            <span class="font-mono">{{ s.row.createdAt }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="right" fixed="right">
          <template #default="s">
            <el-button type="danger" :icon="Delete" link @click="onRevoke(s.row)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.invite-page {
  padding-bottom: 24px;
}

.page-header {
  margin-bottom: 20px;
}

.page-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.5;
  max-width: 720px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-lab {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.kpi-val {
  font-size: 24px;
  font-weight: 700;
  margin-top: 8px;
}

.kpi-teal {
  color: var(--teal);
}

.gen-card {
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.gen-row .hint {
  margin: 12px 0 0;
  font-size: 11px;
  color: var(--text-dim);
  line-height: 1.5;
}

.table-card :deep(.el-card__body) {
  padding-top: 0;
}

.code-cell {
  color: var(--gold);
  font-weight: 700;
}

.copy-btn {
  margin-left: 8px;
  vertical-align: middle;
}

@media (max-width: 900px) {
  .kpi-row {
    grid-template-columns: 1fr;
  }
}
</style>
