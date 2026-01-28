import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireRole } from '../../auth/guards'
import { AppShell } from '../../components/ui/app-shell';
import type { SidebarConfig } from '../../types/sidebar.types';
import { Sidebar } from '../../components/ui/sidebar';

export const studentSidebarConfig: SidebarConfig = {
  title: "Student Portal",
  subtitle: "RIT Chennai",
  items: [
    { label: "Dashboard", to: "/student", exact: true },
    { label: "Profile", to: "/student/profile" },
    { label: "Courses", to: "/student/courses" },
    { label: "Timetable", to: "/student/timetable" },
    { label: "My Faculties", to: "/student/my-faculties" },
  ],
};

export const Route = createFileRoute('/student/_layout')({
  beforeLoad:  requireRole("STUDENT"),
  component: StudentLayout,
})

function StudentLayout() {
  return (
    <AppShell sidebar={<Sidebar config={studentSidebarConfig} />}>
      <Outlet />
    </AppShell>
  );
}