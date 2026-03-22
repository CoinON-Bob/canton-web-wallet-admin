<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import {
  DataAnalysis,
  User,
  PieChart,
  Switch,
  TrendCharts,
  Warning,
  Monitor,
  Setting,
} from '@element-plus/icons-vue';

const route = useRoute();
const auth = useAuthStore();

type NavItem = { label: string; path: string; icon: typeof User; badge?: string };

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Dashboard',
    items: [{ label: '总览', path: '/dashboard', icon: DataAnalysis }],
  },
  {
    label: '用户与资产',
    items: [
      { label: '用户管理', path: '/users', icon: User },
      { label: '资产管理', path: '/assets', icon: PieChart },
    ],
  },
  {
    label: '交易',
    items: [
      { label: 'CC 转账统计', path: '/transfer/stats', icon: Switch },
      { label: 'CC 转账明细', path: '/transfer/list', icon: Switch },
      { label: '预测合约', path: '/contracts', icon: TrendCharts },
    ],
  },
  {
    label: '运营 & 系统',
    items: [
      { label: '风控安全', path: '/risk', icon: Warning, badge: '3' },
      { label: '节点监控', path: '/monitor', icon: Monitor },
      { label: '系统配置', path: '/settings', icon: Setting },
    ],
  },
];

const isActive = (path: string) => {
  if (path === '/settings') return route.path.startsWith('/settings');
  return route.path === path || route.path.startsWith(path + '/');
};
</script>

<template>
  <aside class="sidenav">
    <div class="logo-row">
      <div class="hex" aria-hidden="true">
        <span class="hex-inner">CC</span>
      </div>
      <div class="logo-text">
        <div class="logo-title font-display">Canton Chain</div>
        <div class="logo-sub">ADMIN CONSOLE</div>
      </div>
    </div>

    <nav class="nav-scroll">
      <div v-for="g in groups" :key="g.label" class="group">
        <div class="group-label">{{ g.label }}</div>
        <RouterLink
          v-for="item in g.items"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
        >
          <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </RouterLink>
      </div>
    </nav>

    <div class="admin-card">
      <div class="admin-avatar">{{ auth.userInitial }}</div>
      <div class="admin-meta">
        <div class="admin-name">{{ auth.displayName }}</div>
        <div class="admin-email font-mono">@{{ auth.username || 'admin' }}</div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidenav {
  height: 100%;
  min-height: 0;
  width: 220px;
  background: var(--bg-base);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.logo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.hex {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--gold), #8b6914);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.hex-inner {
  font-family: 'Space Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #000;
}

.logo-title {
  font-size: 17px;
  color: var(--text);
  line-height: 1.2;
}

.logo-sub {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  color: var(--gold);
  letter-spacing: 0.25em;
  margin-top: 4px;
}

.nav-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0 16px;
}

.group {
  margin-bottom: 8px;
}

.group-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-dim);
  padding: 12px 16px 8px;
  font-family: 'Space Mono', monospace;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 14px 0 16px;
  margin: 0 8px 2px;
  border-radius: 6px;
  color: var(--text-dim);
  border-left: 2px solid transparent;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    border-color 0.15s ease;
}

.nav-item:hover {
  color: var(--text);
  border-left-color: rgba(201, 162, 39, 0.4);
}

.nav-item.active {
  color: var(--gold);
  background: var(--gold-dim);
  border-left-color: var(--gold);
}

.nav-icon {
  width: 20px;
  font-size: 20px;
  margin-right: 12px;
}

.nav-label {
  flex: 1;
  font-size: 14px;
}

.badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 77, 109, 0.25);
  color: var(--red);
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
}

.admin-card {
  margin: 12px;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card);
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--gold-dim);
  color: var(--gold);
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.admin-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.admin-email {
  font-size: 10px;
  color: var(--text-dim);
  margin-top: 2px;
}

@media (max-width: 1365px) {
  .sidenav {
    width: 64px;
  }
  .logo-text,
  .group-label,
  .nav-label,
  .badge,
  .admin-meta {
    display: none;
  }
  .logo-row {
    justify-content: center;
    padding: 16px 8px;
  }
  .nav-item {
    justify-content: center;
    padding: 0 8px;
    margin: 0 6px;
  }
  .nav-icon {
    margin-right: 0;
  }
  .admin-card {
    justify-content: center;
    padding: 10px;
  }
}
</style>
