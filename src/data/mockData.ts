import { Stock, NewsItem, Portfolio, User } from '@/types';
import { getRandomChange, getRandomPrice } from '@/lib/utils';

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
    logo: 'https://example.com/sector-icons/industrials.png'
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
  },
  {
    id: '4',
    title: 'Amazon Prime Day Sets New Sales Record',
    source: 'Bloomberg',
    timestamp: new Date('2024-02-04'),
    url: 'https://example.com/news/4',
    symbols: ['AMZN']
  },
  {
    id: '5',
    title: 'NVIDIA Unveils Next-Gen GPU Architecture',
    source: 'The Verge',
    timestamp: new Date('2024-02-05'),
    url: 'https://example.com/news/5',
    symbols: ['NVDA']
  }
];

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  cash: 100000,
  totalValue: 250000,
  dailyChange: 2500,
  dailyChangePercent: 1.02,
  positions: [
    {
      id: 'pos1',
      stockId: 'AAPL',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 100,
      averagePrice: 170.50,
      currentPrice: 175.43
    },
    {
      id: 'pos2',
      stockId: 'MSFT',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 50,
      averagePrice: 330.25,
      currentPrice: 338.11
    },
    {
      id: 'pos3',
      stockId: 'GOOGL',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 75,
      averagePrice: 128.75,
      currentPrice: 131.86
    }
  ],
  optionPositions: [
    {
      id: 'opt1',
      stockId: 'AAPL',
      symbol: 'AAPL',
      type: 'call',
      strikePrice: 180,
      expiryDate: new Date('2024-06-21'),
      premium: 5.50,
      quantity: 2
    }
  ],
  transactions: []
};

// Function to refresh stock prices
export const refreshStockPrices = (): Stock[] => {
  return mockStocks.map(stock => ({
    ...stock,
    price: stock.price * (1 + (Math.random() - 0.5) * 0.02),
    change: (Math.random() - 0.5) * 4,
    volume: Math.floor(Math.random() * 1000000)
  }));
};

// Function to get stock by symbol
export const getStockBySymbol = (symbol: string): Stock | null => {
  return mockStocks.find(stock => stock.symbol === symbol) || null;
};

// Function to simulate AI recommendation
export function getAIRecommendation(symbol: string, riskTolerance: 'low' | 'medium' | 'high') {
  console.log('[mockData] Getting AI recommendation for:', symbol, 'Risk tolerance:', riskTolerance);

  const stock = getStockBySymbol(symbol);
  if (!stock) {
    console.error('[mockData] Stock not found for symbol:', symbol);
    return null;
  }

  const isEtf = stock.isEtf;
  const expiryDays = isEtf ? 7 : 14; // Ensuring we have at least 7 days

  // Create a proper Date object with time set to noon to avoid timezone issues
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  expiryDate.setHours(12, 0, 0, 0); // Set to noon

  // Determine trend based on recent price change
  const recentTrend = stock.change > 0;
  const optionType = recentTrend ? 'call' as const : 'put' as const;

  // Calculate strike price based on risk tolerance and current price
  let strikeDelta = 0;
  switch(riskTolerance) {
    case 'low':
      strikeDelta = optionType === 'call' ? 0.02 : -0.02;
      break;
    case 'medium':
      strikeDelta = optionType === 'call' ? 0.05 : -0.05;
      break;
    case 'high':
      strikeDelta = optionType === 'call' ? 0.08 : -0.08;
      break;
    default:
      strikeDelta = optionType === 'call' ? 0.05 : -0.05; // Default to medium
  }

  const strikePrice = Math.max(1, Math.round(stock.price * (1 + strikeDelta)));

  // Calculate premium based on volatility and time to expiry - ensure it's reasonable
  const daysToExpiry = expiryDays;
  const volatilityFactor = riskTolerance === 'high' ? 0.12 : (riskTolerance === 'medium' ? 0.08 : 0.05);
  const premium = Math.max(0.01, Math.round(stock.price * volatilityFactor * Math.sqrt(daysToExpiry / 365) * 100) / 100);

  // Determine confidence based on price movement and risk tolerance
  const confidenceLevels = ['low', 'medium', 'high'] as const;
  const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];

  // Generate reasoning based on actual market conditions
  let reasoning = '';
  if (optionType === 'call') {
    reasoning = `Based on positive price momentum (${stock.change.toFixed(2)}%) and ${daysToExpiry}-day historical performance, a ${optionType} option may capitalize on potential upside.`;
  } else {
    reasoning = `Recent price weakness (${stock.change.toFixed(2)}%) and market conditions suggest a ${optionType} option could be valuable as a hedge.`;
  }

  const recommendation = {
    symbol,
    confidence,
    optionContract: {
      id: `rec-${Date.now()}`,
      stockId: stock.id,
      symbol,
      type: optionType,
      strikePrice,
      expiryDate, // This is now a properly formatted Date
      premium,
      quantity: 1  // Add default quantity
    },
    reasoning,
  };

  console.log('[mockData] Generated recommendation:', recommendation);
  return recommendation;
}
