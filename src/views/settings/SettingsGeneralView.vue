<script setup lang="ts">
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

const base = reactive({
  site: 'Canton Chain Wallet Admin',
  logo: 'https://example.com/logo.png',
  email: 'support@cantonchain.cc',
});

const save = () => ElMessage.success('基础配置已保存（Mock）');
</script>

<template>
  <div class="general">
    <header class="block-head">
      <h2 class="block-title font-display">基础配置</h2>
      <p class="block-desc">站点展示与对外联系方式</p>
    </header>
    <el-card shadow="never" class="card">
      <el-form label-position="top">
        <el-form-item label="站点名称">
          <el-input v-model="base.site" />
        </el-form-item>
        <el-form-item label="Logo URL">
          <el-input v-model="base.logo" />
        </el-form-item>
        <el-form-item label="客服邮箱">
          <el-input v-model="base.email" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存配置</el-button>
        </el-form-item>
      </el-form>
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
  max-width: 560px;
}

.card :deep(.el-form-item__label) {
  color: var(--text-dim);
  font-size: 12px;
}
</style>
