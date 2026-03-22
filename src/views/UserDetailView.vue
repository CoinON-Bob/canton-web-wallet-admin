<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { users, transfers, formatHash, formatNumber } from '../api/mock';
import StatusBadge from '../components/common/StatusBadge.vue';
import { ArrowLeft, CopyDocument } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();

const user = computed(() => users.find((u) => String(u.id) === String(route.params.id)) || users[0]);

const userTransfers = computed(() => {
  const seed = Number(user.value.id) % 8;
  return transfers.slice(seed, seed + 10);
});

const assetRows = computed(() => [
  { label: '主账户 · CC', amount: user.value.asset, frozen: 0, remark: '可用于转账与合约' },
  { label: '合约保证金', amount: Number((user.value.asset * 0.08).toFixed(2)), frozen: Number((user.value.asset * 0.02).toFixed(2)), remark: '预测合约占用' },
  { label: '理财子账户', amount: Number((user.value.asset * 0.05).toFixed(2)), frozen: 0, remark: 'Mock 演示' },
]);

const auditLogs = [
  { time: '2026-03-22 09:18', action: '登录管理后台', ip: '10.12.0.44' },
  { time: '2026-03-21 16:02', action: '修改安全验证方式', ip: '10.12.0.12' },
  { time: '2026-03-20 11:40', action: '导出资产报表（Mock）', ip: '10.12.0.44' },
];

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制');
};
</script>

<template>
  <div class="user-detail">
    <div class="page-toolbar">
      <el-button class="back-btn" :icon="ArrowLeft" @click="router.push('/users')">返回用户列表</el-button>
    </div>
    <div class="page-title">用户详情 #{{ user.id }}</div>

    <el-card class="hero-card" shadow="never">
      <div class="hero-inner">
        <el-avatar :size="72" :src="user.avatar" />
        <div class="hero-main">
          <div class="hero-top">
            <span class="hero-id font-mono">#{{ user.id }}</span>
            <StatusBadge :status="user.status" />
          </div>
          <div class="hero-email font-mono">{{ user.email }}</div>
          <div class="hero-sub font-mono">注册于 {{ user.createdAt }}</div>
        </div>
        <div class="hero-balance">
          <span class="bal-label">总资产（CC）</span>
          <span class="bal-val gold">{{ user.asset.toLocaleString() }}</span>
        </div>
      </div>
    </el-card>

    <el-card class="tabs-card" shadow="never">
      <el-tabs class="detail-tabs">
        <el-tab-pane label="基本信息">
          <div class="info-grid">
            <div class="info-item">
              <span class="k">用户 ID</span>
              <span class="v font-mono">{{ user.id }}</span>
            </div>
            <div class="info-item wide">
              <span class="k">邮箱</span>
              <span class="v font-mono">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="k">账号状态</span>
              <span class="v"><StatusBadge :status="user.status" /></span>
            </div>
            <div class="info-item">
              <span class="k">注册时间</span>
              <span class="v font-mono">{{ user.createdAt }}</span>
            </div>
            <div class="info-item wide">
              <span class="k">备注</span>
              <span class="v dim">演示数据；生产环境可展示 KYC、风控标签等。</span>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="资产明细">
          <el-table :data="assetRows" stripe>
            <el-table-column prop="label" label="账户" min-width="160" />
            <el-table-column label="可用余额">
              <template #default="s">
                <span class="gold">{{ s.row.amount.toLocaleString() }} CC</span>
              </template>
            </el-table-column>
            <el-table-column label="冻结">
              <template #default="s">
                <span class="font-mono">{{ s.row.frozen.toLocaleString() }} CC</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="说明" min-width="180" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="转账记录">
          <el-table :data="userTransfers">
            <el-table-column label="TxHash" min-width="200">
              <template #default="s">
                <span class="font-mono hash">{{ formatHash(s.row.hash) }}</span>
                <el-button class="copy-ic" link :icon="CopyDocument" @click="copy(s.row.hash)" />
              </template>
            </el-table-column>
            <el-table-column label="金额">
              <template #default="s">{{ formatNumber(s.row.amount) }} CC</template>
            </el-table-column>
            <el-table-column label="状态">
              <template #default="s">
                <StatusBadge :status="s.row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="time" label="时间" width="160" class-name="font-mono" />
          </el-table>
          <div class="tab-footer">
            <el-button type="primary" link @click="router.push('/transfer/list')">查看全平台转账明细</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="操作日志">
          <ul class="log-list">
            <li v-for="(log, i) in auditLogs" :key="i" class="log-row">
              <span class="log-time font-mono">{{ log.time }}</span>
              <span class="log-action">{{ log.action }}</span>
              <span class="log-ip font-mono">{{ log.ip }}</span>
            </li>
          </ul>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped>
.user-detail {
  padding-bottom: 24px;
}

.page-toolbar {
  margin-bottom: 8px;
}

.back-btn {
  padding-left: 0;
}

.hero-card {
  margin-bottom: 16px;
  --el-card-padding: 0;
}

.hero-card :deep(.el-card__body) {
  padding: 20px 24px;
}

.hero-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
}

.hero-main {
  flex: 1;
  min-width: 200px;
}

.hero-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.hero-id {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.hero-email {
  font-size: 15px;
  color: var(--text);
}

.hero-sub {
  font-size: 12px;
  color: var(--text-dim);
  margin-top: 4px;
}

.hero-balance {
  text-align: right;
  min-width: 180px;
}

.bal-label {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.bal-val {
  font-size: 28px;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
}

.tabs-card {
  --el-card-padding: 0;
}

.tabs-card :deep(.el-card__body) {
  padding: 0 20px 20px;
}

.tabs-card :deep(.el-tabs__header) {
  padding: 0 4px;
  margin-bottom: 0;
}

.detail-tabs :deep(.el-tabs__nav-wrap) {
  padding-top: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px 24px;
  padding-top: 8px;
}

.info-item.wide {
  grid-column: 1 / -1;
}

.info-item .k {
  display: block;
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}

.info-item .v {
  font-size: 14px;
  color: var(--text);
}

.info-item .v.dim {
  color: var(--text-dim);
  line-height: 1.5;
}

.hash {
  color: var(--text);
}

.copy-ic {
  margin-left: 6px;
  vertical-align: middle;
}

.tab-footer {
  margin-top: 16px;
  text-align: right;
}

.log-list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
}

.log-row {
  display: grid;
  grid-template-columns: 160px 1fr 120px;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  align-items: center;
}

.log-time {
  color: var(--text-dim);
}

.log-action {
  color: var(--text);
}

.log-ip {
  color: var(--text-dim);
  text-align: right;
}

@media (max-width: 640px) {
  .log-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .log-ip {
    text-align: left;
  }
}
</style>
