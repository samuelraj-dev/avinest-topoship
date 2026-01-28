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

  const claims = jwtDecode<Claims>(accessToken);

  if (claims.exp * 1000 < Date.now()) {
    return null;
  }

  return claims;
}

export async function logout() {
  try {
    await api.post("/auth/logout", { refresh_token: localStorage.getItem("refreshToken") });
  } catch {
  } finally {
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    window.location.href = "/login";
  }
}
