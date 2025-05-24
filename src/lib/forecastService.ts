// Price Forecasting Service
import { fetchRealTimeStockPrice, fetchTimeSeriesData } from './api';

export interface ForecastData {
  timeframe: '1d' | '1w' | '1m';
  predictions: {
    timestamp: string;
    price: number;
    upperBound: number;
    lowerBound: number;
  }[];
  summary: {
    direction: 'up' | 'down' | 'sideways';
    confidenceScore: number;
    potentialUpside: number;
    potentialDownside: number;
    keyLevels: {
      support: number;
      resistance: number;
    };
  };
  lastUpdated: Date;
}

/**
 * Calculate simple moving average
 */
const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  
  const slice = prices.slice(prices.length - period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
};

/**
 * Calculate exponential moving average
 */
const calculateEMA = (prices: number[], period: number): number => {
  if (prices.length < period) return calculateSMA(prices, prices.length);
  
  const k = 2 / (period + 1);
  let ema = prices[0];
  
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  
  return ema;
};

/**
 * Calculate Relative Strength Index
 */
const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length <= period) return 50; // Not enough data
  
  let gains = 0;
  let losses = 0;
  
  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }
  
  if (losses === 0) return 100;
  
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
};

/**
 * Calculate Bollinger Bands
 */
const calculateBollingerBands = (prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number;
  middle: number;
  lower: number;
} => {
  const sma = calculateSMA(prices.slice(-period), period);
  
  // Calculate standard deviation
  const squaredDifferences = prices.slice(-period).map(price => Math.pow(price - sma, 2));
  const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / period;
  const standardDeviation = Math.sqrt(variance);
  
  return {
    upper: sma + (standardDeviation * stdDev),
    middle: sma,
    lower: sma - (standardDeviation * stdDev)
  };
};

/**
 * Generate price forecast based on historical data and technical indicators
 */
export const generatePriceForecast = async (symbol: string, timeframe: '1d' | '1w' | '1m'): Promise<ForecastData> => {
  try {
    // Map timeframes to API parameters
    const intervalMap = {
      '1d': 'intraday',
      '1w': 'daily',
      '1m': 'daily'
    };
    
    const intraday_interval = timeframe === '1d' ? '5min' : undefined;
    
    // Fetch historical data
    const historicalData = await fetchTimeSeriesData(
      symbol, 
      intervalMap[timeframe] as any, 
      'compact', 
      intraday_interval as any
    );
    
    // Get current price
    const currentPrice = await fetchRealTimeStockPrice(symbol);
    
    // Extract prices from historical data
    const timeSeriesKey = 
      timeframe === '1d' ? `Time Series (${intraday_interval})` :
      timeframe === '1w' ? 'Time Series (Daily)' :
      'Time Series (Daily)';
    
    if (!historicalData || !historicalData[timeSeriesKey]) {
      return generateMockForecastData(timeframe, currentPrice.price);
    }
    
    const timeSeries = historicalData[timeSeriesKey];
    const dates = Object.keys(timeSeries).sort();
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
    
    // Calculate technical indicators
    const sma20 = calculateSMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    const rsi = calculateRSI(prices);
    const bollingerBands = calculateBollingerBands(prices);
    
    // Determine trend direction
    const recentPrices = prices.slice(-5);
    const priceChange = (recentPrices[recentPrices.length - 1] - recentPrices[0]) / recentPrices[0];
    let direction: 'up' | 'down' | 'sideways' = 'sideways';
    
    if (Math.abs(priceChange) < 0.01) {
      direction = 'sideways';
    } else {
      direction = priceChange > 0 ? 'up' : 'down';
    }
    
    // Determine confidence based on indicator alignment
    let confidenceScore = 0.5; // Base confidence
    
    // If price is above SMA and EMA, increase confidence for uptrend
    if (direction === 'up') {
      if (currentPrice.price > sma20) confidenceScore += 0.1;
      if (currentPrice.price > ema50) confidenceScore += 0.1;
      if (rsi > 50) confidenceScore += 0.05;
      if (rsi > 70) confidenceScore -= 0.1; // Overbought warning
    } else if (direction === 'down') {
      if (currentPrice.price < sma20) confidenceScore += 0.1;
      if (currentPrice.price < ema50) confidenceScore += 0.1;
      if (rsi < 50) confidenceScore += 0.05;
      if (rsi < 30) confidenceScore -= 0.1; // Oversold warning
    }
    
    // Cap confidence between 0.3 and 0.9
    confidenceScore = Math.min(Math.max(confidenceScore, 0.3), 0.9);
    
    // Generate predictions
    const dataPoints = {
      '1d': 12, // hourly
      '1w': 7,  // daily
      '1m': 30  // daily
    }[timeframe];
    
    const volatility = {
      '1d': 0.01, // 1%
      '1w': 0.03, // 3%
      '1m': 0.08, // 8%
    }[timeframe];
    
    const predictions = [];
    const basePrice = currentPrice.price;
    const directionMultiplier = direction === 'up' ? 1 : direction === 'down' ? -1 : 0;
    
    // Create prediction points
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / dataPoints;
      // Price trends in the direction with some randomness
      const trendFactor = directionMultiplier * volatility * progress;
      const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
      const price = basePrice * (1 + trendFactor + randomFactor);
      
      // Bounds widen over time based on confidence
      const boundWidth = basePrice * volatility * (progress + 0.5) * (1 - confidenceScore);
      
      predictions.push({
        timestamp: getTimestampForPoint(timeframe, i),
        price,
        upperBound: price + boundWidth,
        lowerBound: price - boundWidth
      });
    }
    
    // Calculate potential upside/downside and key levels
    const potentialUpside = (bollingerBands.upper / basePrice) - 1;
    const potentialDownside = 1 - (bollingerBands.lower / basePrice);
    
    return {
      timeframe,
      predictions,
      summary: {
        direction,
        confidenceScore,
        potentialUpside,
        potentialDownside,
        keyLevels: {
          support: bollingerBands.lower,
          resistance: bollingerBands.upper
        }
      },
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error generating price forecast:', error);
    // Fallback to mock data
    const currentPrice = await fetchRealTimeStockPrice(symbol);
    return generateMockForecastData(timeframe, currentPrice.price);
  }
};

/**
 * Generate mock forecast data as a fallback
 */
export const generateMockForecastData = (timeframe: '1d' | '1w' | '1m', basePrice: number): ForecastData => {
  const baseDirection = Math.random() > 0.5 ? 'up' : 'down';
  const directionMultiplier = baseDirection === 'up' ? 1 : -1;
  const volatility = {
    '1d': 0.01, // 1%
    '1w': 0.03, // 3%
    '1m': 0.08, // 8%
  }[timeframe];
  
  const confidenceScore = Math.random() * 0.4 + 0.4; // 40-80%
  const dataPoints = {
    '1d': 12, // hourly
    '1w': 7,  // daily
    '1m': 30  // daily
  }[timeframe];
  
  const predictions = [];
  
  // Create prediction points
  for (let i = 0; i < dataPoints; i++) {
    const progress = i / dataPoints;
    // Price trends in the direction with some randomness
    const trendFactor = directionMultiplier * volatility * progress;
    const randomFactor = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trendFactor + randomFactor);
    
    // Bounds widen over time
    const boundWidth = basePrice * volatility * (progress + 0.5) * (1 - confidenceScore);
    
    predictions.push({
      timestamp: getTimestampForPoint(timeframe, i),
      price,
      upperBound: price + boundWidth,
      lowerBound: price - boundWidth
    });
  }
  
  // Determine if it's sideways when the change is minimal
  const firstPrice = predictions[0].price;
  const lastPrice = predictions[predictions.length - 1].price;
  const priceChange = (lastPrice - firstPrice) / firstPrice;
  const direction = Math.abs(priceChange) < 0.01 ? 'sideways' : priceChange > 0 ? 'up' : 'down';
  
  return {
    timeframe,
    predictions,
    summary: {
      direction,
      confidenceScore,
      potentialUpside: predictions[predictions.length - 1].upperBound / basePrice - 1,
      potentialDownside: 1 - predictions[predictions.length - 1].lowerBound / basePrice,
      keyLevels: {
        support: basePrice * (1 - volatility * 1.2),
        resistance: basePrice * (1 + volatility * 1.2)
      }
    },
    lastUpdated: new Date()
  };
};

/**
 * Helper to generate realistic timestamps based on timeframe
 */
const getTimestampForPoint = (timeframe: string, index: number): string => {
  const date = new Date();
  
  if (timeframe === '1d') {
    // Hourly for 1d
    date.setHours(date.getHours() + index);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (timeframe === '1w') {
    // Daily for 1w
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    // Daily for 1m
    date.setDate(date.getDate() + index);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};