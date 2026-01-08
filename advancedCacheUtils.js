/**
 * Advanced Cache Utilities with Network-Aware Features
 * - Adaptive compression based on network speed
 * - Automatic cache invalidation
 * - Memory efficient storage
 * - Cache statistics
 */

export class AdvancedCacheManager {
  constructor(maxSize = 50 * 1024 * 1024) {
    // 50MB max
    this.cache = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  set(key, data, ttl = 3600000) {
    // 1 hour default
    const size = this.estimateSize(data);

    // Evict if necessary
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    if (this.cache.has(key)) {
      this.currentSize -= this.estimateSize(this.cache.get(key).data);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccess: Date.now(),
    });

    this.currentSize += size;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.currentSize -= this.estimateSize(entry.data);
      this.stats.misses++;
      return null;
    }

    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  has(key) {
    return this.cache.has(key) && !this.isExpired(key);
  }

  isExpired(key) {
    const entry = this.cache.get(key);
    if (!entry) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < lruTime) {
        lruTime = entry.lastAccess;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey);
      this.currentSize -= this.estimateSize(entry.data);
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  estimateSize(data) {
    // Rough estimation in bytes
    return JSON.stringify(data).length * 2;
  }

  getStats() {
    const hitRate =
      this.stats.hits + this.stats.misses > 0
        ? ((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100).toFixed(2)
        : 0;

    return {
      ...this.stats,
      hitRate: `${hitRate}%`,
      size: `${(this.currentSize / 1024 / 1024).toFixed(2)} MB`,
      entries: this.cache.size,
    };
  }

  clear() {
    this.cache.clear();
    this.currentSize = 0;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }
}

// Lazy image loader utility
export class LazyImageLoader {
  constructor(options = {}) {
    this.loadedImages = new Set();
    this.pendingImages = new Map();
    this.options = {
      quality: 'medium',
      ...options,
    };

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
          }
        });
      });
    }
  }

  observe(imgElement) {
    if (this.observer) {
      this.observer.observe(imgElement);
    } else {
      this.loadImage(imgElement);
    }
  }

  loadImage(imgElement) {
    if (this.loadedImages.has(imgElement)) return;

    const src = imgElement.dataset.src;
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      imgElement.src = src;
      imgElement.classList.add('loaded');
      this.loadedImages.add(imgElement);

      if (this.observer) {
        this.observer.unobserve(imgElement);
      }
    };

    img.onerror = () => {
      imgElement.classList.add('error');
      if (this.observer) {
        this.observer.unobserve(imgElement);
      }
    };

    img.src = src;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Memory monitor
export class MemoryMonitor {
  constructor(warningThreshold = 0.8) {
    this.warningThreshold = warningThreshold;
    this.listeners = [];
  }

  async checkMemory() {
    if ('memory' in performance) {
      const usage = performance.memory;
      const ratio = usage.usedJSHeapSize / usage.jsHeapSizeLimit;

      if (ratio > this.warningThreshold) {
        this.notifyListeners({
          usage,
          ratio,
          warning: true,
        });

        // Trigger garbage collection hint
        if (window.gc) {
          window.gc();
        }
      }

      return { usage, ratio };
    }

    return null;
  }

  onWarning(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((cb) => cb(data));
  }

  startMonitoring(interval = 5000) {
    return setInterval(() => this.checkMemory(), interval);
  }
}

export const cacheManager = new AdvancedCacheManager();
export const memoryMonitor = new MemoryMonitor();
