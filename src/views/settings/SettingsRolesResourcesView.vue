<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { adminRoleApi, adminResourceApi } from '../../api/admin';
import { ApiError } from '../../api/http';
import { extractPageRows } from '../../api/listUtils';

const tab = ref<'roles' | 'resList' | 'resTree'>('roles');
const loading = ref(false);
const errorText = ref('');

const rolesEnvelope = ref<unknown>(null);
const resourceListEnvelope = ref<unknown>(null);
const resourceTreeEnvelope = ref<unknown>(null);

const roleRows = computed(() => {
  const e = rolesEnvelope.value;
  if (!e || typeof e !== 'object') return [] as Record<string, unknown>[];
  return extractPageRows((e as { data?: unknown }).data).rows;
});

const resourceRows = computed(() => {
  const e = resourceListEnvelope.value;
  if (!e || typeof e !== 'object') return [] as Record<string, unknown>[];
  return extractPageRows((e as { data?: unknown }).data).rows;
});

type TreeNode = { label: string; children?: TreeNode[] };

function mapTreeNode(n: Record<string, unknown>): TreeNode {
  const label = String(n.title ?? n.name ?? n.label ?? n.menu_name ?? n.code ?? n.id ?? '—');
  const rawKids = n.children ?? n.child ?? n.nodes ?? n.routes;
  const kids = Array.isArray(rawKids)
    ? (rawKids as Record<string, unknown>[]).map((c) => mapTreeNode(c))
    : [];
  return kids.length ? { label, children: kids } : { label };
}

const treeData = computed(() => {
  const e = resourceTreeEnvelope.value;
  if (!e || typeof e !== 'object') return [] as TreeNode[];
  const d = (e as { data?: unknown }).data ?? e;
  let roots: unknown[] = [];
  if (Array.isArray(d)) roots = d;
  else if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    const arr = o.list ?? o.tree ?? o.nodes ?? o.children ?? o.data;
    if (Array.isArray(arr)) roots = arr;
  }
  return roots.filter((x) => x && typeof x === 'object').map((x) => mapTreeNode(x as Record<string, unknown>));
});

async function loadRoles() {
  loading.value = true;
  errorText.value = '';
  try {
    rolesEnvelope.value = await adminRoleApi.list({ page: 1, page_size: 100, keyword: '' });
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    rolesEnvelope.value = null;
    ElMessage.error(errorText.value);
  } finally {
    loading.value = false;
  }
}

async function loadResourceList() {
  loading.value = true;
  errorText.value = '';
  try {
    resourceListEnvelope.value = await adminResourceApi.list({ type: 'menu', status: 1, keyword: '' });
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    resourceListEnvelope.value = null;
    ElMessage.error(errorText.value);
  } finally {
    loading.value = false;
  }
}

async function loadResourceTree() {
  loading.value = true;
  errorText.value = '';
  try {
    resourceTreeEnvelope.value = await adminResourceApi.tree({ status: 1 });
  } catch (e) {
    errorText.value = e instanceof ApiError ? e.message : String(e);
    resourceTreeEnvelope.value = null;
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

function refreshCurrent() {
  if (tab.value === 'roles') void loadRoles();
  else if (tab.value === 'resList') void loadResourceList();
  else void loadResourceTree();
}
</script>

<template>
  <div class="page">
    <header class="block-head">
      <div class="head-top">
        <div>
          <h2 class="block-title font-display">角色与资源</h2>
          <p class="block-desc">只读查看后端角色列表、资源清单与菜单树。新增/编辑角色或资源请使用「API 调试」或后续扩展表单。</p>
        </div>
        <el-button :icon="Refresh" :loading="loading" @click="refreshCurrent">刷新当前页</el-button>
      </div>
    </header>

    <el-alert v-if="errorText" type="error" :title="errorText" :closable="false" class="banner-err" />

    <el-tabs v-model="tab" class="tabs" @tab-change="onTabChange">
      <el-tab-pane label="角色" name="roles">
        <el-table v-loading="loading" v-if="roleRows.length" :data="roleRows" stripe border size="small" max-height="480">
          <el-table-column prop="id" label="ID" width="72" />
          <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="code" label="编码" min-width="100" show-overflow-tooltip />
          <el-table-column label="状态" width="88">
            <template #default="{ row }">
              {{ Number((row as Record<string, unknown>).status) === 1 ? '启用' : '停用' }}
            </template>
          </el-table-column>
        </el-table>
        <p v-else-if="!loading" class="empty">暂无角色数据。</p>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="r">
            <pre class="json font-mono">{{ rolesEnvelope ? JSON.stringify(rolesEnvelope, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <el-tab-pane label="资源列表" name="resList">
        <el-table v-loading="loading" v-if="resourceRows.length" :data="resourceRows" stripe border size="small" max-height="480">
          <el-table-column prop="id" label="ID" width="72" />
          <el-table-column label="名称" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ (row as Record<string, unknown>).title ?? (row as Record<string, unknown>).name ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="88" />
          <el-table-column label="路由" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="font-mono">{{ (row as Record<string, unknown>).route_path ?? '—' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <p v-else-if="!loading" class="empty">暂无资源数据，请先切到本页触发加载。</p>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="l">
            <pre class="json font-mono">{{ resourceListEnvelope ? JSON.stringify(resourceListEnvelope, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>

      <el-tab-pane label="资源树" name="resTree">
        <div v-loading="loading" class="tree-wrap">
          <el-tree v-if="treeData.length" :data="treeData" default-expand-all class="res-tree" />
          <p v-else-if="!loading" class="empty">暂无树数据，请先切到本页触发加载。</p>
        </div>
        <el-collapse class="raw-collapse">
          <el-collapse-item title="原始响应 JSON" name="t">
            <pre class="json font-mono">{{ resourceTreeEnvelope ? JSON.stringify(resourceTreeEnvelope, null, 2) : '—' }}</pre>
          </el-collapse-item>
        </el-collapse>
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
  max-width: 720px;
}

.banner-err {
  margin-bottom: 12px;
}

.tabs {
  margin-top: 4px;
}

.empty {
  margin: 12px 0;
  font-size: 12px;
  color: var(--text-dim);
}

.tree-wrap {
  min-height: 120px;
  padding: 8px 0;
}

.res-tree {
  background: transparent;
  font-size: 13px;
}

.raw-collapse {
  margin-top: 12px;
  --el-collapse-border-color: var(--border);
}

.raw-collapse :deep(.el-collapse-item__header) {
  font-size: 12px;
  color: var(--text-dim);
}

.json {
  margin: 0;
  max-height: min(40vh, 320px);
  overflow: auto;
  font-size: 10px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
