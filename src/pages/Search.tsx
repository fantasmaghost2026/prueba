import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { useAdmin } from '../context/AdminContext';
import { performanceOptimizer } from '../utils/performance';
import { MovieCard } from '../components/MovieCard';
import { NovelCard } from '../components/NovelCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { Movie, TVShow } from '../types/movie';

type SearchType = 'all' | 'movie' | 'tv';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const { state: adminState } = useAdmin();
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [novelResults, setNovelResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const query = searchParams.get('q') || '';

  const searchTypeLabels = {
    all: 'Todo',
    movie: 'Películas',
    tv: 'Series'
  };

  const performSearch = async (searchQuery: string, type: SearchType, pageNum: number, append: boolean = false) => {
    if (!searchQuery.trim()) return;

    try {
      if (!append) setLoading(true);
      
      // Search novels first
      const novelMatches = adminState.novels?.filter(novel =>
        novel.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        novel.genero.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (novel.pais && novel.pais.toLowerCase().includes(searchQuery.toLowerCase()))
      ) || [];
      
      setNovelResults(novelMatches);
      
      let response;
      switch (type) {
        case 'movie':
          response = await tmdbService.searchMovies(searchQuery, pageNum);
          break;
        case 'tv':
          // Buscar tanto series normales como anime
          const [tvResponse, animeResponse] = await Promise.all([
            tmdbService.searchTVShows(searchQuery, pageNum),
            tmdbService.searchAnime(searchQuery, pageNum)
          ]);
          
          // Combinar resultados y eliminar duplicados
          const combinedResults = [...tvResponse.results, ...animeResponse.results];
          const uniqueResults = combinedResults.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          
          response = {
            ...tvResponse,
            results: uniqueResults,
            total_results: tvResponse.total_results + animeResponse.total_results
          };
          break;
        default:
          // Para búsqueda general, incluir anime también
          const [multiResponse, animeMultiResponse] = await Promise.all([
            tmdbService.searchMulti(searchQuery, pageNum),
            tmdbService.searchAnime(searchQuery, pageNum)
          ]);
          
          const allResults = [...multiResponse.results, ...animeMultiResponse.results];
          const uniqueAllResults = tmdbService.removeDuplicates(allResults);
          
          response = {
            ...multiResponse,
            results: uniqueAllResults,
            total_results: multiResponse.total_results + animeMultiResponse.total_results
          };
      }

      // Ensure no duplicates in final results
      const finalResults = tmdbService.removeDuplicates(response.results);

      if (append) {
        setResults(prev => tmdbService.removeDuplicates([...prev, ...finalResults]));
      } else {
        setResults(finalResults);
        setTotalResults(response.total_results);
      }
      
      setHasMore(pageNum < response.total_pages);
      setError(null);
    } catch (err) {
      setError('Error en la búsqueda. Por favor, intenta de nuevo.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = React.useMemo(
    () => performanceOptimizer.debounce(performSearch, 300),
    [performSearch]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query, searchType, 1, false);
    }
  }, [query, searchType, debouncedSearch]);

  const handleTypeChange = (newType: SearchType) => {
    setSearchType(newType);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, searchType, nextPage, true);
  };

  const getItemType = (item: Movie | TVShow): 'movie' | 'tv' => {
    return 'title' in item ? 'movie' : 'tv';
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Buscar contenido</h2>
          <p className="text-gray-600">Usa la barra de búsqueda para encontrar películas, series y anime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Search className="mr-3 h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Resultados para "{query}"
            </h1>
          </div>
          
          {!loading && totalResults > 0 && (
            <p className="text-gray-600 mb-6">
              Se encontraron {totalResults} resultados
            </p>
          )}

          {/* Search Type Filter */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm w-fit">
            <Filter className="h-4 w-4 text-gray-500 ml-2" />
            {Object.entries(searchTypeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => handleTypeChange(key as SearchType)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && results.length === 0 && <LoadingSpinner />}

        {/* Error State */}
        {error && results.length === 0 && <ErrorMessage message={error} />}

        {/* No Results */}
        {!loading && !error && results.length === 0 && novelResults.length === 0 && query && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda o explora nuestro catálogo de películas, series y novelas.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {(results.length > 0 || novelResults.length > 0) && (
          <>
            {/* Novel Results */}
            {novelResults.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📚</span>
                  Novelas ({novelResults.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-6">
                  {novelResults.map((novel) => (
                    <NovelCard key={`novel-${novel.id}`} novel={novel} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Movies and TV Shows */}
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎬</span>
                Películas y Series ({results.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {results.map((item) => (
                <MovieCard
                  key={`${getItemType(item)}-${item.id}`}
                  item={item}
                  type={getItemType(item)}
                />
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
                  {loading ? 'Cargando...' : 'Cargar más resultados'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}