import { useState, useEffect } from 'react';
import { contentSyncService } from '../services/contentSync';
import type { Movie, TVShow } from '../types/movie';

export function useContentSync() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const refreshContent = async () => {
    setIsLoading(true);
    try {
      await contentSyncService.forceRefresh();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendingContent = async (timeWindow: 'day' | 'week'): Promise<(Movie | TVShow)[]> => {
    return await contentSyncService.getTrendingContent(timeWindow);
  };

  const getPopularContent = async () => {
    return await contentSyncService.getPopularContent();
  };

  useEffect(() => {
    const status = contentSyncService.getSyncStatus();
    setLastUpdate(status.lastDaily);
  }, []);

  return {
    isLoading,
    lastUpdate,
    refreshContent,
    getTrendingContent,
    getPopularContent
  };
}