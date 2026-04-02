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
    { label: "Courses", to: "/student/enrolled-courses" },
    { label: "Timetable", to: "/student/timetable" },
    { label: "My Faculties", to: "/student/my-faculties" },
    { label: "Marks", to: "/student/marks" },
    { label: "Grade Book", to: "/student/grades" },
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