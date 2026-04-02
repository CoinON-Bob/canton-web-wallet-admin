<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { ElMessage } from 'element-plus';
import { ApiError } from '../api/http';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);

const form = reactive({ username: '', password: '', remember: true });

const quickFill = () => {
  form.username = 'demo_admin';
  form.password = 'Canton@2026';
  ElMessage.success('已填充演示账号（仍需正确后端密码，或开启 VITE_USE_MOCK_ADMIN_AUTH）');
};

const onSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }
  loading.value = true;
  try {
    await auth.loginWithPassword(form.remember, form.username, form.password);
    ElMessage.success('登录成功');
    await router.push('/dashboard');
  } catch (e) {
    const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : '登录失败';
    ElMessage.error(msg);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-glow" aria-hidden="true" />
    <div class="login-shell">
      <el-card class="login-card" shadow="never">
        <div class="login-head">
          <div class="emblem" aria-hidden="true">
            <span class="emblem-inner">CC</span>
          </div>
          <h1 class="login-brand font-display">Canton Chain</h1>
          <p class="login-sub font-mono">ADMIN CONSOLE</p>
          <div class="head-rule" />
        </div>

        <el-form
          class="login-form"
          label-position="top"
          @submit.prevent="onSubmit"
        >
          <el-form-item label="账号" required>
            <el-input
              v-model="form.username"
              size="large"
              placeholder="管理员账号"
              clearable
              @keyup.enter="onSubmit"
            />
          </el-form-item>
          <el-form-item label="密码" required>
            <el-input
              v-model="form.password"
              type="password"
              show-password
              size="large"
              placeholder="登录密码"
              @keyup.enter="onSubmit"
            />
          </el-form-item>

          <div class="login-meta">
            <el-checkbox v-model="form.remember" class="remember-check">记住登录状态</el-checkbox>
          </div>

          <el-button
            class="submit-btn"
            type="primary"
            size="large"
            :loading="loading"
            native-type="submit"
          >
            登 录
          </el-button>

          <button type="button" class="ghost-fill" @click="quickFill">使用演示账号</button>
        </el-form>
      </el-card>
      <p class="login-foot font-mono">
        POST /admin/login · 默认 /api 走 Vite 代理
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  position: relative;
  overflow: hidden;
}

.login-glow {
  position: absolute;
  inset: -40%;
  background:
    radial-gradient(ellipse 50% 42% at 50% 38%, rgba(201, 162, 39, 0.14), transparent 55%),
    radial-gradient(ellipse 40% 35% at 70% 60%, rgba(0, 212, 177, 0.06), transparent 50%);
  pointer-events: none;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.login-card {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: linear-gradient(165deg, rgba(15, 22, 41, 0.98) 0%, rgba(10, 14, 26, 0.99) 100%);
  box-shadow:
    0 0 0 1px rgba(201, 162, 39, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.45);
}

.login-card :deep(.el-card__body) {
  padding: 36px 40px 40px;
}

@media (max-width: 480px) {
  .login-card :deep(.el-card__body) {
    padding: 28px 22px 32px;
  }
}

.login-head {
  text-align: center;
  margin-bottom: 28px;
}

.emblem {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, var(--gold), #8b6914);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  display: grid;
  place-items: center;
}

.emblem-inner {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: #0a0e1a;
  letter-spacing: 0.02em;
}

.login-brand {
  margin: 0;
  font-size: 26px;
  font-weight: 400;
  color: var(--text);
  letter-spacing: 0.02em;
}

.login-sub {
  margin: 10px 0 0;
  font-size: 9px;
  letter-spacing: 0.32em;
  color: var(--gold);
  opacity: 0.95;
}

.head-rule {
  width: 48px;
  height: 3px;
  margin: 18px auto 0;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
  opacity: 0.85;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.login-form :deep(.el-form-item__label) {
  color: #9aacca;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 8px !important;
  padding: 0;
  line-height: 1.2;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
  min-height: 44px;
}

.login-meta {
  display: flex;
  justify-content: center;
  margin-bottom: 22px;
}

.remember-check :deep(.el-checkbox__label) {
  color: var(--text-dim);
  font-size: 13px;
}

.submit-btn {
  width: 100% !important;
  height: 46px !important;
  margin: 0 !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 800 !important;
  letter-spacing: 0.35em !important;
  text-indent: 0.35em;
}

.ghost-fill {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 10px;
  border: none;
  background: transparent;
  color: var(--text-dim);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  cursor: pointer;
  border-radius: 8px;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.ghost-fill:hover {
  color: var(--gold);
  background: rgba(201, 162, 39, 0.08);
}

.login-foot {
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--text-dim);
  opacity: 0.75;
  text-align: center;
}
</style>
