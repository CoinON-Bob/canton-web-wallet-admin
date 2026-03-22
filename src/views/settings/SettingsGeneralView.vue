<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { loadTransferGas, saveTransferGas, type TransferGasConfig } from '../../api/mock';

const base = reactive({
  site: 'Canton Chain Wallet Admin',
  logo: 'https://example.com/logo.png',
  email: 'support@cantonchain.cc',
});

const gas = reactive<TransferGasConfig>({
  gasPriceGwei: 21,
  gasLimit: 21000,
});

onMounted(() => {
  const g = loadTransferGas();
  gas.gasPriceGwei = g.gasPriceGwei;
  gas.gasLimit = g.gasLimit;
});

const save = () => {
  saveTransferGas({
    gasPriceGwei: gas.gasPriceGwei,
    gasLimit: gas.gasLimit,
  });
  ElMessage.success('基础配置与转账 Gas 已保存（Mock）');
};
</script>

<template>
  <div class="general">
    <header class="block-head">
      <h2 class="block-title font-display">基础配置</h2>
      <p class="block-desc">站点展示、对外联系方式与链上转账参数（演示数据写入浏览器本地）</p>
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

        <div class="section-divider">
          <span class="section-tag font-mono">TRANSFER GAS</span>
          <h3 class="section-title">用户转账 Gas 费</h3>
          <p class="section-hint">用于后台展示与风控估算的默认参数；纯前端 Mock，不接链。</p>
        </div>

        <el-form-item label="Gas Price（Gwei）">
          <el-input-number
            v-model="gas.gasPriceGwei"
            :min="1"
            :max="500"
            :step="1"
            controls-position="right"
            class="num-full"
          />
        </el-form-item>
        <el-form-item label="Gas Limit">
          <el-input-number
            v-model="gas.gasLimit"
            :min="21000"
            :max="500000"
            :step="1000"
            controls-position="right"
            class="num-full"
          />
        </el-form-item>
        <p class="gas-preview font-mono">
          当前组合：{{ gas.gasPriceGwei }} Gwei × {{ gas.gasLimit.toLocaleString() }} Gas Limit（Mock）
        </p>

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
  line-height: 1.5;
}

.card {
  border-radius: 8px;
  max-width: 640px;
}

.card :deep(.el-form-item__label) {
  color: var(--text-dim);
  font-size: 12px;
}

.section-divider {
  margin: 28px 0 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.section-tag {
  display: block;
  font-size: 9px;
  letter-spacing: 0.2em;
  color: var(--gold);
  margin-bottom: 8px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.section-hint {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.5;
}

.num-full {
  width: 100%;
}

.gas-preview {
  margin: -8px 0 20px;
  font-size: 11px;
  color: #9aacca;
}
</style>
