// Servicio universal para WhatsApp compatible con todos los dispositivos y SO

interface WhatsAppConfig {
  phoneNumber: string;
  message: string;
  preferredMethod?: 'app' | 'web' | 'auto';
}

interface PlatformDetection {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'chromeos' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'samsung' | 'unknown';
  device: 'mobile' | 'tablet' | 'desktop';
  capabilities: {
    hasWhatsAppApp: boolean;
    supportsCustomSchemes: boolean;
    supportsPopups: boolean;
  };
}

class UniversalWhatsAppService {
  private static instance: UniversalWhatsAppService;
  private platformInfo: PlatformDetection | null = null;

  static getInstance(): UniversalWhatsAppService {
    if (!UniversalWhatsAppService.instance) {
      UniversalWhatsAppService.instance = new UniversalWhatsAppService();
    }
    return UniversalWhatsAppService.instance;
  }

  private detectPlatform(): PlatformDetection {
    if (this.platformInfo) return this.platformInfo;

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    const screenWidth = window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Detectar sistema operativo
    let os: PlatformDetection['os'] = 'unknown';
    if (/iphone|ipad|ipod/i.test(userAgent)) {
      os = 'ios';
    } else if (/android/i.test(userAgent)) {
      os = 'android';
    } else if (/windows|win32|win64/i.test(userAgent) || /win/i.test(platform)) {
      os = 'windows';
    } else if (/mac/i.test(userAgent) || /mac/i.test(platform)) {
      os = 'macos';
    } else if (/linux/i.test(userAgent) && !/android/i.test(userAgent)) {
      os = 'linux';
    } else if (/cros/i.test(userAgent)) {
      os = 'chromeos';
    }

    // Detectar navegador
    let browser: PlatformDetection['browser'] = 'unknown';
    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
      browser = 'chrome';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'firefox';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'safari';
    } else if (/edge|edg/i.test(userAgent)) {
      browser = 'edge';
    } else if (/opera|opr/i.test(userAgent)) {
      browser = 'opera';
    } else if (/samsungbrowser/i.test(userAgent)) {
      browser = 'samsung';
    }

    // Detectar tipo de dispositivo
    let device: PlatformDetection['device'] = 'desktop';
    if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || screenWidth <= 768) {
      device = 'mobile';
    } else if (/ipad|tablet|kindle|silk|playbook/i.test(userAgent) || (screenWidth > 768 && screenWidth <= 1024 && isTouchDevice)) {
      device = 'tablet';
    }

    // Detectar capacidades
    const capabilities = {
      hasWhatsAppApp: this.detectWhatsAppApp(os, device),
      supportsCustomSchemes: this.supportsCustomSchemes(os, browser),
      supportsPopups: this.supportsPopups(browser)
    };

    this.platformInfo = {
      os,
      browser,
      device,
      capabilities
    };

    return this.platformInfo;
  }

  private detectWhatsAppApp(os: string, device: string): boolean {
    // WhatsApp está disponible en móviles y tablets
    return device === 'mobile' || (device === 'tablet' && (os === 'ios' || os === 'android'));
  }

  private supportsCustomSchemes(os: string, browser: string): boolean {
    // iOS Safari y Chrome en Android soportan esquemas personalizados
    return (os === 'ios' && browser === 'safari') || 
           (os === 'android' && (browser === 'chrome' || browser === 'samsung')) ||
           (os === 'android' && browser === 'firefox');
  }

  private supportsPopups(browser: string): boolean {
    // La mayoría de navegadores modernos soportan popups
    return !['unknown'].includes(browser);
  }

  // Método principal para abrir WhatsApp
  async openWhatsApp(config: WhatsAppConfig): Promise<boolean> {
    const platform = this.detectPlatform();
    const { phoneNumber, message, preferredMethod = 'auto' } = config;
    const encodedMessage = encodeURIComponent(message);

    console.log('Opening WhatsApp with platform info:', platform);

    // Determinar el mejor método según la plataforma
    const method = this.getBestMethod(platform, preferredMethod);
    const urls = this.generateUrls(phoneNumber, encodedMessage, platform, method);

    return this.tryOpenWithFallbacks(urls, platform);
  }

  private getBestMethod(platform: PlatformDetection, preferred: string): 'app' | 'web' {
    if (preferred === 'app' && platform.capabilities.hasWhatsAppApp) {
      return 'app';
    }
    
    if (preferred === 'web') {
      return 'web';
    }

    // Auto: decidir automáticamente
    if (platform.device === 'mobile' && platform.capabilities.hasWhatsAppApp) {
      return 'app';
    }

    return 'web';
  }

  private generateUrls(phoneNumber: string, encodedMessage: string, platform: PlatformDetection, method: 'app' | 'web'): string[] {
    const urls: string[] = [];

    if (method === 'app' && platform.capabilities.hasWhatsAppApp) {
      // URLs para app nativa
      urls.push(`whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`);
      
      // Fallbacks específicos por OS
      if (platform.os === 'ios') {
        urls.push(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
      } else if (platform.os === 'android') {
        urls.push(`intent://send?phone=${phoneNumber}&text=${encodedMessage}#Intent;scheme=whatsapp;package=com.whatsapp;end`);
        urls.push(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
      }
    }

    // URLs web universales
    if (platform.device === 'desktop') {
      urls.push(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`);
    }
    
    urls.push(`https://wa.me/${phoneNumber}?text=${encodedMessage}`);
    urls.push(`https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`);

    return urls;
  }

  private async tryOpenWithFallbacks(urls: string[], platform: PlatformDetection): Promise<boolean> {
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        const success = await this.tryOpenUrl(url, platform, i === 0);
        if (success) {
          console.log(`WhatsApp opened successfully with URL: ${url}`);
          return true;
        }
      } catch (error) {
        console.warn(`Failed to open WhatsApp with URL ${url}:`, error);
      }
    }

    // Si todo falla, mostrar mensaje de error y copiar al portapapeles
    this.handleFallback(urls[urls.length - 1]);
    return false;
  }

  private async tryOpenUrl(url: string, platform: PlatformDetection, isFirstAttempt: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      // Para esquemas personalizados en móviles
      if (url.startsWith('whatsapp://') || url.startsWith('intent://')) {
        if (platform.device === 'mobile' && platform.capabilities.supportsCustomSchemes) {
          // Método iframe para iOS
          if (platform.os === 'ios') {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
              document.body.removeChild(iframe);
              // Si la página sigue visible, probablemente no funcionó
              resolve(document.visibilityState !== 'visible');
            }, 2500);
            
            return;
          }
          
          // Método location para Android
          if (platform.os === 'android') {
            try {
              window.location.href = url;
              setTimeout(() => resolve(true), 1000);
              return;
            } catch (error) {
              resolve(false);
              return;
            }
          }
        }
        
        resolve(false);
        return;
      }

      // Para URLs web
      try {
        const windowFeatures = this.getWindowFeatures(platform);
        const newWindow = window.open(url, '_blank', windowFeatures);
        
        if (!newWindow || newWindow.closed) {
          resolve(false);
          return;
        }

        // Para WhatsApp Web, verificar si se carga correctamente
        if (url.includes('web.whatsapp.com')) {
          setTimeout(() => {
            try {
              if (newWindow.closed) {
                resolve(false);
              } else {
                resolve(true);
              }
            } catch (error) {
              resolve(true); // Asumir éxito si no podemos verificar
            }
          }, 3000);
        } else {
          resolve(true);
        }
      } catch (error) {
        resolve(false);
      }
    });
  }

  private getWindowFeatures(platform: PlatformDetection): string {
    if (platform.device === 'mobile') {
      return '';
    }
    
    if (platform.device === 'tablet') {
      return 'width=800,height=600,scrollbars=yes,resizable=yes';
    }
    
    // Desktop
    return 'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no';
  }

  private handleFallback(lastUrl: string): void {
    const platform = this.detectPlatform();
    
    // Mensaje de error personalizado según la plataforma
    let errorMessage = 'No se pudo abrir WhatsApp automáticamente. ';
    
    if (platform.device === 'mobile') {
      errorMessage += 'Por favor, instala WhatsApp desde tu tienda de aplicaciones o ';
    } else if (platform.device === 'desktop') {
      errorMessage += 'Por favor, abre WhatsApp Web en tu navegador o ';
    }
    
    errorMessage += 'copia el mensaje y envíalo manualmente al +53 54690878';
    
    // Mostrar alerta con opción de copiar
    if (confirm(errorMessage + '\n\n¿Deseas copiar el mensaje al portapapeles?')) {
      this.copyToClipboard(decodeURIComponent(lastUrl.split('text=')[1] || ''));
    }
    
    // Como último recurso, abrir la URL en una nueva pestaña
    try {
      window.open(lastUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open fallback URL:', error);
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert('Mensaje copiado al portapapeles');
      } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          alert('Mensaje copiado al portapapeles');
        } catch (error) {
          console.error('Failed to copy to clipboard:', error);
          alert('No se pudo copiar automáticamente. Por favor, copia manualmente el mensaje.');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Clipboard operation failed:', error);
      alert('No se pudo copiar al portapapeles. Por favor, copia manualmente el mensaje.');
    }
  }

  // Método público simplificado
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    return this.openWhatsApp({
      phoneNumber,
      message,
      preferredMethod: 'auto'
    });
  }

  // Verificar si WhatsApp está disponible
  isWhatsAppAvailable(): boolean {
    const platform = this.detectPlatform();
    return platform.capabilities.hasWhatsAppApp || platform.capabilities.supportsPopups;
  }

  // Obtener información de la plataforma
  getPlatformInfo(): PlatformDetection {
    return this.detectPlatform();
  }
}

export const universalWhatsAppService = UniversalWhatsAppService.getInstance();

// Función de conveniencia para usar en componentes
export async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<boolean> {
  return universalWhatsAppService.sendMessage(phoneNumber, message);
}

// Hook para React
export function useWhatsApp() {
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [platformInfo, setPlatformInfo] = React.useState<PlatformDetection | null>(null);

  React.useEffect(() => {
    const info = universalWhatsAppService.getPlatformInfo();
    setPlatformInfo(info);
    setIsAvailable(universalWhatsAppService.isWhatsAppAvailable());
  }, []);

  const sendMessage = React.useCallback(async (phoneNumber: string, message: string) => {
    return universalWhatsAppService.sendMessage(phoneNumber, message);
  }, []);

  return {
    sendMessage,
    isAvailable,
    platformInfo
  };
}