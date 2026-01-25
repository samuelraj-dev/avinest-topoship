import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth, requireRole } from '../../auth/guards'
import { LogoutButton } from '../../components/ui/logout-button';
import { AppShell } from '../../components/ui/app-shell';

export const Route = createFileRoute('/faculty/_layout')({
  beforeLoad: () => {
    requireAuth();
    requireRole("FACULTY")();
  },
  component: FacultyDashboard,
})

function FacultyDashboard() {
  return (
      // <div className="flex">
      //   <aside className="w-64 bg-gray-900 text-white">
      //     Faculty Sidebar
      //     <LogoutButton />
      //   </aside>
      //   <main className="flex-1 p-6">
      //     <Outlet />
      //   </main>
      // </div>
      <AppShell sidebar={<></>} children={<Outlet />} />
    );
}
