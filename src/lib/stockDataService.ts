// Centralized Stock and Options Data Service
import { StockQuote } from './mockStockService';
import { mockStocks } from '@/data/mockData';

// Re-exporting StockQuote
export type { StockQuote };

// Constants
const API_BASE_URL = '/api'; // Use a relative path for Vercel
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

interface OptionData {
  contractSymbol: string;
  strike: number;
  type: 'call' | 'put';
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

interface OptionsDataCache {
  [symbol: string]: {
    options: OptionData[];
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
  peRatio?: number;
  high52Week?: number;
  low52Week?: number;
  avgVolume?: number;
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
    }, REAL_TIME_INTERVAL) as unknown as NodeJS.Timeout;

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

  private async fetchWithFallBack(path: string) {
    const url = `${API_BASE_URL}${path}`;
    try {
      const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }
      return await response.json();
      } catch (error) {
      console.error(`Error fetching from backend at ${url}:`, error);
      throw error;
    }
  }

  // Fetch real-time quote data
  private async fetchRealTimeQuote(symbol: string): Promise<StockQuote | null> {
    try {
      const quote = await this.fetchWithFallBack(`/yahoo/quote/${symbol}`);
      if (quote) {
          this.stockCache[symbol] = {
          quote,
            lastUpdated: Date.now()
          };
        return quote;
        }
      return null;
      } catch (error) {
      console.warn(`Error fetching real-time quote for ${symbol}:`, error);
    return null;
    }
  }

  // Cache management
  private isCacheValid(lastUpdated: number): boolean {
    return Date.now() - lastUpdated < CACHE_TTL;
  }

  // News types
  public async getCompanyNews(symbol: string, limit: number = 8): Promise<Array<{
    title: string;
    url: string;
    publisher?: string;
    publishedAt?: string;
    summary?: string;
    imageUrl?: string;
  }>> {
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      const data = await this.fetchWithFallBack(`/yahoo/news/${symbol}?${params.toString()}`);
      if (Array.isArray(data)) return data;
      throw new Error('Invalid news response');
    } catch (error) {
      console.warn('Error fetching news, using mock news:', error);
      // Generate simple mock news to avoid empty UI
      const now = new Date();
      return Array.from({ length: limit }).map((_, i) => ({
        title: `${symbol} market update #${i + 1}`,
        url: `https://finance.yahoo.com/quote/${symbol}`,
        publisher: 'AlphaSphere AI',
        publishedAt: new Date(now.getTime() - i * 3600_000).toISOString(),
        summary: `${symbol} latest development and market commentary.`,
      }));
    }
  }

  // Company info methods
  public async getCompanyInfo(symbol: string): Promise<CompanyInfo | null> {
    try {
      return await this.fetchWithFallBack(`/yahoo/info/${symbol}`);
    } catch (error) {
      console.warn(`Error fetching company info for ${symbol}:`, error);
      return null;
    }
  }

  // Historical price data
  public async getHistoricalPrices(
    symbol: string,
    days: number = 30,
    intervalOverride?: string
  ): Promise<{ date: string; open: number; high: number; low: number; close: number; volume: number }[]> {
    const period = `${days}d`;
    // Use intraday intervals for 1-day charts, daily for longer periods unless overridden
    const interval = intervalOverride || (days === 1 ? '5m' : '1d');
    try {
      const data = await this.fetchWithFallBack(`/yahoo/history/${symbol}?period=${period}&interval=${interval}`);
      console.log('API returned data:', data);
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
      throw new Error('No data returned from API');
    } catch (error) {
      console.error('Error fetching historical data, using fallback:', error);
      // Fallback to mock data on error
      try {
        const quote = await this.getStockQuote(symbol);
        const basePrice = quote.price;
        const prices = [];

        if (days === 1) {
          // Generate intraday data for 1-day chart
          const now = new Date();
          const marketOpen = new Date(now);
          marketOpen.setHours(9, 30, 0, 0);
          const marketClose = new Date(now);
          marketClose.setHours(16, 0, 0, 0);
          
          const intervalMs = 5 * 60 * 1000; // 5 minutes
          const currentTime = Math.min(now.getTime(), marketClose.getTime());
          let currentPrice = basePrice;
          
          for (let timestamp = marketOpen.getTime(); timestamp <= currentTime; timestamp += intervalMs) {
            const date = new Date(timestamp);
            const volatility = 0.015;
            const randomChange = (Math.random() - 0.5) * volatility;
            currentPrice = currentPrice * (1 + randomChange);
            
            prices.push({
              date: date.toISOString(),
              open: currentPrice * 0.999,
              high: currentPrice * 1.002,
              low: currentPrice * 0.998,
              close: currentPrice,
              volume: Math.floor(Math.random() * 500000) + 100000
            });
          }
        } else {
          // Generate daily data for longer periods
          let currentPrice = basePrice;
          for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dailyChange = (Math.random() - 0.5) * 0.04;
            currentPrice = currentPrice * (1 + dailyChange);
            
            prices.push({
              date: date.toISOString().split('T')[0],
              open: currentPrice * 0.99,
              high: currentPrice * 1.02,
              low: currentPrice * 0.98,
              close: currentPrice,
              volume: Math.floor(Math.random() * 1000000) + 100000
            });
          }
        }

        console.log('Generated fallback data:', prices);
        return prices;
      } catch (fallbackError) {
        console.error('Error generating fallback data:', fallbackError);
        // Return minimal fallback data
        return [{
          date: new Date().toISOString(),
          open: 150,
          high: 155,
          low: 145,
          close: 150,
          volume: 1000000
        }];
      }
    }
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
    const cachedData = this.stockCache[symbol];
    if (cachedData && this.isCacheValid(cachedData.lastUpdated)) {
      return cachedData.quote;
    }

    try {
      const stockQuote = await this.fetchRealTimeQuote(symbol);
      if (stockQuote) {
        this.stockCache[symbol] = {
          quote: stockQuote,
          lastUpdated: Date.now(),
        };
        return stockQuote;
      }
      throw new Error('Failed to fetch quote from backend');
    } catch (error) {
      console.error('Error fetching combined stock quote:', error);
      if (cachedData) {
        return cachedData.quote;
      }
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

  // Options data methods
  public async getOptionsChain(symbol: string, expiryDate?: string, limit: number = 20): Promise<{
    calls: OptionData[];
    puts: OptionData[];
    underlying: { symbol: string; price: number; lastUpdated: string };
  }> {
    try {
      const params = new URLSearchParams();
      if (expiryDate) params.append('expiry', expiryDate);
      params.append('limit', limit.toString());
      
      const response = await this.fetchWithFallBack(`/yahoo/options/${symbol}?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching options chain:', error);
      return this.getMockOptionsChain(symbol, expiryDate, limit);
    }
  }

  public async getOptionsExpirations(symbol: string): Promise<Array<{
    date: string;
    daysToExpiry: number;
    formatted: string;
  }>> {
    try {
      return await this.fetchWithFallBack(`/yahoo/options/expirations/${symbol}`);
    } catch (error) {
      console.error('Error fetching options expirations:', error);
      return this.getMockOptionsExpirations();
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
    const current = new Date();
    
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

  private getMockOptionsChain(symbol: string, expiryDate?: string, limit: number = 20) {
    const quote = this.stockCache[symbol]?.quote;
    const currentPrice = quote?.price || 150;
    const baseStrike = Math.round(currentPrice / 5) * 5;
    
    const calls: OptionData[] = [];
    const puts: OptionData[] = [];
    
    for (let i = -limit/2; i <= limit/2; i++) {
      const strike = baseStrike + (i * 5);
      if (strike <= 0) continue;
      
      const moneyness = strike / currentPrice;
      const timeValue = Math.max(0.5, 5 - Math.abs(moneyness - 1) * 10);
      
      // Call option
      const callIntrinsic = Math.max(currentPrice - strike, 0);
      const callPrice = callIntrinsic + timeValue;
      const callIv = 0.3 + Math.abs(moneyness - 1) * 0.1;
      
      calls.push({
        contractSymbol: `${symbol}${expiryDate?.replace(/-/g, '').substring(2) || '231215'}C${strike}`,
        strike,
        type: 'call',
        expiration: expiryDate || '2023-12-15',
        bid: Math.round((callPrice - 0.05) * 100) / 100,
        ask: Math.round((callPrice + 0.05) * 100) / 100,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        delta: Math.max(0.1, Math.min(0.9, 0.5 + (currentPrice - strike) / (currentPrice * 0.2))),
        gamma: Math.random() * 0.05,
        theta: -Math.random() * 0.1,
        vega: Math.random() * 0.2,
        rho: Math.random() * 0.01
      });
      
      // Put option
      const putIntrinsic = Math.max(strike - currentPrice, 0);
      const putPrice = putIntrinsic + timeValue;
      const putIv = 0.3 + Math.abs(moneyness - 1) * 0.1 + 0.02;
      
      puts.push({
        contractSymbol: `${symbol}${expiryDate?.replace(/-/g, '').substring(2) || '231215'}P${strike}`,
        strike,
        type: 'put',
        expiration: expiryDate || '2023-12-15',
        bid: Math.round((putPrice - 0.05) * 100) / 100,
        ask: Math.round((putPrice + 0.05) * 100) / 100,
        volume: Math.floor(Math.random() * 1000),
        openInterest: Math.floor(Math.random() * 5000),
        delta: -Math.max(0.1, Math.min(0.9, 0.5 + (strike - currentPrice) / (currentPrice * 0.2))),
        gamma: Math.random() * 0.05,
        theta: -Math.random() * 0.1,
        vega: Math.random() * 0.2,
        rho: -Math.random() * 0.01
      });
    }
    
    return {
      calls,
      puts,
      underlying: {
        symbol,
        price: currentPrice,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private getMockOptionsExpirations() {
    const expirations = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 4; i++) {
      const daysAhead = 4 - currentDate.getDay(); // Friday is 5
      const targetDays = daysAhead <= 0 ? daysAhead + 7 + (i * 7) : daysAhead + (i * 7);
      const expirationDate = new Date(currentDate.getTime() + targetDays * 24 * 60 * 60 * 1000);
      
      expirations.push({
        date: expirationDate.toISOString().split('T')[0],
        daysToExpiry: targetDays,
        formatted: expirationDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      });
    }
    
    return expirations;
  }
}

// Export singleton instance
export const stockDataService = StockDataService.getInstance();
