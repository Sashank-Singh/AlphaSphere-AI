
// Mock Polygon API implementation
export interface PolygonQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface PolygonNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  published_utc: string;
  author: string;
  tickers: string[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorData {
  name: string;
  performance: number;
  volume: number;
  marketCap: number;
}

export interface PopularStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

class PolygonApi {
  private apiKey: string;

  constructor(apiKey: string = 'demo') {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<PolygonQuote> {
    // Mock implementation
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000)
    };
  }

  async getNews(symbol?: string): Promise<PolygonNewsItem[]> {
    // Mock implementation
    return [
      {
        id: '1',
        title: `${symbol || 'Market'} Shows Strong Performance`,
        description: 'Market analysis shows positive trends...',
        url: '#',
        published_utc: new Date().toISOString(),
        author: 'Market Analyst',
        tickers: symbol ? [symbol] : ['SPY', 'QQQ']
      }
    ];
  }
}

export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  return [
    { symbol: 'SPY', name: 'S&P 500', value: 4500, change: 12.5, changePercent: 0.28 },
    { symbol: 'QQQ', name: 'NASDAQ', value: 380, change: -2.1, changePercent: -0.55 },
    { symbol: 'DIA', name: 'Dow Jones', value: 35000, change: 150, changePercent: 0.43 }
  ];
};

export const fetchSectorPerformance = async (): Promise<SectorData[]> => {
  return [
    { name: 'Technology', performance: 2.4, volume: 1000000, marketCap: 500000000 },
    { name: 'Healthcare', performance: 1.8, volume: 800000, marketCap: 400000000 },
    { name: 'Finance', performance: -0.5, volume: 900000, marketCap: 450000000 },
    { name: 'Consumer', performance: 0.9, volume: 700000, marketCap: 350000000 },
    { name: 'Energy', performance: -1.2, volume: 600000, marketCap: 300000000 }
  ];
};

export const fetchPopularStocks = async (): Promise<PopularStock[]> => {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.1, changePercent: 1.2, volume: 50000000 },
    { symbol: 'MSFT', name: 'Microsoft', price: 338.11, change: -1.5, changePercent: -0.44, volume: 30000000 },
    { symbol: 'GOOGL', name: 'Alphabet', price: 131.86, change: 0.8, changePercent: 0.61, volume: 25000000 }
  ];
};

export default PolygonApi;
