import axios from "axios";
import { getAccessToken, setAccessToken, logout } from "../auth/authStore";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

let refreshing = false;
let queue: (() => void)[] = [];

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status !== 401) {
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      await logout();
      window.location.href = "/login";
      return;
    }

    if (!refreshing) {
      refreshing = true;
      try {
        const res = await axios.post("/api/auth/refresh", { refreshToken });
        setAccessToken(res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);
        queue.forEach(cb => cb());
        queue = [];
      } catch {
        await logout();
        window.location.href = "/login";
      } finally {
        refreshing = false;
      }
    }

    return new Promise(resolve => {
      queue.push(() => {
        err.config.headers.Authorization =
          `Bearer ${getAccessToken()}`;
        resolve(api(err.config));
      });
    });
  }
);

export default api;
