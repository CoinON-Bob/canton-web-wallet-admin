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
