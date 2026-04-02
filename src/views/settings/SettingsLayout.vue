<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Setting, User, Document, Link, Key } from '@element-plus/icons-vue';

const route = useRoute();

const tabs = [
  { label: '基础配置', path: '/settings/general', icon: Setting },
  { label: '管理员', path: '/settings/admins', icon: User, match: /^\/settings\/admins/ },
  { label: '角色与资源', path: '/settings/roles-resources', icon: Key },
  { label: '账户接口', path: '/settings/account-api', icon: Link },
  { label: 'API 调试', path: '/settings/api-debug', icon: Link },
  { label: '操作日志', path: '/settings/logs', icon: Document },
];

const isActive = (t: (typeof tabs)[0]) => {
  if (t.match) return t.match.test(route.path);
  return route.path === t.path || route.path.startsWith(t.path + '/');
};

const flowHint = computed(() => {
  if (route.path.includes('/permissions')) return '流程：已选择管理员 → 勾选权限 → 保存';
  if (route.path.endsWith('/new') || route.name === 'settings-admin-edit')
    return '流程：填写账号信息 → 保存后可在列表中配置权限';
  return '';
});
</script>

<template>
  <div class="settings-layout">
    <nav class="sub-nav" aria-label="系统配置子导航">
      <RouterLink
        v-for="t in tabs"
        :key="t.path"
        :to="t.path"
        class="sub-tab"
        :class="{ active: isActive(t) }"
      >
        <el-icon class="sub-ic"><component :is="t.icon" /></el-icon>
        {{ t.label }}
      </RouterLink>
    </nav>
    <p v-if="flowHint" class="flow-hint font-mono">{{ flowHint }}</p>
    <div class="sub-page">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.settings-layout {
  max-width: 1400px;
  margin: 0 auto;
}

.sub-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
  padding: 4px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.sub-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #9aacca;
  border: 1px solid transparent;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.sub-tab:hover {
  color: var(--text);
  background: rgba(255, 255, 255, 0.04);
}

.sub-tab.active {
  color: var(--gold);
  background: var(--gold-dim);
  border-color: rgba(201, 162, 39, 0.35);
}

.sub-ic {
  font-size: 16px;
}

.flow-hint {
  margin: 0 0 16px;
  font-size: 11px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
}

.sub-page {
  min-height: 0;
}
</style>
