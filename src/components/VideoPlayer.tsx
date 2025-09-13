import React, { useState } from 'react';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoKey: string;
  title: string;
}

export function VideoPlayer({ videoKey, title }: VideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoKey}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;

  const openInYouTube = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  // Siempre mostrar la opción de abrir en YouTube debido a las restricciones
  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden group">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60 hover:bg-black/40 transition-colors" />
      
      {/* Play button in top-right corner */}
      <button
        onClick={openInYouTube}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 rounded-full p-3 transition-all hover:scale-110 shadow-2xl z-10"
        title="Ver en YouTube"
      >
        <Play className="h-5 w-5 text-white ml-0.5" />
      </button>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-center text-white p-6">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm opacity-90 mb-4">
            Haz clic en el botón de reproducir para ver en YouTube
          </p>
        </div>
      </div>
    </div>
  );
}