import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRole } from '../../auth/guards'
import { AppShell } from '../../components/ui/app-shell';
import type { SidebarConfig } from '../../types/sidebar.types';
import { Sidebar } from '../../components/ui/sidebar';

export const Route = createFileRoute('/faculty/_layout')({
  beforeLoad:  requireRole("FACULTY"),
  component: FacultyDashboard,
})

export const facultySidebarConfig: SidebarConfig = {
  title: "Faculty Portal",
  subtitle: "RIT Chennai",
  items: [
    { label: "Dashboard", to: "/faculty", exact: true },
    { label: "Profile", to: "/faculty/profile" },
    { label: "Classes", to: "/faculty/classes" },
    { label: "Attendance", to: "/faculty/attendance" },
  ],
};

function FacultyDashboard() {
  return (
      <AppShell sidebar={<Sidebar config={facultySidebarConfig} />}>
        <Outlet />
      </AppShell>
    );
}
