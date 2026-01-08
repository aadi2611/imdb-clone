/**
 * Trending Movies Module
 * - Displays trending movies with refresh capability
 * - Shows "Recently Updated" badge
 * - Differentiates newly trending items
 * - Stale data handling
 * - Compact dashboard layout
 */

import React, { useState, useEffect, useRef } from 'react';
import { fetchTrendingMovies } from './apiOptimized';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

class TrendingCache {
  constructor() {
    this.data = null;
    this.previousData = null;
    this.lastFetchTime = null;
    this.isUpdating = false;
  }

  setData(data) {
    this.previousData = this.data;
    this.data = data;
    this.lastFetchTime = Date.now();
  }

  isStale() {
    return !this.lastFetchTime || Date.now() - this.lastFetchTime > STALE_TIME;
  }

  getNewItems() {
    if (!this.previousData || !this.data) return [];

    const previousIds = new Set(this.previousData.results.map((m) => m.id));
    return this.data.results.filter((m) => !previousIds.has(m.id));
  }
}

export const TrendingMoviesModule = ({ onMovieClick, refreshInterval = 10000 }) => {
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeWindow, setTimeWindow] = useState('week');
  const [recentlyUpdated, setRecentlyUpdated] = useState(false);
  const cacheRef = useRef(new TrendingCache());
  const refreshTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchTrending = async () => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      const result = await fetchTrendingMovies({
        signal: abortControllerRef.current.signal,
        timeWindow,
      });

      cacheRef.current.setData(result);
      setTrending(result);

      const newItems = cacheRef.current.getNewItems();
      if (newItems.length > 0) {
        setRecentlyUpdated(true);
        setTimeout(() => setRecentlyUpdated(false), 5000);
      }

      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch trending movies. Please try again.');
        console.error('Trending fetch error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();

    refreshTimerRef.current = setInterval(() => {
      if (cacheRef.current.isStale()) {
        fetchTrending();
      }
    }, refreshInterval);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [timeWindow, refreshInterval]);

  if (loading && !trending) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="h-8 bg-gray-700 rounded w-32 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-700 rounded aspect-video animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-300">
        {error}
        <button
          onClick={fetchTrending}
          className="ml-2 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">🔥 Trending Now</h2>
          {recentlyUpdated && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full animate-pulse">
              Recently Updated
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {['day', 'week'].map((window) => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`px-4 py-2 rounded font-medium transition-colors capitalize ${
                timeWindow === window
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {window}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {trending?.results?.slice(0, 12).map((movie, idx) => {
          const newItems = cacheRef.current.getNewItems();
          const isNew = newItems.some((m) => m.id === movie.id);

          return (
            <div
              key={`${movie.id}-${idx}`}
              onClick={() => onMovieClick?.(movie.id)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-700 aspect-video">
                {movie.poster && (
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                {isNew && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-semibold text-sm line-clamp-2">{movie.title}</p>
                  <p className="text-gray-300 text-xs">{movie.year}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading Indicator for Refresh */}
      {loading && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          <div className="inline-flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Updating...
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingMoviesModule;
