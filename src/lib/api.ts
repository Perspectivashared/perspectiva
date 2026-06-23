// In production the Vercel rewrite at /api/* proxies to the Railway backend,
// keeping cookies same-origin and avoiding third-party cookie blocking.
const BASE_URL = import.meta.env.PROD
  ? "/api"
  : ((import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000");

export const SESSION_EXPIRED = "SESSION_EXPIRED";
export const RATE_LIMITED = "RATE_LIMITED";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let _refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (_refreshing !== null) return _refreshing;
  _refreshing = fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      _refreshing = null;
    });
  return _refreshing;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, options, false);
    }
    // Notify AuthContext via custom event so unhandledrejection is not needed.
    globalThis.window?.dispatchEvent(new CustomEvent(SESSION_EXPIRED));
    throw new ApiError(401, SESSION_EXPIRED, SESSION_EXPIRED);
  }

  if (res.status === 429) {
    throw new ApiError(429, RATE_LIMITED, RATE_LIMITED);
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const message =
      typeof error.detail === "string" ? error.detail : JSON.stringify(error.detail);
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) =>
    request<T>(path, { method: "DELETE" }),
};
