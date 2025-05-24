
import { useState, useEffect, useRef } from 'react';

export interface OptionQuote {
  symbol: string;
  strike: number;
  type: 'call' | 'put';
  expiration: string;
  expirationDate?: string;
  bid: number;
  ask: number;
  bidPrice?: number;
  askPrice?: number;
  last: number;
  lastPrice?: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
}

interface UseStockWebSocketResult {
  data: any;
  isConnected: boolean;
  stockData?: { [symbol: string]: any };
}

interface UseOptionsWebSocketResult {
  data: any;
  isConnected: boolean;
  optionsData?: OptionQuote[];
}

interface UseNewsWebSocketResult {
  data: any;
  isConnected: boolean;
  newsData?: any;
  latestNews?: any[];
}

export const useStockWebSocket = (symbols: string | string[]): UseStockWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [stockData, setStockData] = useState<{ [symbol: string]: any }>({});
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setIsConnected(true);
    
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    
    const interval = setInterval(() => {
      const newStockData: { [symbol: string]: any } = {};
      
      symbolArray.forEach(symbol => {
        const mockData = {
          symbol,
          price: 150 + Math.random() * 50,
          change: (Math.random() - 0.5) * 10,
          changePercent: (Math.random() - 0.5) * 5,
          volume: Math.floor(Math.random() * 1000000),
          timestamp: Date.now()
        };
        newStockData[symbol] = mockData;
      });
      
      setStockData(newStockData);
      setData(newStockData);
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [symbols]);

  return { data, isConnected, stockData };
};

export const useOptionsWebSocket = (symbols: string | string[]): UseOptionsWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [optionsData, setOptionsData] = useState<OptionQuote[]>([]);

  useEffect(() => {
    setIsConnected(true);
    
    const symbolArray = Array.isArray(symbols) ? symbols : [symbols];
    
    const mockOptions: OptionQuote[] = symbolArray.map(symbol => ({
      symbol: `${symbol}240315C00150000`,
      strike: 150,
      type: 'call' as const,
      expiration: '2024-03-15',
      expirationDate: '2024-03-15',
      bid: 5.20,
      ask: 5.40,
      bidPrice: 5.20,
      askPrice: 5.40,
      last: 5.30,
      lastPrice: 5.30,
      volume: 1250,
      openInterest: 3400,
      impliedVolatility: 0.28
    }));
    
    setOptionsData(mockOptions);
    setData({ optionsData: mockOptions });

    return () => {
      setIsConnected(false);
    };
  }, [symbols]);

  return { data, isConnected, optionsData };
};

export const useNewsWebSocket = (symbols: string[]): UseNewsWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any>(null);
  const [latestNews, setLatestNews] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(true);
    
    const mockNews = symbols.map(symbol => ({
      id: `news-${symbol}-${Date.now()}`,
      title: `Latest news for ${symbol}`,
      content: `Mock news content for ${symbol}`,
      timestamp: new Date(),
      symbol
    }));
    
    setLatestNews(mockNews);
    setNewsData({ news: mockNews });
    setData({ news: mockNews });

    return () => {
      setIsConnected(false);
    };
  }, [symbols]);

  return { data, isConnected, newsData, latestNews };
};
