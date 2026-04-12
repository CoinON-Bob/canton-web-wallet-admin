/**
 * 解析 Admin Transaction stats/* 接口的 data，用于 KPI / 折线 / 饼图。
 * 后端字段名不固定时做多策略容错；若你方稳定字段，可在下方 KNOWN_SHAPES 中收窄。
 */

import type { ApiEnvelope } from './http';

function unwrapEnvelope<T>(env: ApiEnvelope<T>): unknown {
  if (env && typeof env === 'object' && 'data' in env && env.data !== undefined) {
    return env.data;
  }
  return env;
}

/** 常见：{ data: { ...真实 } } 或 Laravel Resource 再包一层 */
export function getApiDataPayload(envelope: ApiEnvelope<unknown>): unknown {
  let d = unwrapEnvelope(envelope);
  if (d && typeof d === 'object' && !Array.isArray(d)) {
    const o = d as Record<string, unknown>;
    const keys = Object.keys(o);
    // 仅含 data 键时多剥一层
    if (keys.length === 1 && keys[0] === 'data') {
      d = o.data;
    }
  }
  return d;
}

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}

function firstArray(...candidates: unknown[]): unknown[] | null {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length) return c;
  }
  return null;
}

function num(v: unknown): number {
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.trim().replace(/,/g, ''));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

/** ---------- trend / overview / top-users 里找「时间序列」数组 ---------- */
function extractTrendPoints(root: unknown): Record<string, unknown>[] | null {
  if (!isPlainObject(root)) {
    return Array.isArray(root) ? (root as Record<string, unknown>[]) : null;
  }
  const o = root;

  const arr = firstArray(
    o.trend,
    o.trend_points,
    o.trend_data,
    o.daily,
    o.daily_stats,
    o.by_day,
    o.per_day,
    o.days,
    o.buckets,
    o.points,
    o.series_points,
    o.chart_data,
    o.hourly,
    o.hourly_stats,
    o.time_series,
    o.items,
    o.list,
    o.rows,
    dig(o, ['trend', 'points']),
    dig(o, ['chart', 'points']),
    dig(o, ['summary', 'daily']),
    dig(o, ['statistics', 'daily']),
    isPlainObject(o.trend) ? (o.trend as Record<string, unknown>).points : undefined
  );

  if (arr && arr.every((x) => x && typeof x === 'object')) {
    return arr as Record<string, unknown>[];
  }
  return null;
}

function dig(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;
  for (const k of path) {
    if (!isPlainObject(cur)) return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

/** 两列并行：dates[] + values[] */
function tryParallelDateValueArrays(o: Record<string, unknown>): { categories: string[]; values: number[] } | null {
  const dateKeys = ['dates', 'labels', 'categories', 'x', 'stat_dates', 'buckets', 'days'];
  const valKeys = [
    'counts',
    'values',
    'data',
    'amounts',
    'totals',
    'tx_counts',
    'transaction_counts',
    'volumes',
    'nums',
    'y',
  ];
  let dates: unknown;
  let vals: unknown;
  for (const dk of dateKeys) {
    if (dk in o && Array.isArray(o[dk])) {
      dates = o[dk];
      break;
    }
  }
  for (const vk of valKeys) {
    if (vk in o && Array.isArray(o[vk])) {
      vals = o[vk];
      break;
    }
  }
  if (!Array.isArray(dates) || !Array.isArray(vals) || !dates.length) {
    return null;
  }
  const n = Math.min(dates.length, vals.length);
  if (n < 1) return null;
  const categories = dates.slice(0, n).map((x) => str(x));
  const values = vals.slice(0, n).map((x) => num(x));
  return { categories, values };
}

/** Chart.js 风格 datasets */
function tryChartJsStyle(o: Record<string, unknown>): { categories: string[]; values: number[] } | null {
  const labels = o.labels ?? o.categories;
  const ds = o.datasets;
  if (!Array.isArray(labels) || !Array.isArray(ds) || !ds.length) return null;
  const first = ds[0];
  if (!isPlainObject(first)) return null;
  const data = first.data;
  if (!Array.isArray(data) || data.length !== labels.length) return null;
  return {
    categories: labels.map((x) => str(x)),
    values: data.map((x) => num(x)),
  };
}

/** 折线图 */
export function parseTrendLineSeries(envelope: ApiEnvelope<unknown>): { categories: string[]; values: number[] } | null {
  const payload = getApiDataPayload(envelope);
  if (payload == null) return null;

  if (isPlainObject(payload)) {
    const parallel = tryParallelDateValueArrays(payload);
    if (parallel) return parallel;

    const cj = tryChartJsStyle(payload);
    if (cj) return cj;

    const seriesArr = payload.series;
    if (Array.isArray(seriesArr) && seriesArr.length) {
      const first = seriesArr[0];
      if (isPlainObject(first)) {
        const pdata = first.data;
        const lbl = payload.labels ?? payload.categories ?? payload.xAxis;
        if (Array.isArray(pdata) && Array.isArray(lbl) && pdata.length === lbl.length) {
          return {
            categories: lbl.map((x) => str(x)),
            values: pdata.map((x) => num(x)),
          };
        }
      }
    }
  }

  const points = extractTrendPoints(payload);
  if (!points?.length) return null;

  const categories: string[] = [];
  const values: number[] = [];

  for (const r of points) {
    const cat = str(
      r.stat_date ??
        r.date ??
        r.day ??
        r.bucket ??
        r.bucket_date ??
        r.time ??
        r.label ??
        r.period ??
        r.d ??
        categories.length
    );
    const v = num(
      r.count ??
        r.tx_count ??
        r.transaction_count ??
        r.amount ??
        r.total_amount ??
        r.value ??
        r.total ??
        r.volume ??
        r.sum ??
        r.y ??
        r.tx_amount ??
        r.net_amount
    );
    categories.push(cat);
    values.push(v);
  }

  if (!categories.length) return null;
  return { categories, values };
}

type PieSlice = { name: string; value: number };

function extractUserRankRows(root: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(root)) {
    return root.every((x) => x && typeof x === 'object') ? (root as Record<string, unknown>[]) : null;
  }
  if (!isPlainObject(root)) return null;
  const o = root;
  const arr = firstArray(
    o.top_users,
    o.topUsers,
    o.ranking,
    o.rankings,
    o.leaders,
    o.rows,
    o.list,
    o.items,
    o.users,
    o.result,
    o.records,
    dig(o, ['data', 'list']),
    dig(o, ['data', 'items'])
  );
  if (!arr || !arr.every((x) => x && typeof x === 'object')) return null;
  return arr as Record<string, unknown>[];
}

export function parsePieFromTopUsers(envelope: ApiEnvelope<unknown>): PieSlice[] | null {
  const payload = getApiDataPayload(envelope);
  const rows = extractUserRankRows(payload);
  if (!rows?.length) return null;

  const slices: PieSlice[] = [];
  for (const r of rows.slice(0, 12)) {
    const rawLabel =
      r.email ??
      r.user_email ??
      r.username ??
      r.display_name ??
      r.nickname ??
      r.party_id ??
      r.party ??
      r.user_id ??
      r.id;
    const name = str(rawLabel != null && rawLabel !== '' ? rawLabel : `用户 ${r.user_id ?? r.id ?? '?'}`).slice(0, 40);
    const value = num(
      r.amount ??
        r.total_amount ??
        r.net_amount ??
        r.volume ??
        r.count ??
        r.tx_count ??
        r.score ??
        r.sum ??
        r.value
    );
    slices.push({ name, value: Math.max(0, value) });
  }
  return slices.length ? slices : null;
}

export function parsePieFromOverview(envelope: ApiEnvelope<unknown>): PieSlice[] | null {
  const payload = getApiDataPayload(envelope);
  if (!isPlainObject(payload)) return null;
  const o = payload;

  const arrays = [
    o.by_type,
    o.type_breakdown,
    o.breakdown,
    o.distribution,
    o.by_subtype,
    o.subtype_stats,
    o.transaction_types,
    o.per_type,
    dig(o, ['summary', 'by_type']),
  ].filter((x) => Array.isArray(x)) as Record<string, unknown>[][];

  for (const candidates of arrays) {
    const slices: PieSlice[] = [];
    for (const row of candidates) {
      if (!isPlainObject(row)) continue;
      const r = row;
      const name = str(r.name ?? r.type ?? r.label ?? r.key ?? r.subtype ?? r.transaction_type ?? '—');
      const value = num(r.value ?? r.count ?? r.amount ?? r.pct ?? r.percent ?? r.share ?? r.total);
      slices.push({ name, value });
    }
    if (slices.length) return slices;
  }
  return null;
}

export type KpiItem = { label: string; value: string };

function labelForScalarKey(k: string): string {
  const nk = k.replace(/_/g, '').toLowerCase();
  const map: Record<string, string> = {
    today_count: '今日笔数',
    today_tx_count: '今日笔数',
    todaycount: '今日笔数',
    count_today: '今日笔数',
    tx_today: '今日笔数',
    today: '今日笔数',
    week_count: '近 7 日笔数',
    last_7d_count: '近 7 日笔数',
    count_7d: '近 7 日笔数',
    days_7_count: '近 7 日笔数',
    weekcount: '近 7 日笔数',
    week: '近 7 日笔数',
    month_count: '近 30 日笔数',
    last_30d_count: '近 30 日笔数',
    count_30d: '近 30 日笔数',
    monthcount: '近 30 日笔数',
    month: '近 30 日笔数',
    total_count: '总笔数',
    tx_count: '总笔数',
    transaction_count: '交易笔数',
    totalcount: '总笔数',
    total: '合计笔数',
    total_amount: '总金额',
    amount_sum: '金额合计',
    sum_amount: '金额合计',
    volume_total: '总成交量',
    latest_sync_at: '最近同步',
  };
  if (map[k]) return map[k];
  if (map[nk]) return map[nk];
  if (k.includes('count') || nk.includes('count')) return k.replace(/_/g, ' ');
  if (k.includes('amount') || k.includes('sum') || k.includes('volume')) return k.replace(/_/g, ' ');
  return k;
}

function pickScalar(o: Record<string, unknown>, keys: string[]): KpiItem | null {
  const tryPair = (key: string, v: unknown): KpiItem | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'boolean') return null;
    if (typeof v === 'object') return null;
    if (typeof v === 'number' && Number.isFinite(v)) {
      return { label: labelForScalarKey(key), value: v.toLocaleString() };
    }
    if (typeof v === 'string' && v.trim() !== '') {
      const n = num(v);
      if (Number.isFinite(n) && String(v).trim() !== '') {
        return { label: labelForScalarKey(key), value: n.toLocaleString() };
      }
      return { label: labelForScalarKey(key), value: v };
    }
    return null;
  };

  for (const k of keys) {
    if (k in o) {
      const it = tryPair(k, o[k]);
      if (it) return it;
    }
  }
  const lowerToOrig = new Map<string, string>();
  for (const k of Object.keys(o)) {
    lowerToOrig.set(k.toLowerCase(), k);
  }
  for (const k of keys) {
    const orig = lowerToOrig.get(k.toLowerCase());
    if (orig) {
      const it = tryPair(orig, o[orig]);
      if (it) return it;
    }
  }
  return null;
}

/** 合并 overview 根对象与常见子对象，避免统计落在 summary/statistics 内解析不到 */
function gatherKpiSources(payload: Record<string, unknown>): Record<string, unknown>[] {
  const list: Record<string, unknown>[] = [payload];
  const nestedKeys = ['summary', 'stats', 'statistics', 'overview', 'result', 'detail', 'data'];
  for (const k of nestedKeys) {
    const v = payload[k];
    if (isPlainObject(v)) list.push(v as Record<string, unknown>);
  }
  return list;
}

/** 从 overview 根对象或 summary 子对象取 KPI */
export function parseOverviewKpis(envelope: ApiEnvelope<unknown>): KpiItem[] | null {
  const payload = getApiDataPayload(envelope);
  if (!isPlainObject(payload)) return null;

  const sources = gatherKpiSources(payload);

  const items: KpiItem[] = [];
  const tryOrder: { keys: string[] }[] = [
    {
      keys: [
        'today_count',
        'today_tx_count',
        'count_today',
        'tx_today',
        'TodayCount',
        'todayCount',
        'today',
      ],
    },
    {
      keys: [
        'week_count',
        'last_7d_count',
        'count_7d',
        'days_7_count',
        'WeekCount',
        'weekCount',
        'week',
        'last7d',
      ],
    },
    {
      keys: [
        'month_count',
        'last_30d_count',
        'count_30d',
        'MonthCount',
        'monthCount',
        'month',
        'last30d',
      ],
    },
  ];

  for (const src of sources) {
    for (const { keys } of tryOrder) {
      const it = pickScalar(src, keys);
      if (it && !items.some((x) => x.label === it.label)) items.push(it);
    }
    if (items.length >= 3) break;
  }

  if (items.length < 3) {
    for (const src of sources) {
      const tc = pickScalar(src, [
        'total_count',
        'tx_count',
        'transaction_count',
        'TotalCount',
        'total',
        'total_tx',
      ]);
      const ta = pickScalar(src, ['total_amount', 'amount_sum', 'sum_amount', 'volume_total', 'TotalAmount', 'amount']);
      if (tc && !items.some((x) => x.label === tc.label)) items.push(tc);
      if (ta && !items.some((x) => x.label === ta.label)) items.push(ta);
      if (items.length >= 3) break;
    }
  }

  if (!items.length) {
    for (const src of sources) {
      const numericEntries = Object.entries(src).filter(([, v]) => {
        if (typeof v === 'number' && Number.isFinite(v)) return true;
        if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v.replace(/,/g, '')))) return true;
        return false;
      });
      const skip = new Set(['code', 'id', 'page', 'page_size', 'status']);
      for (const [k, v] of numericEntries) {
        if (skip.has(k.toLowerCase())) continue;
        const val = num(v);
        items.push({ label: labelForScalarKey(k), value: val.toLocaleString() });
        if (items.length >= 6) break;
      }
      if (items.length) break;
    }
  }

  return items.length ? items.slice(0, 6) : null;
}

/** 若 KPI 已解析且展示值均为 0，用于提示是否需同步链上数据 */
export function overviewKpisAllNumericZero(envelope: ApiEnvelope<unknown> | null): boolean {
  if (!envelope) return false;
  const items = parseOverviewKpis(envelope);
  if (!items?.length) return false;
  return items.every((it) => {
    const n = Number(String(it.value).replace(/,/g, ''));
    return Number.isFinite(n) && n === 0;
  });
}

/** 供页面展示「解析是否命中」 */
export function describeStatsBinding(envelopes: {
  overview: ApiEnvelope<unknown> | null;
  trend: ApiEnvelope<unknown> | null;
  topUsers: ApiEnvelope<unknown> | null;
}): { kpi: boolean; trend: boolean; pie: boolean; pieSource: 'top-users' | 'overview' | null } {
  const kpi = envelopes.overview ? Boolean(parseOverviewKpis(envelopes.overview)?.length) : false;
  const trend = envelopes.trend ? Boolean(parseTrendLineSeries(envelopes.trend)) : false;
  const fromTop = envelopes.topUsers ? parsePieFromTopUsers(envelopes.topUsers) : null;
  const fromOv = envelopes.overview ? parsePieFromOverview(envelopes.overview) : null;
  const pie = Boolean(fromTop?.length || fromOv?.length);
  let pieSource: 'top-users' | 'overview' | null = null;
  if (fromTop?.length) pieSource = 'top-users';
  else if (fromOv?.length) pieSource = 'overview';
  return { kpi, trend, pie, pieSource };
}
