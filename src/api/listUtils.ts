/** 兼容常见分页字段名，解析接口 data 内列表（含有限层嵌套 data） */
export function extractPageRows(data: unknown, depth = 0): { rows: Record<string, unknown>[]; total: number } {
  if (depth > 5) return { rows: [], total: 0 };
  if (data == null) return { rows: [], total: 0 };
  if (Array.isArray(data)) return { rows: data as Record<string, unknown>[], total: data.length };
  if (typeof data !== 'object') return { rows: [], total: 0 };
  const d = data as Record<string, unknown>;
  const list = d.list ?? d.items ?? d.records ?? d.rows;
  if (Array.isArray(list)) {
    const total = Number(d.total ?? d.count ?? d.total_count ?? list.length) || list.length;
    return { rows: list as Record<string, unknown>[], total };
  }
  const inner = d.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return extractPageRows(inner, depth + 1);
  }
  return { rows: [], total: 0 };
}

export function pickColumns(rows: Record<string, unknown>[], max = 10): string[] {
  if (!rows.length) return [];
  const keys = new Set<string>();
  for (const row of rows.slice(0, 5)) {
    for (const k of Object.keys(row)) {
      keys.add(k);
      if (keys.size >= max) return [...keys];
    }
  }
  return [...keys].slice(0, max);
}

/** 角色下拉：兼容 list/options 等分页或数组结构 */
export function extractRoleOptions(data: unknown): { label: string; value: number }[] {
  const { rows } = extractPageRows(data);
  const fromRows = rows
    .map((r) => ({
      label: String(r.name ?? r.code ?? r.title ?? `角色 #${r.id ?? ''}`),
      value: Number(r.id),
    }))
    .filter((o) => Number.isFinite(o.value));
  if (fromRows.length) return fromRows;
  if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>).options)) {
    const opts = (data as Record<string, unknown>).options as Record<string, unknown>[];
    return opts
      .map((r) => ({
        label: String(r.name ?? r.code ?? r.label ?? r.id),
        value: Number(r.id ?? r.value),
      }))
      .filter((o) => Number.isFinite(o.value));
  }
  return [];
}

/** 单条详情：兼容 data / record / 一层嵌套 */
export function extractDetailRecord(data: unknown, depth = 0): Record<string, unknown> | null {
  if (depth > 4 || data == null) return null;
  if (typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const hasId = d.id !== undefined && d.id !== null;
  if (hasId && (d.username !== undefined || d.nickname !== undefined || d.login !== undefined)) {
    return d;
  }
  const inner = d.data ?? d.record ?? d.detail ?? d.info;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return extractDetailRecord(inner, depth + 1);
  }
  return hasId ? d : null;
}
