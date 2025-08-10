export interface User {
  id: string;
  email: string;
  name: string;
  riskTolerance: 'low' | 'medium' | 'high';
  aiBudget: number;
  tradingMode: 'paper' | 'live';
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent?: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  marketCap?: number;
  sector?: string;
  description?: string;
  lastUpdated?: Date;
  logo?: string;
  isEtf?: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  imageUrl?: string;
  url: string;
  symbols?: string[];
}

export interface Position {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  sector?: string;
}

export interface OptionContract {
  id: string;
  stockId: string;
  symbol: string;
  type: 'call' | 'put';
  strikePrice: number;
  expiryDate: Date;
  premium: number;
  quantity?: number;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'buy' | 'sell';
  assetType: 'stock' | 'option';
  symbol: string;
  quantity: number;
  price: number;
  total: number;
  optionDetails?: {
    type: 'call' | 'put';
    strikePrice: number;
    expiryDate: Date;
    premium: number;
  };
}

export interface Portfolio {
  cash: number;
  totalValue: number;
  positions: Position[];
  optionPositions: OptionContract[];
  transactions: Transaction[];
  trades?: Transaction[];  // Added trades property to match usage in AnalyticsPage
}

export interface AIRecommendation {
  symbol: string;
  confidence: 'low' | 'medium' | 'high';
  optionContract: OptionContract;
  reasoning: string;
}

// Market data types for MarketPage
export interface MarketOverview {
  sp500: MarketMetric;
  nasdaq: MarketMetric;
  dow: MarketMetric;
  vix: MarketMetric;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  volume: string;
  activeTraders: number;
  lastUpdated: Date;
}

export interface MarketMetric {
  value: number;
  change: number;
  changePercent: number;
}

export interface TopStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: string;
}

export interface Sector {
  name: string;
  change: number;
  price: number;
  companies: number;
  leader: string;
}
