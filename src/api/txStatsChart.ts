/**
 * 将 stats/overview、trend、top-users 的 data 尽力解析为图表用结构（后端字段未定时做容错）。
 */

import type { ApiEnvelope } from './http';

function unwrapData<T = unknown>(env: ApiEnvelope<T>): unknown {
  return env?.data !== undefined ? env.data : env;
}

function dig(obj: unknown, keys: string[]): unknown {
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur && typeof cur === 'object' && k in (cur as object)) {
      cur = (cur as Record<string, unknown>)[k];
    } else {
      return undefined;
    }
  }
  return cur;
}

/** 折线图：从数组或嵌套对象里找时间序列 */
export function parseTrendLineSeries(envelope: ApiEnvelope<unknown>): { categories: string[]; values: number[] } | null {
  const root = unwrapData(envelope);
  const candidates = [
    dig(root, ['points']),
    dig(root, ['trend']),
    dig(root, ['series']),
    dig(root, ['items']),
    dig(root, ['list']),
    dig(root, ['days']),
    dig(root, ['buckets']),
    Array.isArray(root) ? root : undefined,
  ].filter(Boolean);

  for (const c of candidates) {
    if (!Array.isArray(c) || !c.length) continue;
    const categories: string[] = [];
    const values: number[] = [];
    for (const row of c) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const cat = String(
        r.date ?? r.day ?? r.label ?? r.bucket ?? r.time ?? r.stat_date ?? r.period ?? categories.length
      );
      const v = Number(
        r.count ?? r.amount ?? r.total_amount ?? r.value ?? r.total ?? r.volume ?? r.tx_count ?? 0
      );
      categories.push(cat);
      values.push(Number.isFinite(v) ? v : 0);
    }
    if (categories.length) return { categories, values };
  }
  return null;
}

type PieSlice = { name: string; value: number };

/** 饼图：类型占比或排行转饼 */
export function parsePieFromTopUsers(envelope: ApiEnvelope<unknown>): PieSlice[] | null {
  const root = unwrapData(envelope);
  const arr = Array.isArray(root)
    ? root
    : (dig(root, ['list']) as unknown) ||
      (dig(root, ['items']) as unknown) ||
      (dig(root, ['users']) as unknown);
  if (!Array.isArray(arr) || !arr.length) return null;
  const slices: PieSlice[] = [];
  for (const row of arr.slice(0, 8)) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const name = String(
      r.email ?? r.user_id ?? r.party_id ?? r.nickname ?? r.id ?? '—'
    ).slice(0, 32);
    const value = Number(r.amount ?? r.total_amount ?? r.count ?? r.volume ?? 0);
    if (name && Number.isFinite(value)) slices.push({ name, value: Math.max(0, value) });
  }
  return slices.length ? slices : null;
}

export function parsePieFromOverview(envelope: ApiEnvelope<unknown>): PieSlice[] | null {
  const root = unwrapData(envelope);
  if (!root || typeof root !== 'object') return null;
  const o = root as Record<string, unknown>;
  const candidates = [
    o.by_type,
    o.type_breakdown,
    o.breakdown,
    o.distribution,
    o.by_subtype,
  ].find((x) => Array.isArray(x)) as Record<string, unknown>[] | undefined;

  if (Array.isArray(candidates) && candidates.length) {
    const slices: PieSlice[] = [];
    for (const row of candidates) {
      if (!row || typeof row !== 'object') continue;
      const r = row as Record<string, unknown>;
      const name = String(r.name ?? r.type ?? r.label ?? r.key ?? '—');
      const value = Number(r.value ?? r.count ?? r.amount ?? r.pct ?? 0);
      slices.push({ name, value: Number.isFinite(value) ? value : 0 });
    }
    return slices.length ? slices : null;
  }
  return null;
}

export type KpiItem = { label: string; value: string };

/** KPI 卡片：从 overview 猜常见字段 */
export function parseOverviewKpis(envelope: ApiEnvelope<unknown>): KpiItem[] | null {
  const root = unwrapData(envelope);
  if (!root || typeof root !== 'object') return null;
  const o = root as Record<string, unknown>;
  const pick = (keys: string[], label: string): KpiItem | null => {
    for (const k of keys) {
      const v = o[k];
      if (v !== undefined && v !== null && v !== '') {
        if (typeof v === 'number' || typeof v === 'string') {
          return { label, value: typeof v === 'number' ? v.toLocaleString() : String(v) };
        }
      }
    }
    return null;
  };
  const items: KpiItem[] = [];
  const a = pick(
    ['today_count', 'today_tx_count', 'count_today', 'tx_today'],
    '今日笔数'
  );
  const b = pick(['week_count', 'last_7d_count', 'count_7d'], '近 7 日笔数');
  const c = pick(['month_count', 'last_30d_count', 'count_30d'], '近 30 日笔数');
  if (a) items.push(a);
  if (b) items.push(b);
  if (c) items.push(c);
  if (!items.length) {
    const tc = pick(['total_count', 'tx_count', 'total_tx'], '总笔数');
    const ta = pick(['total_amount', 'amount_sum'], '总金额');
    if (tc) items.push(tc);
    if (ta) items.push(ta);
  }
  return items.length ? items : null;
}
