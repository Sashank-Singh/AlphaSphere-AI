
export interface User {
  id: string;
  email: string;
  name: string;
  riskTolerance: 'low' | 'medium' | 'high';
  aiBudget: number;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  isEtf?: boolean;
  marketCap?: number;
  volume?: number;
  pe?: number;
  sector?: string;
  lastUpdated?: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timestamp: Date;
  imageUrl?: string;
  url: string;
  tickers?: string[];
}

export interface Position {
  id: string;
  stockId: string;
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

export interface OptionContract {
  id: string;
  stockId: string;
  ticker: string;
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
  ticker: string;
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
}

export interface AIRecommendation {
  ticker: string;
  confidence: 'low' | 'medium' | 'high';
  optionContract: OptionContract;
  reasoning: string;
}
