<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { adminAccountApi } from '../../api/admin';
import { ApiError } from '../../api/http';

const loading = ref(false);
const profileJson = ref('');
const menusJson = ref('');
const permissionsJson = ref('');

async function run(label: string, fn: () => Promise<unknown>, target: typeof profileJson) {
  loading.value = true;
  target.value = '';
  try {
    const res = await fn();
    target.value = JSON.stringify(res, null, 2);
    ElMessage.success(`${label} 已更新`);
  } catch (e) {
    if (e instanceof ApiError) {
      target.value = JSON.stringify({ error: e.message, code: e.code }, null, 2);
    } else {
      target.value = String(e);
    }
    ElMessage.error(e instanceof Error ? e.message : '请求失败');
  } finally {
    loading.value = false;
  }
}

const loadProfile = () => run('资料', () => adminAccountApi.profile().then((r) => r), profileJson);
const loadMenus = () => run('菜单', () => adminAccountApi.menus().then((r) => r), menusJson);
const loadPermissions = () => run('权限', () => adminAccountApi.permissions().then((r) => r), permissionsJson);
</script>

<template>
  <div class="page">
    <header class="block-head">
      <h2 class="block-title font-display">账户接口数据</h2>
      <p class="block-desc">
        对应文档：GET <span class="font-mono">/admin/account/profile</span>、
        <span class="font-mono">/admin/account/menus</span>、
        <span class="font-mono">/admin/account/permissions</span>。用于核对登录态与后端返回结构。
      </p>
    </header>

    <div class="actions">
      <el-button type="primary" :loading="loading" @click="loadProfile">拉取资料</el-button>
      <el-button :loading="loading" @click="loadMenus">拉取菜单</el-button>
      <el-button :loading="loading" @click="loadPermissions">拉取权限</el-button>
    </div>

    <div class="panels">
      <el-card shadow="never" class="card">
        <template #header>profile</template>
        <pre class="json font-mono">{{ profileJson || '—' }}</pre>
      </el-card>
      <el-card shadow="never" class="card">
        <template #header>menus</template>
        <pre class="json font-mono">{{ menusJson || '—' }}</pre>
      </el-card>
      <el-card shadow="never" class="card">
        <template #header>permissions</template>
        <pre class="json font-mono">{{ permissionsJson || '—' }}</pre>
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

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.card {
  border-radius: 8px;
}

.json {
  margin: 0;
  max-height: 360px;
  overflow: auto;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
