import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireAuth, requireRole } from '../../auth/guards'
import { LogoutButton } from '../../components/ui/logout-button';

export const Route = createFileRoute('/student/_layout')({
  beforeLoad: () => {
    requireAuth();
    requireRole("STUDENT")();
  },
  component: StudentLayout,
})

function StudentLayout() {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-900 text-white">
        Student Sidebar
        <LogoutButton />
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}