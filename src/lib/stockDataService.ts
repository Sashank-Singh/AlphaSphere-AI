// Centralized Stock and Options Data Service
import { StockQuote, CompanyInfo } from './api';

// Constants
const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

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

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

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

  private constructor() {}

  public static getInstance(): StockDataService {
    if (!StockDataService.instance) {
      StockDataService.instance = new StockDataService();
    }
    return StockDataService.instance;
  }

  private async fetchYahooFinance(symbol: string, range: string = '1d', interval: string = '5m') {
    try {
      const url = `${YAHOO_FINANCE_API_URL}/${symbol}?range=${range}&interval=${interval}`;
      console.log(`Fetching from Yahoo Finance: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Yahoo Finance API error (${response.status}): ${errorText}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from Yahoo Finance:', error);
      return null;
    }
  }

  private isCacheValid(lastUpdated: number): boolean {
    return Date.now() - lastUpdated < CACHE_TTL;
  }

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    // Check cache first
    const cachedData = this.stockCache[symbol];
    if (cachedData && this.isCacheValid(cachedData.lastUpdated)) {
      return cachedData.quote;
    }

    try {
      const yahooData = await this.fetchYahooFinance(symbol);
      
      if (yahooData?.chart?.result?.[0]) {
        const result = yahooData.chart.result[0];
        const quote = result.indicators.quote[0];
        const meta = result.meta;
        
        const latestIndex = result.timestamp.length - 1;
        const currentPrice = meta.regularMarketPrice || (quote.close ? quote.close[latestIndex] : 0);
        const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        const stockQuote: StockQuote = {
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
