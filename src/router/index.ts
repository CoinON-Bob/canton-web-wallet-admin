import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../store/auth';

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/',
    component: () => import('../components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      {
        path: 'dashboard',
        name: 'dashboard',
        meta: { title: '总览仪表盘' },
        component: () => import('../views/DashboardView.vue'),
      },
      {
        path: 'users',
        name: 'users',
        meta: { title: '用户管理' },
        component: () => import('../views/UsersView.vue'),
      },
      {
        path: 'users/:id',
        name: 'user-detail',
        meta: { title: '用户详情' },
        component: () => import('../views/UserDetailView.vue'),
      },
      {
        path: 'invite-codes',
        name: 'invite-codes',
        meta: { title: '邀请码管理' },
        component: () => import('../views/InviteCodesView.vue'),
      },
      {
        path: 'assets',
        name: 'assets',
        meta: { title: '资产管理' },
        component: () => import('../views/AssetsView.vue'),
      },
      {
        path: 'transfer/stats',
        name: 'transfer-stats',
        meta: { title: 'CC 转账统计' },
        component: () => import('../views/TransferStatsView.vue'),
      },
      {
        path: 'transfer/list',
        name: 'transfer-list',
        meta: { title: 'CC 转账明细' },
        component: () => import('../views/TransferListView.vue'),
      },
      {
        path: 'contracts',
        name: 'contracts',
        meta: { title: '预测合约' },
        component: () => import('../views/ContractView.vue'),
      },
      {
        path: 'risk',
        name: 'risk',
        meta: { title: '风控安全' },
        component: () => import('../views/RiskView.vue'),
      },
      {
        path: 'monitor',
        name: 'monitor',
        meta: { title: '节点监控' },
        component: () => import('../views/MonitorView.vue'),
      },
      {
        path: 'settings',
        component: () => import('../views/settings/SettingsLayout.vue'),
        redirect: { name: 'settings-general' },
        meta: { title: '系统配置' },
        children: [
          {
            path: 'general',
            name: 'settings-general',
            meta: { title: '系统配置' },
            component: () => import('../views/settings/SettingsGeneralView.vue'),
          },
          {
            path: 'admins',
            name: 'settings-admins',
            meta: { title: '管理员账号' },
            component: () => import('../views/settings/SettingsAdminsView.vue'),
          },
          {
            path: 'admins/new',
            name: 'settings-admin-new',
            meta: { title: '添加管理员' },
            component: () => import('../views/settings/SettingsAdminFormView.vue'),
          },
          {
            path: 'admins/:id/edit',
            name: 'settings-admin-edit',
            meta: { title: '编辑管理员' },
            component: () => import('../views/settings/SettingsAdminFormView.vue'),
          },
          {
            path: 'admins/:id/permissions',
            name: 'settings-admin-permissions',
            meta: { title: '权限配置' },
            component: () => import('../views/settings/SettingsAdminPermissionsView.vue'),
          },
          {
            path: 'logs',
            name: 'settings-logs',
            meta: { title: '操作日志' },
            component: () => import('../views/settings/SettingsLogsView.vue'),
          },
          {
            path: 'account-api',
            name: 'settings-account-api',
            meta: { title: '当前账户' },
            component: () => import('../views/settings/SettingsAccountApiView.vue'),
          },
          {
            path: 'roles-resources',
            name: 'settings-roles-resources',
            meta: { title: '角色与资源' },
            component: () => import('../views/settings/SettingsRolesResourcesView.vue'),
          },
          {
            path: 'api-debug',
            name: 'settings-api-debug',
            meta: { title: 'API 调试' },
            component: () => import('../views/settings/SettingsApiDebugView.vue'),
          },
        ],
      },
    ],
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.hydrateSession();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/login';
  }
  if (to.path === '/login' && auth.isLoggedIn) {
    return '/dashboard';
  }
  return true;
});

export default router;
