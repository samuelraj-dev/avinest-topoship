import { logout } from "../../auth/authStore"
import { Button } from "./button";

export function LogoutButton() {
    async function invokeLogout() {
        await logout();
    }
    return (
        <Button onClick={invokeLogout} variant="danger">Logout</Button>
    )
}