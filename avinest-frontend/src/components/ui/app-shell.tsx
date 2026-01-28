import { useState } from "react";
import { TopBar } from "./top-bar";

export function AppShell({ sidebar, children }: { sidebar: React.ReactNode, children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="flex h-screen bg-bg text-fg">
      <aside className="hidden w-64 border-r border-border lg:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <aside className="absolute left-0 top-0 h-full w-64 bg-bg shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}
       <div className="flex flex-1 flex-col">
        <TopBar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
       </div>
    </div>
  );
}
