import React from "react";
import { useTheme } from "./ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 px-4 py-2 rounded-md font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2 z-50"
      style={{
        background: theme === "light" ? "#e5e7eb" : "#1f2937",
        color: theme === "light" ? "#111827" : "#f3f4f6",
        border: theme === "light" ? "1px solid #d1d5db" : "1px solid #374151",
      }}
      aria-label="Toggle theme"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
    >
      {theme === "light" ? "🌙" : "☀️"}
      <span className="text-sm">{theme === "light" ? "Dark" : "Light"}</span>
    </button>
  );
}
