import { Outlet, createRootRoute } from '@tanstack/react-router';
import { getClaims, setAccessToken } from '../auth/authStore';
import axios from 'axios';
import { BASE_URL } from '../lib/utils/constants';

export const Route = createRootRoute({
  beforeLoad: async () => {
    if (getClaims()) return;

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return;

    try {
      // const res = await api.post("/auth/refresh", { refresh_token: refreshToken })
      const res = await axios.post(
        `${BASE_URL}/api/auth/refresh`,
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
