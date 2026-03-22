/**
 * 合并：演示种子用户 + 邀请码前台注册用户
 */

import { users as seedUsers } from './mock/index';
import { loadRegisteredUsers, type RegisteredWalletUser } from './registeredUsers';

export type DirectoryUser = (typeof seedUsers)[number] | RegisteredWalletUser;

export function getSeedUsers(): (typeof seedUsers)[number][] {
  return [...seedUsers];
}

export function getAllUsers(): DirectoryUser[] {
  const reg = loadRegisteredUsers();
  return [...reg, ...seedUsers];
}

export function findUserById(id: string | number): DirectoryUser | undefined {
  return getAllUsers().find((u) => String(u.id) === String(id));
}

export function maxSeedUserId(): number {
  return seedUsers.reduce((m, u) => Math.max(m, u.id), 0);
}
