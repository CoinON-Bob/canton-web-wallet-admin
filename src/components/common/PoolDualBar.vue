<script setup lang="ts">
defineProps<{
  bullPct: number;
  bullLabel?: string;
  bearLabel?: string;
}>();
</script>

<template>
  <div class="pool-bar-wrap">
    <div class="pool-bar" role="img" :aria-label="`看涨 ${bullPct}% 看跌 ${100 - bullPct}%`">
      <div class="pool-bull" :style="{ width: `${bullPct}%` }" />
      <div class="pool-bear" :style="{ width: `${100 - bullPct}%` }" />
    </div>
    <div class="pool-legend">
      <span>{{ bullLabel ?? `看涨 ${bullPct}%` }}</span>
      <span>{{ bearLabel ?? `看跌 ${100 - bullPct}%` }}</span>
    </div>
  </div>
</template>

<style scoped>
.pool-bar-wrap {
  width: 100%;
}

.pool-bar {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}

.pool-bull {
  background: var(--teal);
  min-width: 0;
  transition: width 0.4s ease;
}

.pool-bear {
  background: var(--red);
  min-width: 0;
  transition: width 0.4s ease;
}

.pool-legend {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-dim);
  font-family: 'Syne', sans-serif;
}
</style>
