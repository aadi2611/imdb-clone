import React, { useState, useEffect } from "react";
import TodoItem from "./TodoItem";
import TodoFilter from "./TodoFilter";
import "./animations.css";

const STORAGE_KEY = "todos";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [input, setInput] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse todos:", e);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
  };

  const handleToggle = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      setDeletingId(null);
    }, 300); // match animation duration
  };

  // Filter todos based on current filter
  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "pending") return !todo.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          ✓ To-Do List
        </h1>
        <p className="text-center text-gray-400 mb-6">
          {todos.length} total • {pendingCount} pending • {completedCount} completed
        </p>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 rounded-md bg-gray-800 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="New task"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-500 text-white font-medium rounded-md hover:bg-indigo-600 transition-colors"
              disabled={!input.trim()}
            >
              Add
            </button>
          </div>
        </form>

        {/* Filter Buttons */}
        <TodoFilter filter={filter} onFilterChange={setFilter} />

        {/* Todo List */}
        <ul className="space-y-3">
          {filteredTodos.length === 0 ? (
            <li className="text-center text-gray-400 py-8">
              {filter === "completed" && "No completed tasks"}
              {filter === "pending" && "No pending tasks"}
              {filter === "all" && "No tasks yet. Add one to get started!"}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                id={todo.id}
                text={todo.text}
                completed={todo.completed}
                onToggle={handleToggle}
                onDelete={handleDelete}
                isDeleting={deletingId === todo.id}
              />
            ))
          )}
        </ul>

        {/* Clear Completed Button */}
        {completedCount > 0 && (
          <button
            onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
            className="mt-8 w-full px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            Clear Completed ({completedCount})
          </button>
        )}
      </div>
    </div>
  );
}

export default TodoApp;
