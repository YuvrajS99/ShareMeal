import React, { useMemo, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, getStoredTheme, ThemeModes } from "../theme/theme.js";

export default function ThemeToggle() {
  const initial = useMemo(() => getStoredTheme(), []);
  const [mode, setMode] = useState(initial);

  const isDark = mode === ThemeModes.DARK;

  function toggle() {
    const next = isDark ? ThemeModes.LIGHT : ThemeModes.DARK;
    setMode(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
      <span className="themeToggleText">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

