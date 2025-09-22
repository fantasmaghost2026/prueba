import React from 'react';
import { DollarSign, Tv, Film, Star, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface PriceCardProps {
  type: 'movie' | 'tv';
  selectedSeasons?: number[];
  episodeCount?: number;
  isAnime?: boolean;
}

export function PriceCard({ type, selectedSeasons = [], episodeCount = 0, isAnime = false }: PriceCardProps) {
  const { getCurrentPrices } = useCart();
  const currentPrices = getCurrentPrices();
  
  const moviePrice = currentPrices.moviePrice;
  const seriesPrice = currentPrices.seriesPrice;
  const transferFeePercentage = currentPrices.transferFeePercentage;
  
  // Check if this is a series with 50+ episodes
  const isExtendedSeries = type === 'tv' && episodeCount > 50;
  
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
    <div className={`rounded-2xl p-6 border-2 shadow-xl transform hover:scale-105 transition-all duration-300 ${
      isExtendedSeries 
        ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-300' 
        : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300'
    }`}>
      {/* Extended series information banner */}
      {isExtendedSeries && (
        <div className="mb-4 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl border-2 border-amber-300 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg mr-3 shadow-sm">
              <span className="text-white text-sm font-bold">📊</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Serie con Episodios Extendidos</h4>
              <p className="text-xs text-amber-700">{episodeCount} episodios totales</p>
            </div>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-amber-200">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center">
                <p className="font-bold text-amber-800">Política de Precios</p>
                <p className="text-amber-700">$300 CUP por temporada</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-800">Sin Recargos</p>
                <p className="text-green-700">Precio fijo garantizado</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl mr-4 shadow-lg ${
            isExtendedSeries 
              ? 'bg-gradient-to-r from-amber-400 to-orange-400' 
              : 'bg-gradient-to-r from-green-400 to-emerald-400'
          }`}>
            <span className="text-2xl">{getIcon()}</span>
          </div>
          <div>
            <h3 className={`font-black text-lg ${
              isExtendedSeries ? 'text-amber-800' : 'text-green-800'
            }`}>{getTypeLabel()}</h3>
            <p className={`text-sm font-semibold ${
              isExtendedSeries ? 'text-amber-600' : 'text-green-600'
            }`}>
              {type === 'tv' && selectedSeasons.length > 0 
                ? `${selectedSeasons.length} temporada${selectedSeasons.length > 1 ? 's' : ''}`
                : 'Contenido completo'
              }
            </p>
          </div>
        </div>
        <div className={`text-white p-3 rounded-full shadow-lg animate-pulse ${
          isExtendedSeries 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500'
        }`}>
          <DollarSign className="h-4 w-4" />
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Cash Price */}
        <div className={`rounded-xl p-4 border-2 shadow-md hover:shadow-lg transition-all duration-300 ${
          isExtendedSeries 
            ? 'bg-gradient-to-r from-white to-amber-50 border-amber-200' 
            : 'bg-gradient-to-r from-white to-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-bold flex items-center ${
              isExtendedSeries ? 'text-amber-700' : 'text-green-700'
            }`}>
              <div className={`p-1 rounded-lg mr-2 ${
                isExtendedSeries ? 'bg-amber-100' : 'bg-green-100'
              }`}>
                <DollarSign className="h-4 w-4" />
              </div>
              Efectivo
            </span>
            <span className={`text-xl font-black ${
              isExtendedSeries ? 'text-amber-700' : 'text-green-700'
            }`}>
              ${price.toLocaleString()} CUP
            </span>
          </div>
          {isExtendedSeries && (
            <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-center font-medium">
              Serie extensa: Precio estándar aplicado
            </div>
          )}
        </div>
        
        {/* Transfer Price */}
        <div className={`rounded-xl p-4 border-2 shadow-md hover:shadow-lg transition-all duration-300 ${
          isExtendedSeries 
            ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
            : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
        }`}>
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
          {isExtendedSeries && (
            <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full text-center font-medium">
              Recargo estándar: Sin costos adicionales por episodios
            </div>
          )}
        </div>
        
        {type === 'tv' && selectedSeasons.length > 0 && (
          <div className={`text-sm font-bold text-center rounded-xl p-3 border ${
            isExtendedSeries 
              ? 'text-amber-600 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-200' 
              : 'text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 border-green-200'
          }`}>
            ${(price / selectedSeasons.length).toLocaleString()} CUP por temporada (efectivo)
            {isExtendedSeries && (
              <div className="mt-1 text-xs text-amber-500">
                ⭐ Precio especial para series extensas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}