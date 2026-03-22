<script setup lang="ts">
import { ref, computed } from 'vue';
import { users, formatNumber } from '../api/mock';
import { Search, ArrowRight } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const filteredUsers = computed(() => {
  let result = users;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(u =>
      u.id.toString().includes(q) ||
      u.phone.includes(q)
    );
  }
  if (statusFilter.value) {
    result = result.filter(u => u.status === statusFilter.value);
  }
  return result;
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

const viewDetail = (id: number) => {
  router.push(`/users/${String(id)}`);
};

const maskPhone = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};
</script>

<template>
  <div class="users-view">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- Filter Bar -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户ID / 手机号"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
          <el-select v-model="statusFilter" placeholder="全部状态" clearable class="status-select">
            <el-option label="启用" value="confirmed" />
            <el-option label="禁用" value="pending" />
          </el-select>
        </div>
        <div class="filter-stats">
          共 <span class="highlight">{{ filteredUsers.length }}</span> 位用户
        </div>
      </div>
    </el-card>

    <!-- Users Grid -->
    <div class="users-grid">
      <el-card v-for="user in paginatedUsers" :key="user.id" class="user-card">
        <div class="user-header">
          <div class="user-avatar">
            <img :src="user.avatar" :alt="String(user.id)" />
          </div>
          <div class="user-meta">
            <div class="user-id">#{{ user.id }}</div>
            <div class="user-phone">{{ maskPhone(user.phone) }}</div>
          </div>
          <div :class="['user-status', user.status === 'confirmed' ? 'active' : 'inactive']">
            {{ user.status === 'confirmed' ? '启用' : '禁用' }}
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
          <button class="action-btn" @click="viewDetail(user.id)">
            查看详情
            <ArrowRight class="btn-icon" />
          </button>
        </div>
      </el-card>
    </div>

    <!-- Pagination -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="filteredUsers.length"
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
  transition: border-color 0.15s ease, transform 0.15s ease;
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

.user-phone {
  font-size: 13px;
  color: var(--text-dim);
  font-family: 'Space Mono', monospace;
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
