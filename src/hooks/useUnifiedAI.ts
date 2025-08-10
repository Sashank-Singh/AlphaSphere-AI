import { useState, useEffect, useCallback, useRef } from 'react';
import { unifiedGroqService, UnifiedAIResponse, StockData, OptionChainData, NewsItem, MarketContext } from '@/lib/unifiedGroqService';
import { logger } from '@/lib/logger';

// ============================================================================
// UNIFIED AI HOOK
// Single hook that provides all AI insights to all components
// ============================================================================

export interface UseUnifiedAIOptions {
  symbol: string;
  stockData: StockData;
  optionsData?: OptionChainData;
  newsData?: NewsItem[];
  marketContext?: MarketContext;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export interface UseUnifiedAIReturn {
  // Data
  data: UnifiedAIResponse | null;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refresh: () => Promise<void>;
  clearError: () => void;
  
  // Specific AI insights (derived from unified data)
  sentiment: UnifiedAIResponse['sentiment'] | null;
  technicalAnalysis: UnifiedAIResponse['technicalAnalysis'] | null;
  fundamentalScore: UnifiedAIResponse['fundamentalScore'] | null;
  priceForecast: UnifiedAIResponse['priceForecast'] | null;
  tradeRecommendations: UnifiedAIResponse['tradeRecommendations'] | null;
  optionsFlow: UnifiedAIResponse['optionsFlow'] | null;
  riskAssessment: UnifiedAIResponse['riskAssessment'] | null;
  newsImpact: UnifiedAIResponse['newsImpact'] | null;
  earningsPrediction: UnifiedAIResponse['earningsPrediction'] | null;
  insiderTrading: UnifiedAIResponse['insiderTrading'] | null;
  financialHealth: UnifiedAIResponse['financialHealth'] | null;
  tradingMetrics: UnifiedAIResponse['tradingMetrics'] | null;
  patternRecognition: UnifiedAIResponse['patternRecognition'] | null;
  marketInsights: UnifiedAIResponse['marketInsights'] | null;
}

/**
 * Unified AI Hook - Single source of truth for all AI insights
 * 
 * Usage:
 * ```tsx
 * const { sentiment, technicalAnalysis, isLoading } = useUnifiedAI({
 *   symbol: 'AAPL',
 *   stockData: { price: 150, change: 2.5, ... },
 *   autoRefresh: true
 * });
 * ```
 */
export function useUnifiedAI(options: UseUnifiedAIOptions): UseUnifiedAIReturn {
  const {
    symbol,
    stockData,
    optionsData,
    newsData,
    marketContext,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000 // 5 minutes default
  } = options;

  // State
  const [data, setData] = useState<UnifiedAIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Generate AI analysis
   */
  const generateAnalysis = useCallback(async () => {
    if (!symbol || !stockData) {
      logger.warn('Missing symbol or stock data for AI analysis');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      logger.info(`Generating unified AI analysis for ${symbol}`);
      
      const response = await unifiedGroqService.generateUnifiedAnalysis(
        symbol,
        stockData,
        optionsData,
        newsData,
        marketContext
      );

      if (isMountedRef.current) {
        setData(response);
        setLastUpdated(new Date());
        logger.info(`AI analysis completed for ${symbol}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      logger.error(`AI analysis failed for ${symbol}:`, err);
      
      if (isMountedRef.current) {
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [symbol, stockData, optionsData, newsData, marketContext]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await generateAnalysis();
  }, [generateAnalysis]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Setup auto-refresh
   */
  useEffect(() => {
    if (!autoRefresh) return;

    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Set up new interval
    refreshIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        generateAnalysis();
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, generateAnalysis]);

  /**
   * Initial load and symbol change
   */
  useEffect(() => {
    generateAnalysis();
  }, [generateAnalysis]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Derived data (individual AI insights)
  const sentiment = data?.sentiment || null;
  const technicalAnalysis = data?.technicalAnalysis || null;
  const fundamentalScore = data?.fundamentalScore || null;
  const priceForecast = data?.priceForecast || null;
  const tradeRecommendations = data?.tradeRecommendations || null;
  const optionsFlow = data?.optionsFlow || null;
  const riskAssessment = data?.riskAssessment || null;
  const newsImpact = data?.newsImpact || null;
  const earningsPrediction = data?.earningsPrediction || null;
  const insiderTrading = data?.insiderTrading || null;
  const financialHealth = data?.financialHealth || null;
  const tradingMetrics = data?.tradingMetrics || null;
  const patternRecognition = data?.patternRecognition || null;
  const marketInsights = data?.marketInsights || null;

  return {
    // Data
    data,
    
    // State
    isLoading,
    error,
    lastUpdated,
    
    // Actions
    refresh,
    clearError,
    
    // Individual insights
    sentiment,
    technicalAnalysis,
    fundamentalScore,
    priceForecast,
    tradeRecommendations,
    optionsFlow,
    riskAssessment,
    newsImpact,
    earningsPrediction,
    insiderTrading,
    financialHealth,
    tradingMetrics,
    patternRecognition,
    marketInsights
  };
}

/**
 * Simplified hook for components that only need specific insights
 */
export function useAISentiment(symbol: string, stockData: StockData) {
  const { sentiment, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { sentiment, isLoading, error };
}

export function useAITechnicalAnalysis(symbol: string, stockData: StockData) {
  const { technicalAnalysis, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { technicalAnalysis, isLoading, error };
}

export function useAIPriceForecast(symbol: string, stockData: StockData) {
  const { priceForecast, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { priceForecast, isLoading, error };
}

export function useAITradeRecommendations(symbol: string, stockData: StockData) {
  const { tradeRecommendations, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { tradeRecommendations, isLoading, error };
}

export function useAIOptionsFlow(symbol: string, stockData: StockData, optionsData?: OptionChainData) {
  const { optionsFlow, isLoading, error } = useUnifiedAI({ symbol, stockData, optionsData });
  return { optionsFlow, isLoading, error };
}

export function useAINewsImpact(symbol: string, stockData: StockData, newsData?: NewsItem[]) {
  const { newsImpact, isLoading, error } = useUnifiedAI({ symbol, stockData, newsData });
  return { newsImpact, isLoading, error };
}

export function useAIFundamentalScore(symbol: string, stockData: StockData) {
  const { fundamentalScore, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { fundamentalScore, isLoading, error };
}

export function useAIFinancialHealth(symbol: string, stockData: StockData) {
  const { financialHealth, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { financialHealth, isLoading, error };
}

export function useAIPatternRecognition(symbol: string, stockData: StockData) {
  const { patternRecognition, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { patternRecognition, isLoading, error };
}

export function useAIEarningsPrediction(symbol: string, stockData: StockData) {
  const { earningsPrediction, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { earningsPrediction, isLoading, error };
}

export function useAIInsiderTrading(symbol: string, stockData: StockData) {
  const { insiderTrading, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { insiderTrading, isLoading, error };
}

export function useAIRiskAssessment(symbol: string, stockData: StockData) {
  const { riskAssessment, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { riskAssessment, isLoading, error };
}

export function useAITradingMetrics(symbol: string, stockData: StockData) {
  const { tradingMetrics, isLoading, error } = useUnifiedAI({ symbol, stockData });
  return { tradingMetrics, isLoading, error };
}

export function useAIMarketInsights(symbol: string, stockData: StockData, marketContext?: MarketContext) {
  const { marketInsights, isLoading, error } = useUnifiedAI({ symbol, stockData, marketContext });
  return { marketInsights, isLoading, error };
}

export default useUnifiedAI;



