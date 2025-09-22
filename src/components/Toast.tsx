import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, ShoppingCart, Trash2, Plus } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar dispositivo móvil para ajustar posición
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      const isMobileDevice = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                            screenWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div className={`fixed ${isMobile ? 'top-16 left-4 right-4' : 'top-20 right-4'} z-50 transform transition-all duration-500 safe-area-padding ${
      isAnimating ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`}>
      <div className={`flex items-center ${isMobile ? 'p-3' : 'p-4'} rounded-2xl shadow-2xl ${isMobile ? 'w-full' : 'max-w-sm'} backdrop-blur-sm border-2 touch-target ${
        type === 'success' 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-300' 
          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-300'
      } animate-bounce`}>
        <div className={`flex-shrink-0 ${isMobile ? 'mr-2' : 'mr-3'} p-2 rounded-full ${
          type === 'success' ? 'bg-white/20' : 'bg-white/20'
        } animate-pulse`}>
          {type === 'success' ? (
            message.includes('agregado') ? (
              <Plus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            ) : (
              <CheckCircle className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            )
          ) : (
            <Trash2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>{message}</p>
        </div>
        <button
          onClick={() => {
            setIsAnimating(false);
            setTimeout(onClose, 300);
          }}
          className={`flex-shrink-0 ${isMobile ? 'ml-2' : 'ml-3'} hover:bg-white/20 rounded-full p-2 transition-all duration-300 hover:scale-110 touch-target`}
        >
          <X className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
        </button>
        
        {/* Animated progress bar */}
        <div className={`absolute bottom-0 left-0 h-1 rounded-b-2xl ${
          type === 'success' ? 'bg-white/30' : 'bg-white/30'
        } animate-pulse`}>
          <div className={`h-full rounded-b-2xl ${
            type === 'success' ? 'bg-white' : 'bg-white'
          } animate-[shrink_3s_linear_forwards]`} />
        </div>
      </div>
    </div>
  );
}