// Re-export all market data functions from polygonApi.ts
export {
  fetchMarketIndices,
  fetchSectorPerformance,
  fetchPopularStocks,
  fetchMarketNews,
  calculateMarketSentiment,
  fetchRealTimeStockPrice,
  fetchOptionsData,
  fetchHistoricalPrices,
  fetchOptionsChain,
  fetchCompanyDetails
} from './polygonApi';

// Re-export types
export type MarketIndex = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
};

export type Sector = {
  symbol: string;
  name: string;
  change: number;
  price: number;
};

export type Stock = {
  symbol: string;
  sector: string;
  price: number;
  change: number;
  volume: number;
};

export type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  timestamp: string;
  symbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
};
