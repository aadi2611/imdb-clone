import React from "react";
import { useTheme } from "./ThemeContext";

/**
 * Reusable Loader component with multiple loading states
 * Props:
 * - type: 'spinner' | 'skeleton' | 'dots' | 'pulse' (default: 'spinner')
 * - message: Optional loading message text
 * - size: 'small' | 'medium' | 'large' (default: 'medium')
 */
export default function Loader({ type = "spinner", message = "Loading...", size = "medium" }) {
  const { text } = useTheme();

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  const textSize = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className={`relative ${sizeClasses[size]}`}>
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        {message && (
          <p className={`${text} mt-6 ${textSize[size]} transition-colors duration-300 font-medium`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
          <span className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
        </div>
        {message && (
          <p className={`${text} mt-6 ${textSize[size]} transition-colors duration-300 font-medium`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-xl animate-pulse`}></div>
        {message && (
          <p className={`${text} mt-6 ${textSize[size]} transition-colors duration-300 font-medium`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (type === "skeleton") {
    return (
      <div className="space-y-4 py-20">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
            </div>
          </div>
        ))}
        {message && (
          <p className={`${text} mt-6 ${textSize[size]} transition-colors duration-300 font-medium text-center`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return null;
}
