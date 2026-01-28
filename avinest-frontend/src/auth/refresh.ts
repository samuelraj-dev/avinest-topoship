import api from "../api/client";
import { setAccessToken } from "./authStore";

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await api.post(
    "/auth/refresh",
    { refresh_token: refreshToken }
  );

  setAccessToken(res.data.access_token);
  localStorage.setItem("refreshToken", res.data.refresh_token);
}
