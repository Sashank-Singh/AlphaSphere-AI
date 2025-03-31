// Stock data API service using Yahoo Finance
const YAHOO_FINANCE_API_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Define interfaces for stock data
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

// Add CompanyInfo interface for consistent company data structure
export interface CompanyInfo {
  Symbol: string;
  Name: string;
  Exchange: string;
  Sector: string;
  Industry: string;
  Description: string;
  MarketCap?: number;
  PERatio?: number;
  EPS?: number;
  DividendYield?: number;
}

// Helper function to make requests to Yahoo Finance API
const fetchYahooFinance = async (symbol: string, range: string = '1d', interval: string = '5m') => {
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
};

// Fetch real-time stock quote
export const fetchRealTimeStockPrice = async (symbol: string): Promise<StockQuote> => {
  try {
    const yahooData = await fetchYahooFinance(symbol);
    
    if (yahooData && yahooData.chart && yahooData.chart.result && yahooData.chart.result.length > 0) {
      const result = yahooData.chart.result[0];
      const quote = result.indicators.quote[0];
      const meta = result.meta;
      
      // Get the most recent price data
      const latestIndex = result.timestamp.length - 1;
      const currentPrice = meta.regularMarketPrice || (quote.close ? quote.close[latestIndex] : 0);
      const previousClose = meta.previousClose || meta.chartPreviousClose || 0;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;
      
      return {
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
    }
    
    // Fallback mock data
    return getMockStockData(symbol);
  } catch (error) {
    console.error('Error fetching real-time stock data:', error);
    // Return mock data in case of error
    return getMockStockData(symbol);
  }
};

// Helper function to generate mock stock data
const getMockStockData = (symbol: string): StockQuote => {
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
};

// Fetch time series data (intraday, daily, weekly, monthly)
export const fetchTimeSeriesData = async (
  symbol: string, 
  interval: 'intraday' | 'daily' | 'weekly' | 'monthly',
  outputSize: 'compact' | 'full' = 'compact',
  intraday_interval?: '1min' | '5min' | '15min' | '30min' | '60min'
) => {
  try {
    // Map intervals to Yahoo Finance ranges and intervals
    const rangeMap: Record<string, string> = {
      'intraday': '1d',
      'daily': '3mo',
      'weekly': '1y',
      'monthly': '5y'
    };
    
    const intervalMap: Record<string, string> = {
      'intraday': intraday_interval?.replace('min', 'm') || '5m',
      'daily': '1d',
      'weekly': '1wk',
      'monthly': '1mo'
    };
    
    const range = rangeMap[interval];
    const yahooInterval = intervalMap[interval];
    
    // Get data from Yahoo Finance
    const data = await fetchYahooFinance(symbol, range, yahooInterval);
    
    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Failed to get time series data from Yahoo Finance');
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quote = result.indicators.quote[0];
    
    // Format response similar to Alpha Vantage
    const timeSeriesResult: any = {
      'Meta Data': {
        '1. Information': `${interval.toUpperCase()} Time Series`,
        '2. Symbol': symbol,
        '3. Last Refreshed': new Date().toISOString(),
        '4. Output Size': outputSize,
        '5. Time Zone': 'US/Eastern',
      }
    };
    
    // Add the time series data with the expected key format
    const timeSeriesKey = 
      interval === 'intraday' ? `Time Series (${intraday_interval || '5min'})` :
      interval === 'daily' ? 'Time Series (Daily)' :
      interval === 'weekly' ? 'Weekly Time Series' : 'Monthly Time Series';
    
    timeSeriesResult[timeSeriesKey] = {};
    
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.close[i] === null) continue;
      
      const dateStr = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
      
      timeSeriesResult[timeSeriesKey][dateStr] = {
        '1. open': (quote.open[i] || quote.close[i]).toString(),
        '2. high': (quote.high[i] || quote.close[i]).toString(),
        '3. low': (quote.low[i] || quote.close[i]).toString(),
        '4. close': quote.close[i].toString(),
        '5. volume': (quote.volume[i] || 0).toString()
      };
    }
    
    return timeSeriesResult;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return null;
  }
};

// Fetch company overview
export const fetchCompanyOverview = async (symbol: string) => {
  try {
    // Get data from Yahoo Finance
    const data = await fetchYahooFinance(symbol, '1d');
    
    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Failed to get company data from Yahoo Finance');
    }
    
    const meta = data.chart.result[0].meta;
    
    return {
      Symbol: symbol,
      Name: meta.shortName || meta.longName || symbol,
      Exchange: meta.exchangeName || 'NASDAQ',
      Sector: '',
      Industry: '',
      Description: '',
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return {
      Symbol: symbol,
      Name: symbol,
      Exchange: 'NASDAQ',
      Sector: '',
      Industry: '',
      Description: '',
    };
  }
};

// Options data (mock implementation since Yahoo Finance API doesn't provide options data in this way)
export const fetchRealtimeOptions = async (
  symbol: string,
  requireGreeks: boolean = false,
  specificContract?: string
) => {
  try {
    // Get current stock price for mocking options
    const quote = await fetchRealTimeStockPrice(symbol);
    const currentPrice = quote ? parseFloat(quote['05. price'].toString()) : 100;
    
    // Generate mock expiration dates (next 4 fridays)
    const expirationDates = generateNextFridays(4);
    
    // If a specific contract is provided
    if (specificContract) {
      // Parse the contract symbol to extract info
      const mockContract = generateMockOptionContract(specificContract, currentPrice);
      return {
        options: [mockContract],
        underlying: { price: currentPrice }
      };
    }
    
    // Generate mock options chain for the first expiration date
    const mockOptions = generateMockOptionsChain(symbol, expirationDates[0], currentPrice);
    
    return {
      options: mockOptions,
      underlying: { price: currentPrice }
    };
  } catch (error) {
    console.error('Error fetching realtime options:', error);
    return { error: 'Network error', message: String(error) };
  }
};

// Helper function to generate the next n Fridays
function generateNextFridays(count: number): string[] {
  const fridays: string[] = [];
  const date = new Date();
  
  // Find the next Friday
  const day = date.getDay();
  const daysUntilFriday = (5 - day + 7) % 7;
  date.setDate(date.getDate() + daysUntilFriday);
  
  for (let i = 0; i < count; i++) {
    fridays.push(date.toISOString().split('T')[0]);
    // Move to next week
    date.setDate(date.getDate() + 7);
  }
  
  return fridays;
}

// Helper function to generate a mock option contract from a symbol
function generateMockOptionContract(symbol: string, underlyingPrice: number): any {
  // This is a simplified parsing that assumes a specific format
  // In reality, option symbols can vary by exchange
  const type = symbol.includes('C') ? 'CALL' : 'PUT';
  const strikePrice = parseFloat(symbol.slice(-8)) / 1000; // Example: 00270000 -> 270
  const expirationDate = '2025-' + symbol.slice(4, 6) + '-' + symbol.slice(6, 8);
  
  return {
    contractType: type,
    strikePrice,
    expirationDate,
    lastPrice: Math.random() * 5,
    bid: Math.random() * 4.5,
    ask: Math.random() * 5.5,
    volume: Math.floor(Math.random() * 1000),
    openInterest: Math.floor(Math.random() * 5000),
    impliedVolatility: Math.random() * 0.5,
  };
}

// Helper function to generate a mock options chain
function generateMockOptionsChain(symbol: string, expirationDate: string, currentPrice: number): any[] {
  const strikes = [];
  const baseStrike = Math.round(currentPrice / 5) * 5; // Round to nearest $5
  
  // Generate strikes from -30% to +30% of current price
  for (let i = -6; i <= 6; i++) {
    strikes.push(baseStrike + (i * 5));
  }
  
  const options = [];
  
  // Generate call options
  for (const strike of strikes) {
    options.push({
      contractType: 'CALL',
      strikePrice: strike,
      expirationDate,
      lastPrice: Math.max(0.01, currentPrice - strike + Math.random() * 5),
      bid: Math.max(0.01, currentPrice - strike + Math.random() * 4),
      ask: Math.max(0.01, currentPrice - strike + Math.random() * 6),
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      impliedVolatility: 0.2 + Math.random() * 0.5,
    });
  }
  
  // Generate put options
  for (const strike of strikes) {
    options.push({
      contractType: 'PUT',
      strikePrice: strike,
      expirationDate,
      lastPrice: Math.max(0.01, strike - currentPrice + Math.random() * 5),
      bid: Math.max(0.01, strike - currentPrice + Math.random() * 4),
      ask: Math.max(0.01, strike - currentPrice + Math.random() * 6),
      volume: Math.floor(Math.random() * 1000),
      openInterest: Math.floor(Math.random() * 5000),
      impliedVolatility: 0.2 + Math.random() * 0.5,
    });
  }
  
  return options;
}

// Fetch historical options data 
export const fetchHistoricalOptions = async (
  symbol: string,
  date?: string
) => {
  try {
    // For demo purposes, we'll just use the same mock data
    return fetchRealtimeOptions(symbol, false);
  } catch (error) {
    console.error('Error fetching historical options:', error);
    return { error: 'Network error', message: String(error) };
  }
};

// Helper function to extract call options from options data
export const extractCallOptions = (optionsData: any) => {
  if (!optionsData || !optionsData.options || !Array.isArray(optionsData.options)) {
    return [];
  }
  
  return optionsData.options.filter(option => 
    option.contractType === 'CALL' || option.contract_type === 'CALL'
  );
};

// Helper function to extract put options from options data
export const extractPutOptions = (optionsData: any) => {
  if (!optionsData || !optionsData.options || !Array.isArray(optionsData.options)) {
    return [];
  }
  
  return optionsData.options.filter(option => 
    option.contractType === 'PUT' || option.contract_type === 'PUT'
  );
};

// Format options data by expiration date
export const formatOptionsByExpiration = (options: any[]) => {
  const expirationMap = new Map();
  
  options.forEach(option => {
    const expDate = option.expirationDate || option.expiration_date;
    if (!expirationMap.has(expDate)) {
      expirationMap.set(expDate, []);
    }
    expirationMap.get(expDate).push(option);
  });
  
  // Sort each group by strike price
  expirationMap.forEach((optionGroup, expDate) => {
    optionGroup.sort((a, b) => {
      const strikeA = parseFloat(a.strikePrice || a.strike_price);
      const strikeB = parseFloat(b.strikePrice || b.strike_price);
      return strikeA - strikeB;
    });
  });
  
  // Convert map to array of objects for easier consumption
  return Array.from(expirationMap.entries()).map(([expirationDate, options]) => ({
    expirationDate,
    options
  })).sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
};

// Types for API response data
interface TimeSeriesValue {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

interface TimeSeriesData {
  'Meta Data': Record<string, string>;
  [key: string]: Record<string, TimeSeriesValue> | Record<string, string>;
}

// Format time series data for chart
export const formatTimeSeriesData = (data: TimeSeriesData, interval: 'intraday' | 'daily' | 'weekly' | 'monthly') => {
  if (!data) return [];
  
  const timeSeriesKey = 
    interval === 'intraday' ? 'Time Series (5min)' :
    interval === 'daily' ? 'Time Series (Daily)' :
    interval === 'weekly' ? 'Weekly Time Series' : 'Monthly Time Series';
    
  const timeSeries = data[timeSeriesKey] as Record<string, TimeSeriesValue>;
  
  if (!timeSeries) return [];
  
  return Object.entries(timeSeries).map(([date, values]: [string, TimeSeriesValue]) => ({
    date,
    price: parseFloat(values['4. close']),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    volume: parseInt(values['5. volume'], 10)
  })).reverse();
}; 