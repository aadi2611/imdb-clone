/**
 * Optimized Home Component
 * Integrates all professional features:
 * - Virtualized grid
 * - Advanced search with debounce
 * - Trending module
 * - Edge caching
 * - Error boundary
 * - Adaptive images
 * - Prefetching
 */

import React, { useState, useCallback, useEffect } from 'react';
import { fetchPopularMovies, getAdaptiveImageUrl, getCurrentImageQuality } from './apiOptimized';
import { VirtualizedMovieGrid } from './VirtualizedMovieGrid';
import AdvancedSearchBar from './AdvancedSearchBar';
import TrendingMoviesModule from './TrendingMoviesModule';
import ErrorBoundary from './ProfessionalErrorBoundary';

const OptimizedHome = ({ onMovieClick }) => {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageQuality, setImageQuality] = useState('medium');
  const [showSearch, setShowSearch] = useState(false);
  const abortControllerRef = React.useRef(null);

  useEffect(() => {
    const initialImageQuality = getCurrentImageQuality();
    setImageQuality(initialImageQuality);

    const handleQualityChange = (event) => {
      setImageQuality(event.detail.quality);
    };

    window.addEventListener('imageQualityChanged', handleQualityChange);
    return () => window.removeEventListener('imageQualityChanged', handleQualityChange);
  }, []);

  const loadMovies = useCallback(async (pageNum = 1) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      const result = await fetchPopularMovies({
        signal: abortControllerRef.current.signal,
        page: pageNum,
      });

      // Enhance with adaptive image URLs
      const enhancedResults = result.results.map((movie) => ({
        ...movie,
        adaptiveUrl: getAdaptiveImageUrl(movie.posterPath),
      }));

      setMovies(enhancedResults);
      setTotalPages(result.totalPages);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to load movies. Please try again.');
        console.error('Movie load error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovies(page);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [page, loadMovies]);

  const handleMovieClick = useCallback(
    (movieId) => {
      onMovieClick?.(movieId);
    },
    [onMovieClick]
  );

  const handleSearch = useCallback((query) => {
    setShowSearch(true);
    setPage(1);
    // Search logic would be handled by SearchResults component
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-4">
          <div className="max-w-7xl mx-auto space-y-4">
            <h1 className="text-3xl font-bold text-white">MovieFlix</h1>

            <AdvancedSearchBar
              onSearch={handleSearch}
              placeholder="Search by title, actor, genre, or year..."
              debounceDelay={300}
              maxSuggestions={8}
            />

            {/* Quality Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Image Quality:</span>
              <span
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  imageQuality === 'high'
                    ? 'bg-blue-600 text-white'
                    : imageQuality === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-orange-600 text-white'
                }`}
              >
                {imageQuality === 'high' ? '📡 HD' : imageQuality === 'medium' ? '📶 Standard' : '📵 Compressed'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Trending Section */}
          <div>
            <TrendingMoviesModule
              onMovieClick={handleMovieClick}
              refreshInterval={10000}
            />
          </div>

          {/* Popular Movies Section */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Popular Movies</h2>

            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300 mb-4">
                {error}
                <button
                  onClick={() => loadMovies(page)}
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}

            {movies.length > 0 ? (
              <>
                <VirtualizedMovieGrid
                  items={movies}
                  onItemClick={handleMovieClick}
                  loading={loading}
                  itemsPerRow={4}
                  gap={4}
                />

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                  >
                    Previous
                  </button>

                  <span className="text-gray-300 font-semibold">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded transition-colors"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              !loading && (
                <div className="text-center py-12 text-gray-400">
                  <p>No movies to display</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default OptimizedHome;
