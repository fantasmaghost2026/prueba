// Performance optimization utilities
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observers: Map<string, IntersectionObserver> = new Map();
  private platformInfo: any = null;

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Detectar plataforma y capacidades del dispositivo
  detectPlatform() {
    if (this.platformInfo) return this.platformInfo;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    this.platformInfo = {
      // Sistemas operativos
      isIOS: /iphone|ipad|ipod/i.test(userAgent),
      isAndroid: /android/i.test(userAgent),
      isMacOS: /mac/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent),
      isWindows: /windows|win32|win64/i.test(userAgent) || /win/i.test(platform),
      isLinux: /linux/i.test(userAgent) && !/android/i.test(userAgent),
      isChromiumOS: /cros/i.test(userAgent),
      
      // Navegadores
      isChrome: /chrome/i.test(userAgent) && !/edge/i.test(userAgent),
      isFirefox: /firefox/i.test(userAgent),
      isSafari: /safari/i.test(userAgent) && !/chrome/i.test(userAgent),
      isEdge: /edge/i.test(userAgent),
      isOpera: /opera|opr/i.test(userAgent),
      isSamsung: /samsungbrowser/i.test(userAgent),
      
      // Tipos de dispositivo
      isMobile: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || window.innerWidth <= 768,
      isTablet: /ipad|tablet|kindle|silk|playbook/i.test(userAgent) || (window.innerWidth > 768 && window.innerWidth <= 1024 && 'ontouchstart' in window),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      
      // Capacidades
      supportsWebP: this.checkWebPSupport(),
      supportsAVIF: this.checkAVIFSupport(),
      supportsServiceWorker: 'serviceWorker' in navigator,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsResizeObserver: 'ResizeObserver' in window,
      
      // Información de pantalla
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      
      // Información de red
      connectionType: this.getConnectionType(),
      
      userAgent,
      platform
    };
    
    return this.platformInfo;
  }

  private checkWebPSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch {
      return false;
    }
  }

  private checkAVIFSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch {
      return false;
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  // Optimizar imágenes según la plataforma
  getOptimizedImageUrl(baseUrl: string, width: number, height: number): string {
    const platform = this.detectPlatform();
    
    // Para dispositivos de alta densidad, usar imágenes 2x
    const actualWidth = platform.pixelRatio > 1 ? width * 2 : width;
    const actualHeight = platform.pixelRatio > 1 ? height * 2 : height;
    
    // Para conexiones lentas, usar imágenes más pequeñas
    if (platform.connectionType === 'slow-2g' || platform.connectionType === '2g') {
      return `${baseUrl}?w=${Math.floor(actualWidth * 0.7)}&h=${Math.floor(actualHeight * 0.7)}&q=60`;
    }
    
    // Para conexiones rápidas y pantallas de alta densidad
    if (platform.connectionType === '4g' && platform.pixelRatio > 2) {
      return `${baseUrl}?w=${actualWidth}&h=${actualHeight}&q=90`;
    }
    
    return `${baseUrl}?w=${actualWidth}&h=${actualHeight}&q=80`;
  }

  // Lazy loading for images
  setupLazyLoading(): void {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      this.observers.set('images', imageObserver);

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // Debounce function for search and other frequent operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for scroll events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Preload critical resources
  preloadResource(url: string, type: 'image' | 'script' | 'style'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    document.head.appendChild(link);
  }

  // Clean up observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();