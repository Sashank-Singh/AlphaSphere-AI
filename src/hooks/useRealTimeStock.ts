
import { useState, useEffect, useRef } from 'react';
import { stockDataService } from '@/lib/stockDataService';

export interface RealTimeStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  isConnected: boolean;
  lastUpdate: number;
}

export const useRealTimeStock = (symbol: string, interval: number = 5000) => {
  const [data, setData] = useState<RealTimeStockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const quote = await stockDataService.getStockQuote(symbol);
        if (mounted) {
          setData({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            isConnected: true,
            lastUpdate: Date.now()
          });
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching real-time data:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [symbol, interval]);

  return { data, isLoading };
};
