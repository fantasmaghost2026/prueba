import React, { useState, useEffect } from 'react';
import { Clapperboard, Filter } from 'lucide-react';
import { useOptimizedContent } from '../hooks/useOptimizedContent';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Movie } from '../types/movie';

type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

export function Movies() {
  const [category, setCategory] = useState<MovieCategory>('popular');
  const [isChangingCategory, setIsChangingCategory] = useState(false);

  const categoryTitles = {
    popular: 'Populares',
    top_rated: 'Mejor Valoradas',
    upcoming: 'Próximos Estrenos',
    now_playing: 'En Cartelera'
  };

  const getFetchFunction = (selectedCategory: MovieCategory) => {
    switch (selectedCategory) {
      case 'top_rated':
        return tmdbService.getTopRatedMovies.bind(tmdbService);
      case 'upcoming':
        return tmdbService.getUpcomingMovies.bind(tmdbService);
      case 'now_playing':
        return tmdbService.getNowPlayingMovies.bind(tmdbService);
      default:
        return tmdbService.getPopularMovies.bind(tmdbService);
    }
  };

  const { data: movies, loading, error, hasMore, loadMore } = useOptimizedContent(
    getFetchFunction(category),
    [category]
  );

  const handleCategoryChange = (newCategory: MovieCategory) => {
    if (newCategory === category) return;
    setIsChangingCategory(true);
    setTimeout(() => {
      setCategory(newCategory);
      setIsChangingCategory(false);
    }, 150);
  };

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && movies.length === 0) {
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
            <Clapperboard className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Películas {categoryTitles[category]}
            </h1>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md border border-gray-100 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm sm:text-base font-semibold text-gray-800">Categoría</span>
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">{movies.length} resultados</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {Object.entries(categoryTitles).map(([key, title]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key as MovieCategory)}
                  className={`relative px-4 py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                    category === key
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105 ring-2 ring-blue-400 ring-offset-2'
                      : 'bg-gray-50 text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-102 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <span className="relative z-10">{title}</span>
                  {category === key && (
                    <span className="absolute inset-0 bg-white/20 rounded-xl animate-pulse"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 transition-opacity duration-300 ${
          isChangingCategory ? 'opacity-50' : 'opacity-100'
        }`}>
          {movies.map((movie, index) => (
            <div
              key={`${movie.id}-${category}`}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <MovieCard item={movie} type="movie" />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar más películas'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}