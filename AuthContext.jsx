import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { auth } from "./firebase-config";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login with email and password
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      return result.user;
    } catch (err) {
      const message = err.code === "auth/user-not-found"
        ? "User not found"
        : err.code === "auth/wrong-password"
        ? "Wrong password"
        : err.message;
      setError(message);
      throw err;
    }
  }, []);

  // Sign up with email and password
  const signup = useCallback(async (email, password, displayName) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      setUser(result.user);
      return result.user;
    } catch (err) {
      const message = err.code === "auth/email-already-in-use"
        ? "Email already in use"
        : err.code === "auth/weak-password"
        ? "Password should be at least 6 characters"
        : err.message;
      setError(message);
      throw err;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
