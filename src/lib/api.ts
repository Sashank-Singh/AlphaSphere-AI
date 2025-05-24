
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
