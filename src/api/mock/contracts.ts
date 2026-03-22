/** 预测合约 Mock */

export type ContractRoundStatus = 'settling' | 'closed';

export interface ContractRound {
  roundId: number;
  status: ContractRoundStatus;
  bullPct: number;
  bullVol: string;
  bearVol: string;
  countdown?: string;
  settledAt?: string;
  winner?: 'bull' | 'bear';
  poolTotal: string;
}

export const activeRound: ContractRound = {
  roundId: 2041,
  status: 'settling',
  bullPct: 62,
  bullVol: '4.8M CC',
  bearVol: '2.9M CC',
  countdown: '00:14:22',
  poolTotal: '7.7M CC',
};

export const roundHistory: ContractRound[] = [
  {
    roundId: 2040,
    status: 'closed',
    bullPct: 55,
    bullVol: '3.2M CC',
    bearVol: '2.6M CC',
    settledAt: '2026-03-22 08:00',
    winner: 'bull',
    poolTotal: '5.8M CC',
  },
  {
    roundId: 2039,
    status: 'closed',
    bullPct: 41,
    bullVol: '2.1M CC',
    bearVol: '3.0M CC',
    settledAt: '2026-03-22 04:00',
    winner: 'bear',
    poolTotal: '5.1M CC',
  },
  {
    roundId: 2038,
    status: 'closed',
    bullPct: 50,
    bullVol: '2.8M CC',
    bearVol: '2.8M CC',
    settledAt: '2026-03-21 20:00',
    winner: 'bull',
    poolTotal: '5.6M CC',
  },
];

export const contractRules = [
  '每轮固定时长，倒计时结束后进入结算锁定。',
  '看涨 / 看跌两侧资金按比例计入池子，结算后按胜出方与规则分配。',
  '后台仅支持查看与参数类 Mock 配置，链上请以主网为准。',
];
