import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables for Node.js environment (for scripts like testAlpacaApi.ts)
if (typeof process !== 'undefined' && process.env) {
  dotenv.config();
}

// Track API call failures to reduce retry attempts
let apiFailureCount = 0;
let lastApiAttemptTime = 0;
let useMockData = false;

// Constants
// const BASE_URL = 'https://data.alpaca.markets'; // Old direct Alpaca URL
const BASE_URL = 'http://localhost:5001/alpaca/api'; // New URL pointing to our Flask proxy
const MAX_FAILURE_COUNT = 3; // After this many failures, switch to mock permanently
const RETRY_DELAY_BASE = 10000; // 10 seconds initial backoff, will grow exponentially

// Define types for our API responses
export interface AlpacaQuote {
  t: string;  // Timestamp
  ap?: number; // Ask price
  bp?: number; // Bid price
  as?: number; // Ask size
  bs?: number; // Bid size
  c?: string[]; // Conditions
  pcp?: number; // Previous close price
  // Add other fields as needed
}

export interface AlpacaQuoteResponse {
  symbol: string;
  quote: AlpacaQuote;
}

export interface AlpacaMultiQuoteResponse {
  quotes: Record<string, AlpacaQuote>;
}

// Hardcoded API keys as fallback for browser environment
// In production, you should use environment variables securely
const FALLBACK_API_KEY = 'AK4LEHMWEX12KT177V2N';
const FALLBACK_API_SECRET = 'divsX4xjtbMG9xRQodNABfB2kvqvhZ95tvBf3Phk';

const getApiKey = (): string => {
  // Check for Vite environment first
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ALPACA_API_KEY_ID) {
    return import.meta.env.VITE_ALPACA_API_KEY_ID as string;
  }
  // Fallback to Node.js process.env (for scripts like testAlpacaApi.ts)
  if (typeof process !== 'undefined' && process.env && process.env.VITE_ALPACA_API_KEY_ID) {
    return process.env.VITE_ALPACA_API_KEY_ID;
  }
  // Use hardcoded fallback for browser
  return FALLBACK_API_KEY;
};

const getApiSecret = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ALPACA_API_SECRET_KEY) {
    return import.meta.env.VITE_ALPACA_API_SECRET_KEY as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env.VITE_ALPACA_API_SECRET_KEY) {
    return process.env.VITE_ALPACA_API_SECRET_KEY;
  }
  // Use hardcoded fallback for browser
  return FALLBACK_API_SECRET;
};

// Get the API credentials
const apiKeyVal = getApiKey();
const apiSecretVal = getApiSecret();

// Create axios instance with API keys in headers
const alpaca = axios.create({
  baseURL: BASE_URL,
  headers: {
    'APCA-API-KEY-ID': apiKeyVal,
    'APCA-API-SECRET-KEY': apiSecretVal,
    'Accept': 'application/json',
  },
});

// Log config once in browser for debugging (remove in production)
if (typeof window !== 'undefined') {
  console.log('Alpaca API Config (keys partially masked):', {
    key: apiKeyVal ? `${apiKeyVal.substring(0, 4)}...${apiKeyVal.substring(apiKeyVal.length - 4)}` : 'Not set',
    secretLength: apiSecretVal ? apiSecretVal.length : 0,
    baseUrl: BASE_URL
  });
}

// Helper function to determine if we should attempt real API calls
const shouldAttemptRealApiCall = (): boolean => {
  // If we've permanently switched to mock data, don't attempt real calls
  if (useMockData) return false;
  
  // If we've had too many failures, switch to mock data permanently
  if (apiFailureCount >= MAX_FAILURE_COUNT) {
    useMockData = true;
    console.warn(`Alpaca API has failed ${apiFailureCount} times. Switching to mock data permanently.`);
    return false;
  }
  
  // If we're within the exponential backoff period, use mock data temporarily
  const now = Date.now();
  const backoffTime = RETRY_DELAY_BASE * Math.pow(2, apiFailureCount);
  if (now - lastApiAttemptTime < backoffTime) {
    return false;
  }
  
  // Update last attempt time
  lastApiAttemptTime = now;
  return true;
};

// Helper function to handle API errors
const handleApiError = (error: unknown, context: string): void => {
  // Increment failure count and log a warning, but only once per failure to reduce noise
  apiFailureCount++;
  
  if (apiFailureCount === 1) {
    console.warn(`${context} - Switching to mock data with exponential backoff`);
  } else if (apiFailureCount === MAX_FAILURE_COUNT) {
    console.warn(`${context} - Max failures reached. Using mock data permanently.`);
  }
  
  // Only log full error in development
  if (process.env.NODE_ENV === 'development') {
    console.debug(`${context} - Error details:`, error);
  }
};

// Helper function to generate mock data
const generateMockQuoteData = (symbol: string): AlpacaQuoteResponse => {
  const basePrice = symbol === 'AAPL' ? 180 : 
                   symbol === 'MSFT' ? 325 : 
                   symbol === 'TSLA' ? 240 : 
                   symbol === 'AMZN' ? 135 : 
                   symbol === 'GOOGL' ? 142 : 
                   symbol === 'META' ? 330 : 100;
  
  // Add some random variation
  const price = basePrice + (Math.random() * 10 - 5);
  const prevClose = basePrice * 0.99; // 1% lower than base price
  
  return {
    symbol,
    quote: {
      t: new Date().toISOString(),
      ap: price,
      bp: price - 0.1,
      as: Math.floor(Math.random() * 100) + 10,
      bs: Math.floor(Math.random() * 100) + 10,
      c: ['R'],
      pcp: prevClose
    }
  };
};

export const getLatestQuote = async (symbol: string): Promise<AlpacaQuoteResponse> => {
  // Check if we should attempt real API call or use mock data
  if (shouldAttemptRealApiCall()) {
    try {
      const res = await alpaca.get(`/v2/stocks/${symbol}/quotes/latest`);
      // Reset failure count on success
      apiFailureCount = 0;
      return res.data;
    } catch (error) {
      handleApiError(error, `Alpaca API error fetching quote for ${symbol}`);
    }
  }
  
  // Return mock data as fallback
  return generateMockQuoteData(symbol);
};

export const getOptionChain = async (symbol: string) => {
  // Check if we should attempt real API call or use mock data
  if (shouldAttemptRealApiCall()) {
    try {
      const res = await alpaca.get(`/v1beta1/options/snapshots/${symbol}`);
      // Reset failure count on success
      apiFailureCount = 0;
      return res.data;
    } catch (error) {
      handleApiError(error, `Alpaca API error fetching option chain for ${symbol}`);
    }
  }

  // Return empty mock data
  return {
    symbol,
    snapshots: {}
  };
};

export const getLatestQuotes = async (symbols: string[]): Promise<AlpacaMultiQuoteResponse> => {
  if (symbols.length === 0) {
    return { quotes: {} };
  }

  // Check if we should attempt real API call or use mock data
  if (shouldAttemptRealApiCall()) {
    try {
      const symbolsParam = symbols.join(',');
      const res = await alpaca.get(`/v2/stocks/quotes/latest`, {
        params: { symbols: symbolsParam }
      });
      // Reset failure count on success
      apiFailureCount = 0;
      return res.data;
    } catch (error) {
      handleApiError(error, `Alpaca API error fetching quotes for multiple symbols`);
    }
  }
  
  // Generate mock data for each symbol
  const mockQuotes = symbols.reduce((acc, symbol) => {
    acc[symbol] = generateMockQuoteData(symbol).quote;
    return acc;
  }, {} as Record<string, AlpacaQuote>);
  
  return { quotes: mockQuotes };
};

// Public method to check if we're using mock data
export const isMockDataMode = (): boolean => {
  return useMockData || apiFailureCount >= MAX_FAILURE_COUNT;
};

// Add more functions for news, historical, etc.
