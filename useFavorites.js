import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing favorite movies with localStorage persistence
 * Returns favorites array, add/remove functions, and utilities
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [mounted, setMounted] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("favoriteMovies");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setFavorites([]);
    }
    setMounted(true);
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("favoriteMovies", JSON.stringify(favorites));
      } catch (error) {
        console.error("Failed to save favorites:", error);
      }
    }
  }, [favorites, mounted]);

  // Add a movie to favorites
  const addFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) return prev;
      return [...prev, movie];
    });
  }, []);

  // Remove a movie from favorites
  const removeFavorite = useCallback((movieId) => {
    setFavorites((prev) => prev.filter((m) => m.id !== movieId));
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  }, []);

  // Check if a movie is in favorites
  const isFavorite = useCallback((movieId) => {
    return favorites.some((m) => m.id === movieId);
  }, [favorites]);

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
