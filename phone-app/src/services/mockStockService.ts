// Mock Stock Data Service
import { mockStocks } from '../data/mockData';

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
  name: string;
  description: string;
  sector: string;
  industry: string;
  employees: number;
  website: string;
  marketCap: number;
  peRatio: number;
  beta: number;
  dividendYield: number;
  logo?: string;
}

class MockStockService {
  private static instance: MockStockService;
  private stockCache: { [symbol: string]: StockQuote } = {};
  private companyCache: { [symbol: string]: CompanyInfo } = {};

  private constructor() {
    // Initialize with some mock data
    mockStocks.forEach(stock => {
      this.stockCache[stock.symbol] = {
        symbol: stock.symbol,
        price: stock.price,
        open: stock.price * 0.99,
        high: stock.price * 1.02,
        low: stock.price * 0.98,
        volume: stock.volume,
        previousClose: stock.price - stock.change,
        change: stock.change,
        changePercent: (stock.change / (stock.price - stock.change)) * 100,
        latestTradingDay: new Date().toISOString().split('T')[0]
      };

      this.companyCache[stock.symbol] = {
        name: stock.name,
        description: `${stock.name} is a leading company in the ${stock.sector} sector.`,
        sector: stock.sector,
        industry: stock.sector,
        employees: Math.floor(Math.random() * 100000) + 1000,
        website: `https://www.${stock.symbol.toLowerCase()}.com`,
        marketCap: stock.price * (Math.floor(Math.random() * 1000000000) + 100000000),
        peRatio: Math.random() * 30 + 10,
        beta: Math.random() * 2,
        dividendYield: Math.random() * 3,
        logo: stock.logo
      };
    });
  }

  public static getInstance(): MockStockService {
    if (!MockStockService.instance) {
      MockStockService.instance = new MockStockService();
    }
    return MockStockService.instance;
  }

  public async getStockQuote(symbol: string): Promise<StockQuote> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    let quote = this.stockCache[symbol];
    if (!quote) {
      // Generate random data for unknown symbols
      const basePrice = 100 + Math.random() * 100;
      quote = {
        symbol,
        price: basePrice,
        open: basePrice * 0.99,
        high: basePrice * 1.02,
        low: basePrice * 0.98,
        volume: Math.floor(Math.random() * 1000000),
        previousClose: basePrice * 0.99,
        change: basePrice * 0.01,
        changePercent: 1,
        latestTradingDay: new Date().toISOString().split('T')[0]
      };
      this.stockCache[symbol] = quote;
    } else {
      // Update the price with some random movement
      const priceChange = quote.price * (Math.random() * 0.02 - 0.01);
      quote.price += priceChange;
      quote.high = Math.max(quote.high, quote.price);
      quote.low = Math.min(quote.low, quote.price);
      quote.change = quote.price - quote.previousClose;
      quote.changePercent = (quote.change / quote.previousClose) * 100;
      quote.volume += Math.floor(Math.random() * 10000);
    }

    return quote;
  }

  public async getCompanyInfo(symbol: string): Promise<CompanyInfo | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.companyCache[symbol] || null;
  }

  public async getHistoricalPrices(symbol: string, days: number = 30): Promise<any[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const prices = [];
    const quote = await this.getStockQuote(symbol);
    const basePrice = quote.price;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate some random price movement
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

  public async getPopularStocks(): Promise<StockQuote[]> {
    // Return quotes for the mock stocks
    return Promise.all(mockStocks.map(stock => this.getStockQuote(stock.symbol)));
  }

  public async getMarketIndices(): Promise<StockQuote[]> {
    // Return mock data for major indices
    const indices = ['SPY', 'QQQ', 'DIA'];
    return Promise.all(indices.map(symbol => this.getStockQuote(symbol)));
  }
}

export const mockStockService = MockStockService.getInstance(); 