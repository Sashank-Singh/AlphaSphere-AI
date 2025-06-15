
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  variant?: 'text' | 'chart' | 'card' | 'avatar';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  lines = 3,
  variant = 'text'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'chart':
        return 'h-64 w-full rounded-lg';
      case 'card':
        return 'h-32 w-full rounded-lg';
      case 'avatar':
        return 'h-10 w-10 rounded-full';
      default:
        return 'h-4 w-full rounded';
    }
  };

  if (variant !== 'text') {
    return (
      <div className={cn('shimmer bg-muted/50', getVariantClasses(), className)} />
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'shimmer bg-muted/50 h-4 rounded',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
