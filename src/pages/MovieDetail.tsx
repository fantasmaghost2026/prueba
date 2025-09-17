import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Plus, X, Play, Clapperboard, Globe, DollarSign, TrendingUp, Users, Building, Sparkles, Heart, Zap, CheckCircle } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { VideoPlayer } from '../components/VideoPlayer';
import { PriceCard } from '../components/PriceCard';
import { CastSection } from '../components/CastSection';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { useCart } from '../context/CartContext';
import { IMAGE_BASE_URL, BACKDROP_SIZE } from '../config/api';
import type { MovieDetails, Video, CartItem, CastMember } from '../types/movie';

export function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const { addItem, removeItem, isInCart } = useCart();

  const movieId = parseInt(id || '0');
  const inCart = isInCart(movieId);

  // Detectar si es anime
  const isAnime = movie?.original_language === 'ja' || 
                 (movie?.genres && movie.genres.some(g => g.name.toLowerCase().includes('animat')));

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        
        // Fetch movie details and credits first
        const [movieData, creditsData] = await Promise.all([
          tmdbService.getMovieDetails(movieId),
          tmdbService.getMovieCredits(movieId)
        ]);

        setMovie(movieData);
        setCast(creditsData.cast || []);
        
        // Fetch videos separately with error handling
        try {
          const videoData = await tmdbService.getMovieVideos(movieId);
          const trailers = videoData.results.filter(
            video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
          );
          setVideos(trailers);
          
          if (trailers.length > 0) {
            setSelectedVideo(trailers[0]);
          }
        } catch (videoError) {
          console.warn(`No videos available for movie ${movieId}`);
          setVideos([]);
        }
      } catch (err) {
        setError('Error al cargar los detalles de la película.');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieData();
    }
  }, [movieId]);

  const handleCartAction = () => {
    if (!movie) return;

    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 2000);

    const cartItem: CartItem = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      type: 'movie',
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      original_language: movie.original_language,
      genre_ids: movie.genres.map(g => g.id),
    };

    if (inCart) {
      removeItem(movie.id);
    } else {
      addItem(cartItem);
    }
  };

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error || 'Película no encontrada'} />
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${movie.backdrop_path}`
    : 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=1280&h=720&fit=crop&crop=center';

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
              to="/movies"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a películas
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {movie.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                <span className="font-medium">{movie.vote_average.toFixed(1)}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
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
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sinopsis
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {movie.overview || 'Sin descripción disponible.'}
              </p>
              {movie.tagline && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-gradient-to-b from-blue-400 to-purple-400">
                  <p className="text-gray-600 italic text-lg font-medium">"{movie.tagline}"</p>
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
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
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
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <span className="text-lg">🎬</span>
                  </div>
                  Detalles de la Película
                </h3>
              </div>
              
              <div className="p-6">
                <button
                  onClick={handleCartAction}
                  onMouseEnter={() => setIsCartHovered(true)}
                  onMouseLeave={() => setIsCartHovered(false)}
                  className={`w-full mb-6 px-6 py-5 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center transform relative overflow-hidden ${
                  inCart
                    ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-2xl scale-105'
                    : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-xl'
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
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>



              </div>

              {/* Price Card */}
              <div className="mb-6">
                <PriceCard 
                  type="movie" 
                  isAnime={isAnime}
                />
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Clapperboard className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Estado</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">{movie.status}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Globe className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Idioma Original</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">{movie.original_language.toUpperCase()}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Presupuesto</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {movie.budget > 0
                      ? `$${movie.budget.toLocaleString()}`
                      : 'No disponible'
                    }
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-yellow-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3 shadow-sm">
                      <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Recaudación</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {movie.revenue > 0
                      ? `$${movie.revenue.toLocaleString()}`
                      : 'No disponible'
                    }
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-pink-200 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="bg-pink-100 p-2 rounded-lg mr-3 shadow-sm">
                      <Users className="h-4 w-4 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Votos</h3>
                  </div>
                  <p className="text-gray-700 font-medium ml-11">
                    {movie.vote_count.toLocaleString()} votos
                  </p>
                </div>
                  </p>
                {movie.production_companies.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Building className="h-4 w-4 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Productoras</h3>
                    </div>
                    <div className="space-y-2 ml-11">
                      {movie.production_companies.slice(0, 3).map((company) => (
                        <div key={company.id} className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-gray-700 text-sm font-medium">
                          {company.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </div>
                {movie.production_countries.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-orange-200 transition-colors">
                    <div className="flex items-center mb-3">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Globe className="h-4 w-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Países</h3>
                    </div>
                    <div className="space-y-2 ml-11">
                      {movie.production_countries.map((country) => (
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
  );
}