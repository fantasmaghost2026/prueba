import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Star, Calendar, MessageCircle, ArrowLeft, CreditCard as Edit3, Monitor, DollarSign, CreditCard, Calculator, Sparkles, Zap, Heart, Check, X, Clapperboard, Send, BookOpen } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { AdminContext } from '../context/AdminContext';
import { PriceCard } from '../components/PriceCard';
import { CheckoutModal, OrderData, CustomerInfo } from '../components/CheckoutModal';
import { NovelasModal } from '../components/NovelasModal';
import { sendOrderToWhatsApp } from '../utils/whatsapp';
import { IMAGE_BASE_URL, POSTER_SIZE } from '../config/api';
import type { NovelCartItem } from '../types/movie';

export function Cart() {
  const { state, removeItem, clearCart, updatePaymentType, calculateItemPrice, calculateTotalPrice, calculateTotalByPaymentType } = useCart();
  const adminContext = React.useContext(AdminContext);
  const [showCheckoutModal, setShowCheckoutModal] = React.useState(false);
  const [showNovelasModal, setShowNovelasModal] = React.useState(false);

  const handleCheckout = (orderData: OrderData) => {
    // Calculate totals
    const totalsByPaymentType = calculateTotalByPaymentType();
    const subtotal = totalsByPaymentType.cash + totalsByPaymentType.transfer;
    const transferFee = 0;
    const total = subtotal + orderData.deliveryCost;
    
    // Complete the order data with cart information
    const completeOrderData: OrderData = {
      ...orderData,
      items: state.items,
      subtotal,
      transferFee,
      total,
      cashTotal: totalsByPaymentType.cash,
      transferTotal: totalsByPaymentType.transfer
    };
    
    sendOrderToWhatsApp(completeOrderData);
    setShowCheckoutModal(false);
  };

  const handleOpenNovelas = () => {
    setShowNovelasModal(true);
  };

  const getItemUrl = (item: any) => {
    if (item.type === 'novel') return '#';
    return `/${item.type}/${item.id}`;
  };

  const getItemYear = (item: any) => {
    if (item.type === 'novel') return item.year;
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : 'N/A';
  };

  const getPosterUrl = (posterPath: string | null) => {
    return posterPath
      ? `${IMAGE_BASE_URL}/${POSTER_SIZE}${posterPath}`
      : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=750&fit=crop&crop=center';
  };

  const getNovelImage = (novel: NovelCartItem) => {
    if (novel.image) {
      return novel.image;
    }
    // Imagen por defecto basada en el género
    const genreImages = {
      'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop',
      'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=300&h=400&fit=crop',
      'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop',
      'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop'
    };
    
    return genreImages[novel.genre as keyof typeof genreImages] || 
           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
  };

  const isAnime = (item: any) => {
    if (item.type === 'novel') return false;
    return item.original_language === 'ja' || 
           (item.genre_ids && item.genre_ids.includes(16)) ||
           item.title?.toLowerCase().includes('anime');
  };

  const totalPrice = calculateTotalPrice();
  const totalsByPaymentType = calculateTotalByPaymentType();
  const movieCount = state.items.filter(item => item.type === 'movie').length;
  const seriesCount = state.items.filter(item => item.type === 'tv').length;
  const novelCount = state.items.filter(item => item.type === 'novel').length;
  const animeCount = state.items.filter(item => isAnime(item)).length;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <ShoppingCart className="h-24 w-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <p className="text-gray-600 mb-8">
            Explora nuestro catálogo y agrega películas, series o anime a tu carrito.
          </p>
          <div className="flex flex-col space-y-3">
            <Link
              to="/movies"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Explorar Películas
            </Link>
            <Link
              to="/tv"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Ver Series
            </Link>
            <Link
              to="/anime"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Descubrir Anime
            </Link>
            <Link
              to="/admin"
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center flex items-center justify-center"
            >
              <span className="mr-2">⚙️</span>
              Panel de Control
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center justify-center sm:justify-start">
            <ShoppingCart className="mr-2 sm:mr-3 h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Carrito</h1>
          </div>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 flex items-center justify-center sm:justify-start font-medium text-sm sm:text-base"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Seguir explorando
          </Link>
        </div>

        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 sm:mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
                Elementos ({state.total})
              </h2>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors text-center"
              >
                Vaciar carrito
              </button>
              <button
                onClick={handleOpenNovelas}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
              >
                Ver Novelas
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {state.items.map((item) => (
              <div key={`${item.type}-${item.id}`} className={`p-6 hover:bg-gradient-to-r transition-all duration-300 border-l-4 border-transparent ${
                item.type === 'novel' 
                  ? 'hover:from-pink-50 hover:to-purple-50 hover:border-pink-400' 
                  : 'hover:from-blue-50 hover:to-purple-50 hover:border-blue-400'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Poster */}
                  {item.type === 'novel' ? (
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-24 h-36 sm:w-20 sm:h-28 rounded-xl shadow-lg overflow-hidden border-2 border-white">
                        <img
                          src={getNovelImage(item as NovelCartItem)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-1 left-1 right-1">
                          <div className="bg-pink-500/80 text-white px-1 py-0.5 rounded-full text-xs font-bold text-center">
                            <BookOpen className="h-3 w-3 inline mr-1" />
                            Novela
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to={getItemUrl(item)} className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={getPosterUrl(item.poster_path)}
                      alt={item.title}
                      className="w-24 h-36 sm:w-20 sm:h-28 object-cover rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white"
                    />
                    </Link>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">

                    {item.type === 'novel' ? (
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                        {item.title}
                      </h3>
                    ) : (
                      <Link
                        to={getItemUrl(item)}
                        className="block hover:text-blue-600 transition-colors mb-3"
                      >
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                          {item.title}
                        </h3>
                      </Link>
                    )}
                    
                    {item.type === 'tv' && 'selectedSeasons' in item && item.selectedSeasons && item.selectedSeasons.length > 0 && (
                      <div className="mb-3">
                        <span className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold border border-purple-200 shadow-sm">
                          <Monitor className="h-4 w-4 inline mr-2" />
                          Temporadas: {item.selectedSeasons.sort((a, b) => a - b).join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {item.type === 'novel' && (
                      <div className="mb-3">
                        <span className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 px-4 py-2 rounded-full text-sm font-semibold border border-pink-200 shadow-sm">
                          <BookOpen className="h-4 w-4 inline mr-2" />
                          {(item as NovelCartItem).chapters} capítulos • {(item as NovelCartItem).genre}
                          {(item as NovelCartItem).country && (
                            <span className="ml-2">• {(item as NovelCartItem).country}</span>
                          )}
                          {(item as NovelCartItem).status && (
                            <span className={`ml-2 ${
                              (item as NovelCartItem).status === 'transmision' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              • {(item as NovelCartItem).status === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-sm text-gray-600">
                      <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-2 rounded-full text-xs font-semibold border border-blue-200 shadow-sm">
                        {item.type === 'movie' ? 'Película' : item.type === 'tv' ? 'Serie' : 'Novela'}
                      </span>
                      <div className="inline-flex items-center bg-gray-50 px-3 py-2 rounded-full border border-gray-200">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{getItemYear(item)}</span>
                      </div>
                      {item.type !== 'novel' && (
                        <div className="inline-flex items-center bg-yellow-50 px-3 py-2 rounded-full border border-yellow-200">
                          <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                          <span>{item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
                        </div>
                      )}
                    </div>

                    {/* Modern Payment Type Selection */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-center sm:justify-start">
                          <span className="text-sm font-bold text-gray-800 mr-3">💳 Método de Pago:</span>
                        </div>
                        <div className="flex justify-center sm:justify-start space-x-3">
                          <button
                            onClick={() => updatePaymentType(item.id, 'cash')}
                            className={`relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                              item.paymentType === 'cash'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300'
                            }`}
                          >
                            {item.paymentType === 'cash' && (
                              <div className="absolute -top-1 -right-1 bg-green-400 text-white p-1 rounded-full">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <DollarSign className="h-4 w-4 inline mr-2" />
                            Efectivo
                            {item.paymentType === 'cash' && (
                              <Sparkles className="h-3 w-3 inline ml-2 animate-pulse" />
                            )}
                          </button>
                          <button
                            onClick={() => updatePaymentType(item.id, 'transfer')}
                            className={`relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                              item.paymentType === 'transfer'
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            {item.paymentType === 'transfer' && (
                              <div className="absolute -top-1 -right-1 bg-orange-400 text-white p-1 rounded-full">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                            <CreditCard className="h-4 w-4 inline mr-2" />
                            Transferencia
                            <span className="ml-1 text-xs opacity-90">
                              (+{adminContext?.state?.prices?.transferFeePercentage || 10}%)
                            </span>
                            {item.paymentType === 'transfer' && (
                              <Zap className="h-3 w-3 inline ml-2 animate-pulse" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 w-full sm:w-auto sm:ml-4 space-y-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200 shadow-lg sm:min-w-[160px] transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="text-sm font-bold text-green-700 mb-2 flex items-center justify-center">
                          {item.paymentType === 'cash' ? (
                            <DollarSign className="h-4 w-4 mr-1" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-1" />
                          )}
                          {item.paymentType === 'cash' ? 'Efectivo' : 'Transferencia'}
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-green-800 mb-1">
                          ${calculateItemPrice(item).toLocaleString()} CUP
                        </div>
                        {item.paymentType === 'transfer' && (
                          <div className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full">
                            +{adminContext?.state?.prices?.transferFeePercentage || 10}% incluido
                          </div>
                        )}
                        {/* Extended series indicator */}
                        {item.type === 'tv' && 'number_of_episodes' in item && item.number_of_episodes > 50 && (
                          <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-2 rounded-full border border-amber-300 shadow-sm">
                            <span className="text-amber-600 mr-1 text-xs">📊</span>
                            <span className="text-xs font-bold text-amber-700">Serie Extensa</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-center space-x-2">
                      {item.type === 'tv' && 'selectedSeasons' in item && (
                        <Link
                          to={getItemUrl(item)}
                          className="p-3 text-purple-600 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 bg-purple-50 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                          title="Editar temporadas"
                        >
                          <Edit3 className="h-5 w-5" />
                        </Link>
                      )}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-red-600 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 bg-red-50 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
                        title="Eliminar del carrito"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <h3 className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-start">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                Resumen del Pedido
              </h3>
              <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold">${totalPrice.toLocaleString()} CUP</div>
                <div className="text-sm opacity-90">{state.total} elementos</div>
              </div>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {/* Desglose por tipo de pago */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-center sm:justify-start">
                <Calculator className="mr-2 h-5 w-5 text-blue-600" />
                Desglose por Tipo de Pago
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-lg font-bold text-green-700">Efectivo</span>
                    </div>
                    <div className="text-2xl font-bold text-green-800 mb-2">
                      ${totalsByPaymentType.cash.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-green-600">
                      {state.items.filter(item => item.paymentType === 'cash').length} elementos
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-lg font-bold text-orange-700">Transferencia</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-800 mb-2">
                      ${totalsByPaymentType.transfer.toLocaleString()} CUP
                    </div>
                    <div className="text-sm text-orange-600">
                      {state.items.filter(item => item.paymentType === 'transfer').length} elementos (+10%)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-orange-100 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total General:</span>
                  <span className="text-2xl font-bold text-blue-600">${totalPrice.toLocaleString()} CUP</span>
                </div>
              </div>
            </div>

            {/* Desglose detallado de precios */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center justify-center sm:justify-start">
                <span className="text-lg mr-2">💰</span>
                Detalle de Elementos
              </h4>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {state.items.map((item) => {
                  const itemPrice = calculateItemPrice(item);
                  let basePrice: number;
                  if (item.type === 'novel') {
                    const novelItem = item as NovelCartItem;
                    basePrice = novelItem.chapters * novelItem.pricePerChapter;
                  } else if (item.type === 'movie') {
                    basePrice = 80;
                  } else {
                    basePrice = ('selectedSeasons' in item ? item.selectedSeasons?.length || 1 : 1) * 300;
                  }
                  return (
                    <div key={`${item.type}-${item.id}`} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm mb-1 break-words">{item.title}</p>
                        <p className="text-xs text-gray-600">
                          {item.type === 'movie' ? 'Película' : item.type === 'tv' ? 'Serie' : 'Novela'}
                          {'selectedSeasons' in item && item.selectedSeasons && item.selectedSeasons.length > 0 && 
                            ` • Temporadas: ${item.selectedSeasons.sort((a, b) => a - b).join(', ')}`
                          }
                          {item.type === 'novel' && 
                            ` • ${(item as NovelCartItem).chapters} capítulos • ${(item as NovelCartItem).genre}${(item as NovelCartItem).country ? ` • ${(item as NovelCartItem).country}` : ''}${(item as NovelCartItem).status ? ` • ${(item as NovelCartItem).status === 'transmision' ? 'En Transmisión' : 'Finalizada'}` : ''}`
                          }
                          {isAnime(item) && ' • Anime'}
                        </p>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            item.paymentType === 'cash' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {item.paymentType === 'cash' ? 'Efectivo' : 'Transferencia'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className={`font-bold ${item.paymentType === 'cash' ? 'text-green-600' : 'text-orange-600'}`}>
                          ${itemPrice.toLocaleString()} CUP
                        </p>
                        {item.paymentType === 'transfer' && (
                          <p className="text-xs text-gray-500">
                            Base: ${basePrice.toLocaleString()} CUP
                          </p>
                        )}
                        {item.type === 'tv' && 'selectedSeasons' in item && item.selectedSeasons && item.selectedSeasons.length > 0 && (
                          <p className="text-xs text-gray-500">
                            ${Math.round(itemPrice / item.selectedSeasons.length).toLocaleString()} CUP/temp.
                          </p>
                        )}
                        {item.type === 'novel' && (
                          <p className="text-xs text-gray-500">
                            ${(item as NovelCartItem).pricePerChapter.toLocaleString()} CUP/cap.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">${totalPrice.toLocaleString()} CUP</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Películas</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {movieCount}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit">
                    <Clapperboard className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Series/Anime</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {seriesCount}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit">
                    <Monitor className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-center sm:text-left">
                  <div>
                    <p className="text-sm font-medium text-pink-600 mb-1">Novelas</p>
                    <p className="text-2xl font-bold text-pink-800">{novelCount}</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-lg mx-auto sm:mx-0 mt-2 sm:mt-0 w-fit">
                    <BookOpen className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-center sm:text-left">Estadísticas del Pedido</h4>
              <div className="space-y-2">
                {state.items.filter(item => item.type !== 'novel').length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
                    <span className="text-gray-600">Promedio de calificación (películas/series):</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">
                        {(() => {
                          const ratedItems = state.items.filter(item => item.type !== 'novel' && item.vote_average);
                          return ratedItems.length > 0 
                            ? (ratedItems.reduce((acc, item) => acc + item.vote_average, 0) / ratedItems.length).toFixed(1)
                            : '0.0';
                        })()}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
                  <span className="text-gray-600">Contenido más reciente:</span>
                  <span className="font-medium">
                    {state.items.length > 0 
                      ? Math.max(...state.items.map(item => {
                          if (item.type === 'novel') return (item as NovelCartItem).year;
                          const date = item.release_date || item.first_air_date;
                          return date ? new Date(date).getFullYear() : 0;
                        }))
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={() => setShowCheckoutModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 active:scale-95 hover:shadow-lg touch-manipulation"
            >
              <Send className="mr-3 h-6 w-6" />
              Finalizar Pedido
            </button>
            
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <p className="text-sm text-green-700 text-center flex items-center justify-center">
                <span className="mr-2">📱</span>
                Complete sus datos para finalizar el pedido
              </p>
            </div>
          </div>
        </div>
        
        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onCheckout={handleCheckout}
          items={state.items.map(item => {
            if (item.type === 'novel') {
              const novelItem = item as NovelCartItem;
              return {
                id: item.id,
                title: item.title,
                price: calculateItemPrice(item),
                quantity: 1,
                type: 'novel',
                chapters: novelItem.chapters,
                genre: novelItem.genre,
                paymentType: item.paymentType
              };
            }
            return {
              id: item.id,
              title: item.title,
              price: calculateItemPrice(item),
              quantity: 1,
              type: item.type,
              selectedSeasons: 'selectedSeasons' in item ? item.selectedSeasons : undefined,
              paymentType: item.paymentType
            };
          })}
          total={totalPrice}
        />
        
        {/* Modal de Novelas */}
        <NovelasModal 
          isOpen={showNovelasModal} 
          onClose={() => setShowNovelasModal(false)} 
        />
      </div>
    </div>
  );
}