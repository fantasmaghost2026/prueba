import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Plus, Check, Eye, BookOpen, Globe, Monitor, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Toast } from './Toast';
import type { NovelCartItem } from '../types/movie';

interface NovelCardProps {
  novel: {
    id: number;
    titulo: string;
    genero: string;
    capitulos: number;
    año: number;
    descripcion?: string;
    pais?: string;
    imagen?: string;
    estado?: 'transmision' | 'finalizada';
  };
}

export function NovelCard({ novel }: NovelCardProps) {
  const { addNovel, removeItem, isInCart, getCurrentPrices } = useCart();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);
  
  const currentPrices = getCurrentPrices();
  const inCart = isInCart(novel.id);

  const getNovelImage = (novel: any) => {
    if (novel.imagen) {
      return novel.imagen;
    }
    // Imagen por defecto basada en el género
    const genreImages = {
      'Drama': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      'Romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=400&fit=crop',
      'Acción': 'https://images.unsplash.com/photo-1489599843253-c76cc4bcb8cf?w=300&h=400&fit=crop',
      'Comedia': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop',
      'Familia': 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=400&fit=crop'
    };
    
    return genreImages[novel.genero as keyof typeof genreImages] || 
           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
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

  const handleCartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToCart(true);
    setTimeout(() => setIsAddingToCart(false), 1000);

    if (inCart) {
      removeItem(novel.id);
      setToastMessage(`"${novel.titulo}" retirada del carrito`);
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
        paymentType: 'cash',
        pricePerChapter: currentPrices.novelPricePerChapter,
        totalPrice: novel.capitulos * currentPrices.novelPricePerChapter
      };

      addNovel(novelCartItem);
      setToastMessage(`"${novel.titulo}" agregada al carrito`);
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const basePrice = novel.capitulos * currentPrices.novelPricePerChapter;

  return (
    <>
      <div 
        className={`group relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 transform ${
          isHovered 
            ? 'shadow-md scale-[1.01] -translate-y-0.5' 
            : 'hover:shadow-md'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Border effect */}
        <div className={`absolute inset-0 rounded-xl border-2 transition-all duration-200 ${
          isHovered ? 'border-pink-200' : 'border-transparent'
        }`} />
        
        {/* Status badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
            novel.estado === 'transmision' ? 'bg-red-500' : 'bg-green-500'
          }`}>
            {novel.estado === 'transmision' ? '📡 LIVE' : '✅ COMPLETA'}
          </span>
        </div>

        {/* Country flag */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium">
            {getCountryFlag(novel.pais || 'No especificado')}
          </span>
        </div>

        <div className="relative overflow-hidden">
          <img
            src={getNovelImage(novel)}
            alt={novel.titulo}
            className={`w-full h-80 object-cover transition-all duration-200 ${
              isHovered ? 'scale-102' : ''
            }`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop';
            }}
          />
          
          {/* Overlay on hover */}
          <div className={`absolute inset-0 transition-all duration-200 ${
            isHovered 
              ? 'bg-gradient-to-t from-black/20 via-transparent to-transparent' 
              : 'bg-black/0'
          }`} />
          
          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="text-white text-xs">
              <div className="flex items-center justify-between">
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                  {novel.año}
                </span>
                <span className="bg-purple-500/80 px-2 py-1 rounded-full text-xs font-bold">
                  {novel.capitulos} cap.
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 relative">
          <h3 className={`font-semibold text-gray-900 mb-2 line-clamp-2 transition-all duration-200 ${
            isHovered 
              ? 'text-pink-700' 
              : 'text-gray-900'
          }`}>
            {novel.titulo}
          </h3>
          
          <div className={`flex items-center text-gray-500 text-sm mb-3 transition-all duration-200 ${
            isHovered ? 'text-pink-500' : 'text-gray-500'
          }`}>
            <Calendar className="h-4 w-4 mr-2" />
            <span>{novel.año}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              {novel.genero}
            </span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {getCountryFlag(novel.pais || 'No especificado')} {novel.pais || 'No especificado'}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {novel.descripcion || 'Sin descripción disponible'}
          </p>
          
          {/* Price display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4 border border-purple-200">
            <div className="text-center">
              <div className="text-sm font-bold text-purple-600 mb-1">Precio</div>
              <div className="text-lg font-bold text-purple-800">
                ${basePrice.toLocaleString()} CUP
              </div>
              <div className="text-xs text-gray-500">
                ${currentPrices.novelPricePerChapter} CUP × {novel.capitulos} cap.
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleCartAction}
            disabled={isAddingToCart}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-200 transform relative overflow-hidden ${
              inCart
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                : 'bg-pink-500 hover:bg-pink-600 text-white hover:shadow-md'
            } ${isAddingToCart ? 'scale-95' : 'hover:scale-[1.01]'}`}
          >
            {isAddingToCart && (
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
            
            <div className="flex items-center justify-center">
              {inCart ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  <span>En el Carrito</span>
                  <CheckCircle className="ml-2 h-4 w-4 text-green-300" />
                </>
              ) : isAddingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Agregar al Carrito</span>
                </>
              )}
            </div>
          </button>

          {/* View Details Link */}
          <Link
            to={`/novel/${novel.id}`}
            className="w-full mt-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border border-gray-300 text-gray-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 flex items-center justify-center"
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver Detalles
          </Link>
        </div>
        
        {/* Selection indicator */}
        {inCart && (
          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg z-30">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      
      <Toast
        message={toastMessage}
        type={inCart ? "success" : "success"}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}