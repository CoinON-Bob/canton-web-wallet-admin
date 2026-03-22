<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { ArrowUp, ArrowDown, Coin, User, Warning, TrendCharts } from '@element-plus/icons-vue';
import type { KpiVariant } from '../../api/mock';

const props = defineProps<{
  title: string;
  value: string;
  trend: string;
  subline?: string;
  variant?: KpiVariant;
}>();

const display = ref(props.value);
const isNegative = computed(() => props.trend.includes('-') && !props.trend.includes('+'));
const isNeutral = computed(() => props.trend === '实时');

const parsed = computed(() => {
  const match = props.value.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
  if (!match) return { prefix: '', num: NaN, suffix: props.value };
  return {
    prefix: match[1],
    num: parseFloat(match[2].replace(/,/g, '')),
    suffix: match[3],
  };
});

const animate = () => {
  if (!Number.isFinite(parsed.value.num)) {
    display.value = props.value;
    return;
  }
  const duration = 800;
  const start = performance.now();
  const target = parsed.value.num;
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    const cur = Math.floor(target * eased);
    display.value = `${parsed.value.prefix}${cur.toLocaleString('en-US')}${parsed.value.suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

onMounted(animate);
watch(() => props.value, animate);

const decor = computed(() => {
  switch (props.variant) {
    case 'hero':
      return Coin;
    case 'user':
      return User;
    case 'risk':
      return Warning;
    default:
      return TrendCharts;
  }
});
</script>

<template>
  <div class="stat-card" :data-variant="variant || 'default'">
    <div class="decor-icon" aria-hidden="true">
      <el-icon :size="28"><component :is="decor" /></el-icon>
    </div>
    <div class="stat-header">
      <span class="stat-title">{{ title }}</span>
      <div v-if="!isNeutral" :class="['stat-trend', isNegative ? 'down' : 'up']">
        <el-icon class="trend-ic"><component :is="isNegative ? ArrowDown : ArrowUp" /></el-icon>
        <span>{{ trend }}</span>
      </div>
      <div v-else class="stat-trend live">
        <span class="live-dot" />
        <span>{{ trend }}</span>
      </div>
    </div>
    <div class="stat-value font-mono">{{ display }}</div>
    <div v-if="subline" class="stat-sub font-mono">{{ subline }}</div>
    <div v-else class="stat-sub placeholder" />
  </div>
</template>

<style scoped>
.stat-card {
  position: relative;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 20px;
  min-height: 120px;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--bar-color, var(--gold)), transparent);
  pointer-events: none;
}

.stat-card[data-variant='hero'] {
  --bar-color: var(--gold);
}
.stat-card[data-variant='user'] {
  --bar-color: var(--teal);
}
.stat-card[data-variant='risk'] {
  --bar-color: var(--red);
}
.stat-card[data-variant='default'] {
  --bar-color: #5a6578;
}

.stat-card:hover {
  border-color: var(--gold);
}

.decor-icon {
  position: absolute;
  right: 16px;
  bottom: 12px;
  opacity: 0.06;
  color: var(--text);
  pointer-events: none;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.stat-title {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  max-width: 70%;
  line-height: 1.4;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
  padding: 3px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.stat-trend.up {
  color: var(--teal);
  background: rgba(0, 212, 177, 0.12);
}

.stat-trend.down {
  color: var(--red);
  background: rgba(255, 77, 109, 0.12);
}

.stat-trend.live {
  color: var(--gold);
  background: var(--gold-dim);
}

.trend-ic {
  font-size: 11px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--red);
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}

.stat-value {
  position: relative;
  z-index: 1;
  font-size: 32px;
  font-weight: 700;
  color: var(--gold);
  line-height: 1.1;
  margin-top: 12px;
}

.stat-sub {
  margin-top: 6px;
  font-size: 10px;
  color: var(--text-dim);
  position: relative;
  z-index: 1;
}

.stat-sub.placeholder {
  min-height: 14px;
}
</style>
