import { useState, useEffect, useCallback } from 'react';
import { tmdbService } from '../services/tmdb';
import { errorHandler } from '../utils/errorHandler';
import { performanceOptimizer } from '../utils/performance';
import type { Movie, TVShow } from '../types/movie';

interface ContentState {
  data: (Movie | TVShow)[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

export function useOptimizedContent(
  fetchFunction: (page: number) => Promise<any>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<ContentState>({
    data: [],
    loading: true,
    error: null,
    hasMore: true,
    page: 1
  });

  const debouncedFetch = useCallback(
    performanceOptimizer.debounce(async (page: number, append: boolean = false) => {
      try {
        if (!append) {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }

        const response = await errorHandler.handleAsyncError(
          fetchFunction(page),
          'useOptimizedContent'
        );

        const uniqueResults = tmdbService.removeDuplicates(response.results);

        setState(prev => ({
          ...prev,
          data: append ? tmdbService.removeDuplicates([...prev.data, ...uniqueResults]) : uniqueResults,
          loading: false,
          hasMore: page < response.total_pages,
          page
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar el contenido. Por favor, intenta de nuevo.'
        }));
      }
    }, 300),
    [fetchFunction]
  );

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      const nextPage = state.page + 1;
      setState(prev => ({ ...prev, page: nextPage }));
      debouncedFetch(nextPage, true);
    }
  }, [state.loading, state.hasMore, state.page, debouncedFetch]);

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, page: 1 }));
    debouncedFetch(1, false);
  }, [debouncedFetch]);

  useEffect(() => {
    debouncedFetch(1, false);
  }, dependencies);

  return {
    ...state,
    loadMore,
    refresh
  };
}