import type React from "react";
import { logout } from "../../auth/authStore"
import { Button } from "./button";
import { cn } from "../../lib/utils/cn";

export function LogoutButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    async function invokeLogout() {
        await logout();
    }
    return (
        <Button onClick={invokeLogout}
            className={cn(
                className,
                "rounded-md bg-danger/10 px-3 py-2 text-left text-danger hover:bg-danger/20"
            )}
            variant="danger"
            {...props}
        >Logout</Button>
    )
}