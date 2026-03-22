<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SideNav from './SideNav.vue';
import { useAuthStore } from '../../store/auth';
import { Bell, Refresh, ArrowDown, User, Lock, Setting, QuestionFilled, SwitchButton } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  const matched = route.matched;
  for (let i = matched.length - 1; i >= 0; i--) {
    const t = matched[i].meta?.title;
    if (typeof t === 'string' && t) return t;
  }
  return '总览仪表盘';
});

const logout = () => {
  auth.logout();
  router.push('/login');
};

const refresh = () => {
  router.replace({ path: route.fullPath, query: { ...route.query, _t: String(Date.now()) } });
};

const showNotifications = ref(false);
const notifications = ref([
  { id: 1, title: '风控告警', desc: '异常大额转账待处理', time: '10 分钟前', read: false },
  { id: 2, title: '节点同步', desc: 'Tokyo 节点延迟升高', time: '32 分钟前', read: false },
  { id: 3, title: '系统', desc: '配置已自动备份', time: '2 小时前', read: true },
]);

const markAllRead = () => {
  notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
  ElMessage.success('已全部标为已读（Mock）');
};

const showProfile = ref(false);
const showPassword = ref(false);
const showHelp = ref(false);

const pwdForm = ref({ old: '', next: '', again: '' });

const savePassword = () => {
  if (!pwdForm.value.next || pwdForm.value.next.length < 6) {
    ElMessage.warning('新密码至少 6 位');
    return;
  }
  if (pwdForm.value.next !== pwdForm.value.again) {
    ElMessage.warning('两次新密码不一致');
    return;
  }
  ElMessage.success('密码已更新（Mock）');
  showPassword.value = false;
  pwdForm.value = { old: '', next: '', again: '' };
};

const goSettings = () => {
  router.push('/settings/general');
};
</script>

<template>
  <el-container class="shell">
    <el-aside class="sidebar-wrap" width="220px">
      <SideNav />
    </el-aside>
    <el-container class="right-col">
      <el-header class="topbar" height="60px">
        <h1 class="top-title font-display">{{ pageTitle }}</h1>
        <div class="chain-status">
          <span class="pulse-dot" aria-hidden="true" />
          <span class="chain-text font-mono">Canton Mainnet · Block #8,412,037</span>
        </div>
        <div class="top-actions">
          <button type="button" class="icon-circle" title="刷新" @click="refresh">
            <el-icon><Refresh /></el-icon>
          </button>
          <button type="button" class="icon-circle has-dot" title="通知" @click="showNotifications = true">
            <el-icon><Bell /></el-icon>
          </button>

          <el-dropdown trigger="click" placement="bottom-end">
            <div class="user-trigger" role="button" tabindex="0">
              <div class="user-av" aria-hidden="true">{{ auth.userInitial }}</div>
              <div class="user-text">
                <span class="user-name">{{ auth.displayName }}</span>
                <span class="user-login font-mono">@{{ auth.username || 'admin' }}</span>
              </div>
              <el-icon class="chev"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown">
                <el-dropdown-item :icon="User" @click="showProfile = true">个人资料</el-dropdown-item>
                <el-dropdown-item :icon="Setting" @click="goSettings">系统设置</el-dropdown-item>
                <el-dropdown-item :icon="Lock" @click="showPassword = true">修改密码</el-dropdown-item>
                <el-dropdown-item :icon="QuestionFilled" @click="showHelp = true">帮助中心</el-dropdown-item>
                <el-dropdown-item divided :icon="SwitchButton" @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main"><router-view /></el-main>
    </el-container>
  </el-container>

  <!-- 通知 -->
  <el-dialog v-model="showNotifications" title="通知中心" width="420px" destroy-on-close>
    <div class="notif-toolbar">
      <el-button size="small" @click="markAllRead">全部标为已读</el-button>
    </div>
    <ul class="notif-list">
      <li v-for="n in notifications" :key="n.id" :class="['notif-item', { unread: !n.read }]">
        <div class="notif-dot" />
        <div>
          <div class="notif-title">{{ n.title }}</div>
          <div class="notif-desc">{{ n.desc }}</div>
          <div class="notif-time font-mono">{{ n.time }}</div>
        </div>
      </li>
    </ul>
  </el-dialog>

  <!-- 个人资料 -->
  <el-dialog v-model="showProfile" title="个人资料" width="400px">
    <div class="profile-grid">
      <div class="profile-av">{{ auth.userInitial }}</div>
      <div>
        <p><strong>显示名</strong> {{ auth.displayName }}</p>
        <p><strong>登录账号</strong> <span class="font-mono">{{ auth.username || '—' }}</span></p>
        <p><strong>角色</strong> 超级管理员（Mock）</p>
        <p><strong>最后登录</strong> <span class="font-mono">2026-03-22 09:12</span></p>
      </div>
    </div>
  </el-dialog>

  <!-- 修改密码 -->
  <el-dialog v-model="showPassword" title="修改密码" width="400px" @closed="pwdForm = { old: '', next: '', again: '' }">
    <el-form label-position="top">
      <el-form-item label="当前密码">
        <el-input v-model="pwdForm.old" type="password" show-password autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="pwdForm.next" type="password" show-password autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="pwdForm.again" type="password" show-password autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showPassword = false">取消</el-button>
      <el-button type="primary" @click="savePassword">保存</el-button>
    </template>
  </el-dialog>

  <!-- 帮助 -->
  <el-dialog v-model="showHelp" title="帮助中心" width="480px">
    <ul class="help-list">
      <li>快捷键：<span class="font-mono">/</span> 聚焦搜索（即将支持）</li>
      <li>权限变更后需重新登录生效（Mock 提示）。</li>
      <li>数据均为演示数据，不接真实链上环境。</li>
      <li>问题反馈：<span class="font-mono">support@cantonchain.cc</span></li>
    </ul>
  </el-dialog>
</template>

<style scoped>
.shell {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  background: var(--bg-base);
}

.sidebar-wrap {
  width: 220px !important;
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.right-col {
  min-width: 0;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.top-title {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  color: var(--text);
  flex: 0 0 auto;
  max-width: 220px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chain-status {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--teal);
  flex-shrink: 0;
  animation: chain-pulse 2s ease-in-out infinite;
}

.chain-text {
  font-size: 12px;
  color: var(--text-dim);
  letter-spacing: 0.02em;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-dim);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.15s ease;
  padding: 0;
}

.icon-circle:hover {
  color: var(--gold);
  border-color: rgba(201, 162, 39, 0.5);
}

.icon-circle:active {
  transform: scale(0.98);
}

.icon-circle.has-dot {
  position: relative;
}

.icon-circle.has-dot::after {
  content: '';
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  background: var(--red);
  border-radius: 50%;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
  max-width: 220px;
}

.user-trigger:hover {
  border-color: rgba(201, 162, 39, 0.45);
}

.user-av {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gold-dim);
  color: var(--gold);
  font-weight: 800;
  font-size: 14px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-login {
  font-size: 10px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chev {
  color: var(--text-dim);
  font-size: 12px;
  flex-shrink: 0;
}

.main {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: transparent;
  -webkit-overflow-scrolling: touch;
}

.notif-toolbar {
  margin-bottom: 12px;
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notif-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.notif-item.unread .notif-title {
  color: var(--gold);
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  margin-top: 6px;
  flex-shrink: 0;
}

.notif-item.unread .notif-dot {
  background: var(--teal);
  box-shadow: 0 0 8px rgba(0, 212, 177, 0.4);
}

.notif-title {
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 4px;
}

.notif-desc {
  font-size: 12px;
  color: var(--text-dim);
  margin-bottom: 4px;
}

.notif-time {
  font-size: 10px;
  color: var(--text-dim);
}

.profile-grid {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.profile-av {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: var(--gold-dim);
  color: var(--gold);
  font-size: 22px;
  font-weight: 800;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.profile-grid p {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.5;
}

.profile-grid strong {
  color: var(--text);
  margin-right: 8px;
}

.help-list {
  margin: 0;
  padding-left: 18px;
  color: var(--text-dim);
  font-size: 13px;
  line-height: 1.8;
}

@media (max-width: 1365px) {
  .sidebar-wrap {
    width: 64px !important;
  }
  .chain-status {
    display: none;
  }
  .top-title {
    max-width: 140px;
    font-size: 16px;
  }
  .user-text {
    display: none;
  }
  .user-trigger {
    padding: 4px;
    max-width: none;
  }
}
</style>

