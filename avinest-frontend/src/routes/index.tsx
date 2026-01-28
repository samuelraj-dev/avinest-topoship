import { createFileRoute, redirect } from '@tanstack/react-router'
import { getClaims } from '../auth/authStore';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const claims = getClaims();
    
    if (!claims) {
      throw redirect({ to: "/login" });
    }

    throw redirect({
      to: claims.role === "STUDENT" ? "/student" : "/faculty",
    });
  },
})