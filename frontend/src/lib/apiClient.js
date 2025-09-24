import axios from "axios";
import { API_BASE_URL } from "./env";
import qs from "qs";

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Restrict X-School-Id to super_admin and non-auth endpoints
  const url = config.url || '';
  const isAuthEndpoint = typeof url === 'string' && url.startsWith('/api/auth/');
  let roles = [];
  try { const raw = localStorage.getItem('user.roles'); roles = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []; } catch {}
  const isSuper = Array.isArray(roles) && roles.includes('super_admin');
  if (isSuper && !isAuthEndpoint) {
    const id = localStorage.getItem('tenant.schoolId');
    if (id) config.headers['X-School-Id'] = id;
    else delete config.headers['X-School-Id'];
  } else {
    delete config.headers['X-School-Id'];
  }

  return config;
});

api.defaults.paramsSerializer = {
  serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' })
};

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }
    if (err?.response?.status === 403) {
      try {
        window.dispatchEvent(new CustomEvent('api:forbidden', { detail: { path: err?.config?.url } }));
      } catch {}
    }
    return Promise.reject(err);
  }
);