import axios from "axios";
import { API_BASE_URL } from "./env";

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Attach X-School-Id only for superadmin if allowed (backend enforces the rule)
  const allow = localStorage.getItem('TENANCY_ALLOW_HEADER_SWITCH');
  const hdr = localStorage.getItem('currentSchoolId');
  if (allow === 'true' && hdr) {
    config.headers['X-School-Id'] = hdr;
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