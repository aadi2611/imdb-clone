/**
 * Edge Cache Utility with Stale-While-Revalidate Pattern
 * - Serves stale data immediately
 * - Refreshes in background
 * - Shows "Recently Updated" badge
 * - Minimizes network calls
 * - Improves perceived performance
 */

class EdgeCache {
  constructor(maxAge = 60000) {
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isStale: false,
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > this.maxAge;

    if (isStale && !entry.isStale) {
      entry.isStale = true;
    }

    return {
      data: entry.data,
      isStale: entry.isStale,
      age,
    };
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  getSize() {
    return this.cache.size;
  }
}

/**
 * Hook for using edge cache with stale-while-revalidate
 */
export function useEdgeCachedData(key, fetchFn, options = {}) {
  const {
    maxAge = 60000,
    staleWhileRevalidate = true,
    onRevalidate = null,
  } = options;

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isStale, setIsStale] = React.useState(false);
  const cacheRef = React.useRef(new EdgeCache(maxAge));

  const fetchData = React.useCallback(
    async (forceRefresh = false) => {
      const cached = cacheRef.current.get(key);

      // Serve stale data immediately if available and not forcing refresh
      if (cached && !forceRefresh && staleWhileRevalidate) {
        setData(cached.data);
        setIsStale(cached.isStale);

        // Revalidate in background if stale
        if (cached.isStale) {
          setLoading(true);
          try {
            const freshData = await fetchFn();
            cacheRef.current.set(key, freshData);
            setData(freshData);
            setIsStale(false);
            onRevalidate?.(freshData);
          } catch (err) {
            setError(err);
          } finally {
            setLoading(false);
          }
        }
        return;
      }

      // Fetch fresh data
      setLoading(true);
      setError(null);

      try {
        const freshData = await fetchFn();
        cacheRef.current.set(key, freshData);
        setData(freshData);
        setIsStale(false);
        onRevalidate?.(freshData);
      } catch (err) {
        setError(err);
        // Fall back to stale data if available
        if (cached) {
          setData(cached.data);
          setIsStale(true);
        }
      } finally {
        setLoading(false);
      }
    },
    [key, fetchFn, staleWhileRevalidate, onRevalidate]
  );

  React.useEffect(() => {
    fetchData();
  }, [key, fetchData]);

  return {
    data,
    loading,
    error,
    isStale,
    refetch: () => fetchData(true),
    cacheSize: cacheRef.current.getSize(),
  };
}

export const edgeCacheManager = new EdgeCache();

export default EdgeCache;
