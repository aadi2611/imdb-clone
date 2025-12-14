import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const THEMES = {
  light: {
    bg: "bg-gray-50",
    text: "text-gray-900",
    cardBg: "bg-white",
    cardBorder: "border-gray-200",
    inputBg: "bg-gray-100",
    inputBorder: "border-gray-300",
    buttonBg: "bg-indigo-500 hover:bg-indigo-600",
    buttonSecondaryBg: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    accentBg: "bg-indigo-100",
  },
  dark: {
    bg: "bg-gray-900",
    text: "text-white",
    cardBg: "bg-gray-800",
    cardBorder: "border-gray-700",
    inputBg: "bg-gray-800",
    inputBorder: "border-gray-700",
    buttonBg: "bg-indigo-500 hover:bg-indigo-600",
    buttonSecondaryBg: "bg-gray-700 text-gray-300 hover:bg-gray-600",
    accentBg: "bg-indigo-900",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setTheme(saved);
    setMounted(true);
  }, []);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeValues = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ...themeValues }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
