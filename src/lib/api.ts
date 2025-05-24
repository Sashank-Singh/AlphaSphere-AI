
export interface StockQuote {
  symbol: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  change: number;
  changePercent: number;
  latestTradingDay: string;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  marketCap: number;
  description: string;
  employees: number;
  website: string;
  ceo: string;
  founded: string;
}

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
  delta?: number;
  gamma?: number;
  theta?: number;
  vega?: number;
  rho?: number;
}

export interface OptionsChain {
  symbol: string;
  expirationDates: string[];
  strikes: number[];
  calls: OptionQuote[];
  puts: OptionQuote[];
}

// Mock implementations for missing functions
export const fetchRealTimeStockPrice = async (symbol: string): Promise<number> => {
  // Mock implementation
  return 150 + Math.random() * 50;
};

export const fetchTimeSeriesData = async (symbol: string, period: string): Promise<any[]> => {
  // Mock implementation
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      price: 150 + Math.random() * 50,
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  return data;
};
