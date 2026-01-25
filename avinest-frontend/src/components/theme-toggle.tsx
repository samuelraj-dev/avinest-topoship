import { useState } from "react";
import { getTheme, toggleTheme, type Theme } from "../lib/utils/theme";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getTheme());

  return (
    // <button
    //   onClick={() => setTheme(toggleTheme())}
    //   className="
    //     inline-flex items-center gap-2
    //     h-9 px-3 rounded-md border border-border
    //     bg-bg text-fg
    //     hover:bg-muted transition
    //   "
    //   aria-label="Toggle theme"
    // >
    //   {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    // </button>
    <Button variant="secondary" onClick={() => setTheme(toggleTheme())} aria-label="Toggle theme">{theme === "light" ? "🌙 Dark" : "☀️ Light"}</Button>
  );
}
