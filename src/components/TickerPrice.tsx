import React, { useEffect, useState, useRef } from 'react';
import { fetchRealTimeStockPrice, StockQuote } from '@/lib/api';

interface TickerPriceProps {
  symbol: string;
  variant?: 'large' | 'medium' | 'small';
  showChange?: boolean;
  refreshInterval?: number; // in milliseconds
  className?: string;
}

const TickerPrice: React.FC<TickerPriceProps> = ({
  symbol,
  variant = 'medium',
  showChange = true,
  refreshInterval = 10000,
  className = '',
}) => {
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const updateIntervalRef = useRef<number | null>(null);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
  };

  // Fetch price data
  const fetchPrice = async () => {
    try {
      setError(null);
      const data = await fetchRealTimeStockPrice(symbol);
      setStockData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching symbol price:', error);
      setError('Failed to load price');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data and set up refresh interval
  useEffect(() => {
    fetchPrice();
    
    // Set up interval for refreshing price data
    if (refreshInterval > 0) {
      const intervalId = window.setInterval(fetchPrice, refreshInterval);
      updateIntervalRef.current = intervalId;
    }
    
    // Clean up interval on unmount
    return () => {
      if (updateIntervalRef.current) {
        window.clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
    };
  }, [symbol, refreshInterval]);

  // Size classes based on variant
  const sizeClasses = {
    large: 'text-4xl font-bold',
    medium: 'text-2xl font-bold',
    small: 'text-lg font-semibold',
  };

  // If loading or error
  if (loading) {
    return <div className={`${sizeClasses[variant]} text-gray-400 ${className}`}>Loading...</div>;
  }

  if (error) {
    return <div className={`${sizeClasses[variant]} text-red-500 ${className}`}>Error</div>;
  }

  if (!stockData) {
    return <div className={`${sizeClasses[variant]} text-gray-400 ${className}`}>N/A</div>;
  }

  const isPositive = stockData.changePercent >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className={`${className}`}>
      <div className={`${sizeClasses[variant]}`}>
        {formatCurrency(stockData.price)}
      </div>
      
      {showChange && (
        <div className={`flex items-center ${variant === 'small' ? 'text-xs' : 'text-sm'} ${changeColor}`}>
          <span>{formatCurrency(stockData.change)}</span>
          <span className="ml-1">({formatPercent(stockData.changePercent)})</span>
        </div>
      )}
    </div>
  );
};

export default TickerPrice; 