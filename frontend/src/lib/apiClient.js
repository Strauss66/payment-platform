import axios from "axios";
import { API_BASE_URL } from "./env";

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Attach X-School-Id only for superadmin if allowed and not for auth routes
  // Choose env source based on build tool: prefer Vite-style first, fallback to CRA
  const viteFlag = (() => {
    try {
      // Use runtime evaluation to avoid Babel parsing errors in CRA
      return new Function('return (typeof import.meta!=="undefined" && import.meta.env && import.meta.env.VITE_TENANCY_ALLOW_HEADER_SWITCH)')();
    } catch {
      return undefined;
    }
  })();
  const craFlag = process.env.REACT_APP_TENANCY_ALLOW_HEADER_SWITCH;
  const allowHeader = String(viteFlag ?? craFlag) === 'true';
  if (typeof window !== 'undefined' && window && !window.__TENANCY_HEADER_FLAG_LOGGED__) {
    // One-time debug log for smoke test
    try { window.__TENANCY_HEADER_FLAG_LOGGED__ = true; console.log('[tenancy] allowHeader=', allowHeader); } catch {}
  }
  const isAuthCall = typeof config.url === 'string' && config.url.includes('/api/auth');
  const rolesStr = localStorage.getItem('user.roles');
  let isSuperAdmin = false;
  try {
    const parsed = JSON.parse(rolesStr || '[]');
    isSuperAdmin = Array.isArray(parsed) && parsed.includes('super_admin');
  } catch {
    isSuperAdmin = false;
  }

  if (!isAuthCall && allowHeader && isSuperAdmin) {
    const id = localStorage.getItem('tenant.schoolId');
    if (id) config.headers['X-School-Id'] = id;
    else delete config.headers['X-School-Id'];
  } else {
    // Ensure we do NOT send the header for non-superadmins or when not allowed
    if (config.headers) delete config.headers['X-School-Id'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    return Promise.reject(err);
  }
);