
import { useState, useEffect, useRef } from 'react';

export interface OptionQuote {
  symbol: string;
  strike: number;
  type: 'call' | 'put';
  expiration: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
}

interface UseStockWebSocketResult {
  data: any;
  isConnected: boolean;
  optionsData?: OptionQuote[];
}

interface UseOptionsWebSocketResult {
  data: any;
  isConnected: boolean;
  optionsData?: OptionQuote[];
}

export const useStockWebSocket = (symbol: string): UseStockWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Mock WebSocket connection for demo
    setIsConnected(true);
    
    // Simulate real-time data updates
    const interval = setInterval(() => {
      const mockData = {
        symbol,
        price: 150 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        volume: Math.floor(Math.random() * 1000000),
        timestamp: Date.now()
      };
      setData(mockData);
    }, 2000);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [symbol]);

  return { data, isConnected };
};

export const useOptionsWebSocket = (symbol: string): UseOptionsWebSocketResult => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [optionsData, setOptionsData] = useState<OptionQuote[]>([]);

  useEffect(() => {
    // Mock WebSocket connection for options
    setIsConnected(true);
    
    // Generate mock options data
    const mockOptions: OptionQuote[] = [
      {
        symbol: `${symbol}240315C00150000`,
        strike: 150,
        type: 'call',
        expiration: '2024-03-15',
        bid: 5.20,
        ask: 5.40,
        last: 5.30,
        volume: 1250,
        openInterest: 3400,
        impliedVolatility: 0.28
      }
    ];
    
    setOptionsData(mockOptions);
    setData({ optionsData: mockOptions });

    return () => {
      setIsConnected(false);
    };
  }, [symbol]);

  return { data, isConnected, optionsData };
};
