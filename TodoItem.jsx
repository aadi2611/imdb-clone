import React from "react";

const TodoItem = React.memo(function TodoItem({ id, text, completed, onToggle, onDelete, isDeleting }) {
  return (
    <li
      className={`flex items-center gap-3 p-4 bg-gray-800 rounded-md border border-gray-700 transition-all ${
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
        className={`flex-1 text-lg ${completed ? "line-through text-gray-500" : "text-white"}`}
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
