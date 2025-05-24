import { useState, useEffect, useRef } from 'react';
import { getAlpacaWebSocketClient, StockQuote, OptionQuote, NewsItem } from '@/lib/alpacaWebSocketApi';
import { mockStockService } from '@/lib/mockStockService';

interface UseStockWebSocketResult {
  stockData: Record<string, StockQuote>;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Custom hook to subscribe to real-time stock data using Alpaca WebSocket API
 * @param symbols Array of stock symbols to subscribe to
 * @returns Object containing stockData, connection status, and any error
 */
export const useStockWebSocket = (symbol: string): UseStockWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsConnected(true);
    const interval = setInterval(async () => {
      try {
        const quote = await mockStockService.getStockQuote(symbol);
        setData(quote);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [symbol]);

  return { data, isConnected, error };
};

/**
 * Custom hook to subscribe to real-time options data
 * @param symbols Array of option symbols to subscribe to
 */
export const useOptionsWebSocket = (symbol: string) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    // Mock options data
    const mockOptionsData = {
      symbol,
      bid: 0,
      ask: 0,
      last: 0,
      volume: 0,
      openInterest: 0
    };
    setData(mockOptionsData);

    return () => {
      setIsConnected(false);
    };
  }, [symbol]);

  return { data, isConnected };
};

/**
 * Custom hook to subscribe to real-time news data
 * @param symbols Array of symbols to get news for
 */
export const useNewsWebSocket = (symbol: string) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    // Mock news data
    const mockNewsData = {
      symbol,
      headlines: [
        {
          id: '1',
          title: 'Market Update',
          source: 'Mock News',
          timestamp: new Date().toISOString()
        }
      ]
    };
    setData(mockNewsData);

    return () => {
      setIsConnected(false);
    };
  }, [symbol]);

  return { data, isConnected };
};

/**
 * Combined hook for subscribing to multiple types of Alpaca WebSocket data
 * @param stockSymbols Array of stock symbols to subscribe to
 * @param optionSymbols Array of option symbols to subscribe to
 * @param newsSymbols Array of symbols to get news for (can be same as stock symbols)
 * @returns Object containing data for all subscribed types
 */
export const useAlpacaWebSocketData = (
  stockSymbols: string[] = [],
  optionSymbols: string[] = [], 
  newsSymbols: string[] = []
) => {
  const { data: stockData, isConnected: stocksConnected, error: stocksError } = useStockWebSocket(stockSymbols[0]);
  const { data: optionsData, isConnected: optionsConnected } = useOptionsWebSocket(optionSymbols[0]);
  const { data: newsData, isConnected: newsConnected } = useNewsWebSocket(newsSymbols[0]);

  // Combined connection status
  const isConnected = {
    stocks: stocksConnected,
    options: optionsConnected,
    news: newsConnected,
    any: stocksConnected || optionsConnected || newsConnected
  };

  // Combined errors
  const errors = {
    stocks: stocksError,
    options: new Error('Mock options data used'),
    news: new Error('Mock news data used'),
    any: stocksError || new Error('Mock options data used') || new Error('Mock news data used')
  };

  return {
    stockData,
    optionsData,
    newsData,
    isConnected,
    errors
  };
};
