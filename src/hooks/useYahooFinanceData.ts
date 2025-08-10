import { useState, useEffect, useRef } from 'react';

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp?: number;
}

export interface NewsData {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  created_at: string;
}

interface YahooFinanceState {
  stockData: Record<string, StockData>;
  newsData: Record<string, NewsData[]>;
  latestNews: NewsData[];
  isConnected: boolean;
  error: string | null;
}

/**
 * Hook for using Yahoo Finance API for real-time stock and news data
 * Replaces Polygon WebSocket with Yahoo Finance backend calls
 */
export const useYahooFinanceData = (
  stockSymbols: string[] = [],
  newsSymbols: string[] = []
) => {
  const [state, setState] = useState<YahooFinanceState>({
    stockData: {},
    newsData: {},
    latestNews: [],
    isConnected: false,
    error: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch stock data for symbols
  const fetchStockData = async (symbols: string[]) => {
    if (symbols.length === 0) return;

    try {
      // Fetch data for all symbols in parallel
      const promises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`http://localhost:5001/api/yahoo/quote/${symbol}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          return { symbol, data };
        } catch (error) {
          console.warn(`Failed to fetch data for ${symbol}:`, error);
          return { symbol, data: null };
        }
      });

      const results = await Promise.all(promises);
      
      if (!isMountedRef.current) return;

      const newStockData: Record<string, StockData> = {};
      results.forEach(({ symbol, data }) => {
        if (data && data.price) {
          newStockData[symbol] = {
            symbol: data.symbol || symbol,
            price: data.price,
            change: data.change || 0,
            changePercent: data.changePercent || 0,
            volume: data.volume || 0,
            timestamp: Date.now()
          };
        }
      });

      if (Object.keys(newStockData).length > 0) {
        setState(prev => ({
          ...prev,
          stockData: { ...prev.stockData, ...newStockData },
          isConnected: true,
          error: null
        }));
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          error: 'Failed to fetch stock data',
          isConnected: false
        }));
      }
    }
  };

  // Fetch news data
  const fetchNewsData = async (symbols: string[]) => {
    if (symbols.length === 0) return;

    try {
      const response = await fetch('http://localhost:5001/api/yahoo/news');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const newsArray = await response.json();
      
      if (!isMountedRef.current) return;

      if (Array.isArray(newsArray) && newsArray.length > 0) {
        const formattedNews: NewsData[] = newsArray.map((item, index) => ({
          id: item.uuid || `news-${index}`,
          headline: item.title || 'No title',
          summary: item.summary || item.title || '',
          url: item.link || '#',
          source: item.publisher || 'Yahoo Finance',
          created_at: item.providerPublishTime 
            ? new Date(item.providerPublishTime * 1000).toISOString()
            : new Date().toISOString()
        }));

        setState(prev => ({
          ...prev,
          latestNews: formattedNews.slice(0, 10), // Keep latest 10 news items
          error: null
        }));
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
    }
  };

  // Setup polling interval
  useEffect(() => {
    if (stockSymbols.length === 0 && newsSymbols.length === 0) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        error: 'No symbols provided'
      }));
      return;
    }

    // Initial fetch
    fetchStockData(stockSymbols);
    fetchNewsData(newsSymbols);

    // Set up polling interval (30 seconds)
    intervalRef.current = setInterval(() => {
      fetchStockData(stockSymbols);
      if (newsSymbols.length > 0) {
        fetchNewsData(newsSymbols);
      }
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stockSymbols.join(','), newsSymbols.join(',')]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return state;
};

export default useYahooFinanceData;

