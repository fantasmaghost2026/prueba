import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Tv, Plus, X, Play, ChevronDown, Monitor, Rocket, Film, Clock2, Globe, Users, Building, MapPin, Sparkles, Heart, Zap, Check } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { VideoPlayer } from '../components/VideoPlayer';
import { PriceCard } from '../components/PriceCard';
import { CastSection } from '../components/CastSection';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { AdminContext } from '../context/AdminContext';
import { IMAGE_BASE_URL, BACKDROP_SIZE } from '../config/api';
import type { TVShowDetails, Video, CartItem, Season, CastMember } from '../types/movie';

export function TVDetail() {
  const { id } = useParams<{ id: string }>();
  const adminContext = React.useContext(AdminContext);
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [showSeasonSelector, setShowSeasonSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const { addItem, removeItem, updateSeasons, isInCart, getItemSeasons } = useCart();

  // Get current prices with real-time updates
  const seriesPrice = adminContext?.state?.prices?.seriesPrice || 300;

  const tvId = parseInt(id || '0');
  const inCart = isInCart(tvId);

  // Detectar si es anime
  const isAnime = tvShow?.original_language === 'ja' || 
                 (tvShow?.genres && tvShow.genres.some(g => g.name.toLowerCase().includes('animat'))) ||
                 tvShow?.name?.toLowerCase().includes('anime');

  // Cargar temporadas seleccionadas si ya está en el carrito
  useEffect(() => {
    if (inCart) {
      const savedSeasons = getItemSeasons(tvId);
      setSelectedSeasons(savedSeasons);
    }
  }, [inCart, tvId, getItemSeasons]);

  useEffect(() => {
    const fetchTVData = async () => {
      try {
        setLoading(true);
        
        // Fetch TV details and credits first
        const [tvData, creditsData] = await Promise.all([
          tmdbService.getTVShowDetails(tvId),
          tmdbService.getTVShowCredits(tvId)
        ]);

        setTVShow(tvData);
        setCast(creditsData.cast || []);
        
        // Fetch videos separately with error handling
        try {
          const videoData = await tmdbService.getTVShowVideos(tvId);
          const trailers = videoData.results.filter(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          setVideos(trailers);
          
          if (trailers.length > 0) {
            setSelectedVideo(trailers[0]);
          }
        } catch (videoError) {
          console.warn(`No videos available for TV show ${tvId}`);
          setVideos([]);
        }
      } catch (err) {
        setError('Error al cargar los detalles de la serie.');
        console.error('Error fetching TV show details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tvId) {
      fetchTVData();
    }
  }, [tvId]);

  const handleSeasonToggle = (seasonNumber: number) => {
    setSelectedSeasons(prev => {
      if (prev.includes(seasonNumber)) {
        return prev.filter(s => s !== seasonNumber);
      } else {
        return [...prev, seasonNumber];
      }
    });
  };

  const selectAllSeasons = () => {
    if (!tvShow) return;
    const allSeasonNumbers = tvShow.seasons
      .filter(season => season.season_number > 0)
      .map(season => season.season_number);
    setSelectedSeasons(allSeasonNumbers);
  };

  const clearAllSeasons = () => {
    setSelectedSeasons([]);
  };

  // Determinar si el botón debe estar habilitado
  const isAddToCartEnabled = () => {
    if (!tvShow) return false;
    
    const validSeasons = tvShow.seasons.filter(season => season.season_number > 0);
    
    // Siempre habilitar el botón - si no hay temporadas seleccionadas, se seleccionará la primera automáticamente
    return validSeasons.length > 0;
  };

  const handleCartAction = () => {
    if (!tvShow) return;

    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 2000);

    const validSeasons = tvShow.seasons.filter(season => season.season_number > 0);
    
    // Si no hay temporadas seleccionadas, seleccionar la primera por defecto
    let seasonsToAdd = selectedSeasons;
    if (selectedSeasons.length === 0 && validSeasons.length > 0) {
      seasonsToAdd = [1];
      setSelectedSeasons([1]);
    }

    const cartItem: CartItem & { selectedSeasons?: number[] } = {
      id: tvShow.id,
      title: tvShow.name,
      poster_path: tvShow.poster_path,
      type: 'tv',
      first_air_date: tvShow.first_air_date,
      vote_average: tvShow.vote_average,
      selectedSeasons: seasonsToAdd,
      original_language: tvShow.original_language,
      genre_ids: tvShow.genres.map(g => g.id),
    };

    if (inCart) {
      removeItem(tvShow.id);
    } else {
      addItem(cartItem);
    }
  };

  const handleSeasonsUpdate = () => {
    if (inCart && tvShow) {
      updateSeasons(tvShow.id, selectedSeasons);
    }
  };

  // Actualizar temporadas cuando cambie la selección y esté en el carrito
  useEffect(() => {
    if (inCart) {
      handleSeasonsUpdate();
    }
  }, [selectedSeasons, inCart]);

  // Auto-seleccionar la única temporada si solo hay una
  useEffect(() => {
    if (tvShow && !inCart && selectedSeasons.length === 0) {
      const validSeasons = tvShow.seasons.filter(season => season.season_number > 0);
      if (validSeasons.length >= 1) {
        // Siempre seleccionar la primera temporada por defecto
        setSelectedSeasons([1]);
      }
    }
  }, [tvShow, inCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !tvShow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error || 'Serie no encontrada'} />
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path
    ? `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${tvShow.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=1280&h=720&fit=crop&crop=center';

  const validSeasons = tvShow.seasons.filter(season => season.season_number > 0);
  const hasMultipleSeasons = validSeasons.length > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/tv"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a series
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {tvShow.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{tvShow.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
              </div>
              <div className="flex items-center">
                <Tv className="h-5 w-5 mr-1" />
                <span>{tvShow.number_of_seasons} temporadas</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {tvShow.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sinopsis
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {tvShow.overview || 'Sin descripción disponible.'}
              </p>
              {tvShow.tagline && (
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-gradient-to-b from-purple-400 to-pink-400">
                  <p className="text-gray-600 italic text-lg font-medium">"{tvShow.tagline}"</p>
                </div>
              )}
            </div>

            {/* Cast Section */}
            <CastSection cast={cast} title="Reparto Principal" />

            {/* Videos */}
            {videos.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tráilers y Videos</h2>
                
                {showVideo && selectedVideo ? (
                  <div className="mb-4">
                    <VideoPlayer videoKey={selectedVideo.key} title={selectedVideo.name} />
                  </div>
                ) : (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowVideo(true)}
                      className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden group"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: selectedVideo 
                            ? `url(https://img.youtube.com/vi/${selectedVideo.key}/maxresdefault.jpg)` 
                            : `url(${backdropUrl})` 
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 transition-colors group-hover:scale-110">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <p className="font-medium">Reproducir Tráiler</p>
                        <p className="text-sm opacity-75">{selectedVideo?.name}</p>
                      </div>
                    </button>
                  </div>
                )}

                {videos.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {videos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setSelectedVideo(video);
                          setShowVideo(true);
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-colors ${
                          selectedVideo?.id === video.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{video.name}</p>
                        <p className="text-sm text-gray-600">{video.type}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <span className="text-lg">📺</span>
                  </div>
                  Detalles de la Serie
                </h3>
                
                {/* Episode count warning for series with 50+ episodes */}
                {tvShow.number_of_episodes > 50 && (
                  <div className="mt-4 p-3 bg-yellow-100/20 backdrop-blur-sm rounded-lg border border-yellow-300/30">
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-300 mr-2">⚠️</span>
                      <span className="text-sm font-semibold">Información Importante</span>
                    </div>
                    <p className="text-xs text-yellow-100 leading-relaxed">
                      Esta serie tiene {tvShow.number_of_episodes} episodios. Hasta 50 episodios se contempla como una temporada (${seriesPrice} CUP). 
                      Para más episodios, contacte con TV a la Carta para información adicional.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="p-6">
              {/* Season Selection */}
              {hasMultipleSeasons && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 mb-4">
                    <div className="flex items-center mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <span className="text-sm">📝</span>
                      </div>
                      <h4 className="font-semibold text-purple-900">Seleccionar Temporadas</h4>
                    </div>
                    <p className="text-sm text-purple-700 ml-11">
                      Elige las temporadas que deseas agregar a tu pedido
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowSeasonSelector(!showSeasonSelector)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl transition-all duration-300 border border-purple-200 hover:border-purple-300"
                  >
                    <span className="font-semibold text-purple-900">
                      {selectedSeasons.length > 0 && (
                        <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {selectedSeasons.length} seleccionadas
                        </span>
                      )}
                    </span>
                    <ChevronDown className={`h-5 w-5 text-purple-600 transition-transform duration-300 ${
                      showSeasonSelector ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  {showSeasonSelector && (
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={selectAllSeasons}
                          className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg font-medium transition-colors"
                        >
                          Todas
                        </button>
                        <button
                          onClick={clearAllSeasons}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium transition-colors"
                        >
                          Ninguna
                        </button>
                      </div>
                      {validSeasons
                        .map((season) => (
                          <label
                            key={season.id}
                            className="flex items-center p-3 hover:bg-purple-50 rounded-xl cursor-pointer transition-colors border border-gray-100 hover:border-purple-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSeasons.includes(season.season_number)}
                              onChange={() => handleSeasonToggle(season.season_number)}
                              className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {season.name}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {season.episode_count} episodios
                                {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                              </p>
                            </div>
                          </label>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Mostrar información de temporada única */}
              {!hasMultipleSeasons && validSeasons.length === 1 && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <span className="text-sm">✅</span>
                      </div>
                      <h4 className="font-semibold text-green-900">Temporada Única</h4>
                    </div>
                    <p className="text-sm text-green-700 ml-11 mb-3">
                      Esta serie tiene una sola temporada que se incluirá automáticamente
                    </p>
                    <div className="ml-11 bg-white rounded-lg p-3 border border-green-200">
                      <p className="font-medium text-gray-900">{validSeasons[0].name}</p>
                      <p className="text-sm text-gray-600">
                        {validSeasons[0].episode_count} episodios
                        {validSeasons[0].air_date && ` • ${new Date(validSeasons[0].air_date).getFullYear()}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative">
                <button
                onClick={handleCartAction}
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
                disabled={!isAddToCartEnabled()}
                className={`w-full mb-6 px-6 py-5 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center transform relative overflow-hidden ${
                  !isAddToCartEnabled()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : inCart
                      ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-2xl scale-105'
                      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white shadow-xl'
                } ${isCartHovered ? 'scale-110 shadow-2xl' : ''} ${showCartAnimation ? 'animate-pulse' : ''}`}
                >
                {/* Animated background effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transition-all duration-500 ${
                  isCartHovered ? 'animate-pulse' : ''
                }`} />
                
                {/* Floating icons */}
                {isCartHovered && (
                  <>
                    <Sparkles className="absolute top-2 left-4 h-4 w-4 text-yellow-300 animate-bounce" />
                    <Heart className="absolute top-2 right-4 h-4 w-4 text-pink-300 animate-pulse" />
                    <Zap className="absolute bottom-2 left-6 h-4 w-4 text-blue-300 animate-bounce delay-100" />
                    <Star className="absolute bottom-2 right-6 h-4 w-4 text-yellow-300 animate-pulse delay-200" />
                  </>
                )}
                
                {inCart ? (
                  <>
                    <X className={`mr-3 h-6 w-6 transition-transform duration-300 relative z-10 ${
                      isCartHovered ? 'rotate-90 scale-125' : ''
                    }`} />
                    <span className="relative z-10 text-lg">Retirar del Carrito</span>
                  </>
                ) : (
                  <>
                    <Plus className={`mr-3 h-6 w-6 transition-transform duration-300 relative z-10 ${
                      isCartHovered ? 'rotate-180 scale-125' : ''
                    }`} />
                    <span className="relative z-10 text-lg">Agregar al Carrito</span>
                  </>
                )}
                </button>
                
                {/* Success indicator */}
                {inCart && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white p-2 rounded-full animate-bounce shadow-lg">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Mensaje informativo sobre selección automática */}
              {hasMultipleSeasons && selectedSeasons.length === 0 && !inCart && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700 text-center">
                    ℹ️ Se agregará la primera temporada por defecto. Puedes seleccionar más temporadas arriba.
                  </p>
                </div>
              )}

              {/* Price Card */}
              <div className="mb-6">
                <PriceCard 
                  type="tv" 
                  selectedSeasons={selectedSeasons}
                  isAnime={isAnime}
                />
              </div>
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Monitor className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Estado</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">{tvShow.status}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Rocket className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Primera Emisión</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {new Date(tvShow.first_air_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Film className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Temporadas</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">{tvShow.number_of_seasons}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-yellow-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Tv className="h-4 w-4 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Episodios</h3>
                  </div>
                  <div className="ml-11">
                    <p className="text-gray-700 font-medium">{tvShow.number_of_episodes}</p>
                    {tvShow.number_of_episodes > 50 && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700 font-medium">
                          ⚠️ Más de 50 episodios: Consultar condiciones especiales
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-indigo-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Clock2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Duración</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {tvShow.episode_run_time.length > 0
                      ? `${tvShow.episode_run_time[0]} min`
                      : 'Variable'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-pink-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-pink-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Globe className="h-4 w-4 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Idioma Original</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">{tvShow.original_language.toUpperCase()}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-red-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-red-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Users className="h-4 w-4 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Votos</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {tvShow.vote_count.toLocaleString()} votos
                  </p>
                </div>

                {tvShow.production_companies.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Building className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Productoras</h3>
                    </div>
                    <div className="space-y-2 ml-11">
                      {tvShow.production_companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700 text-sm font-medium">
                          {company.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tvShow.production_countries.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-teal-200 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-teal-100 p-2 rounded-lg mr-3 shadow-sm">
                        <MapPin className="h-4 w-4 text-teal-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Países</h3>
                    </div>
                    <div className="space-y-2 ml-11">
                      {tvShow.production_countries.map((country) => (
                        <div key={country.iso_3166_1} className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700 text-sm font-medium">
                            {country.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}