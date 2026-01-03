// API caching and optimization utilities
class APICache {
  constructor(maxSize = 50, maxAge = 3600000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge; // in milliseconds
  }

  set(key, value) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if cache has expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Initialize cache
const apiCache = new APICache(50, 1800000); // 30 minutes max age

// Generate cache key
function generateCacheKey(endpoint, params = {}) {
  const paramStr = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${endpoint}:${paramStr}`;
}

export { apiCache, generateCacheKey };

// Debounce utility
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Memoization utility
export function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
