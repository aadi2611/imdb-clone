import React, { useState, useEffect, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovieDetails } from "./api";
import { useTheme } from "./ThemeContext";
import { useFavorites } from "./useFavorites";
import { useCloudWatchlist } from "./useCloudWatchlist";
import { ReviewsSection } from "./ReviewsSection";
import { SkeletonMovieDetails } from "./SkeletonLoader";
import Loader from "./Loader";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Detailed movie page showing complete information with reviews
 * Optimized with memoization and lazy loading
 */
const MovieDetails = memo(function MovieDetails() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { bg, text, cardBg, cardBorder, buttonBg } = useTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useCloudWatchlist();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchMovieDetails(movieId, { signal: controller.signal })
      .then((data) => {
        setMovie(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load movie details");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [movieId]);

  const handleRetry = () => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchMovieDetails(movieId, { signal: controller.signal })
      .then((data) => {
        setMovie(data);
        setError(null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load movie details");
        }
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonMovieDetails />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bg} transition-colors duration-300`}>
        <ErrorBoundary error={error} onRetry={handleRetry} showRetry={true} />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={`min-h-screen ${bg} transition-colors duration-300 flex items-center justify-center`}>
        <div className={`${cardBg} ${cardBorder} border rounded-xl p-8 text-center`}>
          <p className={`${text} text-xl font-semibold mb-4`}>Movie not found</p>
          <button
            onClick={() => navigate("/")}
            className={`${buttonBg} text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300`}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(movie.id);
  const isWatchlisted = isInWatchlist(movie.id);

  const handleWatchlistClick = async () => {
    if (isWatchlisted) {
      await removeFromWatchlist(movie.id);
    } else {
      await addToWatchlist(movie);
    }
  };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center gap-2 ${text} hover:text-indigo-600 transition-colors duration-300 font-semibold mb-6`}
        >
          <span>←</span>
          Back to Movies
        </button>
      </div>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm rounded-xl shadow-2xl overflow-hidden mb-6 hover:shadow-3xl transition-shadow duration-300">
              {!imageLoaded && (
                <div className="w-full h-96 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 animate-pulse"></div>
              )}
              <img
                src={movie.poster}
                alt={movie.title}
                onLoad={() => setImageLoaded(true)}
                className={`w-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />
            </div>

            {/* Favorite Button */}
            <button
              onClick={() => toggleFavorite(movie)}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mb-3 ${
                isFav
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              }`}
            >
              <span className="text-2xl">{isFav ? "❤️" : "🤍"}</span>
              {isFav ? "Remove from Favorites" : "Add to Favorites"}
            </button>

            {/* Watchlist Button */}
            <button
              onClick={handleWatchlistClick}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                isWatchlisted
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
              }`}
            >
              <span className="text-2xl">📋</span>
              {isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
            </button>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            {/* Title and Rating */}
            <h1 className={`${text} text-4xl md:text-5xl font-bold mb-4`}>{movie.title}</h1>
            <div className="flex items-center gap-6 mb-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⭐</span>
                <span className={`${text} text-2xl font-bold`}>{movie.rating}/5</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                {movie.year} • {movie.runtime} min
              </p>
            </div>

            {/* Genres */}
            {movie.genre && movie.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full font-semibold text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Plot */}
            <div className="mb-8">
              <h2 className={`${text} text-2xl font-bold mb-3`}>Plot</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {movie.plot}
              </p>
            </div>

            {/* Director */}
            {movie.director && (
              <div className="mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">DIRECTOR</p>
                <p className={`${text} text-xl font-semibold`}>{movie.director}</p>
              </div>
            )}

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-3">CAST</p>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor) => (
                    <span
                      key={actor}
                      className={`${cardBg} ${cardBorder} border px-3 py-2 rounded-lg ${text} text-sm font-medium`}
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Release Date */}
            {movie.releaseDate && (
              <div className="mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">RELEASE DATE</p>
                <p className={`${text} text-lg font-semibold`}>
                  {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Budget and Revenue */}
            {(movie.budget || movie.revenue) && (
              <div className="grid grid-cols-2 gap-4">
                {movie.budget > 0 && (
                  <div className={`${cardBg} ${cardBorder} border p-4 rounded-lg`}>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">BUDGET</p>
                    <p className={`${text} text-lg font-bold`}>
                      ${(movie.budget / 1000000).toFixed(1)}M
                    </p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className={`${cardBg} ${cardBorder} border p-4 rounded-lg`}>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">REVENUE</p>
                    <p className={`${text} text-lg font-bold`}>
                      ${(movie.revenue / 1000000).toFixed(1)}M
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection movieId={movieId} />
      </div>
    </div>
  );
});

export default MovieDetails;
