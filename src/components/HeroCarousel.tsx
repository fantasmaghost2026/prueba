import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Calendar, Play, Pause, Sparkles, Zap, Heart } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { tmdbService } from '../services/tmdb';
import { contentSyncService } from '../services/contentSync';
import { performanceOptimizer } from '../utils/performance';
import { IMAGE_BASE_URL, BACKDROP_SIZE } from '../config/api';
import type { Movie, TVShow, Video } from '../types/movie';

interface HeroCarouselProps {
  items: (Movie | TVShow)[];
}

export function HeroCarousel({ items }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [itemVideos, setItemVideos] = useState<{ [key: number]: Video[] }>({});
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [isButtonHovered, setIsButtonHovered] = useState<string | null>(null);

  const AUTOPLAY_INTERVAL = 6000; // 6 seconds

  // Preload next images for smooth transitions
  useEffect(() => {
    const preloadNextImages = () => {
      const nextIndex = (currentIndex + 1) % items.length;
      const prevIndex = (currentIndex - 1 + items.length) % items.length;
      
      [nextIndex, prevIndex].forEach(index => {
        const item = items[index];
        if (item?.backdrop_path) {
          const imageUrl = `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${item.backdrop_path}`;
          if (!preloadedImages.has(imageUrl)) {
            performanceOptimizer.preloadResource(imageUrl, 'image');
            setPreloadedImages(prev => new Set([...prev, imageUrl]));
          }
        }
      });
    };

    preloadNextImages();
  }, [currentIndex, items, preloadedImages]);

  // Cargar videos para cada item
  useEffect(() => {
    const loadVideos = async () => {
      const videoPromises = items.map(async (item) => {
        try {
          // Check cache first
          const isMovie = 'title' in item;
          const cachedVideoData = contentSyncService?.getCachedVideos?.(item.id, isMovie ? 'movie' : 'tv');
          
          if (cachedVideoData && cachedVideoData.length > 0) {
            return { id: item.id, videos: cachedVideoData };
          }
          
          // Fallback to API call with error handling
          try {
            const videoData = isMovie 
              ? await tmdbService.getMovieVideos(item.id)
              : await tmdbService.getTVShowVideos(item.id);
            
            const trailers = videoData.results.filter(
              video => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser')
            );
            
            return { id: item.id, videos: trailers };
          } catch (videoError) {
            console.warn(`No videos available for ${isMovie ? 'movie' : 'tv'} ${item.id}`);
            return { id: item.id, videos: [] };
          }
        } catch (error) {
          console.warn(`Error loading videos for item ${item.id}:`, error);
          return { id: item.id, videos: [] };
        }
      });

      const results = await Promise.allSettled(videoPromises);
      const videosMap = results.reduce((acc, result) => {
        if (result.status === 'fulfilled') {
          const { id, videos } = result.value;
          acc[id] = videos;
        }
        return acc;
      }, {} as { [key: number]: Video[] });
      
      setItemVideos(videosMap);
    };

    if (items.length > 0) {
      loadVideos();
    }
  }, [items]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
    setProgress(0);
  }, [items.length, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setProgress(0);
  }, [items.length, isTransitioning]);

  const goToSlide = useCallback(performanceOptimizer.throttle((index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setProgress(0);
  }, 100), [currentIndex, isTransitioning]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevious, goToNext]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length, goToNext]);

  // Progress bar animation
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animate);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [currentIndex, isAutoPlaying, items.length]);

  // Reset transition state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Auto-refresh carousel content daily
  useEffect(() => {
    const refreshCarousel = async () => {
      try {
        const freshContent = await tmdbService.getHeroContent();
        // This would need to be passed back to parent component
        // For now, we'll rely on the parent's refresh mechanism
      } catch (error) {
        console.error('Error refreshing carousel content:', error);
      }
    };

    const dailyRefresh = setInterval(refreshCarousel, 24 * 60 * 60 * 1000); // 24 hours
    return () => clearInterval(dailyRefresh);
  }, []);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const title = 'title' in currentItem ? currentItem.title : currentItem.name;
  const releaseDate = 'release_date' in currentItem ? currentItem.release_date : currentItem.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const itemType = 'title' in currentItem ? 'movie' : 'tv';
  const currentVideos = itemVideos[currentItem.id] || [];
  const hasTrailer = currentVideos.length > 0;

  const handleWatchNow = () => {
    if (hasTrailer) {
      const trailer = currentVideos[0];
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
      window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative h-96 md:h-[600px] overflow-hidden group">
      {/* Background Images with Parallax Effect */}
      <div className="absolute inset-0">
        {items.map((item, index) => {
          const itemBackdrop = item.backdrop_path
            ? `${IMAGE_BASE_URL}/${BACKDROP_SIZE}${item.backdrop_path}`
            : 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=1280&h=720&fit=crop&crop=center';
          
          const isActive = index === currentIndex;
          const isPrev = index === (currentIndex - 1 + items.length) % items.length;
          const isNext = index === (currentIndex + 1) % items.length;
          
          return (
            <div
              key={item.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform ${
                isActive 
                  ? 'opacity-100 scale-100' 
                  : isPrev 
                    ? 'opacity-0 scale-105 -translate-x-full' 
                    : isNext 
                      ? 'opacity-0 scale-105 translate-x-full'
                      : 'opacity-0 scale-110'
              }`}
              style={{ backgroundImage: `url(${itemBackdrop})` }}
            />
          );
        })}
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        disabled={isTransitioning}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={goToNext}
        disabled={isTransitioning}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 disabled:opacity-50 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Auto-play Control */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 z-20 opacity-0 group-hover:opacity-100"
      >
        {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>

      {/* Content with Slide Animation */}
      <div className="relative h-full flex items-end z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-12 w-full">
          <div className="max-w-3xl">
            <div className={`transform transition-all duration-700 ${
              isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                {title}
              </h2>
              
              <div className="flex items-center space-x-6 text-white/90 mb-6">
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-2" />
                  <span className="font-semibold text-lg">{currentItem.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span className="font-medium">{year}</span>
                </div>
              </div>
              
              <p className="text-white/85 text-xl leading-relaxed mb-8 line-clamp-3 max-w-2xl">
                {currentItem.overview || 'Sin descripción disponible.'}
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={handleWatchNow}
                  onMouseEnter={() => setIsButtonHovered('watch')}
                  onMouseLeave={() => setIsButtonHovered(null)}
                  disabled={!hasTrailer}
                  className={`px-8 py-4 rounded-full font-bold transition-all duration-500 flex items-center relative overflow-hidden ${
                    hasTrailer 
                      ? 'bg-white text-black hover:bg-white/90 shadow-2xl transform hover:scale-110' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  } ${isButtonHovered === 'watch' ? 'scale-110 shadow-2xl' : ''}`}
                >
                  {/* Animated background */}
                  {hasTrailer && isButtonHovered === 'watch' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 animate-pulse" />
                  )}
                  
                  {/* Floating icons */}
                  {hasTrailer && isButtonHovered === 'watch' && (
                    <>
                      <Sparkles className="absolute top-1 left-2 h-3 w-3 text-red-500 animate-bounce" />
                      <Zap className="absolute top-1 right-2 h-3 w-3 text-yellow-500 animate-pulse" />
                    </>
                  )}
                  
                  <Play className={`h-5 w-5 mr-2 relative z-10 transition-transform duration-300 ${
                    isButtonHovered === 'watch' ? 'scale-125 text-red-600' : ''
                  }`} />
                  {hasTrailer ? 'Ver Tráiler' : 'Sin Tráiler'}
                </button>
                
                <Link
                  to={`/${itemType}/${currentItem.id}`}
                  onMouseEnter={() => setIsButtonHovered('info')}
                  onMouseLeave={() => setIsButtonHovered(null)}
                  className={`bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold transition-all duration-500 flex items-center relative overflow-hidden shadow-xl ${
                    isButtonHovered === 'info' ? 'bg-white/40 scale-110 shadow-2xl' : 'hover:bg-white/30 hover:scale-105'
                  }`}
                >
                  {/* Animated background */}
                  {isButtonHovered === 'info' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-pulse" />
                  )}
                  
                  {/* Floating icons */}
                  {isButtonHovered === 'info' && (
                    <>
                      <Heart className="absolute top-1 left-2 h-3 w-3 text-pink-300 animate-pulse" />
                      <Star className="absolute top-1 right-2 h-3 w-3 text-yellow-300 animate-bounce" />
                    </>
                  )}
                  
                  <span className="relative z-10">
                  Más Info
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative transition-all duration-300 ${
              index === currentIndex
                ? 'w-12 h-3'
                : 'w-3 h-3 hover:w-6'
            }`}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white'
                : 'bg-white/40 hover:bg-white/60'
            }`} />
            {index === currentIndex && isAutoPlaying && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute bottom-8 right-8 bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
}