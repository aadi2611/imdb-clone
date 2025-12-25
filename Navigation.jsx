import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

/**
 * Navigation component with links to Home and Favorites
 */
export default function Navigation({ favoriteCount = 0 }) {
  const navigate = useNavigate();
  const { text, cardBg, cardBorder } = useTheme();

  return (
    <nav className={`${cardBg} ${cardBorder} border-b sticky top-0 z-40 shadow-lg transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Home Button */}
          <button
            onClick={() => navigate("/")}
            className={`${text} text-2xl font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2`}
          >
            <span>🎬</span>
            <span className="hidden sm:inline">Movie Collection</span>
          </button>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Favorites Button */}
            <button
              onClick={() => navigate("/favorites")}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span className="text-xl">❤️</span>
              <span className="hidden sm:inline">Favorites</span>
              {favoriteCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                  {favoriteCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
