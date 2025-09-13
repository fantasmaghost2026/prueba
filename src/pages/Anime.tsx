import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { useOptimizedContent } from '../hooks/useOptimizedContent';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { TVShow } from '../types/movie';

type AnimeCategory = 'popular' | 'top_rated';

export function Anime() {
  const [category, setCategory] = useState<AnimeCategory>('popular');

  const categoryTitles = {
    popular: 'Populares',
    top_rated: 'Mejor Valorados'
  };

  const getFetchFunction = (selectedCategory: AnimeCategory) => {
    switch (selectedCategory) {
      case 'top_rated':
        return tmdbService.getTopRatedAnime.bind(tmdbService);
      default:
        return tmdbService.getAnimeFromMultipleSources.bind(tmdbService);
    }
  };

  const { data: animeList, loading, error, hasMore, loadMore } = useOptimizedContent(
    getFetchFunction(category),
    [category]
  );

  const handleCategoryChange = (newCategory: AnimeCategory) => {
    setCategory(newCategory);
  };

  if (loading && animeList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && animeList.length === 0) {
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
            <span className="mr-3 text-4xl">🎌</span>
            <h1 className="text-3xl font-bold text-gray-900">
              Anime {categoryTitles[category]}
            </h1>
          </div>
          <p className="text-gray-600 mb-6">
            Descubre los mejores animes japoneses más populares y mejor valorados.
          </p>

          {/* Category Filter */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm w-fit">
            <Filter className="h-4 w-4 text-gray-500 ml-2" />
            {Object.entries(categoryTitles).map(([key, title]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key as AnimeCategory)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  category === key
                    ? 'bg-pink-600 text-white'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Anime Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          {animeList.map((anime) => (
            <MovieCard key={`${anime.id}-${category}`} item={anime} type="tv" />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Cargando...' : 'Cargar más anime'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}