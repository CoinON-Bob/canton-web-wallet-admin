import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { adminPublicApi, extractAdminLoginToken } from '../api/admin';

const TOKEN_KEY = 'cc_admin_token';
const REMEMBER_KEY = 'cc_admin_remember';
const USER_KEY = 'cc_admin_username';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY));
  const remember = ref(localStorage.getItem(REMEMBER_KEY) === '1');
  const username = ref<string>(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '');

  const isLoggedIn = computed(() => Boolean(token.value));

  const displayName = computed(() => username.value || '管理员');

  const userInitial = computed(() => {
    const s = displayName.value.trim();
    if (!s) return 'A';
    return s.slice(0, 1).toUpperCase();
  });

  function persistSession(nextRemember: boolean, user: string, tokenValue: string) {
    const u = user.trim() || 'admin';
    token.value = tokenValue;
    remember.value = nextRemember;
    username.value = u;

    if (nextRemember) {
      localStorage.setItem(TOKEN_KEY, tokenValue);
      localStorage.setItem(REMEMBER_KEY, '1');
      localStorage.setItem(USER_KEY, u);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, tokenValue);
      sessionStorage.setItem(USER_KEY, u);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * 调用 POST /admin/login；token 从 data.token / data.access_token 等字段解析。
   * 设置 VITE_USE_MOCK_ADMIN_AUTH=true 可跳过接口、写入本地 mock token。
   */
  async function loginWithPassword(nextRemember: boolean, user: string, password: string) {
    const u = user.trim();
    if (!u || !password) {
      throw new Error('请输入账号和密码');
    }
    const useMock = import.meta.env.VITE_USE_MOCK_ADMIN_AUTH === 'true';
    if (useMock) {
      persistSession(nextRemember, u, `mock-token-${Date.now()}`);
      return;
    }
    const res = await adminPublicApi.login({ username: u, password });
    const tok = extractAdminLoginToken(res.data);
    if (!tok) {
      throw new Error(
        '登录成功但响应 data 中未找到 token（尝试 token / access_token）。请与后端确认登录接口字段。'
      );
    }
    persistSession(nextRemember, u, tok);
  }

  function hydrateSession() {
    if (!token.value) {
      token.value = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    }
    if (!username.value) {
      username.value = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '';
    }
  }

  async function logout() {
    const t = token.value;
    try {
      if (t && !t.startsWith('mock-token')) {
        await adminPublicApi.logout();
      }
    } catch {
      /* 忽略登出接口失败，仍清理本地态 */
    }
    token.value = null;
    username.value = '';
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  return {
    token,
    remember,
    username,
    displayName,
    userInitial,
    isLoggedIn,
    loginWithPassword,
    logout,
    hydrateSession,
  };
});
