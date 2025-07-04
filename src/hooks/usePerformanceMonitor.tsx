import React, { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  componentName: string;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enableLogging?: boolean;
  threshold?: number; // ms - log if render time exceeds this
}

export function usePerformanceMonitor({
  componentName,
  enableLogging = process.env.NODE_ENV === 'development',
  threshold = 16 // 60fps = 16.67ms per frame
}: UsePerformanceMonitorOptions) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    componentName
  });
  const renderStartTimeRef = useRef<number>(0);
  const renderTimesRef = useRef<number[]>([]);

  // Mark render start
  const markRenderStart = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);

  // Mark render end and calculate metrics
  const markRenderEnd = useCallback(() => {
    const renderTime = performance.now() - renderStartTimeRef.current;
    const metrics = metricsRef.current;
    
    metrics.renderCount++;
    metrics.lastRenderTime = renderTime;
    
    // Keep last 10 render times for average calculation
    renderTimesRef.current.push(renderTime);
    if (renderTimesRef.current.length > 10) {
      renderTimesRef.current.shift();
    }
    
    metrics.averageRenderTime = renderTimesRef.current.reduce((sum, time) => sum + time, 0) / renderTimesRef.current.length;
    
    if (enableLogging) {
      if (renderTime > threshold) {
        console.warn(`🐌 Slow render detected in ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          threshold: `${threshold}ms`,
          renderCount: metrics.renderCount,
          averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`
        });
      } else if (metrics.renderCount % 50 === 0) {
        // Log performance summary every 50 renders
        console.log(`📊 Performance summary for ${componentName}:`, {
          renderCount: metrics.renderCount,
          averageRenderTime: `${metrics.averageRenderTime.toFixed(2)}ms`,
          lastRenderTime: `${metrics.lastRenderTime.toFixed(2)}ms`
        });
      }
    }
  }, [componentName, enableLogging, threshold]);

  // Get current metrics
  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      componentName
    };
    renderTimesRef.current = [];
  }, [componentName]);

  // Auto-mark render start/end
  useEffect(() => {
    markRenderStart();
    return () => {
      markRenderEnd();
    };
  });

  return {
    markRenderStart,
    markRenderEnd,
    getMetrics,
    resetMetrics,
    metrics: metricsRef.current
  };
}

// Higher-order component for automatic performance monitoring
export function withPerformanceMonitor<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<UsePerformanceMonitorOptions, 'componentName'>
) {
  const WrappedComponent = (props: P) => {
    const componentName = Component.displayName || Component.name || 'Unknown';
    usePerformanceMonitor({ ...options, componentName });
    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitor(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for measuring specific operations
export function useOperationTimer() {
  const timersRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operationName: string) => {
    timersRef.current.set(operationName, performance.now());
  }, []);

  const endTimer = useCallback((operationName: string, logResult = true) => {
    const startTime = timersRef.current.get(operationName);
    if (!startTime) {
      console.warn(`Timer '${operationName}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    timersRef.current.delete(operationName);

    if (logResult) {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, []);

  const measureAsync = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    logResult = true
  ): Promise<T> => {
    startTimer(operationName);
    try {
      const result = await operation();
      endTimer(operationName, logResult);
      return result;
    } catch (error) {
      endTimer(operationName, logResult);
      throw error;
    }
  }, [startTimer, endTimer]);

  return {
    startTimer,
    endTimer,
    measureAsync
  };
}