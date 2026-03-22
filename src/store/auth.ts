import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

const TOKEN_KEY = 'cc_admin_token';
const REMEMBER_KEY = 'cc_admin_remember';
const USER_KEY = 'cc_admin_username';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const remember = ref(localStorage.getItem(REMEMBER_KEY) === '1');
  const username = ref<string>(localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '');

  const isLoggedIn = computed(() => Boolean(token.value));

  /** 展示用名称：优先登录账号 */
  const displayName = computed(() => username.value || '管理员');

  const userInitial = computed(() => {
    const s = displayName.value.trim();
    if (!s) return 'A';
    return s.slice(0, 1).toUpperCase();
  });

  function login(nextRemember: boolean, user: string) {
    const u = user.trim() || 'admin';
    token.value = `mock-token-${Date.now()}`;
    remember.value = nextRemember;
    username.value = u;

    if (nextRemember) {
      localStorage.setItem(TOKEN_KEY, token.value);
      localStorage.setItem(REMEMBER_KEY, '1');
      localStorage.setItem(USER_KEY, u);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token.value);
      sessionStorage.setItem(USER_KEY, u);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  function hydrateSession() {
    if (!token.value) {
      token.value = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    }
    if (!username.value) {
      username.value = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY) || '';
    }
  }

  function logout() {
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
    login,
    logout,
    hydrateSession,
  };
});
