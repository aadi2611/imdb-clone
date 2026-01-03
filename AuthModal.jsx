import React, { useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useTheme } from "./ThemeContext";

export function AuthModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, signup } = useAuth();
  const { bg, cardBg, cardBorder, text, buttonBg } = useTheme();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        if (isLogin) {
          await login(email, password);
        } else {
          await signup(email, password, displayName);
        }
        onSuccess?.();
        onClose();
      } catch (err) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [email, password, displayName, isLogin, login, signup, onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${cardBg} ${cardBorder} border rounded-xl p-8 w-full max-w-md`}>
        <h2 className={`${text} text-2xl font-bold mb-6`}>
          {isLogin ? "Login" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required={!isLogin}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${buttonBg} text-white py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50`}
          >
            {loading ? "Loading..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="w-full mt-4 text-indigo-500 hover:text-indigo-400 text-sm"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>

        <button
          onClick={onClose}
          className={`w-full mt-4 ${text} hover:opacity-70 text-sm`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
