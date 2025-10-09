import { useState, useCallback, RefObject, useRef, useEffect } from 'react';

interface UseTouchSwipeProps {
  scrollRef: RefObject<HTMLDivElement>;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  velocityThreshold?: number;
  preventScroll?: boolean;
}

export function useTouchSwipe({
  scrollRef,
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  velocityThreshold = 0.3,
  preventScroll = true
}: UseTouchSwipeProps) {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeVelocity, setSwipeVelocity] = useState(0);
  const touchStartTime = useRef(0);
  const lastTouchX = useRef(0);
  const lastTouchTime = useRef(0);
  const isHorizontalSwipe = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    const x = touch.clientX;
    const y = touch.clientY;

    setTouchStartX(x);
    setTouchStartY(y);
    lastTouchX.current = x;
    touchStartTime.current = Date.now();
    lastTouchTime.current = Date.now();
    setIsDragging(true);
    setSwipeVelocity(0);
    isHorizontalSwipe.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isDragging) return;

    const touch = 'touches' in e ? e.touches[0] : e;
    const touchCurrentX = touch.clientX;
    const touchCurrentY = touch.clientY;
    const diffX = Math.abs(touchStartX - touchCurrentX);
    const diffY = Math.abs(touchStartY - touchCurrentY);

    // Determine if this is a horizontal or vertical swipe
    if (diffX > 10 || diffY > 10) {
      isHorizontalSwipe.current = diffX > diffY;
    }

    // Calculate velocity for smoother interactions
    const currentTime = Date.now();
    const deltaX = touchCurrentX - lastTouchX.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      const velocity = Math.abs(deltaX) / deltaTime;
      setSwipeVelocity(velocity);
    }

    lastTouchX.current = touchCurrentX;
    lastTouchTime.current = currentTime;

    // Prevent default scroll behavior only for horizontal swipes
    if (preventScroll && isHorizontalSwipe.current && diffX > 15) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isDragging, touchStartX, touchStartY, preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isDragging) return;

    const touch = 'changedTouches' in e ? e.changedTouches[0] : e;
    const touchEndX = touch.clientX;
    const swipeDistance = touchStartX - touchEndX;
    const swipeTime = Date.now() - touchStartTime.current;
    const velocity = swipeTime > 0 ? Math.abs(swipeDistance) / swipeTime : 0;

    // Only trigger swipe if it was a horizontal movement
    if (isHorizontalSwipe.current) {
      const shouldSwipe = Math.abs(swipeDistance) > threshold || velocity > velocityThreshold;

      if (shouldSwipe) {
        if (swipeDistance > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (swipeDistance < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }

    setIsDragging(false);
    setTouchStartX(0);
    setTouchStartY(0);
    setSwipeVelocity(0);
    isHorizontalSwipe.current = false;
  }, [isDragging, touchStartX, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  // Support for mouse events on desktop
  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;

    setTouchStartX(x);
    setTouchStartY(y);
    lastTouchX.current = x;
    touchStartTime.current = Date.now();
    lastTouchTime.current = Date.now();
    setIsDragging(true);
    setSwipeVelocity(0);
    isHorizontalSwipe.current = false;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = Math.abs(touchStartX - currentX);
    const diffY = Math.abs(touchStartY - currentY);

    if (diffX > 10 || diffY > 10) {
      isHorizontalSwipe.current = diffX > diffY;
    }

    const currentTime = Date.now();
    const deltaX = currentX - lastTouchX.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      const velocity = Math.abs(deltaX) / deltaTime;
      setSwipeVelocity(velocity);
    }

    lastTouchX.current = currentX;
    lastTouchTime.current = currentTime;
  }, [isDragging, touchStartX, touchStartY]);

  const handleMouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isDragging) return;

    const endX = e.clientX;
    const swipeDistance = touchStartX - endX;
    const swipeTime = Date.now() - touchStartTime.current;
    const velocity = swipeTime > 0 ? Math.abs(swipeDistance) / swipeTime : 0;

    if (isHorizontalSwipe.current) {
      const shouldSwipe = Math.abs(swipeDistance) > threshold || velocity > velocityThreshold;

      if (shouldSwipe) {
        if (swipeDistance > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (swipeDistance < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }

    setIsDragging(false);
    setTouchStartX(0);
    setTouchStartY(0);
    setSwipeVelocity(0);
    isHorizontalSwipe.current = false;
  }, [isDragging, touchStartX, threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  // Clean up mouse events on document
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
      const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging,
    swipeVelocity,
    isHorizontalSwipe: isHorizontalSwipe.current
  };
}
