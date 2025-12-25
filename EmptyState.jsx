import React from "react";
import { useTheme } from "./ThemeContext";

/**
 * Reusable EmptyState component
 * Props:
 * - type: 'no-results' | 'no-data' | 'no-search' (default: 'no-results')
 * - message: Custom message text
 * - onReset: Optional callback for reset/clear button
 */
export default function EmptyState({ type = "no-results", message, onReset }) {
  const { text, cardBg, cardBorder, buttonBg } = useTheme();

  const states = {
    "no-results": {
      icon: "🎭",
      title: "No Results Found",
      description: "Try adjusting your search or explore popular movies",
    },
    "no-data": {
      icon: "📭",
      title: "No Data Available",
      description: "It looks like there's nothing here yet. Please try again later.",
    },
    "no-search": {
      icon: "🔍",
      title: "Start Searching",
      description: "Enter a movie title to discover great films",
    },
  };

  const state = states[type] || states["no-results"];

  return (
    <div className="flex justify-center py-20">
      <div className={`${cardBg} ${cardBorder} border rounded-2xl p-12 text-center max-w-md w-full shadow-lg animate-fade-in`}>
        <div className="text-6xl mb-4">{state.icon}</div>
        <h3 className={`${text} text-2xl font-bold mb-3 transition-colors duration-300`}>
          {message || state.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {state.description}
        </p>

        {onReset && (
          <button
            onClick={onReset}
            className={`${buttonBg} text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
          >
            Clear Search
          </button>
        )}
      </div>
    </div>
  );
}
