import { redirect } from "@tanstack/react-router";
import { getClaims } from "./authStore";

export const requireAuth = () => {
  if (!getClaims()) {
    throw redirect({ to: "/login" });
  }
};

export const requireGuest = () => {
  const claims = getClaims();
  if (claims) {
    throw redirect({
      to: claims.role === "STUDENT" ? "/student" : "/faculty",
    })
  }
}

export const requireRole = (role: "STUDENT" | "FACULTY") => () => {
  const claims = getClaims();
  if (!claims || claims.role !== role) {
    throw redirect({ to: "/unauthorized" });
  }
};