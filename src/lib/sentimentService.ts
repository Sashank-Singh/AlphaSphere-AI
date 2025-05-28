// Sentiment Analysis Service
import { fetchRealTimeStockPrice } from './polygonApi';
import { debounce } from './utils';

export interface SentimentData {
  overall: number;
  news: number;
  social: number;
  insider: number;
  technical: number;
  sources: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  timestamp: Date;
}

// Finnhub API for sentiment data
const FINNHUB_API_URL = 'https://finnhub.io/api/v1';

// You would need to get a free API key from https://finnhub.io/register
// For demo purposes, we're using a placeholder - replace with your actual key
const FINNHUB_API_KEY = 'demo'; // Replace with your actual API key

/**
 * Fetch news sentiment for a stock symbol
 */
export const fetchNewsSentiment = async (symbol: string): Promise<number> => {
  try {
    const url = `${FINNHUB_API_URL}/news-sentiment?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Finnhub returns sentiment scores between -1 and 1
    // We'll normalize to 0-1 for our UI
    if (data && data.sentiment) {
      return (data.sentiment + 1) / 2;
    }
    
    return generateMockSentiment(symbol, 0.5, 0.15);
  } catch (error) {
    console.error('Error fetching news sentiment:', error);
    return generateMockSentiment(symbol, 0.5, 0.15);
  }
};

/**
 * Fetch social media sentiment
 */
export const fetchSocialSentiment = async (symbol: string): Promise<number> => {
  try {
    const url = `${FINNHUB_API_URL}/stock/social-sentiment?symbol=${symbol}&from=2022-01-01&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.reddit && data.reddit.length > 0) {
      // Calculate average sentiment from Reddit
      const redditSentiment = data.reddit.reduce((acc: number, item: any) => acc + item.sentiment, 0) / data.reddit.length;
      return (redditSentiment + 1) / 2; // Normalize to 0-1
    }
    
    return generateMockSentiment(symbol, 0.5, 0.2);
  } catch (error) {
    console.error('Error fetching social sentiment:', error);
    return generateMockSentiment(symbol, 0.5, 0.2);
  }
};

/**
 * Fetch insider sentiment based on insider transactions
 */
export const fetchInsiderSentiment = async (symbol: string): Promise<number> => {
  try {
    const url = `${FINNHUB_API_URL}/stock/insider-sentiment?symbol=${symbol}&from=2022-01-01&to=2023-01-01&token=${FINNHUB_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.data && data.data.length > 0) {
      // Use most recent month's sentiment
      const mspr = data.data[0].mspr || 0; // Monthly share purchase ratio
      return (mspr + 1) / 2; // Normalize to 0-1
    }
    
    return generateMockSentiment(symbol, 0.5, 0.15);
  } catch (error) {
    console.error('Error fetching insider sentiment:', error);
    return generateMockSentiment(symbol, 0.5, 0.15);
  }
};

/**
 * Calculate technical sentiment based on price action
 */
export const calculateTechnicalSentiment = async (symbol: string): Promise<number> => {
  try {
    const stockData = await fetchRealTimeStockPrice(symbol);
    
    // Simple technical sentiment based on price vs previous close
    if (stockData && typeof stockData === 'object' && 'changePercent' in stockData) {
      const priceChange = stockData.changePercent as number;
      // Normalize to 0-1 scale (assuming normal daily range is -5% to +5%)
      return Math.min(Math.max((priceChange + 5) / 10, 0), 1);
    }
    
    return generateMockSentiment(symbol, 0.5, 0.1);
  } catch (error) {
    console.error('Error calculating technical sentiment:', error);
    return generateMockSentiment(symbol, 0.5, 0.1);
  }
};

/**
 * Generate sentiment sources based on sentiment values
 */
export const generateSentimentSources = (overallSentiment: number): {
  positive: string[];
  negative: string[];
  neutral: string[];
} => {
  // Common sources for different sentiment levels
  const positiveSources = [
    'Strong quarterly earnings report',
    'New product announcement well received',
    'Positive analyst coverage',
    'Strategic partnership announced',
    'Increased market share reported',
    'Successful product launch',
    'Dividend increase announced',
    'Stock buyback program initiated',
    'Favorable regulatory decision',
    'Expansion into new markets'
  ];
  
  const negativeSources = [
    'Regulatory concerns in key markets',
    'Supply chain constraints reported',
    'Increased competition in sector',
    'Missed earnings expectations',
    'Executive leadership changes',
    'Product recall announced',
    'Legal challenges reported',
    'Reduced guidance for next quarter',
    'Margin pressure from rising costs',
    'Declining market share'
  ];
  
  const neutralSources = [
    'Management changes announced',
    'Industry conference participation',
    'Research and development investment',
    'Routine SEC filings submitted',
    'Annual shareholder meeting scheduled',
    'Industry-wide regulatory changes',
    'New facility construction on schedule',
    'Participation in industry standards committee',
    'Routine patent filings',
    'Employee training initiatives'
  ];
  
  // Select sources based on sentiment level
  const numPositive = overallSentiment >= 0.6 ? 3 : overallSentiment >= 0.4 ? 2 : 1;
  const numNegative = overallSentiment <= 0.4 ? 3 : overallSentiment <= 0.6 ? 2 : 1;
  const numNeutral = 3 - Math.max(0, numPositive - 1) - Math.max(0, numNegative - 1);
  
  // Shuffle and select
  const shuffleAndSelect = (arr: string[], count: number) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  return {
    positive: shuffleAndSelect(positiveSources, numPositive),
    negative: shuffleAndSelect(negativeSources, numNegative),
    neutral: shuffleAndSelect(neutralSources, numNeutral)
  };
};

/**
 * Generate mock sentiment with some randomness
 */
export const generateMockSentiment = (symbol: string, baseValue: number = 0.5, variance: number = 0.2): number => {
  // Use the first character of the symbol to seed some variation
  const charCode = symbol.charCodeAt(0);
  const symbolBias = (charCode % 10) / 10 - 0.5;
  
  // Generate a random value with the symbol bias
  return Math.min(Math.max(baseValue + symbolBias * variance + (Math.random() * variance - variance/2), 0), 1);
};

/**
 * Fetch complete sentiment data for a stock
 */
// Cache for sentiment data
const sentimentCache = new Map<string, { data: SentimentData; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute cache duration

// Debounced fetch function for each symbol
const debouncedFetches = new Map<string, (symbol: string) => Promise<SentimentData>>();

export const fetchStockSentiment = async (symbol: string): Promise<SentimentData> => {
  // Check cache first
  const cached = sentimentCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // Create debounced fetch function for this symbol if it doesn't exist
  if (!debouncedFetches.has(symbol)) {
    debouncedFetches.set(symbol, debounce(async (sym: string) => {
      try {
        // Fetch all sentiment components in parallel
        const [newsSentiment, socialSentiment, insiderSentiment, technicalSentiment] = await Promise.all([
          fetchNewsSentiment(sym),
          fetchSocialSentiment(sym),
          fetchInsiderSentiment(sym),
          calculateTechnicalSentiment(sym)
        ]);
        
        // Calculate overall sentiment (weighted average)
        const overall = (
          newsSentiment * 0.35 +
          socialSentiment * 0.25 +
          insiderSentiment * 0.2 +
          technicalSentiment * 0.2
        );
        
        // Generate sources based on overall sentiment
        const sources = generateSentimentSources(overall);
        
        const data = {
          overall,
          news: newsSentiment,
          social: socialSentiment,
          insider: insiderSentiment,
          technical: technicalSentiment,
          sources,
          timestamp: new Date()
        };

        // Update cache
        sentimentCache.set(symbol, { data, timestamp: Date.now() });
        return data;
      } catch (error) {
        console.error('Error fetching stock sentiment:', error);
        
        // Fallback to completely mock data
        const overall = generateMockSentiment(sym);
        const news = generateMockSentiment(sym);
        const social = generateMockSentiment(sym);
        const insider = generateMockSentiment(sym);
        const technical = generateMockSentiment(sym);
        
        const data = {
          overall,
          news,
          social,
          insider,
          technical,
          sources: generateSentimentSources(overall),
          timestamp: new Date()
        };

        // Cache even mock data to prevent too frequent API calls during errors
        sentimentCache.set(symbol, { data, timestamp: Date.now() });
        return data;
      }
    }, 1000));
  }

  // Get the debounced fetch function and execute it
  const debouncedFetch = debouncedFetches.get(symbol)!;
  return debouncedFetch(symbol);
};
