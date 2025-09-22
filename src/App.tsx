import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { TVShows } from './pages/TVShows';
import { Anime } from './pages/Anime';
import { SearchPage } from './pages/Search';
import { MovieDetail } from './pages/MovieDetail';
import { TVDetail } from './pages/TVDetail';
import { Cart } from './pages/Cart';
import { AdminPanel } from './pages/AdminPanel';

function App() {
  // Detectar refresh y redirigir a la página principal
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      // Marcar que la página se está recargando
      sessionStorage.setItem('pageRefreshed', 'true');
    };

    const handleLoad = () => {
      // Si se detecta que la página fue recargada, redirigir a la página principal
      if (sessionStorage.getItem('pageRefreshed') === 'true') {
        sessionStorage.removeItem('pageRefreshed');
        // Solo redirigir si no estamos ya en la página principal
        if (window.location.pathname !== '/') {
          window.location.href = 'https://tvalacarta.vercel.app/';
          return;
        }
      }
    };

    // Verificar al montar el componente si fue un refresh
    if (sessionStorage.getItem('pageRefreshed') === 'true') {
      sessionStorage.removeItem('pageRefreshed');
      if (window.location.pathname !== '/') {
        window.location.href = 'https://tvalacarta.vercel.app/';
        return;
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Deshabilitar zoom con teclado y gestos
  React.useEffect(() => {
    // Detectar plataforma para optimizaciones específicas
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return {
        isIOS: /iphone|ipad|ipod/i.test(userAgent),
        isAndroid: /android/i.test(userAgent),
        isMacOS: /mac/i.test(userAgent) && !/iphone|ipad|ipod/i.test(userAgent),
        isWindows: /windows/i.test(userAgent),
        isLinux: /linux/i.test(userAgent) && !/android/i.test(userAgent),
        isMobile: /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent),
        isTablet: /ipad|tablet|kindle|silk|playbook/i.test(userAgent),
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      };
    };

    const platform = detectPlatform();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Deshabilitar Ctrl/Cmd + Plus/Minus/0 para zoom
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
        return false;
      }
      
      // Deshabilitar F11 (pantalla completa) en algunos casos
      if (e.key === 'F11' && platform.isWindows) {
        e.preventDefault();
        return false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Deshabilitar Ctrl/Cmd + scroll para zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        return false;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Deshabilitar pinch-to-zoom en dispositivos táctiles
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
      
      // Prevenir doble tap zoom en iOS
      if (platform.isIOS) {
        const target = e.target as HTMLElement;
        if (!target.closest('input, textarea, select, button, a, [role="button"]')) {
          e.preventDefault();
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Deshabilitar pinch-to-zoom en dispositivos táctiles
      if (e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    const handleGestureStart = (e: any) => {
      // Prevenir gestos de zoom en iOS Safari
      if (platform.isIOS) {
        e.preventDefault();
        return false;
      }
    };

    const handleGestureChange = (e: any) => {
      // Prevenir gestos de zoom en iOS Safari
      if (platform.isIOS) {
        e.preventDefault();
        return false;
      }
    };

    const handleGestureEnd = (e: any) => {
      // Prevenir gestos de zoom en iOS Safari
      if (platform.isIOS) {
        e.preventDefault();
        return false;
      }
    };

    // Agregar event listeners
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Event listeners específicos para iOS
    if (platform.isIOS) {
      document.addEventListener('gesturestart', handleGestureStart, { passive: false });
      document.addEventListener('gesturechange', handleGestureChange, { passive: false });
      document.addEventListener('gestureend', handleGestureEnd, { passive: false });
    }

    // Optimizaciones específicas para Android
    if (platform.isAndroid) {
      // Prevenir zoom en Chrome Android
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchstart', handleTouchStart);
      
      if (platform.isIOS) {
        document.removeEventListener('gesturestart', handleGestureStart);
        document.removeEventListener('gesturechange', handleGestureChange);
        document.removeEventListener('gestureend', handleGestureEnd);
      }
    };
  }, []);

  return (
    <AdminProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/*" element={
                <>
                  <Header />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/tv" element={<TVShows />} />
                      <Route path="/anime" element={<Anime />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/movie/:id" element={<MovieDetail />} />
                      <Route path="/tv/:id" element={<TVDetail />} />
                      <Route path="/cart" element={<Cart />} />
                    </Routes>
                  </main>
                </>
              } />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AdminProvider>
  );
}

export default App;