import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Star, Monitor, Filter, Calendar, Clock, Flame, Library, Play, Clapperboard, Sparkles, Radio, CheckCircle2 } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { MovieCard } from '../components/MovieCard';
import { HeroCarousel } from '../components/HeroCarousel';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { NovelasModal } from '../components/NovelasModal';
import { NetflixSection } from '../components/NetflixSection';
import { FloatingNav } from '../components/FloatingNav';
import type { Movie, TVShow } from '../types/movie';

type TrendingTimeWindow = 'day' | 'week';

export function Home() {
  const { state: adminState, addNotification } = useAdmin();
  const { getCurrentPrices } = useCart();
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [popularAnime, setPopularAnime] = useState<TVShow[]>([]);
  const [trendingContent, setTrendingContent] = useState<(Movie | TVShow)[]>([]);
  const [novelTrendingContent, setNovelTrendingContent] = useState<any[]>([]);
  const [heroItems, setHeroItems] = useState<(Movie | TVShow)[]>([]);
  const [trendingTimeWindow, setTrendingTimeWindow] = useState<TrendingTimeWindow>('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showNovelasModal, setShowNovelasModal] = useState(false);

  const currentPrices = getCurrentPrices();
  const timeWindowLabels = {
    day: 'Hoy + Novelas en Transmisión',
    week: 'Esta Semana + Novelas Finalizadas'
  };

  const fetchTrendingContent = async (timeWindow: TrendingTimeWindow) => {
    try {
      const response = await tmdbService.getTrendingAll(timeWindow, 1);
      const uniqueContent = tmdbService.removeDuplicates(response.results);
      setTrendingContent(uniqueContent.slice(0, 12));
      
      // Add novels to trending based on time window
      const novelTrending = getNovelTrendingContent(timeWindow);
      setNovelTrendingContent(novelTrending);
      
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching trending content:', err);
    }
  };
  
  const getNovelTrendingContent = (timeWindow: TrendingTimeWindow): any[] => {
    const novels = adminState.novels || [];
    
    if (timeWindow === 'day') {
      // Show novels currently airing
      return novels.filter(novel => novel.estado === 'transmision').slice(0, 12);
    } else {
      // Show recently finished novels
      return novels.filter(novel => novel.estado === 'finalizada').slice(0, 10);
    }
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Turquía': '🇹🇷',
      'Cuba': '🇨🇺',
      'México': '🇲🇽',
      'Brasil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Argentina': '🇦🇷',
      'España': '🇪🇸',
      'Estados Unidos': '🇺🇸',
      'Corea del Sur': '🇰🇷',
      'India': '🇮🇳',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Alemania': '🇩🇪',
      'Japón': '🇯🇵',
      'China': '🇨🇳',
      'Rusia': '🇷🇺'
    };
    return flags[country] || '🌍';
  };
  const fetchAllContent = async () => {
    try {
      setLoading(true);
      
      // Get hero content first (no duplicates)
      const heroContent = await tmdbService.getHeroContent();
      setHeroItems(heroContent);
      
      // Get trending content
      const trendingResponse = await tmdbService.getTrendingAll(trendingTimeWindow, 1);
      const uniqueTrending = tmdbService.removeDuplicates(trendingResponse.results);
      setTrendingContent(uniqueTrending.slice(0, 12));
      
      // Get other content, excluding items already in hero and trending
      const usedIds = new Set([
        ...heroContent.map(item => item.id),
        ...uniqueTrending.slice(0, 12).map(item => item.id)
      ]);
      
      // Get comprehensive content including current releases
      const [moviesRes, tvRes, animeRes, nowPlayingRes, airingTodayRes] = await Promise.all([
        tmdbService.getPopularMovies(1),
        tmdbService.getPopularTVShows(1),
        tmdbService.getAnimeFromMultipleSources(1),
        tmdbService.getNowPlayingMovies(1),
        tmdbService.getAiringTodayTVShows(1)
      ]);

      // Combine and filter out duplicates, prioritizing current content
      const allMovies = [
        ...nowPlayingRes.results,
        ...moviesRes.results.filter(movie => !nowPlayingRes.results.some(np => np.id === movie.id))
      ];
      const allTVShows = [
        ...airingTodayRes.results,
        ...tvRes.results.filter(show => !airingTodayRes.results.some(at => at.id === show.id))
      ];
      
      const filteredMovies = allMovies.filter(movie => !usedIds.has(movie.id)).slice(0, 8);
      const filteredTVShows = allTVShows.filter(show => !usedIds.has(show.id)).slice(0, 8);
      const filteredAnime = animeRes.results.filter(anime => !usedIds.has(anime.id)).slice(0, 8);

      setPopularMovies(filteredMovies);
      setPopularTVShows(filteredTVShows);
      setPopularAnime(filteredAnime);
      setLastUpdate(new Date());
    } catch (err) {
      setError('Error al cargar el contenido. Por favor, intenta de nuevo.');
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllContent();
  }, []);

  useEffect(() => {
    fetchTrendingContent(trendingTimeWindow);
  }, [trendingTimeWindow]);

  // Auto-refresh content daily and weekly
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Set initial timeout for midnight
    const midnightTimeout = setTimeout(() => {
      fetchAllContent();
      
      // Then set daily interval
      const dailyInterval = setInterval(() => {
        fetchAllContent();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    // Weekly refresh on Sundays
    const weeklyInterval = setInterval(() => {
      const currentDay = new Date().getDay();
      if (currentDay === 0) { // Sunday
        fetchAllContent();
      }
    }, 24 * 60 * 60 * 1000); // Check daily for Sunday

    return () => {
      clearTimeout(midnightTimeout);
      clearInterval(weeklyInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel */}
      <HeroCarousel items={heroItems} />
      
      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-900 via-purple-900 to-pink-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Descubre el Mundo del
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-400">
              {' '}Entretenimiento
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Explora miles de películas, animes, series ilimitadas y mucho más. Encuentra tus favoritos y agrégalos a tu carrito.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/movies"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <Clapperboard className="mr-2 h-5 w-5" />
              Explorar Películas
            </Link>
            <Link
              to="/tv"
              className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <Monitor className="mr-2 h-5 w-5" />
              Ver Series
            </Link>
            <button
              onClick={() => setShowNovelasModal(true)}
              className="bg-pink-600 hover:bg-pink-700 px-8 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center"
            >
              <Library className="mr-2 h-5 w-5" />
              Catálogo de Novelas
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Trending Content */}
        <section id="section-trending" className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Flame className="mr-2 h-6 w-6 text-red-500" />
              En Tendencia
            </h2>
            
            {/* Trending Filter */}
            <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <Filter className="h-4 w-4 text-gray-500 ml-2" />
              <span className="text-sm font-medium text-gray-700 px-2">Período:</span>
              {Object.entries(timeWindowLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTrendingTimeWindow(key as TrendingTimeWindow)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                    trendingTimeWindow === key
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  {key === 'day' ? <Calendar className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Movies and TV Shows with Netflix-style carousel */}
          <NetflixSection
            title=""
            showViewAll={false}
          >
            {trendingContent.map((item) => {
              const itemType = 'title' in item ? 'movie' : 'tv';
              return (
                <div key={`trending-${itemType}-${item.id}`} className="flex-shrink-0 w-64">
                  <MovieCard item={item} type={itemType} />
                </div>
              );
            })}
          </NetflixSection>
          
        </section>

        {/* Sección Dedicada: Novelas en Transmisión - Estilo Netflix */}
        <section id="section-novelas-transmision" className="mb-12">

          {adminState.novels && adminState.novels.length > 0 ? (
            <>
              {adminState.novels.filter(novel => novel.estado === 'transmision').length > 0 ? (
                <NetflixSection
                  title="Novelas en Transmisión"
                  icon={
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 p-2 rounded-xl shadow-lg">
                      <Radio className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  }
                  showViewAll={true}
                  onViewAllClick={() => setShowNovelasModal(true)}
                >
                  {adminState.novels
                    .filter(novel => novel.estado === 'transmision')
                    .map((novel) => (
                      <Link
                        to={`/novel/${novel.id}`}
                        key={`novel-live-${novel.id}`}
                        className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-red-300 flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52"
                      >
                          <div className="relative">
                            <img
                              src={novel.imagen || (() => {
                                const genreImages = {
                                  'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                                  'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop',
                                  'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=300&h=400&fit=crop',
                                  'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop',
                                  'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop'
                                };
                                return genreImages[novel.genero as keyof typeof genreImages] || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                              })()}
                              alt={novel.titulo}
                              className="w-full h-56 sm:h-60 md:h-64 lg:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                              }}
                            />
                            <div className="absolute top-2 left-2">
                              <span className="bg-red-500 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg animate-pulse flex items-center">
                                <Radio className="h-3 w-3 mr-1" />
                                EN VIVO
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                {getCountryFlag(novel.pais || 'No especificado')}
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <div className="text-white text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                                    {novel.año}
                                  </span>
                                  <span className="bg-red-500/80 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                    {novel.capitulos} cap.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                              {novel.titulo}
                            </h4>
                            <div className="text-center bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-2 border border-red-200">
                              <span className="text-xs sm:text-sm font-bold text-red-600">
                                ${(novel.capitulos * currentPrices.novelPricePerChapter).toLocaleString()}
                              </span>
                              <div className="text-xs text-gray-500">
                                {novel.capitulos} cap.
                              </div>
                            </div>
                          </div>
                      </Link>
                    ))}
                </NetflixSection>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                  <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <Radio className="h-8 w-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    No hay novelas en transmisión
                  </h3>
                  <p className="text-red-600 mb-4">
                    Actualmente no hay novelas siendo transmitidas.
                  </p>
                  <button
                    onClick={() => setShowNovelasModal(true)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Ver catálogo completo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Library className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Catálogo de novelas no disponible
              </h3>
              <p className="text-gray-600">
                No se pudo cargar el catálogo de novelas.
              </p>
            </div>
          )}
        </section>

        {/* Sección Dedicada: Novelas Finalizadas - Estilo Netflix */}
        <section id="section-novelas-finalizadas" className="mb-12">

          {adminState.novels && adminState.novels.length > 0 ? (
            <>
              {adminState.novels.filter(novel => novel.estado === 'finalizada').length > 0 ? (
                <NetflixSection
                  title="Novelas Finalizadas"
                  icon={
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl shadow-lg">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  }
                  showViewAll={true}
                  onViewAllClick={() => setShowNovelasModal(true)}
                >
                  {adminState.novels
                    .filter(novel => novel.estado === 'finalizada')
                    .map((novel) => (
                      <Link
                        to={`/novel/${novel.id}`}
                        key={`novel-finished-${novel.id}`}
                        className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-200 hover:border-green-300 flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52"
                      >
                          <div className="relative">
                            <img
                              src={novel.imagen || (() => {
                                const genreImages = {
                                  'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
                                  'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop',
                                  'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=300&h=400&fit=crop',
                                  'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop',
                                  'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop'
                                };
                                return genreImages[novel.genero as keyof typeof genreImages] || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                              })()}
                              alt={novel.titulo}
                              className="w-full h-56 sm:h-60 md:h-64 lg:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                              }}
                            />
                            <div className="absolute top-2 left-2">
                              <span className="bg-green-500 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                COMPLETA
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                {getCountryFlag(novel.pais || 'No especificado')}
                              </span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                              <div className="text-white text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                                    {novel.año}
                                  </span>
                                  <span className="bg-green-500/80 px-2 py-1 rounded-full text-xs font-bold">
                                    {novel.capitulos} cap.
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-2 group-hover:text-green-600 transition-colors leading-tight">
                              {novel.titulo}
                            </h4>
                            <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 border border-green-200">
                              <span className="text-xs sm:text-sm font-bold text-green-600">
                                ${(novel.capitulos * currentPrices.novelPricePerChapter).toLocaleString()}
                              </span>
                              <div className="text-xs text-gray-500">
                                {novel.capitulos} cap.
                              </div>
                            </div>
                          </div>
                      </Link>
                    ))}
                </NetflixSection>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    No hay novelas finalizadas
                  </h3>
                  <p className="text-green-600 mb-4">
                    Actualmente no hay novelas finalizadas en el catálogo.
                  </p>
                  <button
                    onClick={() => setShowNovelasModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Ver catálogo completo
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-4">
                <Library className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Catálogo de novelas no disponible
              </h3>
              <p className="text-gray-600">
                No se pudo cargar el catálogo de novelas.
              </p>
            </div>
          )}
        </section>

        {/* Popular Movies */}
        <section id="section-peliculas" className="mb-12">
          <NetflixSection
            title="Películas Destacadas"
            icon={<Clapperboard className="h-6 w-6 text-blue-500" />}
            showViewAll={true}
            onViewAllClick={() => window.location.href = '/movies'}
          >
            {popularMovies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-64">
                <MovieCard item={movie} type="movie" />
              </div>
            ))}
          </NetflixSection>
        </section>

        {/* Popular TV Shows */}
        <section id="section-series" className="mb-12">
          <NetflixSection
            title="Series Destacadas"
            icon={<Monitor className="h-6 w-6 text-purple-500" />}
            showViewAll={true}
            onViewAllClick={() => window.location.href = '/tv'}
          >
            {popularTVShows.map((show) => (
              <div key={show.id} className="flex-shrink-0 w-64">
                <MovieCard item={show} type="tv" />
              </div>
            ))}
          </NetflixSection>
        </section>

        {/* Popular Anime */}
        <section id="section-anime" className="mb-12">
          <NetflixSection
            title="Anime Destacado"
            icon={<Sparkles className="h-6 w-6 text-pink-500" />}
            showViewAll={true}
            onViewAllClick={() => window.location.href = '/anime'}
          >
            {popularAnime.map((anime) => (
              <div key={anime.id} className="flex-shrink-0 w-64">
                <MovieCard item={anime} type="tv" />
              </div>
            ))}
          </NetflixSection>
        </section>

        {/* Last Update Info (Hidden from users) */}
        <div className="hidden">
          <p>Última actualización: {lastUpdate.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Modal de Novelas */}
      <NovelasModal
        isOpen={showNovelasModal}
        onClose={() => setShowNovelasModal(false)}
      />

      {/* Floating Navigation */}
      <FloatingNav
        sections={[
          { id: 'section-trending', label: 'En Tendencia', icon: <Flame className="h-5 w-5" /> },
          { id: 'section-novelas-transmision', label: 'Novelas en Transmisión', icon: <Radio className="h-5 w-5" /> },
          { id: 'section-novelas-finalizadas', label: 'Novelas Finalizadas', icon: <CheckCircle2 className="h-5 w-5" /> },
          { id: 'section-peliculas', label: 'Películas Destacadas', icon: <Clapperboard className="h-5 w-5" /> },
          { id: 'section-series', label: 'Series Destacadas', icon: <Monitor className="h-5 w-5" /> },
          { id: 'section-anime', label: 'Anime Destacado', icon: <Sparkles className="h-5 w-5" /> },
        ]}
      />
    </div>
  );
}