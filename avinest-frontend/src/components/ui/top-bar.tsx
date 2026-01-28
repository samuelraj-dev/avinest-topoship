export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-bg px-4 lg:hidden">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 hover:bg-muted"
        aria-label="Open menu"
      >
        ☰
      </button>

      <span className="text-sm font-medium">Student Portal</span>
    </header>
  );
}
