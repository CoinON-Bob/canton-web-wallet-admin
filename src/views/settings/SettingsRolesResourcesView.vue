<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { adminRoleApi, adminResourceApi } from '../../api/admin';
import { ApiError } from '../../api/http';

const tab = ref<'roles' | 'resList' | 'resTree'>('roles');
const loading = ref(false);
const errorText = ref('');
const rolesPayload = ref('');
const resourceListPayload = ref('');
const resourceTreePayload = ref('');

function stringifyEnvelope(e: unknown) {
  return JSON.stringify(e, null, 2);
}

async function loadRoles() {
  loading.value = true;
  errorText.value = '';
  try {
    const r = await adminRoleApi.list({ page: 1, page_size: 50, keyword: '' });
    rolesPayload.value = stringifyEnvelope(r);
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    rolesPayload.value = '';
    ElMessage.error(errorText.value);
  } finally {
    loading.value = false;
  }
}

async function loadResourceList() {
  loading.value = true;
  errorText.value = '';
  try {
    const r = await adminResourceApi.list({ type: 'menu', status: 1, keyword: '' });
    resourceListPayload.value = stringifyEnvelope(r);
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    resourceListPayload.value = '';
    ElMessage.error(errorText.value);
  } finally {
    loading.value = false;
  }
}

async function loadResourceTree() {
  loading.value = true;
  errorText.value = '';
  try {
    const r = await adminResourceApi.tree({ status: 1 });
    resourceTreePayload.value = stringifyEnvelope(r);
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    resourceTreePayload.value = '';
    ElMessage.error(errorText.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadRoles();
});

function onTabChange(name: string | number) {
  const n = String(name);
  if (n === 'roles') void loadRoles();
  if (n === 'resList') void loadResourceList();
  if (n === 'resTree') void loadResourceTree();
}
</script>

<template>
  <div class="page">
    <header class="block-head">
      <h2 class="block-title font-display">角色与资源</h2>
      <p class="block-desc">
        只读拉取文档中的列表/树接口，便于核对数据结构。写入类接口请使用「API 调试」。
      </p>
    </header>

    <el-tabs v-model="tab" class="tabs" @tab-change="onTabChange">
      <el-tab-pane label="角色列表" name="roles">
        <div class="toolbar">
          <el-button type="primary" :loading="loading" @click="loadRoles">刷新</el-button>
          <span class="hint font-mono">GET /admin/role/list</span>
        </div>
        <pre class="json font-mono">{{ rolesPayload || '—' }}</pre>
      </el-tab-pane>
      <el-tab-pane label="资源列表" name="resList">
        <div class="toolbar">
          <el-button type="primary" :loading="loading" @click="loadResourceList">刷新</el-button>
          <span class="hint font-mono">GET /admin/resource/list</span>
        </div>
        <pre class="json font-mono">{{ resourceListPayload || '—' }}</pre>
      </el-tab-pane>
      <el-tab-pane label="资源树" name="resTree">
        <div class="toolbar">
          <el-button type="primary" :loading="loading" @click="loadResourceTree">刷新</el-button>
          <span class="hint font-mono">GET /admin/resource/tree</span>
        </div>
        <pre class="json font-mono">{{ resourceTreePayload || '—' }}</pre>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.page {
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
  max-width: 640px;
}

.tabs {
  margin-top: 8px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.hint {
  font-size: 11px;
  color: var(--text-dim);
}

.json {
  margin: 0;
  padding: 12px;
  max-height: min(65vh, 560px);
  overflow: auto;
  font-size: 11px;
  line-height: 1.45;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 8px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
