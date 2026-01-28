import { Outlet, createRootRoute } from '@tanstack/react-router';
import { getClaims, setAccessToken } from '../auth/authStore';
import axios from 'axios';

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (getClaims()) return;

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return;

    try {
      // const res = await api.post("/auth/refresh", { refresh_token: refreshToken })
      const res = await axios.post(
        "http://localhost:8080/api/auth/refresh",
        { refresh_token: refreshToken },
        { withCredentials: true }
      );

      setAccessToken(res.data.access_token);
      localStorage.setItem("refreshToken", res.data.refresh_token);
    } catch {
      setAccessToken(null);
      localStorage.removeItem("refreshToken");

    }
  },
  component: Outlet,
});
