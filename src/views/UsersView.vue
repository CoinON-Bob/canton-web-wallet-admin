<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { formatNumber } from '../api/mock';
import { getAllUsers } from '../api/userDirectory';
import { Search, ArrowRight } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { adminEndUserApi } from '../api/admin';
import { extractPageRows } from '../api/listUtils';
import { ApiError } from '../api/http';

const useMock = import.meta.env.VITE_USE_END_USER_MOCK === 'true';

const router = useRouter();
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const loading = ref(false);
const apiError = ref('');
const apiRows = ref<Record<string, unknown>[]>([]);
const apiTotal = ref(0);

const filteredUsers = computed(() => {
  let result = getAllUsers();
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.id.toString().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.inviteCode.toLowerCase().includes(q)
    );
  }
  if (statusFilter.value === 'active') {
    result = result.filter((u) => u.status === 'confirmed');
  } else if (statusFilter.value === 'banned') {
    result = result.filter((u) => u.status !== 'confirmed');
  }
  return result;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

async function fetchEndUsers() {
  loading.value = true;
  apiError.value = '';
  try {
    const q: { page: number; page_size: number; keyword?: string; status?: number } = {
      page: currentPage.value,
      page_size: pageSize.value,
    };
    const kw = searchQuery.value.trim();
    if (kw) q.keyword = kw;
    if (statusFilter.value === 'active') q.status = 1;
    else if (statusFilter.value === 'banned') q.status = 0;
    const res = await adminEndUserApi.list(q);
    const { rows, total } = extractPageRows(res.data);
    apiRows.value = rows;
    apiTotal.value = total;
  } catch (e) {
    apiError.value = e instanceof ApiError ? e.message : String(e);
    apiRows.value = [];
    apiTotal.value = 0;
  } finally {
    loading.value = false;
  }
}

let debounce: ReturnType<typeof setTimeout> | null = null;

watch([currentPage, pageSize], () => {
  if (!useMock) void fetchEndUsers();
});

watch([searchQuery, statusFilter], () => {
  if (useMock) return;
  if (debounce) clearTimeout(debounce);
  debounce = setTimeout(() => {
    currentPage.value = 1;
    void fetchEndUsers();
  }, 400);
});

onMounted(() => {
  if (!useMock) void fetchEndUsers();
});

const totalLabel = computed(() => (useMock ? filteredUsers.value.length : apiTotal.value));

const viewDetail = (id: number | string) => {
  router.push(`/users/${String(id)}`);
};

/** 邮箱脱敏：ab***@domain */
const maskEmail = (email: string) => {
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (local.length <= 2) return `${local[0] ?? '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
};

function apiEmail(row: Record<string, unknown>) {
  return String(row.email ?? row.user_email ?? '—');
}

function apiInvite(row: Record<string, unknown>) {
  return String(row.invite_code ?? row.inviteCode ?? row.ref_invite_code ?? '—');
}

function apiStatusLabel(row: Record<string, unknown>) {
  const s = Number(row.status);
  if (s === 1) return { text: '启用', ok: true };
  if (s === 0) return { text: '禁用', ok: false };
  return { text: String(row.status ?? '—'), ok: false };
}

function apiId(row: Record<string, unknown>) {
  const v = row.user_id ?? row.id;
  return v != null ? String(v) : '—';
}
</script>

<template>
  <div class="users-view">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <el-alert
      v-if="!useMock"
      type="info"
      :closable="false"
      class="banner"
      title="列表对接 GET /admin/user/list（keyword、status：1 启用 / 0 禁用）。设置 VITE_USE_END_USER_MOCK=true 可切回本地演示数据。"
    />

    <!-- Filter Bar -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <el-input
            v-model="searchQuery"
            :placeholder="useMock ? '搜索用户 ID / 邮箱 / 邀请码' : 'keyword：邮箱 / 邀请码 / party / 昵称等'"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
          <el-select v-model="statusFilter" placeholder="全部状态" clearable class="status-select">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="banned" />
          </el-select>
        </div>
        <div class="filter-stats">
          共 <span class="highlight">{{ totalLabel }}</span> 位用户
          <el-button v-if="!useMock" text type="primary" class="refresh" @click="fetchEndUsers">刷新</el-button>
        </div>
      </div>
    </el-card>

    <el-alert v-if="!useMock && apiError" type="error" :title="apiError" :closable="false" class="err-banner" />

    <template v-if="useMock">
      <!-- Users Grid -->
      <div class="users-grid">
        <el-card v-for="user in paginatedUsers" :key="user.id" class="user-card">
          <div class="user-header">
            <div class="user-avatar">
              <img :src="user.avatar" :alt="String(user.id)" />
            </div>
            <div class="user-meta">
              <div class="user-id">#{{ user.id }}</div>
              <div class="user-email font-mono">{{ maskEmail(user.email) }}</div>
              <div class="user-invite font-mono">邀请码 {{ user.inviteCode }}</div>
            </div>
            <div :class="['user-status', user.status === 'confirmed' ? 'active' : 'inactive']">
              {{ user.status === 'confirmed' ? '启用' : '封禁' }}
            </div>
          </div>

          <div class="user-stats">
            <div class="stat-item">
              <div class="stat-label">总资产</div>
              <div class="stat-value gold">{{ formatNumber(user.asset) }} CC</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">注册时间</div>
              <div class="stat-value">{{ user.createdAt.split(' ')[0] }}</div>
            </div>
          </div>

          <div class="user-footer">
            <button type="button" class="action-btn" @click="viewDetail(user.id)">
              查看详情
              <ArrowRight class="btn-icon" />
            </button>
          </div>
        </el-card>
      </div>
    </template>

    <template v-else>
      <el-card v-loading="loading" shadow="never" class="table-card">
        <el-table v-if="apiRows.length" :data="apiRows" stripe border size="small" class="api-table">
          <el-table-column label="ID" width="88">
            <template #default="{ row }">
              <span class="font-mono">{{ apiId(row as Record<string, unknown>) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="邮箱" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              {{ apiEmail(row as Record<string, unknown>) }}
            </template>
          </el-table-column>
          <el-table-column label="邀请码" width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="font-mono">{{ apiInvite(row as Record<string, unknown>) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="88">
            <template #default="{ row }">
              <span
                :class="[
                  'pill',
                  apiStatusLabel(row as Record<string, unknown>).ok ? 'ok' : 'off',
                ]"
              >
                {{ apiStatusLabel(row as Record<string, unknown>).text }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="viewDetail(apiId(row as Record<string, unknown>))">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <p v-else-if="!loading" class="empty font-mono">暂无数据，请确认接口字段或到「API 调试」查看 /admin/user/list 响应。</p>
      </el-card>
    </template>

    <!-- Pagination -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="totalLabel"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<style scoped>
.users-view {
  padding-bottom: 24px;
}

.banner {
  margin-bottom: 12px;
}

.err-banner {
  margin-bottom: 12px;
}

.table-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.api-table {
  width: 100%;
}

.pill {
  font-size: 12px;
  font-weight: 600;
}

.pill.ok {
  color: var(--teal);
}

.pill.off {
  color: var(--red);
}

.empty {
  margin: 20px;
  font-size: 12px;
  color: var(--text-dim);
}

.refresh {
  margin-left: 10px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
}

.filter-card {
  margin-bottom: 16px;
  --el-card-padding: 16px 20px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 500px;
}

.search-input {
  width: 260px;
}

.status-select {
  width: 140px;
}

.filter-stats {
  font-size: 13px;
  color: var(--text-dim);
}

.filter-stats .highlight {
  color: var(--gold);
  font-weight: 700;
  font-family: 'Space Mono', monospace;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.user-card {
  --el-card-padding: 0;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.user-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--border);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-meta {
  flex: 1;
}

.user-id {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 4px;
}

.user-email {
  font-size: 12px;
  color: #b8c5df;
  letter-spacing: 0.02em;
}

.user-invite {
  font-size: 10px;
  color: var(--gold);
  margin-top: 4px;
  letter-spacing: 0.04em;
  opacity: 0.9;
}

.user-status {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.user-status.active {
  background: rgba(0, 212, 177, 0.12);
  color: var(--teal);
}

.user-status.inactive {
  background: rgba(255, 77, 109, 0.12);
  color: var(--red);
}

.user-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-dim);
}

.stat-value {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.stat-value.gold {
  color: var(--gold);
  font-family: 'Space Mono', monospace;
  font-weight: 700;
}

.user-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-dim);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  color: var(--text);
  border-color: var(--gold);
  background: var(--gold-dim);
}

.btn-icon {
  width: 14px;
  height: 14px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: #0d1117;
  --el-pagination-hover-color: #2b6aff;
}

:deep(.el-pagination .el-pager li) {
  background: #0d1117;
  border: 1px solid var(--border);
}

:deep(.el-pagination .el-pager li.active) {
  background: #2b6aff;
  border-color: #2b6aff;
}

@media (max-width: 768px) {
  .users-grid {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    max-width: none;
  }

  .search-input,
  .status-select {
    width: 100%;
  }
}
</style>
