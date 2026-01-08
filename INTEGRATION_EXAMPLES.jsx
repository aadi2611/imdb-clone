/**
 * INTEGRATION EXAMPLE - How to use all optimizations together
 * Copy this structure for your own components
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Import all optimized features
import {
  fetchPopularMovies,
  searchMovies,
  fetchMovieDetails,
  fetchTrendingMovies,
  prefetchMovieDetails,
  getAdaptiveImageUrl,
  getCurrentImageQuality,
  onImageQualityChange,
  getAPIMetrics,
  clearAPICache,
} from './apiOptimized';

import { VirtualizedMovieGrid } from './VirtualizedMovieGrid';
import AdvancedSearchBar from './AdvancedSearchBar';
import TrendingMoviesModule from './TrendingMoviesModule';
import ErrorBoundary from './ProfessionalErrorBoundary';
import { useEdgeCachedData } from './edgeCache';

/**
 * EXAMPLE 1: Basic Movie Grid with Virtualization
 */
export function MovieGridExample() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);
        // Auto-retries, deduplicates, caches - all built-in
        const result = await fetchPopularMovies({ page: 1 });
        setMovies(result.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <ErrorBoundary>
      <div className="p-4">
        {error && <div className="text-red-500">{error}</div>}
        
        <VirtualizedMovieGrid
          items={movies}
          onItemClick={(id) => navigate(`/movie/${id}`)}
          loading={loading}
          itemsPerRow={4}
        />
      </div>
    </ErrorBoundary>
  );
}

/**
 * EXAMPLE 2: Advanced Search with Debounce
 */
export function SearchExample() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (movie) => {
    setSelectedMovie(movie);
    navigate(`/movie/${movie.id}`);
  };

  const handleSuggestionsChange = (suggestions) => {
    // Update UI with suggestions if needed
    console.log('Suggestions:', suggestions);
  };

  return (
    <ErrorBoundary>
      <AdvancedSearchBar
        onSearch={handleSearch}
        onSuggestionsChange={handleSuggestionsChange}
        placeholder="Search movies by title, actor, or genre..."
        debounceDelay={300}
        maxSuggestions={8}
      />
    </ErrorBoundary>
  );
}

/**
 * EXAMPLE 3: Edge Cache with Stale-While-Revalidate
 */
export function EdgeCacheExample() {
  const {
    data: trendingMovies,
    loading,
    isStale,
    refetch,
    error,
  } = useEdgeCachedData(
    'trending-homepage',
    () =>
      fetchTrendingMovies({ timeWindow: 'week' }).then((r) => r.results),
    {
      maxAge: 300000, // 5 minutes
      staleWhileRevalidate: true,
    }
  );

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Trending Now</h2>
          {isStale && <span className="text-sm text-gray-500">Updating...</span>}
          <button onClick={refetch} className="px-3 py-1 bg-blue-500 text-white rounded">
            Refresh
          </button>
        </div>

        {error && <div className="text-red-500">{error.message}</div>}

        {loading && !trendingMovies ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            {trendingMovies?.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

/**
 * EXAMPLE 4: Movie Detail with Prefetch
 */
export function MovieDetailExample({ movieId }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        const result = await fetchMovieDetails(movieId);
        setDetails(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [movieId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold">{details?.title}</h1>
        <img
          src={getAdaptiveImageUrl(details?.posterPath)}
          alt={details?.title}
          className="w-full max-w-md rounded-lg"
        />
        <p className="mt-4">{details?.plot}</p>
      </div>
    </ErrorBoundary>
  );
}

/**
 * EXAMPLE 5: Network Quality Monitoring
 */
export function NetworkQualityExample() {
  const [quality, setQuality] = useState(getCurrentImageQuality());
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    // Monitor quality changes
    onImageQualityChange((newQuality) => {
      setQuality(newQuality);
      console.log('Network changed to:', newQuality);
    });

    // Show metrics every 10 seconds
    const interval = setInterval(() => {
      setMetrics(getAPIMetrics());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white space-y-2">
      <div className="text-lg font-bold">Network Status</div>

      <div>
        Quality:{' '}
        <span
          className={`font-bold ${
            quality === 'high'
              ? 'text-blue-400'
              : quality === 'medium'
                ? 'text-yellow-400'
                : 'text-orange-400'
          }`}
        >
          {quality.toUpperCase()}
        </span>
      </div>

      {metrics && (
        <div className="text-sm space-y-1">
          <div>Circuit Breaker: {metrics.circuitBreaker.state}</div>
          <div>Cache Size: {metrics.cache.size}</div>
          <div>Pending Requests: {metrics.pendingRequests.length}</div>
        </div>
      )}
    </div>
  );
}

/**
 * EXAMPLE 6: Smart Movie Card with Prefetch
 */
function MovieCard({ movie }) {
  const handleMouseEnter = () => {
    // Prefetch details when user hovers
    prefetchMovieDetails(movie.id).catch(() => {});
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      className="rounded-lg overflow-hidden cursor-pointer group"
    >
      <div className="relative bg-gray-700 aspect-video overflow-hidden">
        <img
          src={getAdaptiveImageUrl(movie.posterPath)}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
      </div>

      <div className="p-2">
        <p className="font-semibold line-clamp-2">{movie.title}</p>
        <p className="text-sm text-gray-400">{movie.year}</p>
      </div>
    </div>
  );
}

/**
 * EXAMPLE 7: Complete Home Page Integration
 */
export function CompleteHomeExample() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Using edge cache hook for home feed
  const { data: popularMovies, isStale } = useEdgeCachedData(
    `popular-page-${page}`,
    () =>
      fetchPopularMovies({ page }).then((r) => ({
        results: r.results,
        totalPages: r.totalPages,
      })),
    { maxAge: 600000, staleWhileRevalidate: true }
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            <h1 className="text-3xl font-bold text-white">MovieFlix</h1>

            <SearchExample />

            <NetworkQualityExample />

            {isStale && (
              <div className="text-sm text-yellow-400">Updating content...</div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-4 space-y-8">
          {/* Trending Section */}
          <section>
            <TrendingMoviesModule
              onMovieClick={(id) => navigate(`/movie/${id}`)}
              refreshInterval={10000}
            />
          </section>

          {/* Popular Movies Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Popular Movies</h2>

            <VirtualizedMovieGrid
              items={popularMovies?.results || []}
              onItemClick={(id) => navigate(`/movie/${id}`)}
              itemsPerRow={4}
            />

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-6 py-2 bg-blue-600 disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-white">Page {page}</span>

              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2 bg-blue-600"
              >
                Next
              </button>
            </div>
          </section>

          {/* Debug Info */}
          <section className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-white font-bold mb-2">Debug Info</h3>
            <code className="text-xs text-gray-300 block">
              {JSON.stringify(getAPIMetrics(), null, 2)}
            </code>
            <button
              onClick={clearAPICache}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              Clear Cache
            </button>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}

/**
 * EXAMPLE 8: Custom Hook - useOptimizedMovies
 * Reusable hook combining multiple optimization features
 */
export function useOptimizedMovies(page = 1) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current = new AbortController();

    const loadMovies = async () => {
      try {
        setLoading(true);
        const result = await fetchPopularMovies({
          page,
          signal: abortRef.current.signal,
        });

        // Enhance with adaptive URLs
        const enhanced = result.results.map((movie) => ({
          ...movie,
          adaptiveUrl: getAdaptiveImageUrl(movie.posterPath),
        }));

        setMovies(enhanced);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMovies();

    return () => {
      abortRef.current?.abort();
    };
  }, [page]);

  return { movies, loading, error };
}

/**
 * Usage example:
 * const { movies, loading, error } = useOptimizedMovies(1);
 */

export default CompleteHomeExample;
