import { redirect } from "@tanstack/react-router";
import { getClaims } from "./authStore";

export const requireAuth = () => {
  const claims = getClaims();
  if (!claims) {
    throw redirect({ to: "/login" });
  }
  return claims;
};

export const requireGuest = () => {
  const claims = getClaims();
  if (claims) {
    throw redirect({
      to: claims.role === "STUDENT" ? "/student" : "/faculty",
    })
  }
}

export const requireRole = (role: "STUDENT" | "FACULTY") => {
  return () => {
    const claims = requireAuth();
    
    if (claims.role !== role) {
      throw redirect({ to: "/unauthorized" });
    }
    
    return claims;
  };
};