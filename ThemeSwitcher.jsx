import React from "react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";

export default function ThemeSwitcher({ onAuthClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="fixed top-6 right-6 flex items-center gap-3 z-50">
      {/* Auth Button */}
      {user ? (
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-md font-medium transition-all duration-300 transform hover:scale-105 bg-red-600 text-white hover:bg-red-700"
          title="Logout"
        >
          👤 Logout
        </button>
      ) : (
        <button
          onClick={onAuthClick}
          className="px-4 py-2 rounded-md font-medium transition-all duration-300 transform hover:scale-105 bg-indigo-600 text-white hover:bg-indigo-700"
          title="Login / Sign Up"
        >
          🔐 Login
        </button>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-md font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
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
    </div>
  );
}
