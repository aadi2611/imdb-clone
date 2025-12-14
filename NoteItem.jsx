import React from "react";
import { useTheme } from "./ThemeContext";

const NoteItem = React.memo(function NoteItem({ id, text, date, onDelete }) {
  return (
    <div className={`p-4 rounded-md border ${useTheme().cardBorder} ${useTheme().cardBg} flex justify-between items-start gap-4 hover:shadow-lg transition-shadow`}>
      <div className="flex-1">
        <p className={`${useTheme().text} text-base leading-relaxed break-words`}>
          {text}
        </p>
        <p className={`${useTheme().text} text-xs opacity-50 mt-2`}>
          {new Date(date).toLocaleString()}
        </p>
      </div>
      <button
        onClick={() => onDelete(id)}
        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm whitespace-nowrap flex-shrink-0"
        aria-label={`Delete note "${text.substring(0, 20)}..."`}
      >
        Delete
      </button>
    </div>
  );
});

export default NoteItem;
