/**
 * Admin API HTTP client.
 * Response shape: { code: number; msg: string; data: T }
 * Token: same storage keys as store/auth.ts (cc_admin_token).
 */

export type ApiEnvelope<T = unknown> = { code: number; msg: string; data: T };

export class ApiError extends Error {
  code?: number;
  status?: number;
  constructor(message: string, opts?: { code?: number; status?: number }) {
    super(message);
    this.name = 'ApiError';
    this.code = opts?.code;
    this.status = opts?.status;
  }
}

const TOKEN_KEY = 'cc_admin_token';

export const getApiBaseUrl = (): string => {
  const env = import.meta.env as { VITE_API_BASE_URL?: string };
  const configured = env.VITE_API_BASE_URL || '/api';
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && configured.startsWith('http://')) {
    return configured.replace(/^http:\/\//, 'https://');
  }
  return configured;
};

const base = () => getApiBaseUrl().replace(/\/$/, '');

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function buildQuery(params: Record<string, string | number | undefined | null | boolean>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `?${s}` : '';
}

export async function requestEnvelope<T>(
  method: 'GET' | 'POST',
  path: string,
  opts?: {
    body?: unknown;
    skipAuth?: boolean;
    timeoutMs?: number;
  }
): Promise<ApiEnvelope<T>> {
  const url = `${base()}${path}`;
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {};
  if (!opts?.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let body: string | undefined;
  if (method !== 'GET' && opts?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  const ms = opts?.timeoutMs ?? 20000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, signal: controller.signal });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new ApiError(`网络错误: ${msg}`);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(`非 JSON 响应 (${res.status}): ${text.slice(0, 200)}`, { status: res.status });
  }

  const j = json as ApiEnvelope | null;
  if (!res.ok) {
    const msg = typeof j?.msg === 'string' ? j.msg : `HTTP ${res.status}`;
    throw new ApiError(msg, { status: res.status, code: typeof j?.code === 'number' ? j.code : undefined });
  }

  if (typeof j?.code === 'number' && j.code !== 0) {
    throw new ApiError(j.msg || '业务错误', { code: j.code, status: res.status });
  }

  return j as ApiEnvelope<T>;
}
