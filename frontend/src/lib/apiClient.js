import axios from "axios";
import { API_BASE_URL } from "./env";
import qs from "qs";

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Always try to attach X-School-Id when present in localStorage
  // Backend will ignore/override for non-superadmins
  const id = localStorage.getItem('tenant.schoolId');
  if (id) config.headers['X-School-Id'] = id;

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