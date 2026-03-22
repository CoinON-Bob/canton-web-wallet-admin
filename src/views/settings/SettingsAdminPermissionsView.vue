<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Check, UserFilled } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  rolePermissionTree,
  getAdmin,
  updateAdminPermissions,
  applyRoleTemplate,
  type AdminRole,
} from '../../api/mock/systemSettings';

const route = useRoute();
const router = useRouter();

const adminId = computed(() => String(route.params.id));
const admin = ref(getAdmin(adminId.value));
const treeRef = ref();
const treeKey = ref(0);
const dirty = ref(false);

const reload = () => {
  admin.value = getAdmin(adminId.value);
  if (!admin.value) {
    ElMessage.error('管理员不存在');
    router.replace({ name: 'settings-admins' });
    return;
  }
  treeKey.value += 1;
  dirty.value = false;
};

onMounted(reload);
watch(adminId, reload);

const roleLabel = (r: AdminRole) => {
  if (r === 'root') return '超级管理员';
  if (r === 'risk_manager') return '风控管理员';
  return '只读';
};

const checkedKeys = computed(() => admin.value?.permissionIds ?? []);

const onCheck = () => {
  dirty.value = true;
};

const clearAll = () => {
  treeRef.value?.setCheckedKeys?.([]);
  dirty.value = true;
};

const applyTemplate = async (role: AdminRole) => {
  if (!admin.value) return;
  if (admin.value.role === 'root' && role !== 'root') {
    ElMessage.warning('超级管理员请直接勾选权限，不建议套用降级模板');
    return;
  }
  try {
    await ElMessageBox.confirm('将用该角色的默认权限覆盖当前勾选，是否继续？', '套用模板', {
      type: 'warning',
    });
    applyRoleTemplate(admin.value.id, role);
    reload();
    ElMessage.success('已套用角色模板（Mock）');
  } catch {
    /* cancel */
  }
};

const save = () => {
  if (!admin.value) return;
  const keys = (treeRef.value?.getCheckedKeys?.() ?? []) as number[];
  updateAdminPermissions(admin.value.id, keys);
  dirty.value = false;
  ElMessage.success(`已保存「${admin.value.displayName}」的 ${keys.length} 项权限（Mock）`);
};

const back = () => {
  if (dirty.value) {
    ElMessageBox.confirm('有未保存的权限变更，确定离开？', '提示', { type: 'warning' })
      .then(() => router.push({ name: 'settings-admins' }))
      .catch(() => {});
    return;
  }
  router.push({ name: 'settings-admins' });
};
</script>

<template>
  <div v-if="admin" class="perm-page">
    <el-button class="back" :icon="ArrowLeft" text @click="back">返回管理员列表</el-button>

    <!-- 流程步骤 -->
    <ol class="steps" aria-label="权限配置步骤">
      <li class="done"><span class="sn">1</span>选择管理员</li>
      <li class="active"><span class="sn">2</span>勾选权限</li>
      <li><span class="sn">3</span>保存生效</li>
    </ol>

    <div class="grid">
      <el-card shadow="never" class="card profile">
        <div class="profile-inner">
          <div class="avatar" aria-hidden="true">
            <el-icon :size="28"><UserFilled /></el-icon>
          </div>
          <div>
            <h2 class="name">{{ admin.displayName }}</h2>
            <p class="login font-mono">@{{ admin.login }}</p>
            <div class="meta">
              <span class="pill" :class="admin.role">{{ roleLabel(admin.role) }}</span>
              <span :class="admin.status === 'active' ? 'st-ok' : 'st-off'">
                {{ admin.status === 'active' ? '启用' : '停用' }}
              </span>
            </div>
            <p v-if="admin.phone" class="phone font-mono">{{ admin.phone }}</p>
          </div>
        </div>
        <p class="tip font-mono">当前账号独立权限集 · 与角色模板可不一致</p>
      </el-card>

      <el-card shadow="never" class="card tree-card">
        <template #header>
          <div class="hdr">
            <span class="ht">权限节点</span>
            <div class="tools">
              <el-button size="small" @click="clearAll">清空勾选</el-button>
              <el-dropdown trigger="click">
                <el-button size="small">按角色套用模板</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="applyTemplate('viewer')">只读模板</el-dropdown-item>
                    <el-dropdown-item @click="applyTemplate('risk_manager')">风控模板</el-dropdown-item>
                    <el-dropdown-item divided @click="applyTemplate('root')">全量模板（慎用）</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button type="primary" size="small" :icon="Check" @click="save">
                保存权限
              </el-button>
            </div>
          </div>
        </template>

        <div class="tree-scroll">
          <el-tree
            :key="treeKey"
            ref="treeRef"
            :data="rolePermissionTree"
            show-checkbox
            node-key="id"
            :default-expand-all="true"
            :default-checked-keys="checkedKeys"
            :props="{ label: 'label', children: 'children' }"
            class="perm-tree"
            @check="onCheck"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.perm-page {
  width: 100%;
}

.back {
  margin-bottom: 12px;
  color: var(--text-dim);
}

.steps {
  display: flex;
  gap: 0;
  margin: 0 0 20px;
  padding: 0;
  list-style: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-card);
}

.steps li {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  border-right: 1px solid var(--border);
}

.steps li:last-child {
  border-right: none;
}

.steps li.done {
  background: rgba(0, 212, 177, 0.08);
  color: var(--teal);
}

.steps li.active {
  background: var(--gold-dim);
  color: var(--gold);
}

.sn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-family: 'Space Mono', monospace;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}

.steps li.done .sn {
  border-color: var(--teal);
}

.steps li.active .sn {
  border-color: var(--gold);
}

.grid {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.card {
  border-radius: 8px;
}

.profile {
  --el-card-padding: 20px;
}

.profile-inner {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: var(--gold-dim);
  color: var(--gold);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
}

.login {
  margin: 0 0 10px;
  font-size: 12px;
  color: var(--text-dim);
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
}

.pill.root {
  background: var(--gold-dim);
  color: var(--gold);
}

.pill.risk_manager {
  background: rgba(43, 106, 255, 0.12);
  color: #6b9fff;
}

.pill.viewer {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-dim);
}

.st-ok {
  font-size: 11px;
  color: var(--teal);
}

.st-off {
  font-size: 11px;
  color: var(--text-dim);
}

.phone {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--text-dim);
}

.tip {
  margin: 16px 0 0;
  font-size: 10px;
  color: var(--text-dim);
  line-height: 1.4;
}

.tree-card {
  --el-card-padding: 0;
  min-height: 420px;
  display: flex;
  flex-direction: column;
}

.tree-card :deep(.el-card__header) {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
}

.tree-card :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.ht {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tree-scroll {
  flex: 1;
  min-height: 360px;
  max-height: min(560px, calc(100vh - 320px));
  overflow: auto;
  padding: 16px 18px 20px;
}

.perm-tree {
  background: transparent !important;
}

.perm-tree :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: 4px;
}

.perm-tree :deep(.el-tree-node__content:hover) {
  background: rgba(255, 255, 255, 0.04) !important;
}

.perm-tree :deep(.el-checkbox__inner) {
  border-color: var(--border);
  background: var(--bg-base);
}

.perm-tree :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: var(--gold);
  border-color: var(--gold);
}

.perm-tree :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #000;
}
</style>
