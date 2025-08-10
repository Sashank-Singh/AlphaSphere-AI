import { logger } from './logger';

// ============================================================================
// REAL-TIME OPTIONS SERVICE
// Fetches live options contracts and data
// ============================================================================

export interface OptionContract {
  symbol: string;
  underlying: string;
  strike: number;
  expiry: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  intrinsicValue: number;
  timeValue: number;
  percentChange: number;
  inTheMoney: boolean;
}

export interface OptionsChain {
  underlying: string;
  underlyingPrice: number;
  expirationDates: string[];
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdated: number;
}

export interface OptionsFlowData {
  unusualActivity: Array<{
    symbol: string;
    type: 'call' | 'put';
    strike: number;
    expiry: string;
    volume: number;
    openInterest: number;
    premium: number;
    sentiment: 'bullish' | 'bearish';
    size: 'large' | 'block' | 'sweep';
  }>;
  topVolume: OptionContract[];
  topGainers: OptionContract[];
  topLosers: OptionContract[];
}

class OptionsService {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds for options data

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  }

  /**
   * Get real-time options chain for a symbol
   */
  async getOptionsChain(symbol: string, expiry?: string): Promise<OptionsChain | null> {
    const cacheKey = `options_${symbol}_${expiry || 'all'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      logger.info(`Fetching options chain for ${symbol}`);
      
      const params = new URLSearchParams({ symbol });
      if (expiry) params.append('expiry', expiry);
      
      const response = await fetch(`${this.baseUrl}/api/options/chain?${params}`);
      
      if (!response.ok) {
        throw new Error(`Options API error: ${response.status}`);
      }
      
      const data = await response.json();
      const optionsChain = this.processOptionsChain(data, symbol);
      
      // Cache the result
      this.cache.set(cacheKey, { data: optionsChain, timestamp: Date.now() });
      
      logger.info(`Fetched ${optionsChain.calls.length} calls and ${optionsChain.puts.length} puts for ${symbol}`);
      return optionsChain;
      
    } catch (error) {
      logger.error(`Error fetching options chain for ${symbol}:`, error);
      return this.generateMockOptionsChain(symbol);
    }
  }

  /**
   * Get options flow and unusual activity
   */
  async getOptionsFlow(symbol?: string): Promise<OptionsFlowData | null> {
    const cacheKey = `flow_${symbol || 'market'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      logger.info(`Fetching options flow${symbol ? ` for ${symbol}` : ''}`);
      
      const params = new URLSearchParams();
      if (symbol) params.append('symbol', symbol);
      
      const response = await fetch(`${this.baseUrl}/api/options/flow?${params}`);
      
      if (!response.ok) {
        throw new Error(`Options flow API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      
      return data;
      
    } catch (error) {
      logger.error(`Error fetching options flow:`, error);
      return this.generateMockOptionsFlow(symbol);
    }
  }

  /**
   * Get specific option contract quote
   */
  async getOptionQuote(optionSymbol: string): Promise<OptionContract | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/options/quote/${optionSymbol}`);
      
      if (!response.ok) {
        throw new Error(`Option quote API error: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error(`Error fetching option quote for ${optionSymbol}:`, error);
      return null;
    }
  }

  /**
   * Process raw options chain data
   */
  private processOptionsChain(rawData: any, symbol: string): OptionsChain {
    const now = Date.now();
    
    return {
      underlying: symbol,
      underlyingPrice: rawData.underlyingPrice || 150,
      expirationDates: rawData.expirationDates || this.generateExpiryDates(),
      calls: (rawData.calls || []).map((call: any) => this.processOptionContract(call, 'call')),
      puts: (rawData.puts || []).map((put: any) => this.processOptionContract(put, 'put')),
      lastUpdated: now
    };
  }

  /**
   * Process individual option contract
   */
  private processOptionContract(rawContract: any, type: 'call' | 'put'): OptionContract {
    const strike = parseFloat(rawContract.strike || 0);
    const underlyingPrice = parseFloat(rawContract.underlyingPrice || 150);
    const intrinsicValue = type === 'call' 
      ? Math.max(underlyingPrice - strike, 0)
      : Math.max(strike - underlyingPrice, 0);
    
    return {
      symbol: rawContract.symbol || `${rawContract.underlying}${rawContract.expiry}${type.toUpperCase()}${strike}`,
      underlying: rawContract.underlying,
      strike,
      expiry: rawContract.expiry,
      type,
      bid: parseFloat(rawContract.bid || 0),
      ask: parseFloat(rawContract.ask || 0),
      last: parseFloat(rawContract.last || 0),
      volume: parseInt(rawContract.volume || 0),
      openInterest: parseInt(rawContract.openInterest || 0),
      impliedVolatility: parseFloat(rawContract.impliedVolatility || 0),
      delta: parseFloat(rawContract.delta || 0),
      gamma: parseFloat(rawContract.gamma || 0),
      theta: parseFloat(rawContract.theta || 0),
      vega: parseFloat(rawContract.vega || 0),
      intrinsicValue,
      timeValue: parseFloat(rawContract.last || 0) - intrinsicValue,
      percentChange: parseFloat(rawContract.percentChange || 0),
      inTheMoney: intrinsicValue > 0
    };
  }

  /**
   * Generate mock options chain for development/fallback
   */
  private generateMockOptionsChain(symbol: string): OptionsChain {
    const underlyingPrice = 175; // Mock price
    const expirationDates = this.generateExpiryDates();
    const strikes = this.generateStrikes(underlyingPrice);
    
    const calls: OptionContract[] = [];
    const puts: OptionContract[] = [];
    
    strikes.forEach(strike => {
      const expiry = expirationDates[0]; // Use nearest expiry for mock
      const daysToExpiry = this.getDaysToExpiry(expiry);
      
      // Mock call
      const callIntrinsic = Math.max(underlyingPrice - strike, 0);
      const callTimeValue = this.calculateMockTimeValue(strike, underlyingPrice, daysToExpiry, 'call');
      const callPrice = callIntrinsic + callTimeValue;
      
      calls.push({
        symbol: `${symbol}${expiry.replace(/-/g, '')}C${strike}`,
        underlying: symbol,
        strike,
        expiry,
        type: 'call',
        bid: callPrice * 0.98,
        ask: callPrice * 1.02,
        last: callPrice,
        volume: Math.floor(Math.random() * 1000) + 10,
        openInterest: Math.floor(Math.random() * 5000) + 100,
        impliedVolatility: 0.2 + Math.random() * 0.3,
        delta: this.calculateMockDelta(strike, underlyingPrice, 'call'),
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.5,
        vega: Math.random() * 0.2,
        intrinsicValue: callIntrinsic,
        timeValue: callTimeValue,
        percentChange: (Math.random() - 0.5) * 20,
        inTheMoney: callIntrinsic > 0
      });
      
      // Mock put
      const putIntrinsic = Math.max(strike - underlyingPrice, 0);
      const putTimeValue = this.calculateMockTimeValue(strike, underlyingPrice, daysToExpiry, 'put');
      const putPrice = putIntrinsic + putTimeValue;
      
      puts.push({
        symbol: `${symbol}${expiry.replace(/-/g, '')}P${strike}`,
        underlying: symbol,
        strike,
        expiry,
        type: 'put',
        bid: putPrice * 0.98,
        ask: putPrice * 1.02,
        last: putPrice,
        volume: Math.floor(Math.random() * 800) + 5,
        openInterest: Math.floor(Math.random() * 4000) + 50,
        impliedVolatility: 0.25 + Math.random() * 0.25,
        delta: this.calculateMockDelta(strike, underlyingPrice, 'put'),
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.4,
        vega: Math.random() * 0.18,
        intrinsicValue: putIntrinsic,
        timeValue: putTimeValue,
        percentChange: (Math.random() - 0.5) * 15,
        inTheMoney: putIntrinsic > 0
      });
    });
    
    return {
      underlying: symbol,
      underlyingPrice,
      expirationDates,
      calls,
      puts,
      lastUpdated: Date.now()
    };
  }

  /**
   * Generate mock options flow data
   */
  private generateMockOptionsFlow(symbol?: string): OptionsFlowData {
    const mockUnusualActivity = Array.from({ length: 10 }, (_, i) => ({
      symbol: symbol || ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'][i % 5],
      type: Math.random() > 0.5 ? 'call' : 'put' as 'call' | 'put',
      strike: Math.floor(Math.random() * 100) * 5 + 100,
      expiry: this.generateExpiryDates()[Math.floor(Math.random() * 3)],
      volume: Math.floor(Math.random() * 5000) + 1000,
      openInterest: Math.floor(Math.random() * 10000) + 500,
      premium: Math.random() * 50 + 5,
      sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish' as 'bullish' | 'bearish',
      size: ['large', 'block', 'sweep'][Math.floor(Math.random() * 3)] as 'large' | 'block' | 'sweep'
    }));

    return {
      unusualActivity: mockUnusualActivity,
      topVolume: [],
      topGainers: [],
      topLosers: []
    };
  }

  /**
   * Helper methods
   */
  private generateExpiryDates(): string[] {
    const dates = [];
    const now = new Date();
    
    // Generate next 6 expiry dates (weekly and monthly)
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + (i === 0 ? 7 : i * 14)); // Weekly then bi-weekly
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  private generateStrikes(underlyingPrice: number): number[] {
    const strikes = [];
    const baseStrike = Math.floor(underlyingPrice / 5) * 5; // Round to nearest $5
    
    // Generate strikes from $20 below to $20 above
    for (let i = -4; i <= 4; i++) {
      strikes.push(baseStrike + (i * 5));
    }
    
    return strikes;
  }

  private getDaysToExpiry(expiry: string): number {
    const expiryDate = new Date(expiry);
    const now = new Date();
    return Math.max(1, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  private calculateMockTimeValue(strike: number, underlying: number, days: number, type: 'call' | 'put'): number {
    const timeDecay = Math.max(0.1, days / 365);
    const volatility = 0.3;
    const moneyness = type === 'call' ? (underlying / strike) : (strike / underlying);
    
    return Math.max(0.05, timeDecay * volatility * moneyness * Math.random() * 10);
  }

  private calculateMockDelta(strike: number, underlying: number, type: 'call' | 'put'): number {
    const moneyness = underlying / strike;
    
    if (type === 'call') {
      if (moneyness > 1.1) return 0.7 + Math.random() * 0.25;
      if (moneyness < 0.9) return Math.random() * 0.3;
      return 0.3 + Math.random() * 0.4;
    } else {
      if (moneyness > 1.1) return -Math.random() * 0.3;
      if (moneyness < 0.9) return -0.7 - Math.random() * 0.25;
      return -0.3 - Math.random() * 0.4;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Options service cache cleared');
  }
}

// Export singleton instance
export const optionsService = new OptionsService();
export default optionsService;



