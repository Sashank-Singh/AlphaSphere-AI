import { Stock, NewsItem, Portfolio, User } from '@/types';
import { getRandomChange, getRandomPrice } from '@/lib/utils';

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
    id: '1',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    price: 174.79,
    change: 0.0215,
    marketCap: 2750000000000,
    volume: 57000000,
    pe: 28.7,
    sector: 'Technology',
  },
  {
    id: '2',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    price: 418.34,
    change: 0.0132,
    marketCap: 3100000000000,
    volume: 29000000,
    pe: 36.9,
    sector: 'Technology',
  },
  {
    id: '3',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.75,
    change: -0.0087,
    marketCap: 1850000000000,
    volume: 31000000,
    pe: 60.2,
    sector: 'Consumer Cyclical',
  },
  {
    id: '4',
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    price: 235.45,
    change: -0.0221,
    marketCap: 750000000000,
    volume: 65000000,
    pe: 75.8,
    sector: 'Automotive',
  },
  {
    id: '5',
    ticker: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    price: 511.35,
    change: 0.0075,
    marketCap: null,
    volume: 85000000,
    pe: null,
    isEtf: true,
    sector: 'Index Fund',
  },
  {
    id: '6',
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust',
    price: 425.57,
    change: 0.0092,
    marketCap: null,
    volume: 55000000,
    pe: null,
    isEtf: true,
    sector: 'Technology',
  },
];

// Mock Market Indices
export const mockIndices: Stock[] = [
  {
    id: 'index1',
    ticker: 'S&P 500',
    name: 'S&P 500 Index',
    price: 5100.27,
    change: 0.0082,
  },
  {
    id: 'index2',
    ticker: 'DOW',
    name: 'Dow Jones Industrial Average',
    price: 38547.35,
    change: 0.0065,
  },
  {
    id: 'index3',
    ticker: 'NASDAQ',
    name: 'NASDAQ Composite',
    price: 16084.69,
    change: 0.0110,
  },
];

// Mock News
export const mockNews: NewsItem[] = [
  {
    id: 'news1',
    title: 'Apple Unveils New iPhone Pro Max with Groundbreaking AI Features',
    source: 'TechCrunch',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    imageUrl: 'https://source.unsplash.com/random/300x200?phone',
    url: '#',
    tickers: ['AAPL'],
  },
  {
    id: 'news2',
    title: 'Tesla Reports Record Q2 Deliveries, Shares Jump 5%',
    source: 'Reuters',
    timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
    imageUrl: 'https://source.unsplash.com/random/300x200?car',
    url: '#',
    tickers: ['TSLA'],
  },
  {
    id: 'news3',
    title: 'Federal Reserve Signals Potential Rate Cuts, Markets Rally',
    source: 'Wall Street Journal',
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    imageUrl: 'https://source.unsplash.com/random/300x200?finance',
    url: '#',
    tickers: ['SPY', 'QQQ'],
  },
  {
    id: 'news4',
    title: 'Microsoft Azure Growth Accelerates as Cloud Demand Surges',
    source: 'Bloomberg',
    timestamp: new Date(Date.now() - 18000000), // 5 hours ago
    imageUrl: 'https://source.unsplash.com/random/300x200?cloud',
    url: '#',
    tickers: ['MSFT'],
  },
  {
    id: 'news5',
    title: 'Amazon Expands Same-Day Delivery to More U.S. Cities',
    source: 'CNBC',
    timestamp: new Date(Date.now() - 28800000), // 8 hours ago
    imageUrl: 'https://source.unsplash.com/random/300x200?delivery',
    url: '#',
    tickers: ['AMZN'],
  },
];

// Mock Portfolio
export const mockPortfolio: Portfolio = {
  cash: 5324.78,
  totalValue: 10000.00,
  positions: [
    {
      id: 'pos1',
      stockId: '1',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      quantity: 10,
      averagePrice: 170.25,
      currentPrice: 174.79,
    },
    {
      id: 'pos2',
      stockId: '3',
      ticker: 'AMZN',
      name: 'Amazon.com Inc.',
      quantity: 5,
      averagePrice: 175.50,
      currentPrice: 178.75,
    },
    {
      id: 'pos3',
      stockId: '5',
      ticker: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      quantity: 3,
      averagePrice: 505.20,
      currentPrice: 511.35,
    },
  ],
  optionPositions: [
    {
      id: 'opt1',
      stockId: '4',
      ticker: 'TSLA',
      type: 'call',
      strikePrice: 250,
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      premium: 7.35,
      quantity: 2,
    },
    {
      id: 'opt2',
      stockId: '2',
      ticker: 'MSFT',
      type: 'put',
      strikePrice: 400,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      premium: 4.89,
      quantity: 1,
    },
  ],
  transactions: [
    {
      id: 'tx1',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      type: 'buy',
      assetType: 'stock',
      ticker: 'AAPL',
      quantity: 10,
      price: 170.25,
      total: 1702.50,
    },
    {
      id: 'tx2',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      type: 'buy',
      assetType: 'stock',
      ticker: 'AMZN',
      quantity: 5,
      price: 175.50,
      total: 877.50,
    },
    {
      id: 'tx3',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      type: 'buy',
      assetType: 'stock',
      ticker: 'SPY',
      quantity: 3,
      price: 505.20,
      total: 1515.60,
    },
    {
      id: 'tx4',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      type: 'buy',
      assetType: 'option',
      ticker: 'TSLA',
      quantity: 2,
      price: 7.35,
      total: 735.00,
      optionDetails: {
        type: 'call',
        strikePrice: 250,
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        premium: 7.35,
      },
    },
    {
      id: 'tx5',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      type: 'buy',
      assetType: 'option',
      ticker: 'MSFT',
      quantity: 1,
      price: 4.89,
      total: 489.00,
      optionDetails: {
        type: 'put',
        strikePrice: 400,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        premium: 4.89,
      },
    },
  ],
};

// Function to refresh stock prices
export function refreshStockPrices() {
  return mockStocks.map(stock => ({
    ...stock,
    price: getRandomPrice(stock.price),
    change: getRandomChange(),
    lastUpdated: new Date(),
  }));
}

// Function to get stock by ticker
export function getStockByTicker(ticker: string): Stock | undefined {
  return mockStocks.find(stock => stock.ticker === ticker);
}

// Function to simulate AI recommendation
export function getAIRecommendation(ticker: string, riskTolerance: 'low' | 'medium' | 'high') {
  const stock = getStockByTicker(ticker);
  if (!stock) return null;
  
  const isEtf = stock.isEtf;
  const expiryDays = isEtf ? 0 : 7; // 0-day for ETFs, 7-day for stocks
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  
  // Determine if we should recommend a call or put
  const recentTrend = Math.random() > 0.5; // Simplified logic, randomly decide trend
  const optionType = recentTrend ? 'call' as const : 'put' as const;
  
  // Calculate strike price based on risk tolerance
  let strikeDelta = 0;
  switch(riskTolerance) {
    case 'low':
      strikeDelta = optionType === 'call' ? 0.03 : -0.03;
      break;
    case 'medium':
      strikeDelta = optionType === 'call' ? 0.07 : -0.07;
      break;
    case 'high':
      strikeDelta = optionType === 'call' ? 0.12 : -0.12;
      break;
  }
  
  const strikePrice = Math.round(stock.price * (1 + strikeDelta));
  
  // Calculate premium
  const daysToExpiry = expiryDays;
  const volatilityFactor = riskTolerance === 'high' ? 0.15 : (riskTolerance === 'medium' ? 0.10 : 0.05);
  const premium = Math.round(stock.price * volatilityFactor * Math.sqrt(daysToExpiry / 365) * 100) / 100;
  
  // Random confidence level
  const confidenceLevels = ['low', 'medium', 'high'] as const;
  const confidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)];
  
  // Generate reasoning
  let reasoning = '';
  if (optionType === 'call') {
    reasoning = `Based on recent positive momentum and ${daysToExpiry}-day historical performance, a ${optionType} option may capitalize on potential upside.`;
  } else {
    reasoning = `Recent price weakness and increased volatility suggest a ${optionType} option could be valuable as a hedge.`;
  }
  
  return {
    ticker,
    confidence,
    optionContract: {
      id: `rec-${Date.now()}`,
      stockId: stock.id,
      ticker,
      type: optionType,
      strikePrice,
      expiryDate,
      premium,
    },
    reasoning,
  };
}
