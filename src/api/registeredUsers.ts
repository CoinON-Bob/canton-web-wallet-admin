/**
 * 通过邀请码在前台注册的用户（localStorage，供管理端用户列表合并展示）
 */

import { users as seedUsers } from './mock/index';
import { loadInviteCodes, saveInviteCodes } from './inviteCodes';

export type RegisteredWalletUser = (typeof seedUsers)[number] & {
  registerSource: 'invite';
};

const LS_KEY = 'cc_wallet_invite_registered_users';

const seedMaxId = () => seedUsers.reduce((m, u) => Math.max(m, u.id), 0);

export function loadRegisteredUsers(): RegisteredWalletUser[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as RegisteredWalletUser[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(list: RegisteredWalletUser[]) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function nextUserId(): number {
  const reg = loadRegisteredUsers();
  const regMax = reg.reduce((m, u) => Math.max(m, u.id), 0);
  return Math.max(seedMaxId(), regMax) + 1;
}

/**
 * 前台注册：校验邮箱 + 邀请码，核销次数并写入用户（一步完成，避免只核销未入库）
 */
export function registerWithInvite(email: string, inviteRaw: string): RegisteredWalletUser {
  const emailNorm = email.trim().toLowerCase();
  if (!emailNorm || !emailNorm.includes('@')) {
    throw new Error('请输入有效邮箱');
  }

  const exists = [...loadRegisteredUsers(), ...seedUsers].some(
    (u) => u.email.toLowerCase() === emailNorm,
  );
  if (exists) throw new Error('该邮箱已注册');

  const key = inviteRaw.trim().toUpperCase();
  if (!key) throw new Error('请输入邀请码');

  const rows = loadInviteCodes();
  const idx = rows.findIndex((r) => r.code.toUpperCase() === key);
  if (idx < 0) throw new Error('邀请码无效');
  const row = rows[idx];
  if (row.usedCount >= row.maxUses) throw new Error('邀请码已达使用上限');

  const nextRows = [...rows];
  nextRows[idx] = { ...row, usedCount: row.usedCount + 1 };
  saveInviteCodes(nextRows);

  const list = loadRegisteredUsers();
  const user: RegisteredWalletUser = {
    id: nextUserId(),
    email: emailNorm,
    avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(emailNorm)}`,
    createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    asset: 0,
    status: 'confirmed',
    inviteCode: row.code,
    registerSource: 'invite',
  };
  saveRegisteredUsers([user, ...list]);
  return user;
}
