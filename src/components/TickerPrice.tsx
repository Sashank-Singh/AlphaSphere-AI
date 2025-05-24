import React, { useEffect, useState, useRef } from 'react';
import { mockStockService, StockQuote } from '@/lib/mockStockService';

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
  refreshInterval = 5000,
  className = ''
}) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await mockStockService.getStockQuote(symbol);
        setQuote(data);
      } catch (error) {
        console.error('Error fetching stock price:', error);
      }
    };

    // Initial fetch
    fetchPrice();

    // Setup interval for periodic updates
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchPrice, refreshInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, refreshInterval]);

  if (!quote) {
    return <div className={className}>Loading...</div>;
  }

  const priceClasses = quote.change >= 0 ? 'text-green-500' : 'text-red-500';
  const sizeClasses = {
    large: 'text-2xl',
    medium: 'text-lg',
    small: 'text-sm'
  }[variant];

  return (
    <div className={`flex items-center space-x-2 ${className} ${sizeClasses}`}>
      <span className={priceClasses}>${quote.price.toFixed(2)}</span>
      {showChange && (
        <span className={priceClasses}>
          ({quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)})
          {quote.changePercent.toFixed(2)}%
        </span>
      )}
    </div>
  );
};

export default TickerPrice; 