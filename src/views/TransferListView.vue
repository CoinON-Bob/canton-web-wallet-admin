<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { transfers, formatHash, formatNumber, formatAddress } from '../api/mock';
import StatusBadge from '../components/common/StatusBadge.vue';
import { CopyDocument, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { adminTransactionApi } from '../api/admin';
import { extractPageRows, pickColumns } from '../api/listUtils';
import { ApiError } from '../api/http';

const useMock = import.meta.env.VITE_USE_ADMIN_MOCK_DATA === 'true';

const searchQuery = ref('');
const statusFilter = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const copyText = (text: string) => {
  navigator.clipboard.writeText(text);
  ElMessage.success('已复制到剪贴板');
};

const filteredTransfers = computed(() => {
  let result = transfers;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(
      (t) =>
        t.hash.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.to.toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) {
    result = result.filter((t) => t.status === statusFilter.value);
  }
  return result;
});

const paginatedTransfers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTransfers.value.slice(start, start + pageSize.value);
});

const showDetail = ref(false);
const selectedTx = ref<(typeof transfers)[0] | null>(null);

const viewDetail = (tx: (typeof transfers)[0]) => {
  selectedTx.value = tx;
  showDetail.value = true;
};

const liveLoading = ref(false);
const liveError = ref('');
const liveRows = ref<Record<string, unknown>[]>([]);
const liveTotal = ref(0);
const liveColumns = computed(() => pickColumns(liveRows.value, 12));

const showLiveDetail = ref(false);
const selectedLive = ref<Record<string, unknown> | null>(null);

async function fetchLiveList() {
  liveLoading.value = true;
  liveError.value = '';
  try {
    const res = await adminTransactionApi.list({
      page: currentPage.value,
      page_size: pageSize.value,
      keyword: searchQuery.value.trim() || undefined,
      include_raw: 0,
    });
    const { rows, total } = extractPageRows(res.data);
    liveRows.value = rows;
    liveTotal.value = total;
  } catch (e) {
    liveError.value = e instanceof ApiError ? e.message : String(e);
    liveRows.value = [];
    liveTotal.value = 0;
  } finally {
    liveLoading.value = false;
  }
}

function cellStr(row: Record<string, unknown>, key: string) {
  const v = row[key];
  if (v == null) return '—';
  if (typeof v === 'object') return JSON.stringify(v).slice(0, 120);
  return String(v);
}

function viewDetailLive(row: Record<string, unknown>) {
  selectedLive.value = row;
  showLiveDetail.value = true;
}

let searchDebounce: ReturnType<typeof setTimeout> | null = null;

watch([currentPage, pageSize], () => {
  if (!useMock) void fetchLiveList();
});

watch(searchQuery, () => {
  if (useMock) return;
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentPage.value = 1;
    void fetchLiveList();
  }, 400);
});

onMounted(() => {
  if (!useMock) void fetchLiveList();
});

const totalRecords = computed(() => (useMock ? filteredTransfers.value.length : liveTotal.value));
</script>

<template>
  <div class="transfer-list">
    <div class="page-header">
      <h1 class="page-title">转账明细</h1>
    </div>

    <el-alert
      v-if="!useMock"
      type="info"
      :closable="false"
      class="live-banner"
      title="已对接 GET /admin/transaction/list（keyword 对应文档「关键字」筛选）。列字段随后端 data 结构自动展示。"
    />

    <!-- Filter Bar -->
    <el-card class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <el-input
            v-model="searchQuery"
            :placeholder="useMock ? '搜索交易哈希 / 地址' : 'keyword：事件ID / party / CID 等'"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
          <el-select
            v-if="useMock"
            v-model="statusFilter"
            placeholder="全部状态"
            clearable
            class="status-select"
          >
            <el-option label="已确认" value="confirmed" />
            <el-option label="待确认" value="pending" />
            <el-option label="失败" value="failed" />
          </el-select>
        </div>
        <div class="filter-stats">
          共 <span class="highlight">{{ totalRecords }}</span> 条记录
          <template v-if="!useMock">
            <el-button text type="primary" class="refresh-live" @click="fetchLiveList">刷新</el-button>
          </template>
        </div>
      </div>
    </el-card>

    <el-alert v-if="!useMock && liveError" type="error" :title="liveError" :closable="false" class="err-banner" />

    <!-- Data Table -->
    <el-card class="table-card">
      <div v-if="useMock" class="table-wrapper">
        <table class="custom-table">
          <thead>
            <tr>
              <th>交易哈希</th>
              <th>发送方</th>
              <th>接收方</th>
              <th>金额(CC)</th>
              <th>手续费</th>
              <th>状态</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in paginatedTransfers" :key="tx.hash">
              <td class="hash-cell">
                <span class="hash-text" :title="tx.hash">{{ formatHash(tx.hash) }}</span>
                <button type="button" class="icon-btn" @click="copyText(tx.hash)">
                  <CopyDocument class="icon-sm" />
                </button>
              </td>
              <td class="address-cell">
                <span class="address-text">{{ formatAddress(tx.from) }}</span>
                <button type="button" class="icon-btn" @click="copyText(tx.from)">
                  <CopyDocument class="icon-sm" />
                </button>
              </td>
              <td class="address-cell">
                <span class="address-text">{{ formatAddress(tx.to) }}</span>
                <button type="button" class="icon-btn" @click="copyText(tx.to)">
                  <CopyDocument class="icon-sm" />
                </button>
              </td>
              <td class="amount-cell">{{ formatNumber(tx.amount) }}</td>
              <td class="fee-cell">{{ tx.fee }}</td>
              <td>
                <StatusBadge :status="tx.status" />
              </td>
              <td class="time-cell">{{ tx.time }}</td>
              <td>
                <button type="button" class="action-link" @click="viewDetail(tx)">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else v-loading="liveLoading" class="live-table-wrap">
        <el-table v-if="liveRows.length" :data="liveRows" stripe border class="live-table" size="small">
          <el-table-column
            v-for="col in liveColumns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="120"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span class="live-cell">{{ cellStr(row as Record<string, unknown>, col) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <button type="button" class="action-link" @click="viewDetailLive(row as Record<string, unknown>)">
                查看
              </button>
            </template>
          </el-table-column>
        </el-table>
        <p v-else-if="!liveLoading" class="empty-live font-mono">暂无数据或列表字段与解析规则不匹配，请用「API 调试」查看原始响应。</p>
      </div>

      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalRecords"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="showDetail"
      title="交易详情"
      width="560px"
      :close-on-click-modal="false"
      class="detail-dialog"
    >
      <div v-if="selectedTx" class="detail-content">
        <div class="detail-row">
          <span class="detail-label">交易哈希</span>
          <div class="detail-value">
            <span class="mono">{{ selectedTx.hash }}</span>
            <button type="button" class="icon-btn" @click="copyText(selectedTx.hash)">
              <CopyDocument class="icon-sm" />
            </button>
          </div>
        </div>

        <div class="detail-row">
          <span class="detail-label">状态</span>
          <StatusBadge :status="selectedTx.status" />
        </div>

        <div class="detail-row">
          <span class="detail-label">发送方</span>
          <div class="detail-value">
            <span class="mono">{{ selectedTx.from }}</span>
            <button type="button" class="icon-btn" @click="copyText(selectedTx.from)">
              <CopyDocument class="icon-sm" />
            </button>
          </div>
        </div>

        <div class="detail-row">
          <span class="detail-label">接收方</span>
          <div class="detail-value">
            <span class="mono">{{ selectedTx.to }}</span>
            <button type="button" class="icon-btn" @click="copyText(selectedTx.to)">
              <CopyDocument class="icon-sm" />
            </button>
          </div>
        </div>

        <div class="detail-row">
          <span class="detail-label">金额</span>
          <span class="detail-value highlight">{{ formatNumber(selectedTx.amount) }} CC</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">手续费</span>
          <span class="detail-value">{{ selectedTx.fee }} CC</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">时间</span>
          <span class="detail-value">{{ selectedTx.time }}</span>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      v-model="showLiveDetail"
      title="交易详情（接口原始字段）"
      width="640px"
      :close-on-click-modal="false"
    >
      <pre v-if="selectedLive" class="live-json font-mono">{{ JSON.stringify(selectedLive, null, 2) }}</pre>
    </el-dialog>
  </div>
</template>

<style scoped>
.transfer-list {
  padding-bottom: 24px;
}

.live-banner {
  margin-bottom: 12px;
}

.err-banner {
  margin-bottom: 12px;
}

.live-table-wrap {
  min-height: 120px;
  padding: 0 0 8px;
}

.empty-live {
  margin: 24px 20px;
  font-size: 12px;
  color: var(--text-dim);
}

.live-json {
  margin: 0;
  max-height: 480px;
  overflow: auto;
  font-size: 11px;
  line-height: 1.45;
}

.refresh-live {
  margin-left: 12px;
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
  max-width: 600px;
}

.search-input {
  width: 280px;
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

.table-card {
  --el-card-padding: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-size: 13px;
}

.custom-table th {
  text-align: left;
  padding: 14px 20px;
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.01);
}

.custom-table td {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(30, 45, 74, 0.5);
  color: var(--text);
  font-size: 13px;
}

.custom-table tr:hover td {
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.1s ease;
}

.custom-table tr:last-child td {
  border-bottom: none;
}

.hash-cell,
.address-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hash-text {
  font-family: 'Space Mono', monospace;
  color: #2b6aff;
  font-size: 13px;
  text-decoration: underline;
}

.address-text {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  color: var(--text-dim);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #5e6673;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  color: #2b6aff;
  background: rgba(43, 106, 255, 0.1);
}

.icon-sm {
  width: 14px;
  height: 14px;
}

.amount-cell {
  color: var(--gold);
  font-weight: 700;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  text-align: right;
}

.fee-cell {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: var(--text-dim);
}

.time-cell {
  font-size: 12px;
  color: var(--text-dim);
  white-space: nowrap;
  font-family: 'Space Mono', monospace;
}

.action-link {
  background: transparent;
  border: none;
  color: var(--gold);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.action-link:hover {
  background: var(--gold-dim);
}

.pagination-wrapper {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  --el-pagination-button-bg-color: #0d1117;
  --el-pagination-hover-color: #2b6aff;
}

:deep(.el-pagination .el-pager li) {
  background: #0d1117;
  border: 1px solid #1e2330;
}

:deep(.el-pagination .el-pager li.active) {
  background: #2b6aff;
  border-color: #2b6aff;
}

/* Detail Dialog */
.detail-dialog :deep(.el-dialog) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  color: var(--text);
  font-weight: 600;
  font-size: 16px;
  font-family: 'DM Serif Display', serif;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-label {
  width: 80px;
  font-size: 13px;
  color: var(--text-dim);
  flex-shrink: 0;
  padding-top: 2px;
}

.detail-value {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text);
  word-break: break-all;
}

.detail-value.highlight {
  color: var(--gold);
  font-size: 18px;
  font-weight: 700;
  font-family: 'Space Mono', monospace;
}

.mono {
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  color: var(--text-dim);
}

@media (max-width: 768px) {
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
