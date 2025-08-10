import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, Wifi, WifiOff } from 'lucide-react';

interface PriceDisplayProps {
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
  isConnected: boolean;
  priceUpdated: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  change,
  changePercent,
  lastUpdated,
  isConnected,
  priceUpdated
}) => {
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdated) / 1000);
  const isRecentUpdate = timeSinceUpdate < 5;
  const isPositive = change >= 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div className="space-y-3" style={{ backgroundColor: 'transparent' }}>
      <div className="flex items-end space-x-3">
        <span className={cn(
          "text-4xl font-bold text-white transition-all duration-300",
          priceUpdated && "animate-pulse scale-105"
        )}>
          ${price.toFixed(2)}
        </span>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            "text-lg font-medium transition-colors duration-300",
            isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {isPositive ? '+' : ''}{change.toFixed(2)}
          </span>
          
          <span className={cn(
            "text-lg font-medium transition-colors duration-300",
            isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            ({changePercent.toFixed(2)}%)
          </span>
          
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-green-400" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-400" />
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatTime(timeSinceUpdate)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Live Data</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-400" />
              <span className="text-red-400">Delayed Data</span>
            </>
          )}
        </div>
        
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          isConnected ? "bg-green-900/20 text-green-400" : "bg-red-900/20 text-red-400"
        )}>
          Market {isConnected ? 'Open' : 'Closed'}
        </div>
      </div>
      
      {/* Price Change Indicator */}
      {priceUpdated && (
        <div className={cn(
          "absolute inset-0 rounded-lg transition-opacity duration-1000",
          isPositive ? "bg-green-500/10" : "bg-red-500/10"
        )} />
      )}
    </div>
  );
};

export default PriceDisplay;
