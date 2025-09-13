// System export utilities for comprehensive backup and configuration management

export const generateSystemReadme = (adminState: any) => `# TV a la Carta - Sistema de Gestión

## Descripción
Sistema completo de gestión para TV a la Carta con panel de administración, carrito de compras y sincronización en tiempo real.

## Versión
${adminState.systemConfig?.version || '2.1.0'}

## Última Exportación
${new Date().toISOString()}

## Configuración Actual

### Precios
- Películas: $${adminState.prices?.moviePrice || 80} CUP
- Series: $${adminState.prices?.seriesPrice || 300} CUP por temporada
- Recargo transferencia: ${adminState.prices?.transferFeePercentage || 10}%
- Novelas: $${adminState.prices?.novelPricePerChapter || 5} CUP por capítulo

### Zonas de Entrega
Total configuradas: ${adminState.deliveryZones?.length || 0}

### Novelas Administradas
Total: ${adminState.novels?.length || 0}

## Características
- ✅ Panel de administración completo
- ✅ Sincronización en tiempo real
- ✅ Gestión de precios dinámicos
- ✅ Zonas de entrega personalizables
- ✅ Catálogo de novelas administrable
- ✅ Sistema de notificaciones
- ✅ Exportación/Importación de configuración
- ✅ Optimización de rendimiento
- ✅ Carrito de compras avanzado
- ✅ Integración con WhatsApp

## Instalación
\`\`\`bash
npm install
npm run dev
\`\`\`

## Uso del Panel de Administración
1. Acceder a /admin
2. Usuario: admin
3. Contraseña: admin123

## Tecnologías
- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router
- Lucide Icons
- JSZip

## Contacto
WhatsApp: +5354690878
`;

export const generateSystemConfig = (adminState: any) => {
  const config = {
    version: adminState.systemConfig?.version || '2.1.0',
    lastExport: new Date().toISOString(),
    exportedBy: 'TV a la Carta Admin Panel',
    prices: adminState.prices || {
      moviePrice: 80,
      seriesPrice: 300,
      transferFeePercentage: 10,
      novelPricePerChapter: 5,
    },
    deliveryZones: adminState.deliveryZones || [],
    novels: adminState.novels || [],
    settings: adminState.systemConfig?.settings || {
      autoSync: true,
      syncInterval: 300000,
      enableNotifications: true,
      maxNotifications: 100,
    },
    metadata: {
      totalOrders: adminState.systemConfig?.metadata?.totalOrders || 0,
      totalRevenue: adminState.systemConfig?.metadata?.totalRevenue || 0,
      lastOrderDate: adminState.systemConfig?.metadata?.lastOrderDate || '',
      systemUptime: adminState.systemConfig?.metadata?.systemUptime || new Date().toISOString(),
      exportTimestamp: new Date().toISOString(),
    },
    notifications: adminState.notifications || [],
    syncStatus: adminState.syncStatus || {
      lastSync: new Date().toISOString(),
      isOnline: true,
      pendingChanges: 0,
    }
  };
  
  return JSON.stringify(config, null, 2);
};

export const generateUpdatedPackageJson = () => `{
  "name": "tv-a-la-carta-sistema-completo",
  "private": true,
  "version": "2.1.0",
  "type": "module",
  "description": "Sistema completo de gestión para TV a la Carta con panel de administración",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@types/node": "^24.2.1",
    "jszip": "^3.10.1",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.8.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  },
  "keywords": [
    "tv",
    "movies",
    "series",
    "anime",
    "streaming",
    "cart",
    "admin",
    "react",
    "typescript"
  ],
  "author": "TV a la Carta",
  "license": "MIT"
}`;

// Additional utility functions for complete system export
export const getViteConfig = () => `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});`;

export const getTailwindConfig = () => `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};`;

export const getIndexHtml = () => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/unnamed.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <base href="/" />
    <title>TV a la Carta: Películas y series ilimitadas y mucho más</title>
    <style>
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      
      body {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        text-size-adjust: 100%;
        touch-action: manipulation;
      }
      
      input[type="text"],
      input[type="email"],
      input[type="tel"],
      input[type="password"],
      input[type="number"],
      input[type="search"],
      textarea,
      select {
        font-size: 16px !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

export const getNetlifyRedirects = () => `# Netlify redirects for SPA routing
/*    /index.html   200

# Handle specific routes
/movies    /index.html   200
/tv        /index.html   200
/anime     /index.html   200
/cart      /index.html   200
/search    /index.html   200
/movie/*   /index.html   200
/tv/*      /index.html   200
/admin     /index.html   200`;

export const getVercelConfig = () => `{ "rewrites": [{ "source": "/(.*)", "destination": "/" }] }`;

// Component source code generators
export const getMainTsxSource = () => `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);`;

export const getIndexCssSource = () => `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
    touch-action: manipulation;
  }
  
  body {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    overflow-x: hidden;
  }
  
  input, textarea, [contenteditable="true"] {
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    user-select: text !important;
  }
  
  input[type="text"],
  input[type="email"],
  input[type="tel"],
  input[type="password"],
  input[type="number"],
  input[type="search"],
  textarea,
  select {
    font-size: 16px !important;
    transform: translateZ(0);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    pointer-events: none;
  }
  
  button, a, [role="button"], .clickable {
    pointer-events: auto;
  }
  
  button img, a img, [role="button"] img, .clickable img {
    pointer-events: none;
  }
  
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
  
  .animate-shrink {
    animation: shrink 3s linear forwards;
  }
}`;

// Placeholder functions for other components (these would contain the actual source code)
export const getAppTsxSource = () => `// App.tsx source code would be here`;
export const getAdminContextSource = (state: any) => `// AdminContext.tsx source code with state: ${JSON.stringify(state, null, 2)}`;
export const getCartContextSource = (state: any) => `// CartContext.tsx source code with state`;
export const getCheckoutModalSource = (state: any) => `// CheckoutModal.tsx source code with state`;
export const getPriceCardSource = (state: any) => `// PriceCard.tsx source code with state`;
export const getNovelasModalSource = (state: any) => `// NovelasModal.tsx source code with state`;
export const getToastSource = () => `// Toast.tsx source code`;
export const getOptimizedImageSource = () => `// OptimizedImage.tsx source code`;
export const getLoadingSpinnerSource = () => `// LoadingSpinner.tsx source code`;
export const getErrorMessageSource = () => `// ErrorMessage.tsx source code`;
export const getSystemExportSource = () => `// systemExport.ts source code`;
export const getWhatsAppUtilsSource = () => `// whatsapp.ts source code`;
export const getPerformanceUtilsSource = () => `// performance.ts source code`;
export const getErrorHandlerSource = () => `// errorHandler.ts source code`;
export const getTmdbServiceSource = () => `// tmdb.ts source code`;
export const getApiServiceSource = () => `// api.ts source code`;
export const getContentSyncSource = () => `// contentSync.ts source code`;
export const getApiConfigSource = () => `// api.ts config source code`;
export const getMovieTypesSource = () => `// movie.ts types source code`;
export const getOptimizedContentHookSource = () => `// useOptimizedContent.ts source code`;
export const getPerformanceHookSource = () => `// usePerformance.ts source code`;
export const getContentSyncHookSource = () => `// useContentSync.ts source code`;
export const getHomePageSource = () => `// Home.tsx source code`;
export const getMoviesPageSource = () => `// Movies.tsx source code`;
export const getTVShowsPageSource = () => `// TVShows.tsx source code`;
export const getAnimePageSource = () => `// Anime.tsx source code`;
export const getSearchPageSource = () => `// Search.tsx source code`;
export const getCartPageSource = () => `// Cart.tsx source code`;
export const getMovieDetailPageSource = () => `// MovieDetail.tsx source code`;
export const getTVDetailPageSource = () => `// TVDetail.tsx source code`;
export const getAdminPanelSource = () => `// AdminPanel.tsx source code`;