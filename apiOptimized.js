/**
 * Enhanced API Service with Advanced Features
 * - Retry mechanism with exponential backoff
 * - Request deduplication
 * - Adaptive image quality
 * - Predictive prefetching
 * - Circuit breaker pattern
 * - Edge cache support
 */

import { apiCache, generateCacheKey } from './cacheUtils';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const API_CONFIG = {
  TIMEOUT: 10000,
  MAX_RETRIES: 3,
  INITIAL_BACKOFF: 300,
  MAX_BACKOFF: 10000,
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 60000,
  PREFETCH_DELAY: 500,
};

const FALLBACK_MOVIES = [
  { id: '1', title: 'Inception', year: 2010, rating: 5, poster: '/src/assets/Inception.jpg' },
  { id: '2', title: 'Interstellar', year: 2014, rating: 4, poster: '/src/assets/Interstellar.jpg' },
  { id: '3', title: 'The Dark Knight', year: 2008, rating: 5, poster: '/src/assets/DarkKnight.jpg' },
];

const FALLBACK_DETAILS = {
  '1': {
    id: '1',
    title: 'Inception',
    year: 2010,
    rating: 5,
    poster: '/src/assets/Inception.jpg',
    genre: ['Sci-Fi', 'Thriller', 'Action'],
    runtime: 148,
    plot: 'A skilled thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    cast: ['Leonardo DiCaprio', 'Ellen Page', 'Joseph Gordon-Levitt', 'Marion Cotillard'],
    director: 'Christopher Nolan',
  },
  '2': {
    id: '2',
    title: 'Interstellar',
    year: 2014,
    rating: 4,
    poster: '/src/assets/Interstellar.jpg',
    genre: ['Sci-Fi', 'Adventure', 'Drama'],
    runtime: 169,
    plot: 'A team of explorers travel through a wormhole in an attempt to ensure humanity\'s survival.',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Bill Irwin'],
    director: 'Christopher Nolan',
  },
  '3': {
    id: '3',
    title: 'The Dark Knight',
    year: 2008,
    rating: 5,
    poster: '/src/assets/DarkKnight.jpg',
    genre: ['Action', 'Crime', 'Thriller'],
    runtime: 152,
    plot: 'When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological tests.',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Maggie Gyllenhaal'],
    director: 'Christopher Nolan',
  },
};

// ============================================================================
// CIRCUIT BREAKER IMPLEMENTATION
// ============================================================================

class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  recordSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  canAttempt() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttempt) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    return this.state === 'HALF_OPEN';
  }

  getStatus() {
    return { state: this.state, failures: this.failureCount };
  }
}

// ============================================================================
// REQUEST DEDUPLICATION MANAGER
// ============================================================================

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  async deduplicate(key, requestFn) {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

// ============================================================================
// ADAPTIVE IMAGE QUALITY
// ============================================================================

class ImageQualityManager {
  constructor() {
    this.connectionSpeed = 'high';
    this.imageCache = new Map();
    this.initNetworkMonitoring();
  }

  initNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const updateSpeed = () => {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g' || effectiveType === '5g') {
          this.connectionSpeed = 'high';
        } else if (effectiveType === '3g') {
          this.connectionSpeed = 'medium';
        } else {
          this.connectionSpeed = 'low';
        }
        this.dispatchQualityEvent();
      };

      updateSpeed();
      connection.addEventListener('change', updateSpeed);
    }
  }

  getImageUrl(posterPath, forceQuality = null) {
    if (!posterPath) return null;

    const quality = forceQuality || this.connectionSpeed;
    const sizeMap = {
      low: 'w342', // Compressed
      medium: 'w500', // Standard
      high: 'w780', // HD
    };

    const size = sizeMap[quality] || 'w500';
    return `https://image.tmdb.org/t/p/${size}${posterPath}`;
  }

  getQuality() {
    return this.connectionSpeed;
  }

  dispatchQualityEvent() {
    window.dispatchEvent(
      new CustomEvent('imageQualityChanged', { detail: { quality: this.connectionSpeed } })
    );
  }
}

// ============================================================================
// PREDICTIVE PREFETCH
// ============================================================================

class PrefetchManager {
  constructor() {
    this.prefetchQueue = new Set();
    this.prefetchedData = new Map();
  }

  async prefetch(movieId, signal) {
    if (this.prefetchedData.has(movieId)) {
      return this.prefetchedData.get(movieId);
    }

    if (this.prefetchQueue.has(movieId)) {
      return; // Already prefetching
    }

    this.prefetchQueue.add(movieId);

    try {
      const data = await fetchMovieDetailsInternal(movieId, { signal, isPreetch: true });
      this.prefetchedData.set(movieId, data);
      return data;
    } catch (error) {
      console.warn(`Prefetch failed for movie ${movieId}:`, error);
    } finally {
      this.prefetchQueue.delete(movieId);
    }
  }

  getPrefetchedData(movieId) {
    return this.prefetchedData.get(movieId);
  }

  clearPrefetch() {
    this.prefetchQueue.clear();
    this.prefetchedData.clear();
  }
}

// ============================================================================
// RETRY HANDLER
// ============================================================================

async function retryWithBackoff(fn, maxRetries = API_CONFIG.MAX_RETRIES, signal) {
  let lastError;
  let delay = API_CONFIG.INITIAL_BACKOFF;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await Promise.race([fn(), createTimeoutPromise(API_CONFIG.TIMEOUT, signal)]);
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) break;

      const isRetryable =
        error.name === 'AbortError' ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('timeout');

      if (!isRetryable) throw error;

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.3 * delay;
      delay = Math.min(delay * 2 + jitter, API_CONFIG.MAX_BACKOFF);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function createTimeoutPromise(timeout, signal) {
  return new Promise((_, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), timeout);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Request aborted'));
      });
    }
  });
}

// ============================================================================
// DATA TRANSFORMERS
// ============================================================================

const transformMovie = (item) => ({
  id: item.id,
  title: item.title || item.original_title || 'Untitled',
  year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
  rating: Math.round((item.vote_average || 0) / 2),
  posterPath: item.poster_path,
  poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
});

const transformMovieDetails = (item) => ({
  id: item.id,
  title: item.title || item.original_title || 'Untitled',
  year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
  rating: Math.round((item.vote_average || 0) / 2),
  posterPath: item.poster_path,
  poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
  genre: item.genres ? item.genres.map((g) => g.name) : [],
  runtime: item.runtime || 0,
  plot: item.overview || 'No plot available',
  cast: item.credits?.cast ? item.credits.cast.slice(0, 4).map((c) => c.name) : [],
  director: item.credits?.crew ? item.credits.crew.find((c) => c.job === 'Director')?.name : 'Unknown',
  budget: item.budget || 0,
  revenue: item.revenue || 0,
  releaseDate: item.release_date || 'N/A',
});

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

const circuitBreaker = new CircuitBreaker(
  API_CONFIG.CIRCUIT_BREAKER_THRESHOLD,
  API_CONFIG.CIRCUIT_BREAKER_TIMEOUT
);

const deduplicator = new RequestDeduplicator();
const imageQualityManager = new ImageQualityManager();
const prefetchManager = new PrefetchManager();

// ============================================================================
// CORE API FUNCTIONS
// ============================================================================

async function fetchMovieDetailsInternal(movieId, { signal, isPrefetch = false } = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const cacheKey = generateCacheKey('details', { movieId });

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (!apiKey) {
    if (FALLBACK_DETAILS[movieId]) {
      return FALLBACK_DETAILS[movieId];
    }
    throw new Error('Movie not found');
  }

  return retryWithBackoff(
    async () => {
      if (!circuitBreaker.canAttempt()) {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }

      const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&api_key=${apiKey}&append_to_response=credits`;
      const response = await fetch(url, { signal });

      if (!response.ok) {
        circuitBreaker.recordFailure();
        throw new Error(`TMDB fetch failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = transformMovieDetails(data);

      circuitBreaker.recordSuccess();
      apiCache.set(cacheKey, result);

      return result;
    },
    API_CONFIG.MAX_RETRIES,
    signal
  );
}

export async function fetchPopularMovies({ signal, page = 1 } = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const cacheKey = generateCacheKey('popular', { page });

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const dedupKey = `popular_${page}`;

  return deduplicator.deduplicate(dedupKey, async () => {
    if (!apiKey) {
      return {
        results: FALLBACK_MOVIES,
        totalPages: 1,
        currentPage: 1,
      };
    }

    return retryWithBackoff(
      async () => {
        if (!circuitBreaker.canAttempt()) {
          throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
        }

        const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}&api_key=${apiKey}`;
        const response = await fetch(url, { signal });

        if (!response.ok) {
          circuitBreaker.recordFailure();
          throw new Error(`TMDB fetch failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const result = {
          results: (data.results || []).map(transformMovie),
          totalPages: data.total_pages || 1,
          currentPage: page,
        };

        circuitBreaker.recordSuccess();
        apiCache.set(cacheKey, result);

        return result;
      },
      API_CONFIG.MAX_RETRIES,
      signal
    );
  });
}

export async function searchMovies(query, { signal, page = 1, fields = [] } = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const q = String(query || '').trim();

  if (!q) return { results: [], totalPages: 0, currentPage: 1 };

  const cacheKey = generateCacheKey('search', { q, page, fields: fields.join(',') });
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const dedupKey = `search_${q}_${page}`;

  return deduplicator.deduplicate(dedupKey, async () => {
    if (!apiKey) {
      const lower = q.toLowerCase();
      const filtered = FALLBACK_MOVIES.filter((m) =>
        (m.title || '').toLowerCase().includes(lower)
      );
      return {
        results: filtered,
        totalPages: 1,
        currentPage: 1,
      };
    }

    return retryWithBackoff(
      async () => {
        if (!circuitBreaker.canAttempt()) {
          throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
        }

        const url = `https://api.themoviedb.org/3/search/movie?language=en-US&page=${page}&api_key=${apiKey}&query=${encodeURIComponent(q)}`;
        const response = await fetch(url, { signal });

        if (!response.ok) {
          circuitBreaker.recordFailure();
          throw new Error(`TMDB search failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const result = {
          results: (data.results || []).map(transformMovie),
          totalPages: data.total_pages || 0,
          currentPage: page,
        };

        circuitBreaker.recordSuccess();
        apiCache.set(cacheKey, result);

        return result;
      },
      API_CONFIG.MAX_RETRIES,
      signal
    );
  });
}

export async function fetchMovieDetails(movieId, { signal } = {}) {
  const dedupKey = `details_${movieId}`;

  return deduplicator.deduplicate(dedupKey, () =>
    fetchMovieDetailsInternal(movieId, { signal })
  );
}

export async function fetchTrendingMovies({ signal, timeWindow = 'week' } = {}) {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const cacheKey = generateCacheKey('trending', { timeWindow });

  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  const dedupKey = `trending_${timeWindow}`;

  return deduplicator.deduplicate(dedupKey, async () => {
    if (!apiKey) {
      return {
        results: FALLBACK_MOVIES,
        totalPages: 1,
        currentPage: 1,
        recentlyUpdated: false,
      };
    }

    return retryWithBackoff(
      async () => {
        if (!circuitBreaker.canAttempt()) {
          throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
        }

        const url = `https://api.themoviedb.org/3/trending/movie/${timeWindow}?api_key=${apiKey}&language=en-US`;
        const response = await fetch(url, { signal });

        if (!response.ok) {
          circuitBreaker.recordFailure();
          throw new Error(`TMDB trending fetch failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const result = {
          results: (data.results || []).map(transformMovie),
          totalPages: data.total_pages || 1,
          currentPage: 1,
          recentlyUpdated: false,
        };

        circuitBreaker.recordSuccess();
        apiCache.set(cacheKey, result);

        return result;
      },
      API_CONFIG.MAX_RETRIES,
      signal
    );
  });
}

// ============================================================================
// PREFETCH UTILITIES
// ============================================================================

export function prefetchMovieDetails(movieId, signal) {
  return prefetchManager.prefetch(movieId, signal);
}

export function getPrefetchedMovieDetails(movieId) {
  return prefetchManager.getPrefetchedData(movieId);
}

// ============================================================================
// ADAPTIVE IMAGE UTILITIES
// ============================================================================

export function getAdaptiveImageUrl(posterPath, forceQuality = null) {
  return imageQualityManager.getImageUrl(posterPath, forceQuality);
}

export function getCurrentImageQuality() {
  return imageQualityManager.getQuality();
}

export function onImageQualityChange(callback) {
  window.addEventListener('imageQualityChanged', (event) => {
    callback(event.detail.quality);
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getCircuitBreakerStatus() {
  return circuitBreaker.getStatus();
}

export function clearAPICache() {
  apiCache.clear();
  prefetchManager.clearPrefetch();
  deduplicator.clear();
}

export function getAPIMetrics() {
  return {
    circuitBreaker: circuitBreaker.getStatus(),
    cache: {
      size: apiCache.size || 0,
    },
    pendingRequests: Array.from(deduplicator.pendingRequests.keys()),
  };
}
