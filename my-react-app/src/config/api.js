const ENV_API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
const API_ORIGIN = ENV_API_URL || "http://localhost:4000";

const API_BASE_URL = import.meta.env.DEV ? "" : API_ORIGIN;

export { API_ORIGIN };
export default API_BASE_URL;

// ─── Возвращает токен из storage ──────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
}

// ─── Обёртка fetch — добавляет Authorization header автоматически ─────────────
export async function apiFetch(url, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}