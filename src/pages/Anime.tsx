import React, { useState, useEffect } from 'react';
import { Filter, Sparkles } from 'lucide-react';
import { useOptimizedContent } from '../hooks/useOptimizedContent';
import { tmdbService } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { TVShow } from '../types/movie';

type AnimeCategory = 'popular' | 'top_rated';

export function Anime() {
  const [category, setCategory] = useState<AnimeCategory>('popular');
  const [isChangingCategory, setIsChangingCategory] = useState(false);

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
    if (newCategory === category) return;
    setIsChangingCategory(true);
    setTimeout(() => {
      setCategory(newCategory);
      setIsChangingCategory(false);
    }, 150);
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
            <Sparkles className="mr-3 h-8 w-8 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Anime {categoryTitles[category]}
            </h1>
          </div>
          <p className="text-gray-600 mb-6">
            Descubre los mejores animes japoneses más populares y mejor valorados.
          </p>

          {/* Category Filter */}
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md border border-gray-100 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-pink-600 mr-2" />
                <span className="text-sm sm:text-base font-semibold text-gray-800">Categoría</span>
              </div>
              <span className="text-xs text-gray-500 hidden sm:inline">{animeList.length} resultados</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(categoryTitles).map(([key, title]) => (
                <button
                  key={key}
                  onClick={() => handleCategoryChange(key as AnimeCategory)}
                  className={`relative px-4 py-3 sm:py-4 rounded-xl text-sm font-semibold transition-all duration-300 transform ${
                    category === key
                      ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-500/50 scale-105 ring-2 ring-pink-400 ring-offset-2'
                      : 'bg-gray-50 text-gray-700 hover:text-pink-600 hover:bg-pink-50 hover:scale-102 border border-gray-200 hover:border-pink-300 hover:shadow-md'
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

        {/* Anime Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 transition-opacity duration-300 ${
          isChangingCategory ? 'opacity-50' : 'opacity-100'
        }`}>
          {animeList.map((anime, index) => (
            <div
              key={`${anime.id}-${category}`}
              className="animate-fade-slide-up"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <MovieCard item={anime} type="tv" />
            </div>
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