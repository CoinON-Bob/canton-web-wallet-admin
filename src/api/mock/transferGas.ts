/** 用户转账 Gas 参数（纯前端 Mock，写入 localStorage） */

export type TransferGasConfig = {
  /** 建议 Gas Price，单位 Gwei */
  gasPriceGwei: number;
  /** Gas Limit，普通转账通常 21000 */
  gasLimit: number;
};

const STORAGE_KEY = 'cc_admin_transfer_gas';

export const defaultTransferGas = (): TransferGasConfig => ({
  gasPriceGwei: 21,
  gasLimit: 21000,
});

export function loadTransferGas(): TransferGasConfig {
  if (typeof localStorage === 'undefined') return defaultTransferGas();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<TransferGasConfig>;
      return {
        gasPriceGwei: Math.min(500, Math.max(1, Number(p.gasPriceGwei) || 21)),
        gasLimit: Math.min(500000, Math.max(21000, Number(p.gasLimit) || 21000)),
      };
    }
  } catch {
    /* ignore */
  }
  return defaultTransferGas();
}

export function saveTransferGas(c: TransferGasConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}
