<script setup lang="ts">
const logs = [
  { admin: 'Super Admin', action: '修改角色权限（Risk Admin）', time: '2026-03-22 10:20', ip: '192.168.1.100' },
  { admin: 'Risk Admin', action: '启用规则 #R-21', time: '2026-03-22 09:03', ip: '192.168.1.105' },
  { admin: 'Super Admin', action: '添加管理员 ops_viewer', time: '2026-03-22 08:15', ip: '192.168.1.100' },
  { admin: 'Super Admin', action: '更新站点名称与客服邮箱', time: '2026-03-21 16:42', ip: '10.0.0.12' },
];
</script>

<template>
  <div class="logs">
    <header class="block-head">
      <h2 class="block-title font-display">操作日志</h2>
      <p class="block-desc">关键配置与权限变更记录（Mock）</p>
    </header>
    <el-card shadow="never" class="card">
      <ul class="timeline">
        <li v-for="(log, i) in logs" :key="i" class="row">
          <span class="bullet" />
          <div class="body">
            <div class="top">
              <span class="who">{{ log.admin }}</span>
              <time class="when font-mono">{{ log.time }}</time>
            </div>
            <p class="msg">{{ log.action }}</p>
            <p class="ip font-mono">IP {{ log.ip }}</p>
          </div>
        </li>
      </ul>
    </el-card>
  </div>
</template>

<style scoped>
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
}

.card {
  border-radius: 8px;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 8px 4px 12px;
}

.row {
  display: flex;
  gap: 14px;
  position: relative;
  padding-bottom: 22px;
}

.row:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 16px;
  bottom: 0;
  width: 1px;
  background: var(--border);
}

.bullet {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--gold);
  flex-shrink: 0;
  margin-top: 3px;
  box-shadow: 0 0 10px rgba(201, 162, 39, 0.35);
}

.body {
  flex: 1;
  min-width: 0;
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.who {
  font-weight: 600;
  color: var(--text);
  font-size: 13px;
}

.when {
  font-size: 10px;
  color: var(--text-dim);
}

.msg {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--text-dim);
  line-height: 1.45;
}

.ip {
  margin: 0;
  font-size: 10px;
  color: var(--text-dim);
  opacity: 0.85;
}
</style>
