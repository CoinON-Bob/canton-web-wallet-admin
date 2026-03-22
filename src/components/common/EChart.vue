<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps<{ option: Record<string, unknown>; height?: string }>();
const chartRef = ref<HTMLDivElement>();
let chart: echarts.ECharts | null = null;

const resize = () => chart?.resize();

onMounted(() => {
  if (!chartRef.value) return;
  chart = echarts.init(chartRef.value, 'dark');
  chart.setOption(props.option);
  window.addEventListener('resize', resize);
});

watch(() => props.option, (next) => chart?.setOption(next, true), { deep: true });

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  chart?.dispose();
});
</script>

<template>
  <div ref="chartRef" :style="{ height: height || '320px', width: '100%' }" />
</template>
