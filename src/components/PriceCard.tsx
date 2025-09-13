import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';

// PRECIOS EMBEBIDOS - Generados automáticamente
const EMBEDDED_PRICES = {
  "moviePrice": 80,
  "seriesPrice": 300,
  "transferFeePercentage": 10,
  "novelPricePerChapter": 5
};

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCard({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  // Use embedded prices
  const moviePrice = EMBEDDED_PRICES.moviePrice;
  const seriesPrice = EMBEDDED_PRICES.seriesPrice;
  const transferFeePercentage = EMBEDDED_PRICES.transferFeePercentage;
  
  const calculatePrice = () => {
    if (type === 'movie') {
      return moviePrice;
    } else {
      // Series: dynamic price per season
      return selectedSeasons.length * seriesPrice;
    }
  };

  const price = calculatePrice();
  const transferPrice = Math.round(price * (1 + transferFeePercentage / 100));
  
  const getIcon = () => {
    if (type === 'movie') {
      return isAnime ? '🎌' : '🎬';
    }
    return isAnime ? '🎌' : '📺';
  };

  const getTypeLabel = () => {
    if (type === 'movie') {
      return isAnime ? 'Película Animada' : 'Película';
    }
    return isAnime ? 'Anime' : 'Serie';
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-green-300 shadow-xl transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-3 rounded-xl mr-4 shadow-lg">
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div>
            <h3 className="font-black text-green-800 text-lg">{getTypeLabel()}</h3>
            <p className="text-green-600 text-sm font-semibold">
              {type === 'tv' && selectedSeasons.length > 0 
                ? `${selectedSeasons.length} temporada${selectedSeasons.length > 1 ? 's' : ''}`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-full shadow-lg animate-pulse">
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Cash Price */}
        <div className="bg-gradient-to-r from-white to-green-50 rounded-xl p-4 border-2 border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-green-700 flex items-center">
              <div className="bg-green-100 p-1 rounded-lg mr-2">
                <DollarSign className="h-4 w-4" />
              </div>
              Efectivo
            </span>
            <span className="text-xl font-black text-green-700">
              ${price.toLocaleString()} CUP
            </span>
          </div>
        </div>
        
        {/* Transfer Price */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-orange-700 flex items-center">
              <div className="bg-orange-100 p-1 rounded-lg mr-2">
                <CreditCard className="h-4 w-4" />
              </div>
              Transferencia
            </span>
            <span className="text-xl font-black text-orange-700">
              ${transferPrice.toLocaleString()} CUP
            </span>
          </div>
          <div className="text-sm text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full text-center">
            +{transferFeePercentage}% recargo bancario
          </div>
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className="text-sm text-green-600 font-bold text-center bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-3 border border-green-200">
            ${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
          </div>
        )}
      </div>
    </div>
  );
}