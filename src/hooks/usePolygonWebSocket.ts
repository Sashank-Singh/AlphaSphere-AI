import { useState, useEffect, useRef } from 'react';

// Get Polygon.io API key from environment variable
const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

// Define types for the data we'll receive
interface StockData {
  [symbol: string]: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  };
}

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  url: string;
  source: string;
  created_at: string;
  updated_at: string;
  symbols: string[];
}

interface WebSocketState {
  stockData: StockData;
  newsData: Record<string, NewsItem[]>;
  latestNews: NewsItem[];
  isConnected: boolean;
}

/**
 * Hook for using Polygon.io WebSocket for real-time stock and news data
 */
export const usePolygonWebSocketData = (
  stockSymbols: string[] = [],
  optionSymbols: string[] = [],
  newsSymbols: string[] = []
) => {
  const [state, setState] = useState<WebSocketState>({
    stockData: {},
    newsData: {},
    latestNews: [],
    isConnected: false
  });

  // Keep track of previous day's close prices for calculating change
  const prevCloseRef = useRef<Record<string, number>>({});
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!POLYGON_API_KEY) {
      console.error('Polygon API key is missing. Please set VITE_POLYGON_API_KEY in your .env file.');
      return;
    }

    // Connect to Polygon WebSocket
    const ws = new WebSocket('wss://socket.polygon.io/stocks');
    wsRef.current = ws;

    let isMounted = true;

    ws.onopen = () => {
      // Authenticate
      ws.send(JSON.stringify({ action: 'auth', params: POLYGON_API_KEY }));
      // Subscribe to stock symbols
      if (stockSymbols.length > 0) {
        ws.send(JSON.stringify({ action: 'subscribe', params: stockSymbols.map(s => `T.${s}`).join(',') }));
      }
      setState(prev => ({ ...prev, isConnected: true }));
    };

    ws.onmessage = (event) => {
      const messages = JSON.parse(event.data);
      if (!Array.isArray(messages)) return;
      const updatedStockData: StockData = {};
      for (const msg of messages) {
        // Trade update (type 'T')
        if (msg.ev === 'T') {
          const symbol = msg.sym;
          const price = msg.p;
          const volume = msg.s;
          // Calculate change and changePercent if possible
          const prevClose = prevCloseRef.current[symbol] || price;
          const change = price - prevClose;
          const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;
          updatedStockData[symbol] = {
            symbol,
            price,
            change,
            changePercent,
            volume
          };
        }
      }
      if (Object.keys(updatedStockData).length > 0 && isMounted) {
        setState(prev => ({
          ...prev,
          stockData: { ...prev.stockData, ...updatedStockData }
        }));
      }
    };

    ws.onerror = (err) => {
      console.error('Polygon WebSocket error:', err);
      setState(prev => ({ ...prev, isConnected: false }));
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, isConnected: false }));
    };

    // Fetch previous close prices for all symbols (optional: can be improved with REST API)
    (async () => {
      for (const symbol of stockSymbols) {
        // For now, just set to 0 (or fetch from REST API if needed)
        prevCloseRef.current[symbol] = 0;
      }
    })();

    // Cleanup
    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [stockSymbols.join(','), POLYGON_API_KEY]);

  return state;
};