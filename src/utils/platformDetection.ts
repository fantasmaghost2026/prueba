// Utilidad completa para detección de plataforma y optimizaciones específicas

export interface PlatformInfo {
  // Sistemas operativos
  isIOS: boolean;
  isAndroid: boolean;
  isMacOS: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isChromiumOS: boolean;
  
  // Navegadores
  isChrome: boolean;
  isFirefox: boolean;
  isSafari: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isSamsung: boolean;
  
  // Tipos de dispositivo
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  
  // Capacidades
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsServiceWorker: boolean;
  supportsWebGL: boolean;
  supportsWebAssembly: boolean;
  
  // Información de pantalla
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  
  // Información de red
  connectionType: string;
  isOnline: boolean;
  
  // Metadatos
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
}

class PlatformDetectionService {
  private static instance: PlatformDetectionService;
  private platformInfo: PlatformInfo | null = null;
  private listeners: Set<(info: PlatformInfo) => void> = new Set();

  static getInstance(): PlatformDetectionService {
    if (!PlatformDetectionService.instance) {
      PlatformDetectionService.instance = new PlatformDetectionService();
    }
    return PlatformDetectionService.instance;
  }

  constructor() {
    this.initializeDetection();
    this.setupEventListeners();
  }

  private initializeDetection(): void {
    this.platformInfo = this.detectPlatform();
  }

  private setupEventListeners(): void {
    // Actualizar información cuando cambie la orientación o tamaño de pantalla
    window.addEventListener('resize', () => {
      this.updatePlatformInfo();
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updatePlatformInfo();
      }, 100);
    });

    // Actualizar estado de conexión
    window.addEventListener('online', () => {
      this.updatePlatformInfo();
    });

    window.addEventListener('offline', () => {
      this.updatePlatformInfo();
    });
  }

  private updatePlatformInfo(): void {
    const oldInfo = this.platformInfo;
    this.platformInfo = this.detectPlatform();
    
    // Notificar a los listeners si hay cambios significativos
    if (this.hasSignificantChanges(oldInfo, this.platformInfo)) {
      this.notifyListeners(this.platformInfo);
    }
  }

  private hasSignificantChanges(oldInfo: PlatformInfo | null, newInfo: PlatformInfo): boolean {
    if (!oldInfo) return true;
    
    return (
      oldInfo.screenWidth !== newInfo.screenWidth ||
      oldInfo.screenHeight !== newInfo.screenHeight ||
      oldInfo.orientation !== newInfo.orientation ||
      oldInfo.isOnline !== newInfo.isOnline ||
      oldInfo.connectionType !== newInfo.connectionType
    );
  }

  private notifyListeners(info: PlatformInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(info);
      } catch (error) {
        console.error('Error in platform detection listener:', error);
      }
    });
  }

  private detectPlatform(): PlatformInfo {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Detectar sistemas operativos
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
    const isAndroid = /android/i.test(userAgent);
    const isMacOS = /mac/i.test(userAgent) && !isIOS;
    const isWindows = /windows|win32|win64/i.test(userAgent) || /win/i.test(platform);
    const isLinux = /linux/i.test(userAgent) && !isAndroid;
    const isChromiumOS = /cros/i.test(userAgent);
    
    // Detectar navegadores
    const isChrome = /chrome/i.test(userAgent) && !/edge/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent);
    const isEdge = /edge|edg/i.test(userAgent);
    const isOpera = /opera|opr/i.test(userAgent);
    const isSamsung = /samsungbrowser/i.test(userAgent);
    
    // Detectar tipos de dispositivo
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                     screenWidth <= 768;
    const isTablet = /ipad|tablet|kindle|silk|playbook/i.test(userAgent) || 
                     (screenWidth > 768 && screenWidth <= 1024 && isTouchDevice);
    const isDesktop = !isMobile && !isTablet;
    
    // Detectar capacidades
    const supportsWebP = this.checkImageFormatSupport('webp');
    const supportsAVIF = this.checkImageFormatSupport('avif');
    const supportsServiceWorker = 'serviceWorker' in navigator;
    const supportsWebGL = this.checkWebGLSupport();
    const supportsWebAssembly = this.checkWebAssemblySupport();
    
    // Información de pantalla
    const pixelRatio = window.devicePixelRatio || 1;
    const orientation = screenWidth > screenHeight ? 'landscape' : 'portrait';
    
    // Información de red
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connectionType = connection ? connection.effectiveType || 'unknown' : 'unknown';
    const isOnline = navigator.onLine;
    
    // Información de localización
    const language = navigator.language || 'es-ES';
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return {
      isIOS,
      isAndroid,
      isMacOS,
      isWindows,
      isLinux,
      isChromiumOS,
      isChrome,
      isFirefox,
      isSafari,
      isEdge,
      isOpera,
      isSamsung,
      isMobile,
      isTablet,
      isDesktop,
      isTouchDevice,
      supportsWebP,
      supportsAVIF,
      supportsServiceWorker,
      supportsWebGL,
      supportsWebAssembly,
      screenWidth,
      screenHeight,
      pixelRatio,
      orientation,
      connectionType,
      isOnline,
      userAgent,
      platform,
      language,
      timezone
    };
  }

  private checkImageFormatSupport(format: 'webp' | 'avif'): boolean {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
    } catch {
      return false;
    }
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  private checkWebAssemblySupport(): boolean {
    try {
      return typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function';
    } catch {
      return false;
    }
  }

  // Métodos públicos
  getPlatformInfo(): PlatformInfo {
    if (!this.platformInfo) {
      this.platformInfo = this.detectPlatform();
    }
    return this.platformInfo;
  }

  subscribe(callback: (info: PlatformInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Optimizaciones específicas por plataforma
  getOptimizedSettings(): {
    imageQuality: number;
    enableAnimations: boolean;
    prefetchImages: boolean;
    useWebP: boolean;
    chunkSize: number;
  } {
    const info = this.getPlatformInfo();
    
    // Configuraciones optimizadas según la plataforma
    if (info.isMobile) {
      return {
        imageQuality: info.connectionType === '4g' ? 80 : 60,
        enableAnimations: info.connectionType !== 'slow-2g' && info.connectionType !== '2g',
        prefetchImages: info.connectionType === '4g',
        useWebP: info.supportsWebP && (info.isChrome || info.isAndroid),
        chunkSize: 10
      };
    }
    
    if (info.isTablet) {
      return {
        imageQuality: 85,
        enableAnimations: true,
        prefetchImages: true,
        useWebP: info.supportsWebP,
        chunkSize: 15
      };
    }
    
    // Desktop
    return {
      imageQuality: 90,
      enableAnimations: true,
      prefetchImages: true,
      useWebP: info.supportsWebP,
      chunkSize: 20
    };
  }

  // Método para obtener configuraciones de WhatsApp optimizadas
  getWhatsAppConfig(): {
    preferredMethod: 'app' | 'web' | 'api';
    urls: string[];
    openInNewTab: boolean;
    windowFeatures: string;
  } {
    const info = this.getPlatformInfo();
    
    if (info.isMobile) {
      return {
        preferredMethod: 'app',
        urls: [
          'whatsapp://send',
          'https://wa.me',
          'https://api.whatsapp.com/send'
        ],
        openInNewTab: false,
        windowFeatures: ''
      };
    }
    
    if (info.isTablet) {
      return {
        preferredMethod: 'web',
        urls: [
          'https://wa.me',
          'whatsapp://send',
          'https://web.whatsapp.com/send'
        ],
        openInNewTab: true,
        windowFeatures: 'width=800,height=600,scrollbars=yes,resizable=yes'
      };
    }
    
    // Desktop
    return {
      preferredMethod: 'web',
      urls: [
        'https://web.whatsapp.com/send',
        'https://wa.me',
        'https://api.whatsapp.com/send'
      ],
      openInNewTab: true,
      windowFeatures: 'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
    };
  }
}

export const platformDetectionService = PlatformDetectionService.getInstance();

// Hook para usar la detección de plataforma en componentes React
export function usePlatformDetection() {
  const [platformInfo, setPlatformInfo] = React.useState<PlatformInfo>(
    platformDetectionService.getPlatformInfo()
  );

  React.useEffect(() => {
    const unsubscribe = platformDetectionService.subscribe(setPlatformInfo);
    return unsubscribe;
  }, []);

  return platformInfo;
}

// Utilidades de conveniencia
export const isMobileDevice = () => platformDetectionService.getPlatformInfo().isMobile;
export const isTabletDevice = () => platformDetectionService.getPlatformInfo().isTablet;
export const isDesktopDevice = () => platformDetectionService.getPlatformInfo().isDesktop;
export const isTouchDevice = () => platformDetectionService.getPlatformInfo().isTouchDevice;
export const isIOSDevice = () => platformDetectionService.getPlatformInfo().isIOS;
export const isAndroidDevice = () => platformDetectionService.getPlatformInfo().isAndroid;