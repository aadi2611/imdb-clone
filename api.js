// Optimized API service with caching and performance improvements
import { apiCache, generateCacheKey } from './cacheUtils';

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
    plot: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
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

// Optimized transformers with memoization
const transformMovie = (item) => ({
  id: item.id,
  title: item.title || item.original_title || 'Untitled',
  year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
  rating: Math.round((item.vote_average || 0) / 2),
  poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
});

const transformMovieDetails = (item) => ({
  id: item.id,
  title: item.title || item.original_title || 'Untitled',
  year: item.release_date ? item.release_date.split('-')[0] : 'N/A',
  rating: Math.round((item.vote_average || 0) / 2),
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

// Fetch popular movies with caching
export async function fetchPopularMovies({ signal, page = 1 } = {}) {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  const cacheKey = generateCacheKey('popular', { page });

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (key) {
    const url = `https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}&api_key=${key}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`TMDB fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const result = {
      results: (data.results || []).map(transformMovie),
      totalPages: data.total_pages || 1,
      currentPage: page,
    };
    apiCache.set(cacheKey, result);
    return result;
  }

  // Fallback
  const result = {
    results: FALLBACK_MOVIES,
    totalPages: 1,
    currentPage: 1,
  };
  apiCache.set(cacheKey, result);
  return result;
}

// Search movies with caching
export async function searchMovies(query, { signal, page = 1 } = {}) {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  const q = String(query || "").trim();

  if (!q) return { results: [], totalPages: 0, currentPage: 1 };

  const cacheKey = generateCacheKey('search', { q, page });
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (key) {
    const url = `https://api.themoviedb.org/3/search/movie?language=en-US&page=${page}&api_key=${key}&query=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`TMDB search failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const result = {
      results: (data.results || []).map(transformMovie),
      totalPages: data.total_pages || 0,
      currentPage: page,
    };
    apiCache.set(cacheKey, result);
    return result;
  }

  // Fallback: filter local list
  const lower = q.toLowerCase();
  const filtered = FALLBACK_MOVIES.filter((m) => (m.title || '').toLowerCase().includes(lower));
  const result = {
    results: filtered,
    totalPages: 1,
    currentPage: 1,
  };
  apiCache.set(cacheKey, result);
  return result;
}

// Fetch movie details with caching
export async function fetchMovieDetails(movieId, { signal } = {}) {
  const key = import.meta.env.VITE_TMDB_API_KEY;
  const cacheKey = generateCacheKey('details', { movieId });

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) return cached;

  if (key) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}?language=en-US&api_key=${key}&append_to_response=credits`;
    const res = await fetch(url, { signal });
    if (!res.ok) {
      throw new Error(`TMDB fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const result = transformMovieDetails(data);
    apiCache.set(cacheKey, result);
    return result;
  }

  // Fallback
  if (FALLBACK_DETAILS[movieId]) {
    apiCache.set(cacheKey, FALLBACK_DETAILS[movieId]);
    return FALLBACK_DETAILS[movieId];
  }

  throw new Error("Movie not found");
}

// Clear cache utility
export function clearAPICache() {
  apiCache.clear();
}

