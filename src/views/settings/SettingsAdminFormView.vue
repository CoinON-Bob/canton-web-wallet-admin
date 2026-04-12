<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { AdminRole } from '../../api/mock/systemSettings';
import { getAdmin, createAdmin, updateAdmin } from '../../api/mock/systemSettings';
import { adminUserApi, adminRoleApi } from '../../api/admin';
import { extractDetailRecord, extractRoleOptions } from '../../api/listUtils';
import { ApiError } from '../../api/http';

const route = useRoute();
const router = useRouter();

const useMock = import.meta.env.VITE_USE_ADMIN_MOCK_DATA === 'true';

const isNew = computed(() => route.name === 'settings-admin-new');
const adminId = computed(() => (isNew.value ? '' : String(route.params.id)));

const form = reactive({
  login: '',
  displayName: '',
  password: '',
  role: 'viewer' as AdminRole,
  phone: '',
});

const apiLoading = ref(false);
const roleOptions = ref<{ label: string; value: number }[]>([]);
const apiForm = reactive({
  id: 0,
  username: '',
  nickname: '',
  password: '',
  mobile: '',
  email: '',
  status: 1,
  role_ids: [] as number[],
});

async function loadRoleOptions() {
  try {
    const r = await adminRoleApi.options();
    let opts = extractRoleOptions(r.data);
    if (!opts.length) {
      const r2 = await adminRoleApi.list({ page: 1, page_size: 100, keyword: '' });
      opts = extractRoleOptions(r2.data);
    }
    roleOptions.value = opts;
  } catch (e) {
    console.warn(e);
    roleOptions.value = [];
  }
}

async function loadApiDetail() {
  if (isNew.value) return;
  const id = Number(adminId.value);
  if (!Number.isFinite(id)) {
    ElMessage.error('无效的管理员 ID');
    router.replace({ name: 'settings-admins' });
    return;
  }
  apiLoading.value = true;
  try {
    const res = await adminUserApi.detail(id);
    const rec = extractDetailRecord(res.data);
    if (!rec) {
      ElMessage.error('未解析到管理员详情');
      router.replace({ name: 'settings-admins' });
      return;
    }
    apiForm.id = Number(rec.id) || id;
    apiForm.username = String(rec.username ?? rec.login ?? '');
    apiForm.nickname = String(rec.nickname ?? rec.displayName ?? '');
    apiForm.mobile = String(rec.mobile ?? '');
    apiForm.email = String(rec.email ?? '');
    apiForm.status = Number(rec.status) === 0 ? 0 : 1;
    const rids = rec.role_ids;
    apiForm.role_ids = Array.isArray(rids) ? rids.map((x) => Number(x)).filter((n) => Number.isFinite(n)) : [];
    apiForm.password = '';
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : String(e));
    router.replace({ name: 'settings-admins' });
  } finally {
    apiLoading.value = false;
  }
}

onMounted(() => {
  if (useMock) {
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
    return;
  }
  void loadRoleOptions().then(() => loadApiDetail());
});

const title = computed(() => (isNew.value ? '添加管理员' : '编辑管理员'));

const isEditingRoot = computed(() => getAdmin(adminId.value)?.role === 'root');

const submitMock = () => {
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

const submitApi = async () => {
  if (!apiForm.username.trim() || !apiForm.nickname.trim()) {
    ElMessage.warning('请填写登录账号与显示名（对应接口 username / nickname）');
    return;
  }
  if (isNew.value) {
    if (!apiForm.password || apiForm.password.length < 6) {
      ElMessage.warning('请设置至少 6 位初始密码');
      return;
    }
  }
  if (!apiForm.role_ids.length) {
    ElMessage.warning('请至少选择一个角色（role_ids）');
    return;
  }
  const body: Record<string, unknown> = {
    id: isNew.value ? 0 : apiForm.id,
    username: apiForm.username.trim(),
    nickname: apiForm.nickname.trim(),
    mobile: apiForm.mobile.trim(),
    email: apiForm.email.trim(),
    status: apiForm.status,
    role_ids: apiForm.role_ids,
  };
  if (apiForm.password.trim()) {
    body.password = apiForm.password.trim();
  }
  apiLoading.value = true;
  try {
    await adminUserApi.save(body);
    ElMessage.success(isNew.value ? '已创建管理员' : '已保存');
    router.push({ name: 'settings-admins' });
  } catch (e) {
    ElMessage.error(e instanceof ApiError ? e.message : String(e));
  } finally {
    apiLoading.value = false;
  }
};

const submit = () => {
  if (useMock) submitMock();
  else void submitApi();
};

const back = () => router.push({ name: 'settings-admins' });
</script>

<template>
  <div class="form-page">
    <el-button class="back" :icon="ArrowLeft" text @click="back">返回管理员列表</el-button>

    <header class="block-head">
      <h2 class="block-title font-display">{{ title }}</h2>
      <p class="block-desc">
        <template v-if="useMock">
          {{ isNew ? '创建后系统将跳转至「配置权限」页，为该账号勾选可访问能力。' : '修改资料后请视需要重新调整权限。' }}
        </template>
        <template v-else>
          对接 POST /admin/admin-user/save；字段与 Apipost 文档一致。权限树绑定仍以「角色与资源」及 API 调试为准。
        </template>
      </p>
    </header>

    <el-card v-loading="!useMock && apiLoading" shadow="never" class="card">
      <template v-if="useMock">
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
      </template>

      <template v-else>
        <el-form label-position="top" class="f" @submit.prevent>
          <el-form-item label="username（登录账号）">
            <el-input v-model="apiForm.username" :disabled="!isNew" placeholder="与接口字段一致" />
          </el-form-item>
          <el-form-item label="nickname（显示名）">
            <el-input v-model="apiForm.nickname" placeholder="nickname" />
          </el-form-item>
          <el-form-item :label="isNew ? '初始密码' : '新密码（留空则不修改）'">
            <el-input v-model="apiForm.password" type="password" show-password placeholder="至少 6 位（新建必填）" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="apiForm.email" placeholder="email" />
          </el-form-item>
          <el-form-item label="手机">
            <el-input v-model="apiForm.mobile" placeholder="mobile" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="apiForm.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="角色 role_ids">
            <el-select
              v-model="apiForm.role_ids"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="从 /admin/role/options 或 list 加载"
              style="width: 100%"
            >
              <el-option v-for="o in roleOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
            <p v-if="!roleOptions.length" class="hint font-mono">
              未加载到角色列表，请确认 GET /admin/role/options 或 role/list 有数据。
            </p>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="apiLoading" @click="submit">{{ isNew ? '创建' : '保存' }}</el-button>
            <el-button @click="back">取消</el-button>
          </el-form-item>
        </el-form>
      </template>
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
