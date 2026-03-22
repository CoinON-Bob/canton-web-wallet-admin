<script setup lang="ts">
defineProps<{
  /** 用户状态与转账状态共用同一套样式（Mock） */
  status: string;
}>();

const labels: Record<string, string> = {
  confirmed: '已确认',
  pending: '待确认',
  failed: '失败',
};
</script>

<template>
  <span :class="['status-badge', status]">
    <span v-if="status === 'confirmed'" class="icon" aria-hidden="true">✓</span>
    <span v-else-if="status === 'pending'" class="icon" aria-hidden="true">⏱</span>
    <span v-else class="icon" aria-hidden="true">✕</span>
    {{ labels[status] }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: 1px solid;
}

.icon {
  font-size: 10px;
  line-height: 1;
}

.status-badge.confirmed {
  color: var(--teal);
  background: rgba(0, 212, 177, 0.12);
  border-color: rgba(0, 212, 177, 0.2);
}

.status-badge.pending {
  color: var(--gold);
  background: rgba(201, 162, 39, 0.12);
  border-color: rgba(201, 162, 39, 0.25);
}

.status-badge.failed {
  color: var(--red);
  background: rgba(255, 77, 109, 0.12);
  border-color: rgba(255, 77, 109, 0.2);
}
</style>
