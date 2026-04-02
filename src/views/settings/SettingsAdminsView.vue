<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Plus, Key, EditPen } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { AdminAccount } from '../../api/mock/systemSettings';
import { listAdmins, updateAdmin } from '../../api/mock/systemSettings';
import { adminUserApi } from '../../api/admin';
import { extractPageRows } from '../../api/listUtils';
import { ApiError } from '../../api/http';

const useMock = import.meta.env.VITE_USE_ADMIN_MOCK_DATA === 'true';

const router = useRouter();
const rows = ref<AdminAccount[]>([]);
const apiRows = ref<Record<string, unknown>[]>([]);
const apiLoading = ref(false);
const apiError = ref('');

const loadMock = () => {
  rows.value = listAdmins();
};

async function loadApi() {
  apiLoading.value = true;
  apiError.value = '';
  try {
    const res = await adminUserApi.list({ page: 1, page_size: 50, keyword: '' });
    const { rows: r } = extractPageRows(res.data);
    apiRows.value = r;
  } catch (e) {
    apiError.value = e instanceof ApiError ? e.message : String(e);
    apiRows.value = [];
  } finally {
    apiLoading.value = false;
  }
}

onMounted(() => {
  if (useMock) loadMock();
  else void loadApi();
});

const roleLabel = (r: string) => {
  if (r === 'root') return '超级管理员';
  if (r === 'risk_manager') return '风控管理员';
  return '只读';
};

const goPermissions = (row: AdminAccount | Record<string, unknown>) => {
  const id =
    typeof (row as Record<string, unknown>).id !== 'undefined'
      ? String((row as Record<string, unknown>).id)
      : (row as AdminAccount).id;
  router.push({ name: 'settings-admin-permissions', params: { id } });
};

const goEdit = (row: AdminAccount) => {
  router.push({ name: 'settings-admin-edit', params: { id: row.id } });
};

const goAdd = () => {
  router.push({ name: 'settings-admin-new' });
};

const goAddClick = () => {
  if (useMock) goAdd();
  else ElMessage.info('新增请用「API 调试」POST /admin/admin-user/save，或后续对接表单');
};

const goEditClick = (row: AdminAccount | Record<string, unknown>) => {
  if (useMock) goEdit(row as AdminAccount);
  else ElMessage.info('编辑请用「API 调试」POST /admin/admin-user/save');
};

function roleIdsPreview(row: Record<string, unknown>) {
  const r = row.role_ids;
  if (Array.isArray(r)) return r.join(', ') || '—';
  return '—';
}

const toggleStatusMock = async (row: AdminAccount) => {
  if (row.role === 'root') {
    ElMessage.warning('超级管理员账号不可停用');
    return;
  }
  const next = row.status === 'active' ? 'disabled' : 'active';
  try {
    await ElMessageBox.confirm(
      `确定将「${row.displayName}」设为${next === 'active' ? '启用' : '停用'}？`,
      '确认',
      { type: 'warning' },
    );
    updateAdmin(row.id, { status: next });
    loadMock();
    ElMessage.success('状态已更新（Mock）');
  } catch {
    /* cancel */
  }
};

const toggleStatusApi = async (row: Record<string, unknown>) => {
  const id = Number(row.id);
  if (!Number.isFinite(id)) {
    ElMessage.warning('缺少有效 id');
    return;
  }
  const st = Number(row.status);
  const isActive = st === 1;
  const nextStatus = isActive ? 0 : 1;
  try {
    await ElMessageBox.confirm(
      `确定将管理员 #${id} 设为${nextStatus === 1 ? '启用' : '停用'}？`,
      '确认',
      { type: 'warning' },
    );
    await adminUserApi.status({ id, status: nextStatus });
    ElMessage.success('状态已更新');
    await loadApi();
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e instanceof ApiError ? e.message : String(e));
  }
};

const toggleStatus = async (row: AdminAccount | Record<string, unknown>) => {
  if (useMock) await toggleStatusMock(row as AdminAccount);
  else await toggleStatusApi(row as Record<string, unknown>);
};

function apiStatusLabel(row: Record<string, unknown>) {
  return Number(row.status) === 1 ? '启用' : '停用';
}
</script>

<template>
  <div class="admins">
    <header class="block-head">
      <div class="head-row">
        <div>
          <h2 class="block-title font-display">管理员账号</h2>
          <p class="block-desc">先在此维护账号，再进入「配置权限」为指定管理员勾选能力并保存</p>
        </div>
        <el-button type="primary" :icon="Plus" @click="goAddClick">添加管理员</el-button>
      </div>
    </header>

    <el-alert
      v-if="!useMock"
      type="info"
      :closable="false"
      class="live-banner"
      title="列表数据来自 GET /admin/admin-user/list。「配置权限」页仍为前端 Mock 树；线上请以 /admin/role/resource-ids 与资源树为准。"
    />

    <el-card shadow="never" class="card">
      <ol class="steps font-mono" aria-label="推荐流程">
        <li :class="{ done: true }">1. 添加或编辑管理员</li>
        <li>2. 点击「配置权限」选择账号</li>
        <li>3. 勾选权限节点并保存</li>
      </ol>

      <template v-if="useMock">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>登录账号</th>
                <th>显示名</th>
                <th>角色</th>
                <th>状态</th>
                <th class="num">权限节点</th>
                <th class="actions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.id">
                <td class="font-mono td-login">{{ row.login }}</td>
                <td class="td-strong">{{ row.displayName }}</td>
                <td><span class="role-pill" :class="row.role">{{ roleLabel(row.role) }}</span></td>
                <td>
                  <span v-if="row.status === 'active'" class="ok"><i class="dot" />启用</span>
                  <span v-else class="off">停用</span>
                </td>
                <td class="font-mono num">{{ row.permissionIds.length }}</td>
                <td class="actions">
                  <el-button type="primary" link :icon="Key" @click="goPermissions(row)">配置权限</el-button>
                  <el-button link :icon="EditPen" @click="goEditClick(row)">编辑</el-button>
                  <el-button
                    v-if="row.role !== 'root'"
                    link
                    type="danger"
                    @click="toggleStatus(row)"
                  >
                    {{ row.status === 'active' ? '停用' : '启用' }}
                  </el-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <template v-else>
        <div class="api-toolbar">
          <el-button size="small" :loading="apiLoading" @click="loadApi">刷新列表</el-button>
        </div>
        <el-alert v-if="apiError" type="error" :title="apiError" :closable="false" class="api-err" />
        <div v-loading="apiLoading" class="api-table-wrap">
          <el-table v-if="apiRows.length" :data="apiRows" stripe border size="small">
            <el-table-column prop="id" label="ID" width="72" />
            <el-table-column prop="username" label="账号" min-width="120" show-overflow-tooltip />
            <el-table-column prop="nickname" label="昵称" min-width="100" show-overflow-tooltip />
            <el-table-column prop="email" label="邮箱" min-width="140" show-overflow-tooltip />
            <el-table-column prop="mobile" label="手机" width="110" show-overflow-tooltip />
            <el-table-column label="状态" width="88">
              <template #default="{ row }">
                <span :class="Number((row as Record<string, unknown>).status) === 1 ? 'ok' : 'off'">
                  {{ apiStatusLabel(row as Record<string, unknown>) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="role_ids" min-width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <span class="font-mono">{{ roleIdsPreview(row as Record<string, unknown>) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :icon="Key" @click="goPermissions(row as Record<string, unknown>)">
                  配置权限
                </el-button>
                <el-button link :icon="EditPen" @click="goEditClick(row as Record<string, unknown>)">编辑</el-button>
                <el-button link type="danger" @click="toggleStatus(row as Record<string, unknown>)">
                  {{ Number((row as Record<string, unknown>).status) === 1 ? '停用' : '启用' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <p v-else-if="!apiLoading" class="empty-api font-mono">暂无数据，请确认接口分页字段或到「API 调试」查看响应。</p>
        </div>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.live-banner {
  margin-bottom: 12px;
}

.api-toolbar {
  margin-bottom: 12px;
}

.api-err {
  margin-bottom: 12px;
}

.api-table-wrap {
  min-height: 100px;
}

.empty-api {
  margin: 16px 0;
  font-size: 12px;
  color: var(--text-dim);
}

.block-head {
  margin-bottom: 16px;
}

.head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
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
  max-width: 520px;
  line-height: 1.5;
}

.card {
  border-radius: 8px;
}

.steps {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  margin: 0 0 20px;
  padding: 12px 14px;
  list-style: none;
  font-size: 11px;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.steps li.done {
  color: var(--teal);
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  text-align: left;
  padding: 12px 14px;
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-dim);
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(30, 45, 74, 0.5);
  color: var(--text);
  vertical-align: middle;
}

.data-table tbody tr:hover td {
  background: rgba(255, 255, 255, 0.02);
}

.td-strong {
  font-weight: 600;
}

.td-login {
  color: var(--text-dim);
  font-size: 12px;
}

.num {
  text-align: right;
}

.actions {
  white-space: nowrap;
}

.actions :deep(.el-button) {
  margin-right: 4px;
}

.role-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.role-pill.root {
  background: var(--gold-dim);
  color: var(--gold);
}

.role-pill.risk_manager {
  background: rgba(43, 106, 255, 0.12);
  color: #6b9fff;
}

.role-pill.viewer {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
}

.ok {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--teal);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal);
}

.off {
  font-size: 12px;
  color: var(--text-dim);
}
</style>
