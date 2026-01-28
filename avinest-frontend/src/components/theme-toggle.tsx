import { useState } from "react";
import { getTheme, toggleTheme, type Theme } from "../lib/utils/theme";
import { Button } from "./ui/button";
import { cn } from "../lib/utils/cn";

export function ThemeToggle({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = useState<Theme>(getTheme());

  return (
    <Button
      onClick={() => setTheme(toggleTheme())}
      // className="w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted"
      className={cn(
        className,
        "inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border",
        "bg-bg text-fg",
        "hover:bg-muted transition"
      )}
      aria-label="Toggle theme"
      {...props}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </Button>
    // <Button variant="secondary" onClick={() => setTheme(toggleTheme())} aria-label="Toggle theme">{theme === "light" ? "🌙 Dark" : "☀️ Light"}</Button>
  );
}
