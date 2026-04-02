<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { ADMIN_DEBUG_ENDPOINTS, type DebugEndpoint } from '../../api/adminDebugCatalog';
import { requestEnvelope, ApiError } from '../../api/http';

const groups = computed(() => {
  const g = new Map<string, DebugEndpoint[]>();
  for (const e of ADMIN_DEBUG_ENDPOINTS) {
    if (!g.has(e.group)) g.set(e.group, []);
    g.get(e.group)!.push(e);
  }
  return [...g.entries()];
});

const selectedId = ref(ADMIN_DEBUG_ENDPOINTS[0]!.id);
const queryStr = ref('');
const bodyStr = ref('');
const loading = ref(false);
const resultText = ref('');
const elapsedMs = ref<number | null>(null);
const statusLine = ref('');

const current = computed(() => ADMIN_DEBUG_ENDPOINTS.find((e) => e.id === selectedId.value)!);

function syncEditorsFromEndpoint(ep: DebugEndpoint) {
  if (ep.query) {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(ep.query)) {
      if (v !== undefined && v !== null) u.set(k, String(v));
    }
    queryStr.value = u.toString();
  } else {
    queryStr.value = '';
  }
  bodyStr.value = ep.body ?? '{}';
}

watch(
  selectedId,
  (id) => {
    const ep = ADMIN_DEBUG_ENDPOINTS.find((e) => e.id === id);
    if (ep) syncEditorsFromEndpoint(ep);
  },
  { immediate: true }
);

function pathWithQuery(path: string, qs: string): string {
  const t = qs.trim();
  if (!t) return path;
  return `${path}?${t}`;
}

async function sendRequest() {
  const ep = current.value;
  const path = pathWithQuery(ep.path, queryStr.value);
  const skipAuth = ep.path === '/admin/public' || ep.path === '/admin/login';
  let body: unknown = undefined;
  if (ep.method === 'POST') {
    try {
      body = bodyStr.value.trim() ? JSON.parse(bodyStr.value) : undefined;
    } catch {
      ElMessage.error('请求体不是合法 JSON');
      return;
    }
  }
  loading.value = true;
  resultText.value = '';
  statusLine.value = '';
  elapsedMs.value = null;
  const t0 = performance.now();
  try {
    const env = await requestEnvelope(ep.method, path, { body, skipAuth, timeoutMs: 60000 });
    elapsedMs.value = Math.round(performance.now() - t0);
    statusLine.value = `code=${env.code} · ${elapsedMs.value}ms`;
    resultText.value = JSON.stringify(env, null, 2);
    ElMessage.success('请求完成');
  } catch (e) {
    elapsedMs.value = Math.round(performance.now() - t0);
    if (e instanceof ApiError) {
      statusLine.value = `错误 · ${elapsedMs.value}ms · ${e.message}`;
      resultText.value = JSON.stringify({ error: e.message, code: e.code, status: e.status }, null, 2);
    } else {
      statusLine.value = `错误 · ${elapsedMs.value}ms`;
      resultText.value = String(e);
    }
    ElMessage.error(e instanceof Error ? e.message : '请求失败');
  } finally {
    loading.value = false;
  }
}

function copyResult() {
  if (!resultText.value) return;
  navigator.clipboard.writeText(resultText.value);
  ElMessage.success('已复制');
}
</script>

<template>
  <div class="debug-page">
    <header class="block-head">
      <h2 class="block-title font-display">API 调试</h2>
      <p class="block-desc">
        按 Apipost 文档预置后台接口。GET 使用下方 Query 字符串；POST 使用 JSON 请求体。除
        <span class="font-mono">/admin/public</span> 与
        <span class="font-mono">/admin/login</span>
        外，会自动带上当前登录态的 Bearer Token。
      </p>
    </header>

    <div class="grid">
      <el-card shadow="never" class="card">
        <template #header>选择接口</template>
        <el-select v-model="selectedId" filterable class="ep-select" placeholder="选择接口">
          <el-option-group v-for="[label, items] in groups" :key="label" :label="label">
            <el-option v-for="e in items" :key="e.id" :label="`${e.method} ${e.label}`" :value="e.id" />
          </el-option-group>
        </el-select>
        <div class="meta font-mono">
          <div><span class="k">METHOD</span> {{ current.method }}</div>
          <div><span class="k">PATH</span> {{ current.path }}</div>
        </div>
        <div class="field-label">Query（URL 编码键值对，不含 ?）</div>
        <el-input v-model="queryStr" type="textarea" :rows="4" class="mono" placeholder="page=1&page_size=10" />
        <template v-if="current.method === 'POST'">
          <div class="field-label">Body（JSON）</div>
          <el-input v-model="bodyStr" type="textarea" :rows="14" class="mono" />
        </template>
        <el-button type="primary" class="send" :loading="loading" @click="sendRequest">发送请求</el-button>
      </el-card>

      <el-card shadow="never" class="card out">
        <template #header>
          <div class="out-head">
            <span>响应</span>
            <el-button text type="primary" :disabled="!resultText" @click="copyResult">复制 JSON</el-button>
          </div>
        </template>
        <p v-if="statusLine" class="status font-mono">{{ statusLine }}</p>
        <pre class="result font-mono">{{ resultText || '（尚无响应）' }}</pre>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.debug-page {
  padding-bottom: 24px;
}

.block-head {
  margin-bottom: 16px;
}

.block-title {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 400;
}

.block-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.55;
  max-width: 720px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(320px, 1.2fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 960px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border-radius: 8px;
}

.ep-select {
  width: 100%;
  margin-bottom: 12px;
}

.meta {
  font-size: 11px;
  color: var(--text-dim);
  margin-bottom: 14px;
  line-height: 1.6;
}

.meta .k {
  display: inline-block;
  width: 56px;
  color: var(--gold);
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-dim);
  margin: 10px 0 6px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mono :deep(textarea) {
  font-family: 'Space Mono', ui-monospace, monospace;
  font-size: 12px;
}

.send {
  margin-top: 14px;
  width: 100%;
}

.out-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.status {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--teal);
}

.result {
  margin: 0;
  padding: 12px;
  max-height: min(70vh, 640px);
  overflow: auto;
  font-size: 12px;
  line-height: 1.45;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  border: 1px solid var(--border);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
