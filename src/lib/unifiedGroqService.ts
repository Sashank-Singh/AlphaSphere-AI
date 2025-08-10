import { logger } from './logger';

// ============================================================================
// UNIFIED GROQ AI SERVICE
// Single API call for all AI insights across all components
// ============================================================================

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
}

export interface OptionChainData {
  calls: Array<{
    strike: number;
    price: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  }>;
  puts: Array<{
    strike: number;
    price: number;
    volume: number;
    openInterest: number;
    impliedVolatility: number;
  }>;
}

export interface NewsItem {
  title: string;
  summary: string;
  sentiment: number;
  timestamp: number;
  source: string;
}

export interface MarketContext {
  spyPrice: number;
  spyChange: number;
  vixLevel: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
}

// ============================================================================
// UNIFIED AI RESPONSE INTERFACES
// ============================================================================

export interface SentimentAnalysis {
  overall: number; // -100 to 100
  news: number;
  social: number;
  insider: number;
  technical: number;
  description: string;
  keyFactors: string[];
}

export interface TechnicalAnalysis {
  signal: 'BUY' | 'SELL' | 'HOLD';
  strength: 'weak' | 'medium' | 'strong';
  confidence: number;
  indicators: {
    rsi: { value: number; signal: string };
    macd: { signal: string; description: string };
    sma50: { value: number; position: string };
    sma200: { value: number; position: string };
    supportLevel: number;
    resistanceLevel: number;
  };
  patterns: string[];
}

export interface FundamentalScore {
  score: number; // 0-100
  maxScore: number;
  rating: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  factors: {
    financial: number;
    growth: number;
    profitability: number;
    valuation: number;
  };
  description: string;
}

export interface PriceForecast {
  timeframes: {
    '1d': { price: number; confidence: number; range: [number, number] };
    '1w': { price: number; confidence: number; range: [number, number] };
    '1m': { price: number; confidence: number; range: [number, number] };
  };
  trend: 'upward' | 'downward' | 'sideways';
  reasoning: string;
}

export interface TradeRecommendations {
  stock: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    targetPrice: number;
    stopLoss: number;
    timeframe: string;
    reasoning: string;
  };
  options?: {
    strategy: string;
    contracts: Array<{
      type: 'call' | 'put';
      strike: number;
      expiry: string;
      action: 'buy' | 'sell';
    }>;
    maxRisk: number;
    maxProfit: number;
    reasoning: string;
  };
}

export interface OptionsFlowAnalysis {
  bullishTrades: number;
  bearishTrades: number;
  sweepActivity: number;
  unusualActivity: boolean;
  largestTrade: {
    type: 'call' | 'put';
    strike: number;
    volume: number;
    premium: number;
  };
  flowSentiment: 'bullish' | 'bearish' | 'neutral';
  significance: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  score: number; // 0-100
  factors: string[];
  warnings: string[];
  volatility: {
    current: number;
    historical: number;
    percentile: number;
  };
  maxDrawdown: number;
}

export interface NewsImpactAnalysis {
  impact: 'positive' | 'negative' | 'neutral';
  magnitude: 'low' | 'medium' | 'high';
  keyEvents: Array<{
    event: string;
    sentiment: number;
    impact: string;
    timeframe: string;
  }>;
  description: string;
}

export interface EarningsPrediction {
  nextEarningsDate: string;
  estimatedEPS: number;
  actualEPS?: number;
  surpriseProbability: number;
  priceMovePrediction: {
    direction: 'up' | 'down' | 'flat';
    magnitude: number;
    confidence: number;
  };
  keyMetrics: string[];
}

export interface InsiderTradingAnalysis {
  recentActivity: Array<{
    type: 'buy' | 'sell';
    amount: number;
    date: string;
    title: string;
  }>;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  significance: 'low' | 'medium' | 'high';
  pattern: string;
}

export interface FinancialHealthAnalysis {
  score: number; // 0-100
  rating: 'poor' | 'fair' | 'good' | 'excellent';
  metrics: {
    debtToEquity: number;
    currentRatio: number;
    roe: number;
    roic: number;
    freeCashFlow: number;
  };
  strengths: string[];
  concerns: string[];
}

export interface TradingMetrics {
  volatility: number;
  beta: number;
  averageVolume: number;
  institutionalOwnership: number;
  shortInterest: number;
  daysToCover: number;
  momentum: {
    short: number;
    medium: number;
    long: number;
  };
}

export interface PatternRecognition {
  patterns: Array<{
    name: string;
    type: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    description: string;
    timeframe: string;
  }>;
  currentFormation: string;
  significance: 'low' | 'medium' | 'high';
}

export interface MarketInsights {
  sectorPerformance: Array<{
    sector: string;
    performance: number;
    outlook: 'positive' | 'negative' | 'neutral';
  }>;
  marketCorrelation: number;
  relativeStrength: number;
  institutionalFlow: 'buying' | 'selling' | 'neutral';
  keyDrivers: string[];
}

// ============================================================================
// UNIFIED AI RESPONSE
// ============================================================================

export interface UnifiedAIResponse {
  symbol: string;
  timestamp: number;
  
  // Core Analysis
  sentiment: SentimentAnalysis;
  technicalAnalysis: TechnicalAnalysis;
  fundamentalScore: FundamentalScore;
  
  // Price & Market
  priceForecast: PriceForecast;
  patternRecognition: PatternRecognition;
  marketInsights: MarketInsights;
  
  // Trading Recommendations
  tradeRecommendations: TradeRecommendations;
  optionsFlow: OptionsFlowAnalysis;
  riskAssessment: RiskAssessment;
  
  // News & Events
  newsImpact: NewsImpactAnalysis;
  earningsPrediction: EarningsPrediction;
  insiderTrading: InsiderTradingAnalysis;
  
  // Performance Metrics
  financialHealth: FinancialHealthAnalysis;
  tradingMetrics: TradingMetrics;
}

// ============================================================================
// GROQ AI SERVICE CLASS
// ============================================================================

class UnifiedGroqService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { data: UnifiedAIResponse; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    if (!this.apiKey) {
      logger.warn('Groq API key not found. AI insights will use mock data.');
    }
  }

  /**
   * Generate comprehensive AI analysis for a stock symbol
   * Single API call that powers ALL AI components
   */
  async generateUnifiedAnalysis(
    symbol: string,
    stockData: StockData,
    optionsData?: OptionChainData,
    newsData?: NewsItem[],
    marketContext?: MarketContext
  ): Promise<UnifiedAIResponse> {
    const cacheKey = `${symbol}_${Math.floor(Date.now() / this.CACHE_DURATION)}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      logger.info(`Serving cached AI analysis for ${symbol}`);
      return cached.data;
    }

    try {
      logger.info(`Generating unified AI analysis for ${symbol}`);
      
      if (!this.apiKey) {
        return this.generateMockResponse(symbol, stockData);
      }

      const prompt = this.buildUnifiedPrompt(symbol, stockData, optionsData, newsData, marketContext);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile', // Meta Llama model
          messages: [
            {
              role: 'system',
              content: 'You are an expert financial analyst and trading advisor. Provide comprehensive stock analysis in JSON format only. Be precise, data-driven, and actionable.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = JSON.parse(data.choices[0].message.content) as UnifiedAIResponse;
      
      // Add metadata
      aiResponse.symbol = symbol;
      aiResponse.timestamp = Date.now();
      
      // Cache the response
      this.cache.set(cacheKey, { data: aiResponse, timestamp: Date.now() });
      
      logger.info(`Generated unified AI analysis for ${symbol} successfully`);
      return aiResponse;
      
    } catch (error) {
      logger.error(`Error generating AI analysis for ${symbol}:`, error);
      return this.generateMockResponse(symbol, stockData);
    }
  }

  /**
   * Build comprehensive prompt for unified analysis
   */
  private buildUnifiedPrompt(
    symbol: string,
    stockData: StockData,
    optionsData?: OptionChainData,
    newsData?: NewsItem[],
    marketContext?: MarketContext
  ): string {
    return `
Analyze ${symbol} comprehensively. Current price: $${stockData.price} (${stockData.changePercent}%).

STOCK DATA:
${JSON.stringify(stockData, null, 2)}

${optionsData ? `OPTIONS DATA:\n${JSON.stringify(optionsData, null, 2)}` : ''}

${newsData ? `RECENT NEWS:\n${JSON.stringify(newsData, null, 2)}` : ''}

${marketContext ? `MARKET CONTEXT:\n${JSON.stringify(marketContext, null, 2)}` : ''}

Generate a comprehensive analysis in JSON format matching this EXACT structure:

{
  "sentiment": {
    "overall": -100 to 100,
    "news": -100 to 100,
    "social": -100 to 100,
    "insider": -100 to 100,
    "technical": -100 to 100,
    "description": "string",
    "keyFactors": ["factor1", "factor2"]
  },
  "technicalAnalysis": {
    "signal": "BUY/SELL/HOLD",
    "strength": "weak/medium/strong",
    "confidence": 0-100,
    "indicators": {
      "rsi": {"value": 0-100, "signal": "string"},
      "macd": {"signal": "string", "description": "string"},
      "sma50": {"value": number, "position": "above/below"},
      "sma200": {"value": number, "position": "above/below"},
      "supportLevel": number,
      "resistanceLevel": number
    },
    "patterns": ["pattern1", "pattern2"]
  },
  "fundamentalScore": {
    "score": 0-100,
    "maxScore": 100,
    "rating": "weak/fair/good/strong/excellent",
    "factors": {
      "financial": 0-100,
      "growth": 0-100,
      "profitability": 0-100,
      "valuation": 0-100
    },
    "description": "string"
  },
  "priceForecast": {
    "timeframes": {
      "1d": {"price": number, "confidence": 0-100, "range": [low, high]},
      "1w": {"price": number, "confidence": 0-100, "range": [low, high]},
      "1m": {"price": number, "confidence": 0-100, "range": [low, high]}
    },
    "trend": "upward/downward/sideways",
    "reasoning": "string"
  },
  "tradeRecommendations": {
    "stock": {
      "action": "BUY/SELL/HOLD",
      "confidence": 0-100,
      "targetPrice": number,
      "stopLoss": number,
      "timeframe": "string",
      "reasoning": "string"
    }
  },
  "optionsFlow": {
    "bullishTrades": number,
    "bearishTrades": number,
    "sweepActivity": number,
    "unusualActivity": boolean,
    "largestTrade": {
      "type": "call/put",
      "strike": number,
      "volume": number,
      "premium": number
    },
    "flowSentiment": "bullish/bearish/neutral",
    "significance": "low/medium/high"
  },
  "riskAssessment": {
    "level": "low/medium/high",
    "score": 0-100,
    "factors": ["factor1", "factor2"],
    "warnings": ["warning1", "warning2"],
    "volatility": {
      "current": number,
      "historical": number,
      "percentile": number
    },
    "maxDrawdown": number
  },
  "newsImpact": {
    "impact": "positive/negative/neutral",
    "magnitude": "low/medium/high",
    "keyEvents": [
      {
        "event": "string",
        "sentiment": -100 to 100,
        "impact": "string",
        "timeframe": "string"
      }
    ],
    "description": "string"
  },
  "earningsPrediction": {
    "nextEarningsDate": "YYYY-MM-DD",
    "estimatedEPS": number,
    "surpriseProbability": 0-100,
    "priceMovePrediction": {
      "direction": "up/down/flat",
      "magnitude": number,
      "confidence": 0-100
    },
    "keyMetrics": ["metric1", "metric2"]
  },
  "insiderTrading": {
    "recentActivity": [
      {
        "type": "buy/sell",
        "amount": number,
        "date": "YYYY-MM-DD",
        "title": "string"
      }
    ],
    "sentiment": "bullish/bearish/neutral",
    "significance": "low/medium/high",
    "pattern": "string"
  },
  "financialHealth": {
    "score": 0-100,
    "rating": "poor/fair/good/excellent",
    "metrics": {
      "debtToEquity": number,
      "currentRatio": number,
      "roe": number,
      "roic": number,
      "freeCashFlow": number
    },
    "strengths": ["strength1", "strength2"],
    "concerns": ["concern1", "concern2"]
  },
  "tradingMetrics": {
    "volatility": number,
    "beta": number,
    "averageVolume": number,
    "institutionalOwnership": number,
    "shortInterest": number,
    "daysToCover": number,
    "momentum": {
      "short": number,
      "medium": number,
      "long": number
    }
  },
  "patternRecognition": {
    "patterns": [
      {
        "name": "string",
        "type": "bullish/bearish/neutral",
        "confidence": 0-100,
        "description": "string",
        "timeframe": "string"
      }
    ],
    "currentFormation": "string",
    "significance": "low/medium/high"
  },
  "marketInsights": {
    "sectorPerformance": [
      {
        "sector": "string",
        "performance": number,
        "outlook": "positive/negative/neutral"
      }
    ],
    "marketCorrelation": number,
    "relativeStrength": number,
    "institutionalFlow": "buying/selling/neutral",
    "keyDrivers": ["driver1", "driver2"]
  }
}

Be precise with numbers, realistic with predictions, and actionable with recommendations.
`;
  }

  /**
   * Generate realistic mock response when API is unavailable
   */
  private generateMockResponse(symbol: string, stockData: StockData): UnifiedAIResponse {
    const price = stockData.price;
    const change = stockData.changePercent;
    
    return {
      symbol,
      timestamp: Date.now(),
      sentiment: {
        overall: change > 0 ? 65 : -45,
        news: change > 0 ? 70 : -40,
        social: change > 0 ? 60 : -50,
        insider: 20,
        technical: change > 0 ? 55 : -35,
        description: `Overall sentiment is ${change > 0 ? 'positive' : 'negative'} based on recent price movement and market indicators.`,
        keyFactors: ['Price momentum', 'Volume patterns', 'Market correlation']
      },
      technicalAnalysis: {
        signal: change > 2 ? 'BUY' : change < -2 ? 'SELL' : 'HOLD',
        strength: Math.abs(change) > 3 ? 'strong' : 'medium',
        confidence: 75,
        indicators: {
          rsi: { value: change > 0 ? 65 : 35, signal: change > 0 ? 'Overbought approaching' : 'Oversold territory' },
          macd: { signal: change > 0 ? 'Bullish crossover' : 'Bearish divergence', description: 'MACD trending with price movement' },
          sma50: { value: price * 0.95, position: change > 0 ? 'above' : 'below' },
          sma200: { value: price * 0.90, position: change > 0 ? 'above' : 'below' },
          supportLevel: price * 0.95,
          resistanceLevel: price * 1.05
        },
        patterns: change > 0 ? ['Ascending triangle', 'Bullish flag'] : ['Descending triangle', 'Bear flag']
      },
      fundamentalScore: {
        score: 78,
        maxScore: 100,
        rating: 'good',
        factors: {
          financial: 82,
          growth: 75,
          profitability: 80,
          valuation: 70
        },
        description: 'Strong fundamentals with solid financial metrics and growth prospects.'
      },
      priceForecast: {
        timeframes: {
          '1d': { price: price * (1 + change/100 * 0.3), confidence: 60, range: [price * 0.98, price * 1.02] },
          '1w': { price: price * (1 + change/100 * 0.8), confidence: 55, range: [price * 0.95, price * 1.05] },
          '1m': { price: price * (1 + change/100 * 1.5), confidence: 45, range: [price * 0.90, price * 1.10] }
        },
        trend: change > 0 ? 'upward' : 'downward',
        reasoning: `Technical indicators and momentum suggest ${change > 0 ? 'continued upward' : 'potential downward'} movement.`
      },
      tradeRecommendations: {
        stock: {
          action: change > 2 ? 'BUY' : change < -2 ? 'SELL' : 'HOLD',
          confidence: 70,
          targetPrice: price * (change > 0 ? 1.08 : 0.95),
          stopLoss: price * (change > 0 ? 0.95 : 1.05),
          timeframe: '2-4 weeks',
          reasoning: `Based on technical analysis and current momentum patterns.`
        }
      },
      optionsFlow: {
        bullishTrades: change > 0 ? 1200 : 400,
        bearishTrades: change > 0 ? 300 : 900,
        sweepActivity: 15,
        unusualActivity: Math.abs(change) > 3,
        largestTrade: {
          type: change > 0 ? 'call' : 'put',
          strike: Math.round(price * (change > 0 ? 1.05 : 0.95)),
          volume: 500,
          premium: price * 0.02
        },
        flowSentiment: change > 0 ? 'bullish' : 'bearish',
        significance: Math.abs(change) > 3 ? 'high' : 'medium'
      },
      riskAssessment: {
        level: Math.abs(change) > 5 ? 'high' : Math.abs(change) > 2 ? 'medium' : 'low',
        score: Math.abs(change) > 5 ? 80 : Math.abs(change) > 2 ? 50 : 25,
        factors: ['Price volatility', 'Market conditions', 'Volume patterns'],
        warnings: Math.abs(change) > 5 ? ['High volatility detected', 'Consider position sizing'] : [],
        volatility: {
          current: Math.abs(change) * 2,
          historical: Math.abs(change) * 1.5,
          percentile: 75
        },
        maxDrawdown: Math.abs(change) * 0.8
      },
      newsImpact: {
        impact: change > 0 ? 'positive' : 'negative',
        magnitude: Math.abs(change) > 3 ? 'high' : 'medium',
        keyEvents: [
          {
            event: change > 0 ? 'Positive earnings guidance' : 'Market concerns',
            sentiment: change > 0 ? 80 : -60,
            impact: change > 0 ? 'Stock price boost' : 'Downward pressure',
            timeframe: 'Short-term'
          }
        ],
        description: `Recent news ${change > 0 ? 'positively' : 'negatively'} impacting stock performance.`
      },
      earningsPrediction: {
        nextEarningsDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimatedEPS: 2.45,
        surpriseProbability: change > 0 ? 65 : 35,
        priceMovePrediction: {
          direction: change > 0 ? 'up' : 'down',
          magnitude: Math.abs(change) * 0.5,
          confidence: 60
        },
        keyMetrics: ['Revenue growth', 'Margin expansion', 'Guidance update']
      },
      insiderTrading: {
        recentActivity: [
          {
            type: change > 0 ? 'buy' : 'sell',
            amount: 50000,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            title: 'CEO'
          }
        ],
        sentiment: change > 0 ? 'bullish' : 'bearish',
        significance: 'medium',
        pattern: change > 0 ? 'Accumulation by executives' : 'Some profit taking'
      },
      financialHealth: {
        score: 82,
        rating: 'good',
        metrics: {
          debtToEquity: 0.45,
          currentRatio: 2.1,
          roe: 15.2,
          roic: 12.8,
          freeCashFlow: 1.2e9
        },
        strengths: ['Strong balance sheet', 'Consistent profitability', 'Good cash generation'],
        concerns: ['Competitive pressure', 'Market volatility']
      },
      tradingMetrics: {
        volatility: Math.abs(change) * 2.5,
        beta: 1.15,
        averageVolume: stockData.volume || 1000000,
        institutionalOwnership: 68,
        shortInterest: 5.2,
        daysToCover: 2.1,
        momentum: {
          short: change,
          medium: change * 0.8,
          long: change * 0.6
        }
      },
      patternRecognition: {
        patterns: [
          {
            name: change > 0 ? 'Bullish breakout' : 'Bearish breakdown',
            type: change > 0 ? 'bullish' : 'bearish',
            confidence: 75,
            description: `Price action shows ${change > 0 ? 'upward momentum' : 'downward pressure'}`,
            timeframe: 'Short-term'
          }
        ],
        currentFormation: change > 0 ? 'Higher highs and higher lows' : 'Lower highs and lower lows',
        significance: Math.abs(change) > 3 ? 'high' : 'medium'
      },
      marketInsights: {
        sectorPerformance: [
          { sector: 'Technology', performance: 2.1, outlook: 'positive' },
          { sector: 'Healthcare', performance: 1.3, outlook: 'neutral' },
          { sector: 'Finance', performance: -0.8, outlook: 'negative' }
        ],
        marketCorrelation: 0.75,
        relativeStrength: change > 0 ? 65 : 35,
        institutionalFlow: change > 0 ? 'buying' : 'selling',
        keyDrivers: ['Fed policy', 'Earnings season', 'Economic data']
      }
    };
  }

  /**
   * Clear cache (useful for forcing refresh)
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Groq AI cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const unifiedGroqService = new UnifiedGroqService();
export default unifiedGroqService;



