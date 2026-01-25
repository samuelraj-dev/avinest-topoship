import { jwtDecode } from "jwt-decode";
import api from "../api/client";

export type Role = "STUDENT" | "FACULTY";

type Claims = {
  sub: string;
  role: Role;
  exp: number;
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function getClaims(): Claims | null {
  if (!accessToken) return null;
  return jwtDecode(accessToken);
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // ignore network issues
  } finally {
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    window.location.href = "/login";
  }
}
