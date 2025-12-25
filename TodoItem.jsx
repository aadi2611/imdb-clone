import React from "react";
import { useTheme } from "./ThemeContext";

const TodoItem = React.memo(function TodoItem({ id, text, completed, onToggle, onDelete, isDeleting }) {
  const theme = useTheme();

  return (
    <li
      className={`flex items-center gap-3 p-4 ${theme.cardBg} rounded-md border ${theme.cardBorder} transition-all ${
        isDeleting ? "animate-slide-out" : "animate-slide-in"
      } ${completed ? "opacity-70" : ""}`}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(id)}
        className="checkbox-custom"
        aria-label={`Mark "${text}" as ${completed ? "incomplete" : "complete"}`}
      />
      <span
        className={`flex-1 text-lg ${completed ? `line-through ${theme.text} opacity-50` : theme.text}`}
      >
        {text}
      </span>
      <button
        onClick={() => onDelete(id)}
        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
        aria-label={`Delete "${text}"`}
      >
        Delete
      </button>
    </li>
  );
});

export default TodoItem;
