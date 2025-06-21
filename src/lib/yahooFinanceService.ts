import axios from 'axios';

// Types for Yahoo Finance API responses
interface YahooOptionContract {
  contractSymbol: string;
  strike: number;
  currency: string;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  contractSize: string;
  expiration: number;
  lastTradeDate: number;
  impliedVolatility: number;
  inTheMoney: boolean;
}

interface YahooOptionsData {
  underlyingSymbol: string;
  expirationDates: number[];
  strikes: number[];
  hasMiniOptions: boolean;
  quote: {
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
  };
  options: Array<{
    expirationDate: number;
    hasMiniOptions: boolean;
    calls: YahooOptionContract[];
    puts: YahooOptionContract[];
  }>;
}

interface YahooResponse {
  optionChain: {
    result: YahooOptionsData[];
    error: null;
  };
}

export interface OptionChainData {
  symbol: string;
  underlyingPrice: number;
  underlyingChange: number;
  underlyingChangePercent: number;
  expirationDates: string[];
  options: {
    [expiration: string]: {
      calls: OptionContract[];
      puts: OptionContract[];
    };
  };
}

export interface OptionContract {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  change: number;
  percentChange: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  expiration: string;
  type: 'call' | 'put';
}

class YahooFinanceService {
  private static instance: YahooFinanceService;
  private cache: Map<string, { data: OptionChainData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly BASE_URL = 'https://query1.finance.yahoo.com/v7/finance/options';
  private readonly CORS_PROXY = 'https://api.allorigins.win/get?url=';

  private constructor() {}

  public static getInstance(): YahooFinanceService {
    if (!YahooFinanceService.instance) {
      YahooFinanceService.instance = new YahooFinanceService();
    }
    return YahooFinanceService.instance;
  }

  private formatExpirationDate(timestamp: number): string {
    return new Date(timestamp * 1000).toISOString().split('T')[0];
  }

  private async fetchWithProxy(url: string): Promise<any> {
    try {
      // Try direct fetch first
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.log('Direct fetch failed, trying with CORS proxy:', error);
      
      // Fallback to CORS proxy
      try {
        const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(url)}`;
        const response = await axios.get(proxyUrl, { timeout: 15000 });
        return JSON.parse(response.data.contents);
      } catch (proxyError) {
        console.error('CORS proxy also failed:', proxyError);
        throw new Error('Failed to fetch data from Yahoo Finance');
      }
    }
  }

  public async getOptionChain(symbol: string, expiration?: string): Promise<OptionChainData> {
    const cacheKey = `${symbol}-${expiration || 'all'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      let url = `${this.BASE_URL}/${symbol.toUpperCase()}`;
      if (expiration) {
        const expirationTimestamp = Math.floor(new Date(expiration).getTime() / 1000);
        url += `?date=${expirationTimestamp}`;
      }

      const response: YahooResponse = await this.fetchWithProxy(url);
      
      if (!response.optionChain?.result?.[0]) {
        throw new Error('No option data found');
      }

      const data = response.optionChain.result[0];
      const optionChainData: OptionChainData = {
        symbol: data.underlyingSymbol,
        underlyingPrice: data.quote.regularMarketPrice,
        underlyingChange: data.quote.regularMarketChange,
        underlyingChangePercent: data.quote.regularMarketChangePercent,
        expirationDates: data.expirationDates.map(this.formatExpirationDate),
        options: {},
      };

      // Process options data
      data.options.forEach((optionData) => {
        const expirationDate = this.formatExpirationDate(optionData.expirationDate);
        
        const calls: OptionContract[] = optionData.calls.map((call) => ({
          contractSymbol: call.contractSymbol,
          strike: call.strike,
          lastPrice: call.lastPrice || 0,
          change: call.change || 0,
          percentChange: call.percentChange || 0,
          volume: call.volume || 0,
          openInterest: call.openInterest || 0,
          bid: call.bid || 0,
          ask: call.ask || 0,
          impliedVolatility: call.impliedVolatility || 0,
          inTheMoney: call.inTheMoney || false,
          expiration: expirationDate,
          type: 'call' as const,
        }));

        const puts: OptionContract[] = optionData.puts.map((put) => ({
          contractSymbol: put.contractSymbol,
          strike: put.strike,
          lastPrice: put.lastPrice || 0,
          change: put.change || 0,
          percentChange: put.percentChange || 0,
          volume: put.volume || 0,
          openInterest: put.openInterest || 0,
          bid: put.bid || 0,
          ask: put.ask || 0,
          impliedVolatility: put.impliedVolatility || 0,
          inTheMoney: put.inTheMoney || false,
          expiration: expirationDate,
          type: 'put' as const,
        }));

        optionChainData.options[expirationDate] = { calls, puts };
      });

      // Cache the result
      this.cache.set(cacheKey, {
        data: optionChainData,
        timestamp: Date.now(),
      });

      return optionChainData;
    } catch (error) {
      console.error('Error fetching option chain:', error);
      
      // Return mock data as fallback
      return this.generateMockOptionChain(symbol);
    }
  }

  private generateMockOptionChain(symbol: string): OptionChainData {
    const basePrice = 150; // Mock underlying price
    const expirationDates = [
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 month
    ];

    const optionChainData: OptionChainData = {
      symbol,
      underlyingPrice: basePrice,
      underlyingChange: 2.5,
      underlyingChangePercent: 1.67,
      expirationDates,
      options: {},
    };

    expirationDates.forEach((expiration) => {
      const calls: OptionContract[] = [];
      const puts: OptionContract[] = [];

      // Generate strikes around the current price
      for (let i = -10; i <= 10; i++) {
        const strike = basePrice + (i * 5);
        const isITMCall = strike < basePrice;
        const isITMPut = strike > basePrice;
        
        // Mock call option
        calls.push({
          contractSymbol: `${symbol}${expiration.replace(/-/g, '')}C${strike.toFixed(0).padStart(8, '0')}`,
          strike,
          lastPrice: Math.max(0.01, isITMCall ? basePrice - strike + Math.random() * 5 : Math.random() * 3),
          change: (Math.random() - 0.5) * 2,
          percentChange: (Math.random() - 0.5) * 20,
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          bid: Math.random() * 2,
          ask: Math.random() * 2 + 0.1,
          impliedVolatility: 0.2 + Math.random() * 0.3,
          inTheMoney: isITMCall,
          expiration,
          type: 'call',
        });

        // Mock put option
        puts.push({
          contractSymbol: `${symbol}${expiration.replace(/-/g, '')}P${strike.toFixed(0).padStart(8, '0')}`,
          strike,
          lastPrice: Math.max(0.01, isITMPut ? strike - basePrice + Math.random() * 5 : Math.random() * 3),
          change: (Math.random() - 0.5) * 2,
          percentChange: (Math.random() - 0.5) * 20,
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          bid: Math.random() * 2,
          ask: Math.random() * 2 + 0.1,
          impliedVolatility: 0.2 + Math.random() * 0.3,
          inTheMoney: isITMPut,
          expiration,
          type: 'put',
        });
      }

      optionChainData.options[expiration] = { calls, puts };
    });

    return optionChainData;
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const yahooFinanceService = YahooFinanceService.getInstance();
export default yahooFinanceService;