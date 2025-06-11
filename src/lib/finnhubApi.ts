import axios from 'axios';

const FINNHUB_API_KEY = 'cvkbr89r01qu5brnrlngcvkbr89r01qu5brnrlo0'; // TODO: Move to environment variable
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface FinnhubQuote {
  c: number; // Current price
  d: number | null; // Change
  dp: number | null; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

export interface FinnhubCandle {
  c: number[]; // List of close prices
  h: number[]; // List of high prices
  l: number[]; // List of low prices
  o: number[]; // List of open prices
  s: string;   // Status of the response
  t: number[]; // List of timestamp
  v: number[]; // List of volume data
}

const finnhubClient = axios.create({
  baseURL: FINNHUB_BASE_URL,
  params: {
    token: FINNHUB_API_KEY,
  },
});

export const getFinnhubQuote = async (symbol: string): Promise<FinnhubQuote | null> => {
  try {
    const response = await finnhubClient.get<FinnhubQuote>('/quote', {
      params: { symbol },
    });
    if (response.status === 200) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Finnhub API error fetching quote for ${symbol}:`, error);
    return null;
  }
};

export const getFinnhubHistoricalCandles = async (
  symbol: string,
  resolution: string, // 1, 5, 15, 30, 60, D, W, M
  from: number,     // UNIX timestamp
  to: number        // UNIX timestamp
): Promise<FinnhubCandle | null> => {
  try {
    const response = await finnhubClient.get<FinnhubCandle>('/stock/candle', {
      params: {
        symbol,
        resolution,
        from,
        to,
      },
    });
    if (response.status === 200 && response.data.s === 'ok') {
      return response.data;
    }
    if (response.data.s === 'no_data') {
      console.log(`Finnhub: No data for ${symbol} in the given range.`);
      return { s: 'no_data', c: [], h: [], l: [], o: [], t: [], v: [] }; // Return empty data structure
    }
    return null;
  } catch (error) {
    console.error(`Finnhub API error fetching candles for ${symbol}:`, error);
    return null;
  }
};

export interface FinnhubOptionContract {
  strike: number;
  type: 'call' | 'put';
  lastPrice: number;
  volume: number;
  openInterest: number;
  expirationDate: string; // Or number if UNIX timestamp
}

export interface FinnhubOptionChain {
  symbol: string;
  expirationDates: string[]; // Or number[]
  contracts: FinnhubOptionContract[];
  // Or a nested structure like:
  // options: { [expirationDate: string]: { calls: FinnhubOptionContract[], puts: FinnhubOptionContract[] } };
  lastRefreshed: number; // Timestamp
  s?: string; // Status, if applicable like in candles
}

export const getFinnhubOptionsChain = async (symbol: string): Promise<FinnhubOptionChain | null> => {
  console.warn("Attempting to fetch options chain from Finnhub using a guessed endpoint. This might fail or require specific API documentation for the correct endpoint and response structure.");
  try {
    // THIS IS A GUESSED ENDPOINT - LIKELY NEEDS TO BE ADJUSTED
    const response = await finnhubClient.get<FinnhubOptionChain>('/stock/option-chain', { // Or similar common pattern like /stock/options/chain
      params: { symbol },
    });
    if (response.status === 200 && response.data) {
      // Add a check for response.data.s === 'ok' if Finnhub uses it for options
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Finnhub API error fetching options chain for ${symbol} (guessed endpoint):`, error);
    return null;
  }
};

// TODO: Add functions for options data if Finnhub supports it
// e.g., getFinnhubOptionsChain(symbol: string)
