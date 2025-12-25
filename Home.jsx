import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "./MovieCard";
import SearchBar from "./SearchBar";
import ThemeSwitcher from "./ThemeSwitcher";
import Loader from "./Loader";
import ErrorBoundary from "./ErrorBoundary";
import EmptyState from "./EmptyState";
import { fetchPopularMovies, searchMovies } from "./api";
import { useTheme } from "./ThemeContext";

function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [loaderType, setLoaderType] = useState("spinner");
  const abortControllerRef = useRef(null);
  const { bg, text, buttonBg } = useTheme();

  // Load initial popular movies
  const loadInitialMovies = useCallback(() => {
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setMovies([]);
    setCurrentPage(1);
    setLoaderType("spinner");

    fetchPopularMovies({ signal: abortControllerRef.current.signal, page: 1 })
      .then((data) => {
        if (data.results.length === 0) {
          setError("No movies available at the moment");
        } else {
          setMovies(data.results);
          setTotalPages(data.totalPages);
          setCurrentPage(1);
          setError(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load movies. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadInitialMovies();
    return () => abortControllerRef.current?.abort();
  }, [loadInitialMovies]);

  // Handle search with debouncing
  const handleSearch = useCallback((query) => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    setMovies([]);
    setCurrentPage(1);
    setLoaderType("dots");

    const promise = query 
      ? searchMovies(query, { signal: abortControllerRef.current.signal, page: 1 })
      : fetchPopularMovies({ signal: abortControllerRef.current.signal, page: 1 });

    promise
      .then((data) => {
        if (data.results.length === 0) {
          setError(null);
          setMovies([]);
        } else {
          setMovies(data.results);
          setTotalPages(data.totalPages);
          setCurrentPage(1);
          setError(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to search movies. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Load more movies
  const handleLoadMore = useCallback(() => {
    if (loadingMore || currentPage >= totalPages) return;

    abortControllerRef.current = new AbortController();
    setLoadingMore(true);
    const nextPage = currentPage + 1;

    const promise = searchQuery
      ? searchMovies(searchQuery, { signal: abortControllerRef.current.signal, page: nextPage })
      : fetchPopularMovies({ signal: abortControllerRef.current.signal, page: nextPage });

    promise
      .then((data) => {
        if (data.results.length > 0) {
          setMovies((prev) => [...prev, ...data.results]);
          setCurrentPage(nextPage);
          setError(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load more movies. Please try again.");
        }
      })
      .finally(() => setLoadingMore(false));
  }, [currentPage, totalPages, searchQuery, loadingMore]);

  // Retry handler
  const handleRetry = useCallback(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      loadInitialMovies();
    }
  }, [searchQuery, handleSearch, loadInitialMovies]);

  // Clear search handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    loadInitialMovies();
  }, [loadInitialMovies]);

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500 overflow-x-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${text} mb-4 transition-colors duration-300`}>
            🎬 Movie Collection
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl">
            Discover and explore thousands of movies
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} debounceMs={450} />

        {/* Loading State */}
        {loading && <Loader type={loaderType} message="Finding amazing movies..." size="medium" />}

        {/* Error State with Retry */}
        {error && <ErrorBoundary error={error} onRetry={handleRetry} showRetry={true} />}

        {/* Empty State */}
        {!loading && !error && movies.length === 0 && (
          <EmptyState 
            type={searchQuery ? "no-results" : "no-data"} 
            onReset={searchQuery ? handleClearSearch : undefined}
          />
        )}

        {/* Movies Grid */}
        {!loading && !error && movies.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
              {movies.map((m, idx) => (
                <div
                  key={m.id ?? m.title}
                  className="animate-fade-in transition-all"
                  style={{
                    animationDelay: `${(idx % 8) * 0.05}s`,
                    animationDuration: "0.6s",
                  }}
                >
                  <MovieCard poster={m.poster} title={m.title} year={m.year} rating={m.rating} id={m.id} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="flex justify-center pb-12">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className={`${buttonBg} disabled:opacity-60 disabled:cursor-not-allowed text-white px-8 md:px-10 py-3 md:py-4 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg disabled:transform-none disabled:shadow-md flex items-center gap-2`}
                >
                  {loadingMore ? (
                    <>
                      <span className="inline-block animate-spin">⏳</span>
                      Loading...
                    </>
                  ) : (
                    <>
                      📽️ Load More Movies
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
