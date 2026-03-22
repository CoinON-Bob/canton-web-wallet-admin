<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { registerWithInvite } from '../api/registeredUsers';
import { ElMessage } from 'element-plus';

const router = useRouter();
const auth = useAuthStore();
const loading = ref(false);
const regLoading = ref(false);
const activeTab = ref<'admin' | 'register'>('admin');

const form = reactive({ username: '', password: '', remember: true });
const regForm = reactive({ email: '', password: '', inviteCode: '' });

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

const onRegister = async () => {
  if (!regForm.email?.trim()) {
    ElMessage.warning('请输入邮箱');
    return;
  }
  if (!regForm.password || regForm.password.length < 6) {
    ElMessage.warning('密码至少 6 位');
    return;
  }
  if (!regForm.inviteCode?.trim()) {
    ElMessage.warning('必须填写有效邀请码才能完成注册');
    return;
  }
  regLoading.value = true;
  await new Promise((r) => setTimeout(r, 400));
  try {
    registerWithInvite(regForm.email, regForm.inviteCode);
    ElMessage.success('注册成功！请使用管理员账号登录后台查看用户列表（演示环境不保存登录密码）');
    regForm.email = '';
    regForm.password = '';
    regForm.inviteCode = '';
    activeTab.value = 'admin';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '注册失败';
    ElMessage.error(msg);
  } finally {
    regLoading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <el-card class="login-card" shadow="never">
      <h2 class="login-brand font-display">Canton Chain</h2>
      <p class="login-sub font-mono">ADMIN CONSOLE</p>

      <el-tabs v-model="activeTab" class="login-tabs">
        <el-tab-pane label="管理员登录" name="admin">
          <el-form @submit.prevent class="login-form">
            <el-form-item label="账号" required>
              <el-input v-model="form.username" placeholder="请输入管理员账号" />
            </el-form-item>
            <el-form-item label="密码" required>
              <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
            </el-form-item>
            <el-checkbox v-model="form.remember">记住密码</el-checkbox>
            <el-button class="fill-btn" @click="quickFill">一键填充演示账号</el-button>
            <el-button class="btn-primary" type="primary" :loading="loading" @click="onSubmit">登录后台</el-button>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="用户注册" name="register">
          <p class="reg-hint">须填写后台发放的邀请码，无邀请码无法注册。普通用户不能生成邀请码。</p>
          <el-form @submit.prevent class="login-form">
            <el-form-item label="邮箱" required>
              <el-input v-model="regForm.email" type="email" placeholder="name@example.com" />
            </el-form-item>
            <el-form-item label="密码" required>
              <el-input v-model="regForm.password" type="password" show-password placeholder="至少 6 位" />
            </el-form-item>
            <el-form-item label="邀请码" required>
              <el-input v-model="regForm.inviteCode" placeholder="向管理员索取" class="font-mono" />
            </el-form-item>
            <el-button class="btn-primary" type="primary" :loading="regLoading" @click="onRegister">
              注册
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
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
  width: 420px;
  max-width: 100%;
  border-radius: 8px;
}

.login-brand {
  margin: 0;
  font-size: 28px;
  font-weight: 400;
  color: var(--text);
}

.login-sub {
  margin: 8px 0 16px;
  font-size: 9px;
  letter-spacing: 0.25em;
  color: var(--gold);
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.reg-hint {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.55;
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
