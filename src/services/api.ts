// Centralized API service for better error handling and caching
import { BASE_URL, API_OPTIONS } from '../config/api';

export class APIService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for regular content
  private readonly FRESH_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes for trending/current content

  async fetchWithCache<T>(endpoint: string, useCache: boolean = true): Promise<T> {
    const cacheKey = endpoint;
    const cacheDuration = this.getCacheDuration(endpoint);
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const isExpired = Date.now() - cached.timestamp > cacheDuration;
      
      if (!isExpired) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, API_OPTIONS);
      
      if (!response.ok) {
        // Handle 404 errors gracefully for video endpoints
        if (response.status === 404 && endpoint.includes('/videos')) {
          console.warn(`Videos not found for endpoint: ${endpoint}`);
          return { results: [] } as T;
        }
        // Handle 404 errors gracefully for details and credits endpoints
        if (response.status === 404 && (endpoint.includes('/movie/') || endpoint.includes('/tv/'))) {
          console.warn(`Content not found for endpoint: ${endpoint}`);
          return null as T;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (useCache) {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Handle video endpoints specifically
      if (endpoint.includes('/videos')) {
        console.warn(`Returning empty videos for ${endpoint}`);
        return { results: [] } as T;
      }
      
      // Return cached data if available, even if expired
      if (this.cache.has(cacheKey)) {
        console.warn(`Using expired cache for ${endpoint}`);
        return this.cache.get(cacheKey)!.data;
      }
      
      throw error;
    }
  }

  private getCacheDuration(endpoint: string): number {
    // Use shorter cache for trending, popular, and current content
    if (endpoint.includes('/trending') || 
        endpoint.includes('/now_playing') || 
        endpoint.includes('/airing_today') || 
        endpoint.includes('/on_the_air') ||
        endpoint.includes('/popular')) {
      return this.FRESH_CACHE_DURATION;
    }
    return this.CACHE_DURATION;
  }

  clearCache(): void {
    this.cache.clear();
    
    // Also clear localStorage caches
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('fresh_') || 
          key.includes('trending') || 
          key.includes('popular') || 
          key.includes('now_playing') || 
          key.includes('airing')) {
        localStorage.removeItem(key);
      }
    });
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheInfo(): { key: string; age: number }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, { timestamp }]) => ({
      key,
      age: now - timestamp
    }));
  }
}

export const apiService = new APIService();