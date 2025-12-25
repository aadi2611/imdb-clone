import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { useFavorites } from "./useFavorites";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";

/**
 * Favorites page showing all bookmarked movies
 */
export default function Favorites() {
  const navigate = useNavigate();
  const { bg, text, buttonBg } = useTheme();
  const { favorites, clearFavorites } = useFavorites();

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all favorites?")) {
      clearFavorites();
    }
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className={`${text} hover:text-indigo-600 transition-colors duration-300 font-semibold flex items-center gap-2 mb-4`}
            >
              <span>←</span>
              Back
            </button>
          </div>
        </div>

        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${text} mb-4 transition-colors duration-300`}>
            ❤️ My Favorites
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">
            {favorites.length > 0
              ? `You have ${favorites.length} favorite movie${favorites.length !== 1 ? "s" : ""}`
              : "No favorites yet. Add some movies to your collection!"}
          </p>
        </div>

        {/* Favorites Grid or Empty State */}
        {favorites.length === 0 ? (
          <EmptyState
            type="no-data"
            message="No Favorites Yet"
            onReset={() => navigate("/")}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
              {favorites.map((movie, idx) => (
                <div
                  key={movie.id ?? movie.title}
                  className="animate-fade-in transition-all cursor-pointer"
                  style={{
                    animationDelay: `${(idx % 8) * 0.05}s`,
                    animationDuration: "0.6s",
                  }}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <MovieCard
                    poster={movie.poster}
                    title={movie.title}
                    year={movie.year}
                    rating={movie.rating}
                  />
                </div>
              ))}
            </div>

            {/* Clear All Button */}
            <div className="flex justify-center">
              <button
                onClick={handleClearAll}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg"
              >
                <span>🗑️</span>
                Clear All Favorites
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
