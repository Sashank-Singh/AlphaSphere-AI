import { Stock, NewsItem, Portfolio, User } from '../types';


// Types
export interface Index {
  symbol: string;
  name: string;
  price: number;
  change: number;
  logo: string;
}

export interface Sector {
  name: string;
  change: number;
  marketCap: number;
  topStocks: string[];
  logo: string;
}

// Mock User
export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  riskTolerance: 'medium',
  aiBudget: 1000,
};

// Mock Stocks
export const mockStocks: Stock[] = [
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.31,
    volume: 55789432,
    sector: 'Technology',
    logo: 'https://companieslogo.com/img/orig/AAPL-bf1a4314.png'
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.11,
    change: 1.45,
    volume: 23456789,
    sector: 'Technology',
    logo: 'https://companieslogo.com/img/orig/MSFT-6e0c67c3.png'
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 131.86,
    change: -0.89,
    volume: 19876543,
    sector: 'Technology',
    logo: 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png'
  },
  {
    id: 'AMZN',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.24,
    change: 0.76,
    volume: 45678901,
    sector: 'Consumer Cyclical',
    logo: 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png'
  },
  {
    id: 'NVDA',
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 477.76,
    change: 3.21,
    volume: 34567890,
    sector: 'Technology',
    logo: 'https://companieslogo.com/img/orig/NVDA-6d4cef10.png'
  },
  {
    id: 'META',
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 326.49,
    change: 1.98,
    volume: 28901234,
    sector: 'Technology',
    logo: 'https://companieslogo.com/img/orig/META-4767da84.png'
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 238.45,
    change: -1.54,
    volume: 67890123,
    sector: 'Consumer Cyclical',
    logo: 'https://companieslogo.com/img/orig/TSLA-6da1e910.png'
  },
  {
    id: 'JPM',
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 147.11,
    change: 0.45,
    volume: 12345678,
    sector: 'Financial Services',
    logo: 'https://companieslogo.com/img/orig/JPM-0ddf4f3e.png'
  },
  {
    id: 'V',
    symbol: 'V',
    name: 'Visa Inc.',
    price: 252.34,
    change: 0.89,
    volume: 89012345,
    sector: 'Financial Services',
    logo: 'https://companieslogo.com/img/orig/V-69020c3e.png'
  }
];

// Mock Market Indices
export const mockIndices: Index[] = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    price: 4783.45,
    change: 1.23,
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/S%26P_500_logo.svg/1200px-S%26P_500_logo.svg.png'
  },
  {
    symbol: 'NDX',
    name: 'Nasdaq 100',
    price: 16832.78,
    change: 1.56,
    logo: 'https://companieslogo.com/img/orig/NDX-3fcd083c.png'
  },
  {
    symbol: 'DJI',
    name: 'Dow Jones Industrial Average',
    price: 37654.32,
    change: 0.89,
    logo: 'https://companieslogo.com/img/orig/DJI-c47b257b.png'
  }
];

// Mock Sectors
export const mockSectors: Sector[] = [
  {
    name: 'Technology',
    change: 2.34,
    marketCap: 12.5,
    topStocks: ['AAPL', 'MSFT', 'NVDA'],
    logo: 'https://example.com/sector-icons/technology.png'
  },
  {
    name: 'Financial Services',
    change: 0.87,
    marketCap: 8.2,
    topStocks: ['JPM', 'V', 'BAC'],
    logo: 'https://example.com/sector-icons/financial.png'
  },
  {
    name: 'Consumer Cyclical',
    change: 1.45,
    marketCap: 6.8,
    topStocks: ['AMZN', 'TSLA', 'HD'],
    logo: 'https://example.com/sector-icons/consumer.png'
  },
  {
    name: 'Healthcare',
    change: -0.32,
    marketCap: 5.9,
    topStocks: ['JNJ', 'UNH', 'PFE'],
    logo: 'https://example.com/sector-icons/healthcare.png'
  },
  {
    name: 'Communication Services',
    change: 1.12,
    marketCap: 4.7,
    topStocks: ['GOOGL', 'META', 'NFLX'],
    logo: 'https://example.com/sector-icons/communication.png'
  },
  {
    name: 'Industrials',
    change: 0.54,
    marketCap: 3.8,
    topStocks: ['HON', 'UPS', 'CAT'],
    logo: 'https://example.com/sector-icons/industrials..png'
  },
  {
    name: 'Energy',
    change: -1.23,
    marketCap: 2.9,
    topStocks: ['XOM', 'CVX', 'COP'],
    logo: 'https://example.com/sector-icons/energy.png'
  },
  {
    name: 'Utilities',
    change: -0.45,
    marketCap: 1.8,
    topStocks: ['NEE', 'DUK', 'SO'],
    logo: 'https://example.com/sector-icons/utilities.png'
  },
  {
    name: 'Real Estate',
    change: 0.21,
    marketCap: 1.5,
    topStocks: ['AMT', 'PLD', 'CCI'],
    logo: 'https://example.com/sector-icons/realestate.png'
  },
  {
    name: 'Materials',
    change: -0.67,
    marketCap: 1.2,
    topStocks: ['LIN', 'APD', 'ECL'],
    logo: 'https://example.com/sector-icons/materials.png'
  },
  {
    name: 'Consumer Defensive',
    change: 0.32,
    marketCap: 2.1,
    topStocks: ['PG', 'KO', 'PEP'],
    logo: 'https://example.com/sector-icons/consumerdefensive.png'
  }
];

// Mock News
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Apple Reports Record Q4 Earnings',
    source: 'Financial Times',
    timestamp: new Date('2024-02-01'),
    url: 'https://example.com/news/1',
    symbols: ['AAPL']
  },
  {
    id: '2',
    title: 'Microsoft and Google Partner on AI Initiative',
    source: 'TechCrunch',
    timestamp: new Date('2024-02-02'),
    url: 'https://example.com/news/2',
    symbols: ['MSFT', 'GOOGL']
  },
  {
    id: '3',
    title: 'Tesla Announces New Battery Technology',
    source: 'Reuters',
    timestamp: new Date('2024-02-03'),
    url: 'https://example.com/news/3',
    symbols: ['TSLA']
  }
];

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  id: '1',
  userId: '1',
  name: 'Main Portfolio',
  cash: 10000,
  totalValue: 152340.75,
  positions: [],
  optionPositions: [],
  transactions: [],
};

// Helper functions for mock data
export const generatePriceData = (basePrice: number, days: number = 30) => {
  const data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < days; i++) {
    const change = currentPrice * (Math.random() - 0.5) * 0.1;
    currentPrice += change;
    data.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      price: currentPrice
    });
  }
  return data;
};

export const refreshStockPrices = (): Stock[] => {
  return mockStocks.map(stock => ({
    ...stock,
    price: stock.price + (Math.random() - 0.5) * 2,
    change: (Math.random() - 0.5) * 5,
    volume: stock.volume + Math.floor(Math.random() * 100000)
  }));
};

export const getStockBySymbol = (symbol: string): Stock | null => {
  return mockStocks.find(stock => stock.symbol === symbol) || null;
};

export function getAIRecommendation(symbol: string, riskTolerance: 'low' | 'medium' | 'high') {
  const stock = getStockBySymbol(symbol);
  if (!stock) return null;

  const reasons = [
    "Strong technical indicators show a bullish trend.",
    "Recent news and market sentiment are highly positive.",
    "The stock has broken through a key resistance level.",
    "Fundamental analysis suggests the company is undervalued.",
    "High trading volume indicates strong investor interest.",
    "Upcoming product launch could significantly boost revenue.",
    "Analyst ratings have recently been upgraded.",
    "The company is a leader in a high-growth sector.",
    "Insider trading activity shows confidence from executives.",
    "Macroeconomic factors are favorable for this industry."
  ];

  const randomReason = () => reasons[Math.floor(Math.random() * reasons.length)];

  const confidenceLevels = riskTolerance === 'high' ? [0.8, 0.95] : riskTolerance === 'medium' ? [0.7, 0.85] : [0.6, 0.75];
  const confidence = Math.random() * (confidenceLevels[1] - confidenceLevels[0]) + confidenceLevels[0];
  
  const priceTargetMultiplier = {
    low: [1.05, 1.10],
    medium: [1.10, 1.20],
    high: [1.15, 1.30]
  }[riskTolerance];

  const priceTarget = stock.price * (Math.random() * (priceTargetMultiplier[1] - priceTargetMultiplier[0]) + priceTargetMultiplier[0]);

  const stopLoss = stock.price * 0.95;

  return {
    decision: 'BUY',
    confidence,
    reasoning: [randomReason(), randomReason()],
    priceTarget,
    stopLoss
  };
} 