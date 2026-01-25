import { Outlet, createRootRoute } from '@tanstack/react-router';
import { getClaims, logout, setAccessToken } from '../auth/authStore';
import api from '../api/client';

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (getClaims()) return;

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return;

    try {
      const res = await api.post("/auth/refresh", { refresh_token: refreshToken }, { withCredentials: true })
      setAccessToken(res.data.access_token);
      localStorage.setItem("refreshToken", res.data.refresh_token);
    } catch {
      await logout()
    }
  },
  component: Outlet,
});
