import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NovelCard } from './NovelCard';
import { useTouchSwipe } from '../hooks/useTouchSwipe';

interface Novel {
  id: number;
  titulo: string;
  genero: string;
  capitulos: number;
  año: number;
  descripcion?: string;
  paymentType?: 'cash' | 'transfer';
  pais?: string;
  imagen?: string;
  estado?: 'transmision' | 'finalizada';
}

interface NetflixNovelSectionProps {
  novels: Novel[];
}

export function NetflixNovelSection({ novels }: NetflixNovelSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      const targetScroll = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      setTimeout(checkScroll, 300);
    }
  };

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    swipeVelocity
  } = useTouchSwipe({
    scrollRef,
    onSwipeLeft: () => canScrollLeft && scroll('left'),
    onSwipeRight: () => canScrollRight && scroll('right'),
    threshold: 50,
    velocityThreshold: 0.3,
    preventScroll: false
  });

  React.useEffect(() => {
    checkScroll();
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();

    window.addEventListener('resize', checkScroll);
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, [novels]);

  if (novels.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg ${
            isMobile ? 'opacity-60 active:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full transition-all duration-300 shadow-lg ${
            isMobile ? 'opacity-60 active:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className="overflow-x-auto scrollbar-hide touch-pan-x swipe-container momentum-scroll cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          transform: swipeVelocity > 0 ? 'translateZ(0)' : undefined,
          touchAction: 'pan-x',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
      >
        <div className="flex gap-4 pb-4" style={{ minWidth: 'min-content' }}>
          {novels.map((novel) => (
            <div key={novel.id} className="flex-shrink-0 w-64">
              <NovelCard novel={novel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
