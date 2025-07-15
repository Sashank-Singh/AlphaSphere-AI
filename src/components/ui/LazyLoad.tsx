import React, { memo, useState, useEffect, useRef, useCallback } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  onLoad?: () => void;
  delay?: number;
  minHeight?: number;
}

const LazyLoad: React.FC<LazyLoadProps> = memo(({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  onLoad,
  delay = 0,
  minHeight = 100
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    
    if (entry.isIntersecting && !isVisible) {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true);
          onLoad?.();
        }, delay);
      } else {
        setIsVisible(true);
        onLoad?.();
      }
    }
  }, [isVisible, onLoad, delay]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleIntersection, rootMargin, threshold]);

  useEffect(() => {
    if (isVisible && !isLoaded) {
      // Add a small delay to ensure smooth loading
      const loadTimeout = setTimeout(() => {
        setIsLoaded(true);
      }, 50);

      return () => clearTimeout(loadTimeout);
    }
  }, [isVisible, isLoaded]);

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-muted/30 rounded-lg animate-pulse"
      style={{ minHeight }}
    >
      <div className="text-center space-y-2">
        <div className="w-8 h-8 bg-muted rounded-full mx-auto animate-spin border-2 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? (
        <div className="fade-in">
          {children}
        </div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
});

LazyLoad.displayName = 'LazyLoad';

export default LazyLoad;

// Higher-order component for lazy loading
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  lazyLoadProps?: Partial<LazyLoadProps>
) {
  const LazyComponent = memo((props: P) => {
    return (
      <LazyLoad {...lazyLoadProps}>
        <Component {...props} />
      </LazyLoad>
    );
  });

  LazyComponent.displayName = `LazyLoad(${Component.displayName || Component.name})`;
  
  return LazyComponent;
}

// Hook for programmatic lazy loading
export function useLazyLoad({
  rootMargin = '50px',
  threshold = 0.1,
  triggerOnce = true
}: Partial<Pick<LazyLoadProps, 'rootMargin' | 'threshold' | 'triggerOnce'>> = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, [rootMargin, threshold, triggerOnce]);

  return { isVisible, setRef };
}

// Lazy loading wrapper for images
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export const LazyImage: React.FC<LazyImageProps> = memo(({
  src,
  alt,
  fallbackSrc,
  loadingComponent,
  errorComponent,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isVisible, setRef } = useLazyLoad();

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, []);

  const defaultLoadingComponent = (
    <div className="bg-muted animate-pulse rounded" style={{ aspectRatio: '16/9' }}>
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  const defaultErrorComponent = (
    <div className="bg-muted/50 rounded flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
      <p className="text-sm text-muted-foreground">Failed to load image</p>
    </div>
  );

  return (
    <div ref={setRef} className={className}>
      {!isVisible ? (
        loadingComponent || defaultLoadingComponent
      ) : hasError ? (
        fallbackSrc ? (
          <img
            src={fallbackSrc}
            alt={alt}
            className="fade-in"
            {...props}
          />
        ) : (
          errorComponent || defaultErrorComponent
        )
      ) : (
        <>
          {!isLoaded && (loadingComponent || defaultLoadingComponent)}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`${isLoaded ? 'fade-in' : 'opacity-0 absolute'} ${className}`}
            {...props}
          />
        </>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';