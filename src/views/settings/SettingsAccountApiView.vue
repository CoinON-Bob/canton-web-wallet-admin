<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { adminAccountApi } from '../../api/admin';
import { ApiError } from '../../api/http';
import { extractDetailRecord } from '../../api/listUtils';

const loading = ref(false);
const err = ref('');

const profileEnv = ref<unknown>(null);
const menusEnv = ref<unknown>(null);
const permEnv = ref<unknown>(null);

const profileFlat = computed(() => {
  const raw = profileEnv.value;
  if (!raw || typeof raw !== 'object') return [] as { k: string; v: string }[];
  const data = (raw as { data?: unknown }).data;
  let rec =
    extractDetailRecord(data) ?? extractDetailRecord(raw as Record<string, unknown>) ?? null;
  if (!rec && data && typeof data === 'object' && !Array.isArray(data)) {
    rec = data as Record<string, unknown>;
  }
  if (!rec) return [];
  return Object.entries(rec)
    .filter(([k]) => !['password', 'pwd', 'token', 'secret'].some((s) => k.toLowerCase().includes(s)))
    .map(([k, v]) => ({
      k,
      v: typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—'),
    }));
});

const menuRows = computed(() => {
  const raw = menusEnv.value;
  if (!raw || typeof raw !== 'object') return [] as Record<string, unknown>[];
  const d = (raw as { data?: unknown }).data ?? raw;
  if (Array.isArray(d)) return d as Record<string, unknown>[];
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    const list = o.list ?? o.menus ?? o.items ?? o.children;
    if (Array.isArray(list)) return list as Record<string, unknown>[];
  }
  return [];
});

const permissionTags = computed(() => {
  const raw = permEnv.value;
  if (!raw || typeof raw !== 'object') return [] as string[];
  const d = (raw as { data?: unknown }).data ?? raw;
  if (Array.isArray(d)) {
    return d.map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));
  }
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    const list = o.list ?? o.permissions ?? o.codes ?? o.keys;
    if (Array.isArray(list)) {
      return list.map((x) => (typeof x === 'string' ? x : (x as { code?: string }).code ?? JSON.stringify(x)));
    }
  }
  return [];
});

async function loadAll() {
  loading.value = true;
  err.value = '';
  try {
    const [p, m, perm] = await Promise.all([
      adminAccountApi.profile(),
      adminAccountApi.menus(),
      adminAccountApi.permissions(),
    ]);
    profileEnv.value = p;
    menusEnv.value = m;
    permEnv.value = perm;
  } catch (e) {
    err.value = e instanceof ApiError ? e.message : String(e);
    ElMessage.error(err.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadAll();
});
</script>

<template>
  <div class="page" v-loading="loading">
    <header class="block-head">
      <div class="head-top">
        <div>
          <h2 class="block-title font-display">当前账户</h2>
          <p class="block-desc">登录管理员的资料、可见菜单与权限码，来自后端账户接口。</p>
        </div>
        <el-button type="primary" :icon="Refresh" :loading="loading" @click="loadAll">全部刷新</el-button>
      </div>
    </header>

    <el-alert v-if="err" type="error" :title="err" :closable="false" class="banner-err" />

    <div class="grid">
      <el-card shadow="never" class="card">
        <template #header>
          <span class="card-title">基本资料</span>
        </template>
        <el-table v-if="profileFlat.length" :data="profileFlat" stripe border size="small" class="tbl">
          <el-table-column prop="k" label="字段" width="160" class-name="col-key" />
          <el-table-column prop="v" label="值" min-width="200" show-overflow-tooltip />
        </el-table>
        <p v-else class="empty">暂无数据，请检查是否已登录或接口是否返回 data。</p>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="p">
            <pre class="json font-mono">{{ profileEnv ? JSON.stringify(profileEnv, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card shadow="never" class="card">
        <template #header>
          <span class="card-title">菜单结构</span>
        </template>
        <el-table v-if="menuRows.length" :data="menuRows" stripe border size="small" max-height="360">
          <el-table-column type="index" width="48" />
          <el-table-column label="名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ (row as Record<string, unknown>).title ?? (row as Record<string, unknown>).name ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column label="路由 / path" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="font-mono">{{
                (row as Record<string, unknown>).path ?? (row as Record<string, unknown>).route_path ?? '—'
              }}</span>
            </template>
          </el-table-column>
        </el-table>
        <p v-else class="empty">暂无菜单数据。</p>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="m">
            <pre class="json font-mono">{{ menusEnv ? JSON.stringify(menusEnv, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card shadow="never" class="card card-wide">
        <template #header>
          <span class="card-title">权限标识</span>
        </template>
        <div v-if="permissionTags.length" class="tags">
          <el-tag v-for="(t, i) in permissionTags" :key="i" class="tag" type="info" effect="plain">{{ t }}</el-tag>
        </div>
        <p v-else class="empty">暂无权限码或结构非列表，可展开下方 JSON 核对。</p>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="perm">
            <pre class="json font-mono">{{ permEnv ? JSON.stringify(permEnv, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: 24px;
}

.block-head {
  margin-bottom: 16px;
}

.head-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
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
  max-width: 640px;
}

.banner-err {
  margin-bottom: 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  align-items: start;
}

.card-wide {
  grid-column: 1 / -1;
}

.card {
  border-radius: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
}

.tbl :deep(.col-key) {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
}

.empty {
  margin: 0 0 12px;
  font-size: 12px;
  color: var(--text-dim);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.tag {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
}

.raw-collapse {
  margin-top: 8px;
  --el-collapse-border-color: var(--border);
}

.raw-collapse :deep(.el-collapse-item__header) {
  font-size: 12px;
  color: var(--text-dim);
}

.json {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  font-size: 10px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
