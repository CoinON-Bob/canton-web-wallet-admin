<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);

const form = reactive({ username: '', password: '', remember: true });
const quickFill = () => {
  form.username = 'demo_admin';
  form.password = 'Canton@2026';
  ElMessage.success('已填充默认演示账号');
};

const onSubmit = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入账号和密码');
    return;
  }
  loading.value = true;
  await new Promise((r) => setTimeout(r, 600));
  auth.login(form.remember, form.username);
  loading.value = false;
  router.push('/dashboard');
};
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="never">
      <h2 class="login-brand font-display">Canton Chain</h2>
      <p class="login-sub font-mono">ADMIN CONSOLE</p>
      <el-form @submit.prevent class="login-form">
        <el-form-item label="账号" required>
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" required>
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-checkbox v-model="form.remember">记住密码</el-checkbox>
        <el-button class="fill-btn" @click="quickFill">一键填充演示账号</el-button>
        <el-button class="btn-primary" type="primary" :loading="loading" @click="onSubmit">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.login-card {
  width: 400px;
  border-radius: 8px;
}

.login-brand {
  margin: 0;
  font-size: 28px;
  font-weight: 400;
  color: var(--text);
}

.login-sub {
  margin: 8px 0 24px;
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--gold);
}

.login-form :deep(.el-form-item__label) {
  color: var(--text-dim);
}

.fill-btn {
  margin-top: 12px;
  width: 100%;
  border-radius: 6px;
  background: transparent !important;
  color: var(--text-dim) !important;
  border: 1px solid var(--border) !important;
}

.fill-btn:hover {
  color: var(--text) !important;
  border-color: var(--gold) !important;
}

.btn-primary {
  margin-top: 14px;
  width: 220px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  border-radius: 6px !important;
}
</style>
