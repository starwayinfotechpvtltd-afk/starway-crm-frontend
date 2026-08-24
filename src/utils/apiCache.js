/**
 * Starway Enterprise Client API Cache & Stale-While-Revalidate Engine
 * Features: Memory + SessionStorage caching, configurable TTL, cache invalidation, and background revalidation.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes

export const apiCache = {
  get: (key) => {
    // 1. Check memory cache
    if (memoryCache.has(key)) {
      const entry = memoryCache.get(key);
      const isExpired = Date.now() > entry.expiry;
      return { data: entry.data, isStale: isExpired };
    }

    // 2. Check sessionStorage
    try {
      const item = sessionStorage.getItem(`sw_cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        const isExpired = Date.now() > parsed.expiry;
        memoryCache.set(key, parsed);
        return { data: parsed.data, isStale: isExpired };
      }
    } catch {
      // sessionStorage unavailable or parse error
    }

    return null;
  },

  set: (key, data, ttlMs = DEFAULT_TTL) => {
    const entry = {
      data,
      expiry: Date.now() + ttlMs,
      cachedAt: Date.now(),
    };

    memoryCache.set(key, entry);

    try {
      sessionStorage.setItem(`sw_cache_${key}`, JSON.stringify(entry));
    } catch {
      // Ignore quota exceeded or storage disabled
    }
  },

  invalidate: (pattern) => {
    if (!pattern) {
      memoryCache.clear();
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith("sw_cache_")) sessionStorage.removeItem(k);
        });
      } catch {
        // storage error
      }
      return;
    }

    const regex = typeof pattern === "string" ? new RegExp(pattern, "i") : pattern;

    // Clear matching in memory
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }

    // Clear matching in sessionStorage
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith("sw_cache_")) {
          const rawKey = k.replace("sw_cache_", "");
          if (regex.test(rawKey)) {
            sessionStorage.removeItem(k);
          }
        }
      });
    } catch {
      // storage error
    }
  },
};
