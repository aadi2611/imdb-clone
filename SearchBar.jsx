import React, { useEffect, useState } from "react";

/**
 * SearchBar with built-in debouncing.
 * Props:
 * - onSearch(query) : callback called after debounce delay
 * - debounceMs (optional) : debounce delay in ms (default 400)
 */
export default function SearchBar({ onSearch, debounceMs = 400 }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const id = setTimeout(() => {
      onSearch(value.trim());
    }, debounceMs);

    return () => clearTimeout(id);
  }, [value, debounceMs, onSearch]);

  return (
    <div className="max-w-2xl mx-auto mb-6">
      <label className="sr-only">Search movies</label>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies by title..."
        className="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Search movies"
      />
    </div>
  );
}
