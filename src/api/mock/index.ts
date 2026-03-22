export type KpiVariant = 'hero' | 'user' | 'risk' | 'default';

export const dashboardKpis: {
  title: string;
  value: string;
  trend: string;
  subline?: string;
  variant?: KpiVariant;
}[] = [
  {
    title: '平台总 CC 持有量',
    value: '482,310,000',
    trend: '+2.4%',
    subline: '≈ $12,057,750 USDT',
    variant: 'hero',
  },
  { title: '注册用户', value: '84,261', trend: '+495', subline: '近 24h 净增', variant: 'user' },
  { title: '今日转账', value: '6,483', trend: '+4.8%', subline: '笔数', variant: 'default' },
  { title: '合约交易额', value: '9.2B CC', trend: '-1.2%', subline: '滚动 7 日', variant: 'default' },
  { title: '风险事件', value: '3', trend: '实时', subline: '待处理队列', variant: 'risk' },
];

const mockAddr = (seed: number) => {
  const base = (BigInt(seed) * 0x9e3779b97f4a7c15n).toString(16).padStart(40, 'a').slice(0, 40);
  return `0x${base}`;
};

const invitePool = ['CC-WELCOME-2026', 'CC-PARTNER-DEMO', 'CC-BETA-INTERNAL'];

export const users = Array.from({ length: 22 }).map((_, i) => ({
  id: 10001 + i,
  avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${10001 + i}`,
  /** 用户唯一对外标识之一（与 ID 并列） */
  email: `user${10001 + i}@canton.mail`,
  createdAt: `2026-03-${String((i % 28) + 1).padStart(2, '0')} 12:30`,
  asset: Number((1250000.5 - i * 6532.33).toFixed(2)),
  status: i % 3 === 0 ? 'pending' : i % 4 === 0 ? 'failed' : 'confirmed',
  /** 注册时使用的邀请码（后台发放） */
  inviteCode: invitePool[i % invitePool.length]!,
}));

export const transfers = Array.from({ length: 36 }).map((_, i) => ({
  hash: mockAddr(50000 + i),
  from: mockAddr(10000 + i),
  to: mockAddr(20000 + i),
  amount: Number((Math.random() * 500000).toFixed(2)),
  fee: Number((Math.random() * 20).toFixed(4)),
  status: (i % 7 === 0 ? 'failed' : i % 4 === 0 ? 'pending' : 'confirmed') as
    | 'confirmed'
    | 'pending'
    | 'failed',
  time: `2026-03-${String((i % 28) + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:10`,
}));

export type RiskSeverity = 'critical' | 'warning' | 'info';

export const riskEvents: {
  severity: RiskSeverity;
  type: string;
  desc: string;
  time: string;
  status: string;
}[] = [
  {
    severity: 'critical',
    type: '异常大额转账',
    desc: '用户 10023 在 5 分钟内发起 12 笔大额转账',
    time: '2026-03-22 09:30',
    status: '待处理',
  },
  {
    severity: 'warning',
    type: '多端登录',
    desc: '同账号在 3 个地区同时活跃',
    time: '2026-03-22 08:10',
    status: '已标记',
  },
  {
    severity: 'info',
    type: '频繁失败交易',
    desc: '合约调用失败率升高至 8.3%',
    time: '2026-03-21 22:12',
    status: '观察中',
  },
];

export const formatHash = (hash: string): string => {
  if (hash.length <= 12) return hash;
  return hash.slice(0, 6) + '...' + hash.slice(-4);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  if (num >= 1000) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
  return num.toFixed(2);
};

/** 0x4f2e...a9c1 */
export const formatAddress = (addr: string): string => {
  const a = addr.trim();
  if (a.length <= 12) return a;
  return a.slice(0, 6) + '...' + a.slice(-4);
};

export * from './contracts';
export * from './transferGas';
