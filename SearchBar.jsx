import React, { useEffect, useState, useCallback } from "react";
import { useTheme } from "./ThemeContext";

/**
 * SearchBar with built-in debouncing.
 * Props:
 * - onSearch(query) : callback called after debounce delay
 * - debounceMs (optional) : debounce delay in ms (default 400)
 */
function SearchBar({ onSearch, debounceMs = 400 }) {
  const [value, setValue] = useState("");
  const { inputBg, inputBorder, text } = useTheme();

  useEffect(() => {
    const id = setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);

    return () => clearTimeout(id);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="max-w-3xl mx-auto mb-12">
      <label className="sr-only">Search movies</label>
      <div className="relative group">
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="🔍 Search movies by title..."
          className={`w-full px-6 py-4 rounded-xl ${inputBg} ${inputBorder} ${text} placeholder-gray-400 border-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-md group-hover:shadow-lg text-lg`}
          aria-label="Search movies"
        />
        <span className="absolute right-4 top-4 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">🎬</span>
      </div>
    </div>
  );
}

export default React.memo(SearchBar);
