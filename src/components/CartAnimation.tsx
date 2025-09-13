import React, { useEffect, useState } from 'react';
import { ShoppingCart, Check, Plus, Sparkles, Star, Heart, Zap } from 'lucide-react';

interface CartAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export function CartAnimation({ show, onComplete }: CartAnimationProps) {
  const [stage, setStage] = useState<'hidden' | 'flying' | 'sparkle' | 'success' | 'celebration' | 'complete'>('hidden');

  useEffect(() => {
    if (show) {
      setStage('flying');
      
      const timer1 = setTimeout(() => {
        setStage('sparkle');
      }, 800);

      const timer2 = setTimeout(() => {
        setStage('celebration');
      }, 1000);

      const timer3 = setTimeout(() => {
        setStage('success');
      }, 1600);

      const timer4 = setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 2400);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    } else {
      setStage('hidden');
    }
  }, [show, onComplete]);

  if (stage === 'hidden' || stage === 'complete') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {/* Enhanced background with animated gradient */}
      <div className={`absolute inset-0 transition-all duration-1000 ${
        stage === 'flying' ? 'bg-gradient-to-r from-blue-500/5 via-purple-500/10 to-pink-500/5' :
        stage === 'sparkle' ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/15 to-yellow-500/10' :
        stage === 'celebration' ? 'bg-gradient-to-r from-green-500/10 via-blue-500/15 to-purple-500/10' :
        stage === 'success' ? 'bg-gradient-to-r from-green-500/15 via-emerald-500/20 to-teal-500/15' :
        'bg-transparent'
      } animate-pulse`} />
      
      {stage === 'flying' && (
        <div className="relative">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-8 rounded-full shadow-2xl animate-bounce transform scale-125 relative overflow-hidden">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full animate-spin" />
            <ShoppingCart className="h-12 w-12 animate-pulse relative z-10" />
          </div>
          
          {/* Enhanced plus indicator */}
          <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white p-3 rounded-full animate-ping shadow-lg">
            <Plus className="h-5 w-5 animate-spin" />
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 animate-spin">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-3 h-3 rounded-full animate-bounce`}
                style={{
                  backgroundColor: ['#fbbf24', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'][i],
                  top: `${20 + Math.sin(i * Math.PI / 4) * 80}px`,
                  left: `${20 + Math.cos(i * Math.PI / 4) * 80}px`,
                  animationDelay: `${i * 100}ms`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {stage === 'sparkle' && (
        <div className="relative">
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-white p-10 rounded-full shadow-2xl animate-pulse transform scale-150 relative overflow-hidden">
            {/* Rotating inner ring */}
            <div className="absolute inset-2 border-4 border-white/30 rounded-full animate-spin" />
            <Sparkles className="h-14 w-14 animate-spin relative z-10" />
          </div>
          
          {/* Sparkle effects */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: `${30 + Math.sin(i * Math.PI / 6) * 100}px`,
                left: `${30 + Math.cos(i * Math.PI / 6) * 100}px`,
                animationDelay: `${i * 80}ms`
              }}
            >
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
            </div>
          ))}
          
          {/* Multiple ripple effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full animate-ping opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full animate-ping opacity-20 animation-delay-200"></div>
        </div>
      )}
      
      {stage === 'celebration' && (
        <div className="relative">
          <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white p-12 rounded-full shadow-2xl animate-bounce transform scale-175 relative overflow-hidden">
            {/* Pulsing inner glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-full animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-spin" />
            <Heart className="h-16 w-16 animate-pulse relative z-10 fill-white" />
          </div>
          
          {/* Celebration burst */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                top: `${-30 + Math.sin(i * Math.PI / 8) * 120}px`,
                left: `${-30 + Math.cos(i * Math.PI / 8) * 120}px`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '1.2s'
              }}
            >
              <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
          ))}
        </div>
      )}
      
      {stage === 'success' && (
        <div className="relative">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white p-10 rounded-full shadow-2xl animate-bounce transform scale-200 relative overflow-hidden">
            {/* Success glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent rounded-full animate-pulse" />
            <Check className="h-14 w-14 relative z-10 animate-pulse" />
          </div>
          
          {/* Success ripples */}
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-50"></div>
          <div className="absolute inset-0 bg-green-300 rounded-full animate-ping opacity-30 animation-delay-200"></div>
          <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-15 animation-delay-400"></div>
          <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-10 animation-delay-600"></div>
          
          {/* Confetti effect */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                top: `${-40 + Math.random() * 80}px`,
                left: `${-40 + Math.random() * 80}px`,
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDelay: `${i * 50}ms`,
                animationDuration: '1.5s'
              }}
            >
              <div 
                className="w-3 h-6 rounded-sm"
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][i % 8]
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}