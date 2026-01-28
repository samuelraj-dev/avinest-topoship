import { useState } from "react";
import { cn } from "../libs/utils/cn";
// import { TopBar } from "./top-bar";

export function AppShell({ 
  sidebar, 
  children 
}: { 
  sidebar: React.ReactNode; 
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex h-screen bg-bg text-fg overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-surface shadow-sm">
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

          {/* Drawer */}
          <aside 
            className={cn(
              "absolute left-0 top-0 h-full w-72 bg-surface shadow-2xl",
              "animate-slide-right"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-full overflow-y-auto">
              {sidebar}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* <TopBar onMenuClick={() => setOpen(true)} /> */}
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/* Add this animation to your CSS */
const styles = `
@keyframes slide-right {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-right {
  animation: slide-right 0.3s ease-out;
}
`;