import { useCallback, RefObject, useRef, useEffect } from 'react';

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
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastTouchX = useRef(0);
  const lastTouchTime = useRef(0);
  const isHorizontalSwipe = useRef(false);
  const isDragging = useRef(false);
  const swipeVelocity = useRef(0);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    const touch = 'touches' in e ? e.touches[0] : e;
    const x = touch.clientX;
    const y = touch.clientY;

    touchStartX.current = x;
    touchStartY.current = y;
    lastTouchX.current = x;
    touchStartTime.current = Date.now();
    lastTouchTime.current = Date.now();
    isDragging.current = true;
    swipeVelocity.current = 0;
    isHorizontalSwipe.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isDragging.current) return;

    const touch = 'touches' in e ? e.touches[0] : e;
    const touchCurrentX = touch.clientX;
    const touchCurrentY = touch.clientY;
    const diffX = Math.abs(touchStartX.current - touchCurrentX);
    const diffY = Math.abs(touchStartY.current - touchCurrentY);

    if (diffX > 10 || diffY > 10) {
      isHorizontalSwipe.current = diffX > diffY;
    }

    const currentTime = Date.now();
    const deltaX = touchCurrentX - lastTouchX.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      const velocity = Math.abs(deltaX) / deltaTime;
      swipeVelocity.current = velocity;
    }

    lastTouchX.current = touchCurrentX;
    lastTouchTime.current = currentTime;

    if (preventScroll && isHorizontalSwipe.current && diffX > 15) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  }, [preventScroll]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isDragging.current) return;

    const touch = 'changedTouches' in e ? e.changedTouches[0] : e;
    const touchEndX = touch.clientX;
    const swipeDistance = touchStartX.current - touchEndX;
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

    isDragging.current = false;
    touchStartX.current = 0;
    touchStartY.current = 0;
    swipeVelocity.current = 0;
    isHorizontalSwipe.current = false;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (isTouchDevice.current) return;

    const x = e.clientX;
    const y = e.clientY;

    touchStartX.current = x;
    touchStartY.current = y;
    lastTouchX.current = x;
    touchStartTime.current = Date.now();
    lastTouchTime.current = Date.now();
    isDragging.current = true;
    swipeVelocity.current = 0;
    isHorizontalSwipe.current = false;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || isTouchDevice.current) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = Math.abs(touchStartX.current - currentX);
    const diffY = Math.abs(touchStartY.current - currentY);

    if (diffX > 10 || diffY > 10) {
      isHorizontalSwipe.current = diffX > diffY;
    }

    const currentTime = Date.now();
    const deltaX = currentX - lastTouchX.current;
    const deltaTime = currentTime - lastTouchTime.current;

    if (deltaTime > 0) {
      const velocity = Math.abs(deltaX) / deltaTime;
      swipeVelocity.current = velocity;
    }

    lastTouchX.current = currentX;
    lastTouchTime.current = currentTime;
  }, []);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging.current || isTouchDevice.current) return;

    const endX = e.clientX;
    const swipeDistance = touchStartX.current - endX;
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

    isDragging.current = false;
    touchStartX.current = 0;
    touchStartY.current = 0;
    swipeVelocity.current = 0;
    isHorizontalSwipe.current = false;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const options: AddEventListenerOptions = { passive: false };

    element.addEventListener('touchstart', handleTouchStart as EventListener, options);
    element.addEventListener('touchmove', handleTouchMove as EventListener, options);
    element.addEventListener('touchend', handleTouchEnd as EventListener, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart as EventListener);
      element.removeEventListener('touchmove', handleTouchMove as EventListener);
      element.removeEventListener('touchend', handleTouchEnd as EventListener);
    };
  }, [scrollRef, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    if (isTouchDevice.current) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);

    if (isDragging.current) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    isDragging: isDragging.current,
    swipeVelocity: swipeVelocity.current,
    isHorizontalSwipe: isHorizontalSwipe.current
  };
}
