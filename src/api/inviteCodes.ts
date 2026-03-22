/**
 * 邀请码（仅后台可生成；持久化 localStorage）
 */

export type InviteCodeRow = {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  /** 可选备注 */
  note?: string;
};

const LS_KEY = 'cc_admin_invite_codes';

const randomChunk = (len: number) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

function defaultSeed(): InviteCodeRow[] {
  const t = new Date().toISOString().slice(0, 19).replace('T', ' ');
  return [
    { id: 'seed-1', code: 'CC-WELCOME-2026', maxUses: 50, usedCount: 0, createdAt: t, note: '演示批次' },
    { id: 'seed-2', code: 'CC-PARTNER-DEMO', maxUses: 10, usedCount: 0, createdAt: t, note: '合作方' },
  ];
}

export function loadInviteCodes(): InviteCodeRow[] {
  if (typeof localStorage === 'undefined') return defaultSeed();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as InviteCodeRow[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  const seed = defaultSeed();
  saveInviteCodes(seed);
  return seed;
}

export function saveInviteCodes(rows: InviteCodeRow[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(rows));
}

function uniqueCode(existing: Set<string>): string {
  for (let k = 0; k < 50; k++) {
    const c = `CC-${randomChunk(4)}-${randomChunk(4)}`;
    if (!existing.has(c)) return c;
  }
  return `CC-${Date.now()}-${randomChunk(4)}`;
}

/** 批量生成邀请码并写入存储，返回本次新生成的条目 */
export function generateInviteCodes(count: number, maxUses: number): InviteCodeRow[] {
  const clampedCount = Math.min(200, Math.max(1, Math.floor(count)));
  const clampedUses = Math.min(99999, Math.max(1, Math.floor(maxUses)));
  const existing = loadInviteCodes();
  const set = new Set(existing.map((r) => r.code.toUpperCase()));
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const batch: InviteCodeRow[] = [];
  for (let i = 0; i < clampedCount; i++) {
    const code = uniqueCode(set);
    set.add(code.toUpperCase());
    batch.push({
      id: `ic-${Date.now()}-${i}-${randomChunk(3)}`,
      code,
      maxUses: clampedUses,
      usedCount: 0,
      createdAt: now,
    });
  }
  saveInviteCodes([...batch, ...existing]);
  return batch;
}

export function revokeInviteCode(id: string) {
  const rows = loadInviteCodes().filter((r) => r.id !== id);
  saveInviteCodes(rows);
}

/** 用户注册时核销一次；成功返回规范码文案 */
export function tryConsumeInviteCode(
  raw: string,
): { ok: true; code: string } | { ok: false; message: string } {
  const key = raw.trim().toUpperCase();
  if (!key) return { ok: false, message: '请输入邀请码' };
  const rows = loadInviteCodes();
  const idx = rows.findIndex((r) => r.code.toUpperCase() === key);
  if (idx < 0) return { ok: false, message: '邀请码无效' };
  const row = rows[idx];
  if (row.usedCount >= row.maxUses) return { ok: false, message: '邀请码已达使用上限' };
  const next = [...rows];
  next[idx] = { ...row, usedCount: row.usedCount + 1 };
  saveInviteCodes(next);
  return { ok: true, code: row.code };
}

export function inviteStats(rows: InviteCodeRow[]) {
  const total = rows.length;
  const exhausted = rows.filter((r) => r.usedCount >= r.maxUses).length;
  const remainingUses = rows.reduce((s, r) => s + Math.max(0, r.maxUses - r.usedCount), 0);
  return { total, exhausted, active: total - exhausted, remainingUses };
}
