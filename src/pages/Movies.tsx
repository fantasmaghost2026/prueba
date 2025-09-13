import React, { useState, useEffect } from 'react';
import { Film, Filter } from 'lucide-react';
import { useOptimizedContent } from '../hooks/useOptimizedContent';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Movie } from '../types/movie';

type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

export function Movies() {
  const [category, setCategory] = useState<MovieCategory>('popular');

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
    setCategory(newCategory);
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
            <Film className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Películas {categoryTitles[category]}
            </h1>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm w-fit">
            <Filter className="h-4 w-4 text-gray-500 ml-2" />
            {Object.entries(categoryTitles).map(([key, title]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key as MovieCategory)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {movies.map((movie) => (
            <MovieCard key={`${movie.id}-${category}`} item={movie} type="movie" />
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