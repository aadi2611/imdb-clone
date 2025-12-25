import React from "react";
import { useTheme } from "./ThemeContext";

/**
 * Reusable Error component with retry capability
 * Props:
 * - error: Error message string
 * - onRetry: Callback function when retry button is clicked
 * - showRetry: Show retry button (default: true)
 */
export default function ErrorBoundary({ error, onRetry, showRetry = true }) {
  const { text, cardBg, cardBorder } = useTheme();

  return (
    <div className="flex justify-center py-12">
      <div className={`${cardBg} ${cardBorder} border-l-4 border-red-500 p-8 rounded-xl shadow-lg max-w-md w-full animate-slide-in`}>
        {/* Error Header */}
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">⚠️</div>
          <div className="flex-1">
            <p className={`${text} font-bold text-lg mb-2`}>Oops! Something went wrong</p>
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">
              {error || "An unexpected error occurred. Please try again."}
            </p>
          </div>
        </div>

        {/* Error Actions */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="w-full mt-6 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Retry
          </button>
        )}

        {/* Error Details */}
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400 font-mono break-words">
            Error: {error || "Unknown error"}
          </p>
        </div>
      </div>
    </div>
  );
}
