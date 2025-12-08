import { useEffect, useRef, useState, useCallback } from "react";

// How many pixels from the bottom of the container to enable auto-scroll
const ACTIVATION_THRESHOLD = 50;
// Minimum pixels of scroll-up movement required to disable auto-scroll
const MIN_SCROLL_UP_THRESHOLD = 10;

export function useAutoScroll(dependencies: React.DependencyList) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollTop = useRef<number | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const isScrollingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current && !isScrollingRef.current) {
      isScrollingRef.current = true;
      const container = containerRef.current;
      
      // Re-enable auto-scroll when user explicitly scrolls to bottom
      setShouldAutoScroll(true);
      
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (container) {
          // Scroll to bottom
          container.scrollTop = container.scrollHeight;
          
          // Also update previousScrollTop to prevent false scroll-up detection
          previousScrollTop.current = container.scrollTop;
          
          // Reset flag after a short delay to allow scroll to complete
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 100);
        }
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      const distanceFromBottom = Math.abs(
        scrollHeight - scrollTop - clientHeight
      );

      const isScrollingUp = previousScrollTop.current !== null
        ? scrollTop < previousScrollTop.current
        : false;

      const scrollUpDistance = previousScrollTop.current !== null
        ? previousScrollTop.current - scrollTop
        : 0;

      const isDeliberateScrollUp =
        isScrollingUp && scrollUpDistance > MIN_SCROLL_UP_THRESHOLD;

      // If user deliberately scrolled up, disable auto-scroll
      if (isDeliberateScrollUp) {
        setShouldAutoScroll(false);
      } else {
        // If user is near the bottom (within threshold), re-enable auto-scroll
        const isScrolledToBottom = distanceFromBottom < ACTIVATION_THRESHOLD;
        if (isScrolledToBottom) {
          setShouldAutoScroll(true);
        }
      }

      previousScrollTop.current = scrollTop;
    }
  }, []);

  const handleTouchStart = useCallback(() => {
    setShouldAutoScroll(false);
  }, []);

  // Initialize previous scroll position
  useEffect(() => {
    if (containerRef.current) {
      previousScrollTop.current = containerRef.current.scrollTop;
    }
  }, []);

  // Auto-scroll when dependencies change and shouldAutoScroll is true
  useEffect(() => {
    if (shouldAutoScroll && containerRef.current) {
      // Use a small delay to ensure DOM has updated with new content
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    containerRef,
    scrollToBottom,
    handleScroll,
    shouldAutoScroll,
    handleTouchStart,
  };
}
