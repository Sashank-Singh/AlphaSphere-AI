// Centralized Stock and Options Data Service
import { StockQuote, CompanyInfo } from './mockStockService';
import { mockStocks } from '../data/mockData';

// Constants
const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const YAHOO_QUOTE_API_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Types for data storage
interface StockDataCache {
  [symbol: string]: {
    quote: StockQuote;
    lastUpdated: number;
  };
}

interface OptionsDataCache {
  [symbol: string]: {
    options: any[];
    underlying: { price: number };
    lastUpdated: number;
  };
}

// Cache TTL in milliseconds (30 seconds for real-time updates)
const CACHE_TTL = 30 * 1000;

// Real-time update interval (10 seconds)
const REAL_TIME_INTERVAL = 10 * 1000;

// Add CompanyInfo interface
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

class StockDataService {
  private static instance: StockDataService;
  private stockCache: StockDataCache = {};
  private optionsCache: OptionsDataCache = {};
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private subscribers: Map<string, Set<(quote: StockQuote) => void>> = new Map();

  private constructor() {}

  // Subscribe to real-time updates for a symbol
  public subscribe(symbol: string, callback: (quote: StockQuote) => void): () => void {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
      this.startRealTimeUpdates(symbol);
    }
    
    this.subscribers.get(symbol)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const symbolSubscribers = this.subscribers.get(symbol);
      if (symbolSubscribers) {
        symbolSubscribers.delete(callback);
        if (symbolSubscribers.size === 0) {
          this.stopRealTimeUpdates(symbol);
          this.subscribers.delete(symbol);
        }
      }
    };
  }

  // Start real-time updates for a symbol
  private startRealTimeUpdates(symbol: string): void {
    if (this.updateIntervals.has(symbol)) {
      return; // Already updating
    }

    const updateInterval = setInterval(async () => {
      try {
        const quote = await this.fetchRealTimeQuote(symbol);
        if (quote) {
          this.notifySubscribers(symbol, quote);
        }
      } catch (error) {
        console.error(`Error updating real-time data for ${symbol}:`, error);
      }
    }, REAL_TIME_INTERVAL);

    this.updateIntervals.set(symbol, updateInterval);
  }

  // Stop real-time updates for a symbol
  private stopRealTimeUpdates(symbol: string): void {
    const interval = this.updateIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(symbol);
    }
  }

  // Notify all subscribers of a symbol
  private notifySubscribers(symbol: string, quote: StockQuote): void {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.forEach(callback => {
        try {
          callback(quote);
        } catch (error) {
          console.error('Error in subscriber callback:', error);
        }
      });
    }
  }

  public static getInstance(): StockDataService {
    if (!StockDataService.instance) {
      StockDataService.instance = new StockDataService();
    }
    return StockDataService.instance;
  }

  private async fetchYahooFinance(symbol: string, range: string = '1d', interval: string = '5m') {
    const urls = [
      `${YAHOO_FINANCE_API_URL}/${symbol}?range=${range}&interval=${interval}`,
      `${CORS_PROXY}${encodeURIComponent(`${YAHOO_FINANCE_API_URL}/${symbol}?range=${range}&interval=${interval}`)}`
    ];

    for (const url of urls) {
      try {
        console.log(`Fetching from Yahoo Finance: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.warn(`Yahoo Finance API error (${response.status}) for URL: ${url}`);
          continue;
        }
        
        const data = await response.json();
        if (data?.chart?.result?.[0]) {
          return data;
        }
      } catch (error) {
        console.warn(`Error fetching from ${url}:`, error);
        continue;
      }
    }
    
    console.error('All Yahoo Finance API endpoints failed');
    return null;
  }

  // Fetch real-time quote data
  private async fetchRealTimeQuote(symbol: string): Promise<StockQuote | null> {
    const urls = [
      `${YAHOO_QUOTE_API_URL}?symbols=${symbol}`,
      `${CORS_PROXY}${encodeURIComponent(`${YAHOO_QUOTE_API_URL}?symbols=${symbol}`)}`
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          continue;
        }
        
        const data = await response.json();
        if (data?.quoteResponse?.result?.[0]) {
          const quote = data.quoteResponse.result[0];
          const stockQuote: StockQuote = {
            symbol: quote.symbol,
            price: quote.regularMarketPrice || quote.ask || quote.bid || 0,
            open: quote.regularMarketOpen || 0,
            high: quote.regularMarketDayHigh || 0,
            low: quote.regularMarketDayLow || 0,
            volume: quote.regularMarketVolume || 0,
            previousClose: quote.regularMarketPreviousClose || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            latestTradingDay: new Date().toISOString().split('T')[0]
          };

          // Update cache
          this.stockCache[symbol] = {
            quote: stockQuote,
            lastUpdated: Date.now()
          };

          return stockQuote;
        }
      } catch (error) {
        console.warn(`Error fetching real-time quote from ${url}:`, error);
        continue;
      }
    }
    
    return null;
  }

  // Cache management
  private isCacheValid(lastUpdated: number): boolean {
    return Date.now() - lastUpdated < CACHE_TTL;
  }

  // Company info methods
  public async getCompanyInfo(symbol: string): Promise<CompanyInfo | null> {
    // For now, return basic company info based on symbol
    // This could be enhanced with a real company info API
    const companyMap: { [key: string]: CompanyInfo } = {
      'AAPL': {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        marketCap: 3000000000000,
        employees: 164000,
        website: 'https://www.apple.com'
      },
      'GOOGL': {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        description: 'Alphabet Inc. provides online advertising services in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
        sector: 'Technology',
        industry: 'Internet Content & Information',
        marketCap: 2000000000000,
        employees: 190000,
        website: 'https://www.alphabet.com'
      },
      'MSFT': {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
        sector: 'Technology',
        industry: 'Software—Infrastructure',
        marketCap: 2800000000000,
        employees: 221000,
        website: 'https://www.microsoft.com'
      },
      'TSLA': {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
        marketCap: 800000000000,
        employees: 140000,
        website: 'https://www.tesla.com'
      }
    };

    return companyMap[symbol] || {
      symbol,
      name: `${symbol} Corporation`,
      description: `${symbol} is a publicly traded company.`,
      sector: 'Unknown',
      industry: 'Unknown',
      marketCap: 0,
      employees: 0,
      website: ''
    };
  }

  // Historical price data
  public async getHistoricalPrices(symbol: string, days: number = 30): Promise<any[]> {
    try {
      // Try to get historical data from Yahoo Finance
      const yahooData = await this.fetchYahooFinance(symbol, `${days}d`, '1d');
      
      if (yahooData?.chart?.result?.[0]) {
        const result = yahooData.chart.result[0];
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        return timestamps.map((timestamp: number, index: number) => ({
          date: new Date(timestamp * 1000).toISOString().split('T')[0],
          open: quotes.open[index] || 0,
          high: quotes.high[index] || 0,
          low: quotes.low[index] || 0,
          close: quotes.close[index] || 0,
          volume: quotes.volume[index] || 0
        })).filter(item => item.close > 0);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }

    // Fallback: generate mock historical data
    const quote = await this.getStockQuote(symbol);
    const basePrice = quote.price;
    const prices = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dailyChange = (Math.random() - 0.5) * 2;
      const price = basePrice * (1 + (dailyChange / 100) * i);
      
      prices.push({
        date: date.toISOString().split('T')[0],
        open: price * 0.99,
        high: price * 1.02,
        low: price * 0.98,
        close: price,
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }

    return prices;
  }

  // Popular stocks
  public async getPopularStocks(): Promise<StockQuote[]> {
    return Promise.all(mockStocks.map(stock => this.getStockQuote(stock.symbol)));
  }

  // Market indices
  public async getMarketIndices(): Promise<StockQuote[]> {
    const indices = ['SPY', 'QQQ', 'DIA'];
    return Promise.all(indices.map(symbol => this.getStockQuote(symbol)));
  }

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    // Check cache first
    const cachedData = this.stockCache[symbol];
    if (cachedData && this.isCacheValid(cachedData.lastUpdated)) {
      return cachedData.quote;
    }

    try {
      // Try real-time quote API first (faster and more current)
      let stockQuote = await this.fetchRealTimeQuote(symbol);
      
      if (stockQuote) {
        return stockQuote;
      }

      // Fallback to chart API
      const yahooData = await this.fetchYahooFinance(symbol);
      
      if (yahooData?.chart?.result?.[0]) {
        const result = yahooData.chart.result[0];
        const quote = result.indicators.quote[0];
        const meta = result.meta;
        
        const latestIndex = result.timestamp.length - 1;
        const currentPrice = meta.regularMarketPrice || (quote.close ? quote.close[latestIndex] : 0);
        const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
        const change = currentPrice - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
        
        stockQuote = {
          symbol: symbol,
          price: currentPrice,
          open: quote.open ? quote.open[latestIndex] : 0,
          high: quote.high ? quote.high[latestIndex] : 0,
          low: quote.low ? quote.low[latestIndex] : 0,
          volume: quote.volume ? quote.volume[latestIndex] : 0,
          previousClose: previousClose,
          change: change,
          changePercent: changePercent,
          latestTradingDay: new Date().toISOString().split('T')[0]
        };

        // Update cache
        this.stockCache[symbol] = {
          quote: stockQuote,
          lastUpdated: Date.now()
        };

        return stockQuote;
      }
      
      throw new Error('Invalid data format from Yahoo Finance');
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      
      // Return cached data if available, even if expired
      if (cachedData) {
        console.log('Returning expired cached data for', symbol);
        return cachedData.quote;
      }
      
      // Last resort: return mock data
      console.log('Returning mock data for', symbol);
      return this.getMockStockData(symbol);
    }
  }

  public async getOptionsData(symbol: string, requireGreeks: boolean = false, specificContract?: string) {
    // Check cache first
    const cachedData = this.optionsCache[symbol];
    if (cachedData && this.isCacheValid(cachedData.lastUpdated)) {
      return cachedData;
    }

    try {
      const quote = await this.getStockQuote(symbol);
      const currentPrice = quote.price;

      // Generate mock expiration dates (next 4 fridays)
      const expirationDates = this.generateNextFridays(4);
      
      let optionsData;
      if (specificContract) {
        const mockContract = this.generateMockOptionContract(specificContract, currentPrice);
        optionsData = {
          options: [mockContract],
          underlying: { price: currentPrice }
        };
      } else {
        const mockOptions = this.generateMockOptionsChain(symbol, expirationDates[0], currentPrice);
        optionsData = {
          options: mockOptions,
          underlying: { price: currentPrice }
        };
      }

      // Update cache
      this.optionsCache[symbol] = {
        ...optionsData,
        lastUpdated: Date.now()
      };

      return optionsData;
    } catch (error) {
      console.error('Error fetching options data:', error);
      return { error: 'Network error', message: String(error) };
    }
  }

  private getMockStockData(symbol: string): StockQuote {
    const basePrice = Math.random() * 1000;
    const previousClose = basePrice * (1 + (Math.random() * 0.02 - 0.01));
    const change = basePrice - previousClose;
    
    return {
      symbol: symbol,
      price: basePrice,
      open: previousClose * (1 + (Math.random() * 0.01)),
      high: basePrice * (1 + Math.random() * 0.02),
      low: basePrice * (1 - Math.random() * 0.02),
      volume: Math.floor(Math.random() * 10000000),
      previousClose: previousClose,
      change: change,
      changePercent: (change / previousClose) * 100,
      latestTradingDay: new Date().toISOString().split('T')[0]
    };
  }

  private generateNextFridays(count: number): string[] {
    const fridays: string[] = [];
    let current = new Date();
    
    while (fridays.length < count) {
      current.setDate(current.getDate() + 1);
      if (current.getDay() === 5) { // Friday is 5
        fridays.push(current.toISOString().split('T')[0]);
      }
    }
    
    return fridays;
  }

  private generateMockOptionContract(contractSymbol: string, underlyingPrice: number) {
    const strike = underlyingPrice * (1 + (Math.random() * 0.2 - 0.1));
    const isCall = Math.random() > 0.5;
    
    return {
      contractSymbol,
      strike,
      type: isCall ? 'call' : 'put',
      expiration: this.generateNextFridays(1)[0],
      bid: strike * 0.95,
      ask: strike * 1.05,
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      delta: isCall ? 0.6 : -0.4,
      gamma: 0.02,
      theta: -0.03,
      vega: 0.04,
      rho: 0.01
    };
  }

  private generateMockOptionsChain(symbol: string, expiration: string, underlyingPrice: number) {
    const strikes = [
      underlyingPrice * 0.9,
      underlyingPrice * 0.95,
      underlyingPrice,
      underlyingPrice * 1.05,
      underlyingPrice * 1.1
    ];

    return strikes.flatMap(strike => [
      this.generateMockOptionContract(`${symbol}${expiration}C${strike}`, underlyingPrice),
      this.generateMockOptionContract(`${symbol}${expiration}P${strike}`, underlyingPrice)
    ]);
  }
}

// Export singleton instance
export const stockDataService = StockDataService.getInstance(); 