<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { AdminRole } from '../../api/mock/systemSettings';
import { getAdmin, createAdmin, updateAdmin } from '../../api/mock/systemSettings';

const route = useRoute();
const router = useRouter();

const isNew = computed(() => route.name === 'settings-admin-new');
const adminId = computed(() => (isNew.value ? '' : String(route.params.id)));

const form = reactive({
  login: '',
  displayName: '',
  password: '',
  role: 'viewer' as AdminRole,
  phone: '',
});

onMounted(() => {
  if (isNew.value) return;
  const a = getAdmin(adminId.value);
  if (!a) {
    ElMessage.error('管理员不存在');
    router.replace({ name: 'settings-admins' });
    return;
  }
  form.login = a.login;
  form.displayName = a.displayName;
  form.role = a.role;
  form.phone = a.phone ?? '';
  form.password = '';
});

const title = computed(() => (isNew.value ? '添加管理员' : '编辑管理员'));

const isEditingRoot = computed(() => getAdmin(adminId.value)?.role === 'root');

const submit = () => {
  if (!form.login.trim() || !form.displayName.trim()) {
    ElMessage.warning('请填写登录账号与显示名');
    return;
  }
  if (isNew.value) {
    if (!form.password || form.password.length < 6) {
      ElMessage.warning('请设置至少 6 位密码');
      return;
    }
    try {
      const created = createAdmin({
        login: form.login.trim(),
        displayName: form.displayName.trim(),
        password: form.password,
        role: form.role,
        phone: form.phone.trim() || undefined,
      });
      ElMessage.success('已创建管理员（Mock），可前往配置权限');
      router.replace({ name: 'settings-admin-permissions', params: { id: created.id } });
    } catch (e: unknown) {
      ElMessage.error(e instanceof Error ? e.message : '创建失败');
    }
    return;
  }

  const a = getAdmin(adminId.value);
  if (a?.role === 'root' && form.role !== 'root') {
    ElMessage.warning('不可修改超级管理员角色');
    return;
  }
  updateAdmin(adminId.value, {
    displayName: form.displayName.trim(),
    role: form.role,
    phone: form.phone.trim() || undefined,
  });
  ElMessage.success('已保存（Mock）');
  router.push({ name: 'settings-admins' });
};

const back = () => router.push({ name: 'settings-admins' });
</script>

<template>
  <div class="form-page">
    <el-button class="back" :icon="ArrowLeft" text @click="back">返回管理员列表</el-button>

    <header class="block-head">
      <h2 class="block-title font-display">{{ title }}</h2>
      <p class="block-desc">
        {{ isNew ? '创建后系统将跳转至「配置权限」页，为该账号勾选可访问能力。' : '修改资料后请视需要重新调整权限。' }}
      </p>
    </header>

    <el-card shadow="never" class="card">
      <el-form label-position="top" class="f" @submit.prevent>
        <el-form-item label="登录账号">
          <el-input v-model="form.login" :disabled="!isNew" placeholder="如 risk.ops" />
        </el-form-item>
        <el-form-item label="显示名称">
          <el-input v-model="form.displayName" placeholder="展示名" />
        </el-form-item>
        <el-form-item v-if="isNew" label="初始密码">
          <el-input v-model="form.password" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="角色模板">
          <el-select v-model="form.role" :disabled="isEditingRoot" style="width: 100%">
            <el-option label="超级管理员（不可新建第二位）" value="root" :disabled="true" />
            <el-option label="风控管理员" value="risk_manager" />
            <el-option label="只读" value="viewer" />
          </el-select>
          <p class="hint font-mono">保存新建时：会按角色套用默认权限，可在下一步细调</p>
        </el-form-item>
        <el-form-item label="手机号（可选）">
          <el-input v-model="form.phone" placeholder="用于安全通知" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">{{ isNew ? '创建并配置权限' : '保存' }}</el-button>
          <el-button @click="back">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.form-page {
  max-width: 520px;
}

.back {
  margin-bottom: 12px;
  color: var(--text-dim);
}

.block-head {
  margin-bottom: 16px;
}

.block-title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 400;
  color: var(--text);
}

.block-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}

.card {
  border-radius: 8px;
}

.f :deep(.el-form-item__label) {
  color: var(--text-dim);
  font-size: 12px;
}

.hint {
  margin: 8px 0 0;
  font-size: 10px;
  color: var(--text-dim);
  line-height: 1.4;
}
</style>
