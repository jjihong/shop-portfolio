// 중앙 fetch 유틸리티 — 401 시 자동 로그아웃 처리
let _logoutFn: (() => void) | null = null;

export function setLogoutHandler(fn: () => void) {
  _logoutFn = fn;
}

export async function apiFetch(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === "string") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    _logoutFn?.();
    window.location.href = "/login";
  }

  return res;
}
