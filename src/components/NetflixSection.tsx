import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NetflixSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  showViewAll?: boolean;
  onViewAllClick?: () => void;
}

export function NetflixSection({
  title,
  icon,
  children,
  showViewAll = false,
  onViewAllClick
}: NetflixSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  React.useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          {title}
        </h2>
        {showViewAll && onViewAllClick && (
          <button
            onClick={onViewAllClick}
            className="text-blue-600 hover:text-blue-800 flex items-center font-medium text-sm sm:text-base transition-colors"
          >
            Ver todas
            <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative group">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 sm:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex gap-3 sm:gap-4 px-4 sm:px-0 pb-4" style={{ minWidth: 'min-content' }}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
