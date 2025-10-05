import React, { useState, useEffect } from 'react';
import { Monitor, Filter } from 'lucide-react';
import { useOptimizedContent } from '../hooks/useOptimizedContent';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { TVShow } from '../types/movie';

type TVCategory = 'popular' | 'top_rated' | 'airing_today' | 'on_the_air';

export function TVShows() {
  const [category, setCategory] = useState<TVCategory>('popular');

  const categoryTitles = {
    popular: 'Populares',
    top_rated: 'Mejor Valoradas',
    airing_today: 'Al Aire Hoy',
    on_the_air: 'En Emisión'
  };

  const getFetchFunction = (selectedCategory: TVCategory) => {
    switch (selectedCategory) {
      case 'top_rated':
        return tmdbService.getTopRatedTVShows.bind(tmdbService);
      case 'airing_today':
        return tmdbService.getAiringTodayTVShows.bind(tmdbService);
      case 'on_the_air':
        return tmdbService.getOnTheAirTVShows.bind(tmdbService);
      default:
        return tmdbService.getPopularTVShows.bind(tmdbService);
    }
  };

  const { data: tvShows, loading, error, hasMore, loadMore } = useOptimizedContent(
    getFetchFunction(category),
    [category]
  );

  const handleCategoryChange = (newCategory: TVCategory) => {
    setCategory(newCategory);
  };

  if (loading && tvShows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && tvShows.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <Monitor className="mr-3 h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Series {categoryTitles[category]}
            </h1>
          </div>

          {/* Category Filter - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="hidden sm:flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm w-full sm:w-fit">
              <Filter className="h-4 w-4 text-gray-500 ml-2" />
              {Object.entries(categoryTitles).map(([key, title]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key as TVCategory)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    category === key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>

            {/* Mobile/Tablet Dropdown */}
            <div className="sm:hidden bg-white rounded-lg p-1 shadow-sm">
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as TVCategory)}
                className="w-full px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white border-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {Object.entries(categoryTitles).map(([key, title]) => (
                  <option key={key} value={key}>{title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TV Shows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {tvShows.map((show) => (
            <MovieCard key={`${show.id}-${category}`} item={show} type="tv" />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar más series'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}