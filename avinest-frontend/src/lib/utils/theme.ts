export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function getTheme(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "light";
}

export function initTheme() {
  setTheme(getTheme());
}

export function toggleTheme(): Theme {
  const next = getTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}