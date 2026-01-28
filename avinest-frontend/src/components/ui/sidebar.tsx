import { Link } from "@tanstack/react-router";
import type { SidebarConfig } from "../../types/sidebar.types";
import { ThemeToggle } from "../theme-toggle";
import { LogoutButton } from "./logout-button";

export function Sidebar({
  config,
}: {
  config: SidebarConfig;
}) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-bg p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold">
          {config.title}
        </h1>
        {config.subtitle && (
          <p className="text-sm text-fg-muted">
            {config.subtitle}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {config.items.map(item => (
          <SidebarLink
            key={item.to}
            to={item.to}
            exact={item.exact}
          >
            {item.label}
          </SidebarLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-4 space-y-3 border-t border-border pt-4">
        <ThemeToggle className="w-full" />
        <LogoutButton className="w-full" />
      </div>
    </aside>
  );
}


function SidebarLink({
  to,
  children,
  exact=false
}: {
  to: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  return (
    <Link
      to={to}
      activeOptions={{
        exact
      }}
      className="rounded-md px-3 py-2 text-sm text-fg/80 hover:bg-muted"
      activeProps={{
        className: "bg-muted font-medium text-fg",
      }}
    >
      {children}
    </Link>
  );
}