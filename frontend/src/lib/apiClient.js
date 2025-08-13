import axios from "axios";
import { API_BASE_URL } from "./env";

export const api = axios.create({ baseURL: API_BASE_URL, withCredentials: false });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
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