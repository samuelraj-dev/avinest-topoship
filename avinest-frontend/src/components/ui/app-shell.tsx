export function AppShell({ sidebar, children }: { sidebar: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg text-fg">
      <aside className="w-64 border-r border-border">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
