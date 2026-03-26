export const ThemeModes = {
  LIGHT: "light",
  DARK: "dark"
};

export function getStoredTheme() {
  if (typeof window === "undefined") return ThemeModes.LIGHT;
  const raw = localStorage.getItem("theme");
  return raw === ThemeModes.DARK ? ThemeModes.DARK : ThemeModes.LIGHT;
}

// CSS is driven by `[data-theme="dark"]` overrides in `styles.css`.
export function applyTheme(mode) {
  if (typeof document === "undefined") return;

  const nextMode = mode === ThemeModes.DARK ? ThemeModes.DARK : ThemeModes.LIGHT;
  document.documentElement.setAttribute("data-theme", nextMode);

  try {
    localStorage.setItem("theme", nextMode);
  } catch {
    // Ignore storage errors (private mode / blocked storage).
  }
}

