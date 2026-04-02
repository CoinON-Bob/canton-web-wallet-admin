import { buildQuery, requestEnvelope } from './http';

/** Extract bearer token from login payload (doc 未写字段名，兼容常见形态). */
export function extractAdminLoginToken(data: unknown): string | null {
  if (data == null) return null;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const candidates = ['token', 'access_token', 'accessToken', 'admin_token'];
  for (const k of candidates) {
    const v = d[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

export const adminPublicApi = {
  ping: () => requestEnvelope('GET', '/admin/public', { skipAuth: true }),
  login: (body: { username: string; password: string }) =>
    requestEnvelope<Record<string, unknown>>('POST', '/admin/login', { body, skipAuth: true }),
  logout: () => requestEnvelope('POST', '/admin/logout'),
};

export const adminAccountApi = {
  profile: () => requestEnvelope('GET', '/admin/account/profile'),
  menus: () => requestEnvelope('GET', '/admin/account/menus'),
  permissions: () => requestEnvelope('GET', '/admin/account/permissions'),
};

export const adminUserApi = {
  list: (q: { page?: number; page_size?: number; keyword?: string }) =>
    requestEnvelope('GET', `/admin/admin-user/list${buildQuery(q)}`),
  detail: (id: number) => requestEnvelope('GET', `/admin/admin-user/detail${buildQuery({ id })}`),
  save: (body: Record<string, unknown>) => requestEnvelope('POST', '/admin/admin-user/save', { body }),
  status: (body: { id: number; status: number }) => requestEnvelope('POST', '/admin/admin-user/status', { body }),
  delete: (body: { id: number }) => requestEnvelope('POST', '/admin/admin-user/delete', { body }),
};

export const adminRoleApi = {
  list: (q: { page?: number; page_size?: number; keyword?: string }) =>
    requestEnvelope('GET', `/admin/role/list${buildQuery(q)}`),
  options: () => requestEnvelope('GET', '/admin/role/options'),
  resourceIds: (role_id: number) => requestEnvelope('GET', `/admin/role/resource-ids${buildQuery({ role_id })}`),
  save: (body: Record<string, unknown>) => requestEnvelope('POST', '/admin/role/save', { body }),
  status: (body: { id: number; status: number }) => requestEnvelope('POST', '/admin/role/status', { body }),
  delete: (body: { id: number }) => requestEnvelope('POST', '/admin/role/delete', { body }),
};

export const adminResourceApi = {
  list: (q: { type?: string; status?: number; parent_id?: number; keyword?: string }) =>
    requestEnvelope('GET', `/admin/resource/list${buildQuery(q)}`),
  tree: (q: { type?: string; status?: number }) => requestEnvelope('GET', `/admin/resource/tree${buildQuery(q)}`),
  save: (body: Record<string, unknown>) => requestEnvelope('POST', '/admin/resource/save', { body }),
  status: (body: { id: number; status: number }) => requestEnvelope('POST', '/admin/resource/status', { body }),
  delete: (body: { id: number }) => requestEnvelope('POST', '/admin/resource/delete', { body }),
};

export const adminTransactionApi = {
  list: (q: {
    page?: number;
    page_size?: number;
    user_id?: number;
    party_id?: string;
    keyword?: string;
    transaction_type?: string;
    transaction_subtype_choice?: string;
    start_time?: string;
    end_time?: string;
    include_raw?: number;
  }) => requestEnvelope('GET', `/admin/transaction/list${buildQuery(q)}`),
  statsOverview: (q: { days?: number; latest_limit?: number }) =>
    requestEnvelope('GET', `/admin/transaction/stats/overview${buildQuery(q)}`),
  statsTrend: (q: { days?: number }) => requestEnvelope('GET', `/admin/transaction/stats/trend${buildQuery(q)}`),
  statsTopUsers: (q: { days?: number; limit?: number; sort_by?: string }) =>
    requestEnvelope('GET', `/admin/transaction/stats/top-users${buildQuery(q)}`),
  sync: (body: Record<string, unknown>) => requestEnvelope('POST', '/admin/transaction/sync', { body }),
};
