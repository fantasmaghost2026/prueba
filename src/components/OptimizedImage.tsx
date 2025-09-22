import React, { useState, useRef, useEffect } from 'react';
import { platformDetectionService } from '../utils/platformDetection';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  lazy?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&crop=center',
  lazy = true,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(lazy ? '' : src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Optimizar imagen según la plataforma
  useEffect(() => {
    const platform = platformDetectionService.getPlatformInfo();
    const settings = platformDetectionService.getOptimizedSettings();
    
    let optimized = src;
    
    // Aplicar optimizaciones según la plataforma
    if (src.includes('image.tmdb.org') || src.includes('images.unsplash.com')) {
      const separator = src.includes('?') ? '&' : '?';
      
      // Ajustar calidad según el dispositivo y conexión
      optimized += `${separator}q=${settings.imageQuality}`;
      
      // Usar WebP si está soportado
      if (settings.useWebP && platform.supportsWebP) {
        optimized += '&fm=webp';
      }
      
      // Ajustar tamaño para dispositivos de alta densidad
      if (platform.pixelRatio > 1) {
        optimized += `&dpr=${Math.min(platform.pixelRatio, 3)}`;
      }
      
      // Optimizaciones específicas para móviles
      if (platform.isMobile) {
        optimized += '&fit=crop&crop=smart';
      }
    }
    
    setOptimizedSrc(optimized);
  }, [src]);

  useEffect(() => {
    if (!lazy) {
      setImageSrc(optimizedSrc || src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(optimizedSrc || src);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Precargar imágenes un poco antes
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [optimizedSrc, src, lazy]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading={lazy ? 'lazy' : 'eager'}
      />
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Error al cargar imagen</span>
        </div>
      )}
    </div>
  );
}