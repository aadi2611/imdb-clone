import React from "react";
import { useTheme } from "./ThemeContext";

export default function TodoFilter({ filter, onFilterChange }) {
  const theme = useTheme();
  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex gap-2 justify-center mb-6">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onFilterChange(f.value)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === f.value
              ? "bg-indigo-500 text-white"
              : `${theme.buttonSecondaryBg}`
          }`}
          aria-pressed={filter === f.value}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
