import React, { useState, useEffect } from "react";
import NoteItem from "./NoteItem";
import ThemeSwitcher from "./ThemeSwitcher";
import { useTheme } from "./ThemeContext";
import "./animations.css";
import "./theme-transitions.css";

const STORAGE_KEY = "notes";

function NotesApp() {
  const theme = useTheme();
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newNote = {
      id: Date.now(),
      text,
      date: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setInput("");
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setDeletingId(null);
    }, 300); // match animation duration
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} p-6`}>
      <ThemeSwitcher />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">📝 Notes</h1>
        <p className={`text-center ${theme.text} opacity-70 mb-8`}>
          {notes.length} {notes.length === 1 ? "note" : "notes"} saved
        </p>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="mb-8">
          <div className="flex flex-col gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write your note here..."
              rows="4"
              className={`px-4 py-3 rounded-md ${theme.inputBg} ${theme.text} placeholder-gray-400 border ${theme.inputBorder} focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none`}
              aria-label="Note content"
            />
            <button
              type="submit"
              className={`px-6 py-3 ${theme.buttonBg} text-white font-medium rounded-md transition-colors self-start`}
              disabled={!input.trim()}
            >
              Save Note
            </button>
          </div>
        </form>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className={`text-center py-12 rounded-md border-2 border-dashed ${theme.cardBorder}`}>
            <p className={`${theme.text} opacity-60 text-lg`}>
              No notes yet. Create one to get started! ✨
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`transition-all ${
                  deletingId === note.id ? "animate-slide-out" : "animate-slide-in"
                }`}
              >
                <NoteItem
                  id={note.id}
                  text={note.text}
                  date={note.date}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}

        {/* Clear All Button */}
        {notes.length > 0 && (
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete all notes?")
              ) {
                setNotes([]);
              }
            }}
            className={`mt-8 w-full px-4 py-2 ${theme.buttonSecondaryBg} rounded-md transition-colors text-sm`}
          >
            Clear All Notes
          </button>
        )}
      </div>
    </div>
  );
}

export default NotesApp;
