import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeIndicatorProps {
  show?: boolean;
  side: 'left' | 'right';
}

export function SwipeIndicator({ show = false, side }: SwipeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed ${side === 'left' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 z-50 pointer-events-none`}
    >
      <div className="bg-black/80 text-white p-4 rounded-full shadow-2xl animate-pulse">
        {side === 'left' ? (
          <ChevronLeft className="h-8 w-8" />
        ) : (
          <ChevronRight className="h-8 w-8" />
        )}
      </div>
    </div>
  );
}
