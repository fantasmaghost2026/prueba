import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, BookOpen, Plus, X, Globe, DollarSign, CreditCard, Users, MapPin, Sparkles, Heart, Zap, Check, CheckCircle, Info, Play, Monitor } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { PriceCard } from '../components/PriceCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import type { NovelCartItem } from '../types/movie';

interface NovelDetails {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  pais?: string;
  imagen?: string;
  estado?: 'transmision' | 'finalizada';
  createdAt: string;
  updatedAt: string;
}

export function NovelDetail() {
  const { id } = useParams<{ id: string }>();
  const { state: adminState } = useAdmin();
  const [novel, setNovel] = useState<NovelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [showCartAnimation, setShowCartAnimation] = useState(false);
  const [paymentType, setPaymentType] = useState<'cash' | 'transfer'>('cash');
  const { addNovel, removeItem, isInCart, getCurrentPrices } = useCart();

  const novelId = parseInt(id || '0');
  const inCart = isInCart(novelId);
  const currentPrices = getCurrentPrices();

  useEffect(() => {
    const fetchNovelData = async () => {
      try {
        setLoading(true);
        
        // Find novel in admin state
        const foundNovel = adminState.novels?.find(n => n.id === novelId);
        
        if (foundNovel) {
          setNovel(foundNovel);
        } else {
          setError('Novela no encontrada');
        }
      } catch (err) {
        setError('Error al cargar los detalles de la novela.');
        console.error('Error fetching novel details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (novelId) {
      fetchNovelData();
    }
  }, [novelId, adminState.novels]);

  const handleCartAction = () => {
    if (!novel) return;

    setShowCartAnimation(true);
    setTimeout(() => setShowCartAnimation(false), 2000);

    if (inCart) {
      removeItem(novel.id);
    } else {
      const novelCartItem: NovelCartItem = {
        id: novel.id,
        title: novel.titulo,
        type: 'novel',
        genre: novel.genero,
        chapters: novel.capitulos,
        year: novel.año,
        description: novel.descripcion,
        country: novel.pais,
        status: novel.estado,
        image: novel.imagen,
        paymentType: paymentType,
        pricePerChapter: currentPrices.novelPricePerChapter,
        totalPrice: paymentType === 'transfer' 
          ? Math.round((novel.capitulos * currentPrices.novelPricePerChapter) * (1 + currentPrices.transferFeePercentage / 100))
          : novel.capitulos * currentPrices.novelPricePerChapter
      };

      addNovel(novelCartItem);
    }
  };

  const getNovelImage = (novel: NovelDetails) => {
    if (novel.imagen) {
      return novel.imagen;
    }
    // Imagen por defecto basada en el género
    const genreImages = {
      'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop',
      'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&h=1200&fit=crop',
      'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=800&h=1200&fit=crop',
      'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop',
      'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=1200&fit=crop'
    };
    
    return genreImages[novel.genero as keyof typeof genreImages] || 
           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop';
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Turquía': '🇹🇷',
      'Cuba': '🇨🇺',
      'México': '🇲🇽',
      'Brasil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Argentina': '🇦🇷',
      'España': '🇪🇸',
      'Estados Unidos': '🇺🇸',
      'Corea del Sur': '🇰🇷',
      'India': '🇮🇳',
      'Reino Unido': '🇬🇧',
      'Francia': '🇫🇷',
      'Italia': '🇮🇹',
      'Alemania': '🇩🇪',
      'Japón': '🇯🇵',
      'China': '🇨🇳',
      'Rusia': '🇷🇺'
    };
    return flags[country] || '🌍';
  };

  const calculatePrice = (type: 'cash' | 'transfer') => {
    if (!novel) return 0;
    const basePrice = novel.capitulos * currentPrices.novelPricePerChapter;
    return type === 'transfer' 
      ? Math.round(basePrice * (1 + currentPrices.transferFeePercentage / 100))
      : basePrice;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorMessage message={error || 'Novela no encontrada'} />
      </div>
    );
  }

  const backdropUrl = getNovelImage(novel);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/"
              className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {novel.titulo}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{novel.año}</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 mr-1" />
                <span>{novel.capitulos} capítulos</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-1" />
                <span>{getCountryFlag(novel.pais || 'No especificado')} {novel.pais || 'No especificado'}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                {novel.genero}
              </span>
              <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-sm text-white ${
                novel.estado === 'transmision' ? 'bg-red-500/80' : 'bg-green-500/80'
              }`}>
                {novel.estado === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Overview */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl mr-4 shadow-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Sinopsis
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-4">
                {novel.descripcion || 'Sin descripción disponible.'}
              </p>
              
              {/* Novel specific information */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-pink-600 mr-2" />
                    <span className="font-semibold text-pink-800">Información de la Novela</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Género:</strong> {novel.genero}</p>
                    <p><strong>Capítulos:</strong> {novel.capitulos}</p>
                    <p><strong>País:</strong> {getCountryFlag(novel.pais || 'No especificado')} {novel.pais || 'No especificado'}</p>
                    <p><strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                        novel.estado === 'transmision' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {novel.estado === 'transmision' ? '📡 En Transmisión' : '✅ Finalizada'}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-semibold text-blue-800">Información de Precios</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Precio por capítulo:</strong> ${currentPrices.novelPricePerChapter} CUP</p>
                    <p><strong>Costo total (efectivo):</strong> ${(novel.capitulos * currentPrices.novelPricePerChapter).toLocaleString()} CUP</p>
                    <p><strong>Costo total (transferencia):</strong> ${Math.round((novel.capitulos * currentPrices.novelPricePerChapter) * (1 + currentPrices.transferFeePercentage / 100)).toLocaleString()} CUP</p>
                    <p className="text-orange-600"><strong>Recargo transferencia:</strong> +{currentPrices.transferFeePercentage}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <span className="text-lg">📚</span>
                  </div>
                  Detalles de la Novela
                </h3>
              </div>
              
              <div className="p-6">
                {/* Payment Type Selection */}
                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-800 mr-3">💳 Método de Pago:</span>
                    </div>
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setPaymentType('cash')}
                        className={`relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                          paymentType === 'cash'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 hover:bg-green-50 border-2 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        {paymentType === 'cash' && (
                          <div className="absolute -top-1 -right-1 bg-green-400 text-white p-1 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <DollarSign className="h-4 w-4 inline mr-2" />
                        Efectivo
                        {paymentType === 'cash' && (
                          <Sparkles className="h-3 w-3 inline ml-2 animate-pulse" />
                        )}
                      </button>
                      <button
                        onClick={() => setPaymentType('transfer')}
                        className={`relative px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                          paymentType === 'transfer'
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-600 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {paymentType === 'transfer' && (
                          <div className="absolute -top-1 -right-1 bg-orange-400 text-white p-1 rounded-full">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                        <CreditCard className="h-4 w-4 inline mr-2" />
                        Transferencia
                        <span className="ml-1 text-xs opacity-90">
                          (+{currentPrices.transferFeePercentage}%)
                        </span>
                        {paymentType === 'transfer' && (
                          <Zap className="h-3 w-3 inline ml-2 animate-pulse" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={handleCartAction}
                    onMouseEnter={() => setIsCartHovered(true)}
                    onMouseLeave={() => setIsCartHovered(false)}
                    className={`w-full mb-6 px-6 py-5 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center transform relative overflow-hidden ${
                      inCart
                        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white shadow-2xl scale-105'
                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white shadow-xl'
                    } ${isCartHovered ? 'scale-110 shadow-2xl' : ''} ${showCartAnimation ? 'animate-pulse' : ''}`}
                  >
                    {/* Animated background effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transition-all duration-500 ${
                      isCartHovered ? 'animate-pulse' : ''
                    }`} />
                    
                    {/* Floating icons */}
                    {isCartHovered && (
                      <>
                        <Sparkles className="absolute top-2 left-4 h-4 w-4 text-yellow-300 animate-bounce" />
                        <Heart className="absolute top-2 right-4 h-4 w-4 text-pink-300 animate-pulse" />
                        <Zap className="absolute bottom-2 left-6 h-4 w-4 text-blue-300 animate-bounce delay-100" />
                        <Star className="absolute bottom-2 right-6 h-4 w-4 text-yellow-300 animate-pulse delay-200" />
                      </>
                    )}
                    
                    {inCart ? (
                      <>
                        <X className={`mr-3 h-6 w-6 transition-transform duration-300 relative z-10 ${
                          isCartHovered ? 'rotate-90 scale-125' : ''
                        }`} />
                        <span className="relative z-10 text-lg">Retirar del Carrito</span>
                      </>
                    ) : (
                      <>
                        <Plus className={`mr-3 h-6 w-6 transition-transform duration-300 relative z-10 ${
                          isCartHovered ? 'rotate-180 scale-125' : ''
                        }`} />
                        <span className="relative z-10 text-lg">Agregar al Carrito</span>
                      </>
                    )}
                  </button>
                  
                  {/* Success indicator */}
                  {inCart && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-700 mb-2 flex items-center justify-center">
                        {paymentType === 'cash' ? (
                          <DollarSign className="h-4 w-4 mr-1" />
                        ) : (
                          <CreditCard className="h-4 w-4 mr-1" />
                        )}
                        {paymentType === 'cash' ? 'Efectivo' : 'Transferencia'}
                      </div>
                      <div className="text-3xl font-black text-green-800 mb-2">
                        ${calculatePrice(paymentType).toLocaleString()} CUP
                      </div>
                      {paymentType === 'transfer' && (
                        <div className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full">
                          +{currentPrices.transferFeePercentage}% incluido
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        ${currentPrices.novelPricePerChapter} CUP × {novel.capitulos} capítulos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-pink-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-pink-100 p-2 rounded-lg mr-3 shadow-sm">
                        <BookOpen className="h-4 w-4 text-pink-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Género</h3>
                    </div>
                    <p className="text-gray-700 font-medium ml-11">{novel.genero}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Monitor className="h-4 w-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Capítulos</h3>
                    </div>
                    <p className="text-gray-700 font-medium ml-11">{novel.capitulos}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Año</h3>
                    </div>
                    <p className="text-gray-700 font-medium ml-11">{novel.año}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-purple-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3 shadow-sm">
                        <Globe className="h-4 w-4 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">País de Origen</h3>
                    </div>
                    <p className="text-gray-700 font-medium ml-11">
                      {getCountryFlag(novel.pais || 'No especificado')} {novel.pais || 'No especificado'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-lg mr-3 shadow-sm ${
                        novel.estado === 'transmision' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <span className="text-sm">
                          {novel.estado === 'transmision' ? '📡' : '✅'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">Estado</h3>
                    </div>
                    <p className={`font-medium ml-11 ${
                      novel.estado === 'transmision' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {novel.estado === 'transmision' ? 'En Transmisión' : 'Finalizada'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}