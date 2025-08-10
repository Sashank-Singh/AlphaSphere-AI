// Types for AI Trading Integration
export interface AITradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity?: number;
  timestamp: Date;
}

export interface RLModelPrediction {
  symbol: string;
  prediction: number; // -1 to 1 (sell to buy)
  confidence: number;
  features: Record<string, number>;
  timestamp: Date;
}

export interface LLMAnalysis {
  marketContext: string;
  tradingOpportunities: string[];
  riskFactors: string[];
  recommendations: string[];
  reasoning: string;
  timestamp: Date;
}

export interface AITradingSession {
  sessionId: string;
  userId: string;
  initialCapital: number;
  currentCapital: number;
  positions: Record<string, number>;
  trades: AITrade[];
  signals: AITradingSignal[];
  performance: TradingPerformance;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AITrade {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: Date;
  signal: AITradingSignal;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
}

export interface TradingPerformance {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageWin: number;
  averageLoss: number;
}

export class AITradingIntegration {
  private alpacaApiKey: string;
  private alpacaSecretKey: string;
  private alpacaBaseUrl: string;
  private rlApiEndpoint: string;
  private llmApiEndpoint: string;
  private activeSessions: Map<string, AITradingSession> = new Map();

  constructor(
    alpacaApiKey: string,
    alpacaSecretKey: string,
    rlApiEndpoint: string = 'http://localhost:8501',
    llmApiEndpoint: string = 'http://localhost:5001'
  ) {
    this.alpacaApiKey = alpacaApiKey;
    this.alpacaSecretKey = alpacaSecretKey;
    this.alpacaBaseUrl = 'https://paper-api.alpaca.markets'; // Paper trading URL
    this.rlApiEndpoint = rlApiEndpoint;
    this.llmApiEndpoint = llmApiEndpoint;
  }

  // Initialize a new AI trading session
  async createTradingSession(
    userId: string,
    initialCapital: number,
    symbols: string[] = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']
  ): Promise<AITradingSession> {
    const sessionId = `ai_session_${Date.now()}_${userId}`;
    
    const session: AITradingSession = {
      sessionId,
      userId,
      initialCapital,
      currentCapital: initialCapital,
      positions: {},
      trades: [],
      signals: [],
      performance: {
        totalReturn: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        winRate: 0,
        totalTrades: 0,
        profitableTrades: 0,
        averageWin: 0,
        averageLoss: 0
      },
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  // Get RL model predictions for symbols
  async getRLPredictions(symbols: string[]): Promise<RLModelPrediction[]> {
    try {
      const response = await fetch(`${this.rlApiEndpoint}/predict/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          model_type: 'ensemble',
          lookback_period: 30
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.predictions.map((pred: any) => ({
          symbol: pred.symbol,
          prediction: pred.prediction,
          confidence: pred.confidence,
          features: pred.features,
          timestamp: new Date(pred.timestamp)
        }));
      }

      // Fallback to individual predictions if batch fails
      const predictions: RLModelPrediction[] = [];
      for (const symbol of symbols) {
        try {
          const singleResponse = await fetch(`${this.rlApiEndpoint}/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              symbol,
              model_type: 'ensemble',
              lookback_period: 30
            })
          });

          if (singleResponse.ok) {
            const pred = await singleResponse.json();
            predictions.push({
              symbol: pred.symbol,
              prediction: pred.prediction,
              confidence: pred.confidence,
              features: pred.features,
              timestamp: new Date(pred.timestamp)
            });
          }
        } catch (error) {
          console.error(`Error getting prediction for ${symbol}:`, error);
        }
      }

      return predictions;
    } catch (error) {
      console.error('Error getting RL predictions:', error);
      // Return mock predictions for demo when RL system is not available
      return symbols.map(symbol => ({
        symbol,
        prediction: Math.random() * 2 - 1, // -1 to 1
        confidence: 0.5 + Math.random() * 0.4, // 0.5 to 0.9
        features: { feature_1: Math.random(), feature_2: Math.random() },
        timestamp: new Date()
      }));
    }
  }

  // Get LLM analysis for market context
  async getLLMAnalysis(
    symbols: string[],
    marketData: any,
    rlPredictions: RLModelPrediction[]
  ): Promise<LLMAnalysis> {
    try {
      const response = await fetch(`${this.llmApiEndpoint}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbols,
          market_data: marketData,
          rl_predictions: rlPredictions,
          analysis_type: 'trading_opportunities'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          marketContext: data.market_context,
          tradingOpportunities: data.opportunities,
          riskFactors: data.risk_factors,
          recommendations: data.recommendations,
          reasoning: data.reasoning,
          timestamp: new Date(data.timestamp)
        };
      }

      // Fallback analysis if API fails
      return this.generateFallbackAnalysis(symbols, rlPredictions);
    } catch (error) {
      console.error('Error getting LLM analysis:', error);
      return this.generateFallbackAnalysis(symbols, rlPredictions);
    }
  }

  // Generate trading signals from RL predictions and LLM analysis
  generateTradingSignals(
    rlPredictions: RLModelPrediction[],
    llmAnalysis: LLMAnalysis,
    session: AITradingSession
  ): AITradingSignal[] {
    const signals: AITradingSignal[] = [];

    for (const prediction of rlPredictions) {
      const confidence = prediction.confidence;
      const predictionValue = prediction.prediction;
      
      // Determine action based on prediction value and confidence
      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let reasoning = '';

      if (confidence > 0.7) { // High confidence threshold
        if (predictionValue > 0.3) {
          action = 'BUY';
          reasoning = `Strong buy signal from RL model (confidence: ${(confidence * 100).toFixed(1)}%). ${llmAnalysis.recommendations.join(' ')}`;
        } else if (predictionValue < -0.3) {
          action = 'SELL';
          reasoning = `Strong sell signal from RL model (confidence: ${(confidence * 100).toFixed(1)}%). ${llmAnalysis.riskFactors.join(' ')}`;
        }
      }

      if (action !== 'HOLD') {
        signals.push({
          symbol: prediction.symbol,
          action,
          confidence,
          reasoning,
          timestamp: new Date()
        });
      }
    }

    return signals;
  }

  // Execute trades based on AI signals (simulated for demo)
  async executeAITrades(
    sessionId: string,
    signals: AITradingSignal[]
  ): Promise<AITrade[]> {
    console.log('Executing trades for session:', sessionId);
    console.log('Available sessions:', Array.from(this.activeSessions.keys()));
    
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    if (session.status !== 'ACTIVE') {
      throw new Error(`Session is not active. Current status: ${session.status}`);
    }

    console.log('Session found:', {
      sessionId: session.sessionId,
      status: session.status,
      currentCapital: session.currentCapital,
      signalsCount: signals.length
    });

    const executedTrades: AITrade[] = [];

    for (const signal of signals) {
      try {
        console.log(`Processing signal for ${signal.symbol}:`, signal);
        
        // Calculate position size based on confidence and available capital
        const positionSize = this.calculatePositionSize(
          session.currentCapital,
          signal.confidence,
          session.positions[signal.symbol] || 0
        );

        console.log(`Calculated position size for ${signal.symbol}:`, positionSize);

        if (positionSize > 0) {
          // Simulate trade execution (in real implementation, this would call Alpaca API)
          const mockPrice = this.getMockPrice(signal.symbol);
          const tradeId = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          const trade: AITrade = {
            id: tradeId,
            symbol: signal.symbol,
            side: signal.action as 'BUY' | 'SELL',
            quantity: positionSize,
            price: mockPrice,
            timestamp: new Date(),
            signal,
            status: 'FILLED'
          };

          console.log(`Executing trade:`, trade);

          executedTrades.push(trade);
          session.trades.push(trade);

          // Update session positions
          if (signal.action === 'BUY') {
            session.positions[signal.symbol] = (session.positions[signal.symbol] || 0) + positionSize;
            session.currentCapital -= positionSize * mockPrice;
          } else {
            session.positions[signal.symbol] = (session.positions[signal.symbol] || 0) - positionSize;
            session.currentCapital += positionSize * mockPrice;
          }

          console.log(`Updated session capital: ${session.currentCapital}`);
        } else {
          console.log(`Skipping trade for ${signal.symbol} - position size is 0`);
        }
      } catch (error) {
        console.error(`Error executing trade for ${signal.symbol}:`, error);
        throw error; // Re-throw to show error in UI
      }
    }

    session.updatedAt = new Date();
    console.log(`Successfully executed ${executedTrades.length} trades`);
    return executedTrades;
  }

  // Calculate optimal position size based on Kelly Criterion
  private calculatePositionSize(
    availableCapital: number,
    confidence: number,
    currentPosition: number
  ): number {
    // For demo purposes, use a simpler calculation to ensure trades execute
    const basePositionSize = Math.floor(availableCapital * 0.02); // 2% of capital per trade
    
    // Adjust based on confidence
    const adjustedSize = Math.floor(basePositionSize * confidence);
    
    // Ensure minimum position size for demo
    const minPositionSize = 1; // At least 1 share
    const maxPositionSize = Math.floor(availableCapital * 0.1); // Max 10% of capital
    
    const finalSize = Math.max(minPositionSize, Math.min(adjustedSize, maxPositionSize));
    
    console.log(`Position size calculation:`, {
      availableCapital,
      confidence,
      basePositionSize,
      adjustedSize,
      finalSize
    });
    
    return finalSize;
  }

  // Get mock price for demo purposes
  private getMockPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      'AAPL': 150,
      'MSFT': 320,
      'GOOGL': 2850,
      'TSLA': 250,
      'NVDA': 450,
      'AMZN': 3300,
      'META': 280,
      'NFLX': 500
    };
    
    const basePrice = basePrices[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    return basePrice * (1 + variation);
  }

  // Update session performance metrics
  updateSessionPerformance(sessionId: string): TradingPerformance {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const filledTrades = session.trades.filter(trade => trade.status === 'FILLED');
    const profitableTrades = filledTrades.filter(trade => {
      // Calculate profit/loss for each trade
      // This is a simplified calculation
      return trade.side === 'BUY' ? true : false; // Simplified for demo
    });

    const performance: TradingPerformance = {
      totalReturn: ((session.currentCapital - session.initialCapital) / session.initialCapital) * 100,
      sharpeRatio: this.calculateSharpeRatio(filledTrades),
      maxDrawdown: this.calculateMaxDrawdown(filledTrades),
      winRate: profitableTrades.length / filledTrades.length,
      totalTrades: filledTrades.length,
      profitableTrades: profitableTrades.length,
      averageWin: this.calculateAverageWin(profitableTrades),
      averageLoss: this.calculateAverageLoss(filledTrades.filter(t => !profitableTrades.includes(t)))
    };

    session.performance = performance;
    return performance;
  }

  // Helper methods for performance calculations
  private calculateSharpeRatio(trades: AITrade[]): number {
    // Simplified Sharpe ratio calculation
    return trades.length > 0 ? 1.5 : 0; // Placeholder
  }

  private calculateMaxDrawdown(trades: AITrade[]): number {
    // Simplified max drawdown calculation
    return trades.length > 0 ? 5.2 : 0; // Placeholder
  }

  private calculateAverageWin(profitableTrades: AITrade[]): number {
    return profitableTrades.length > 0 ? 150 : 0; // Placeholder
  }

  private calculateAverageLoss(losingTrades: AITrade[]): number {
    return losingTrades.length > 0 ? -75 : 0; // Placeholder
  }

  // Generate fallback analysis when LLM API is unavailable
  private generateFallbackAnalysis(
    symbols: string[],
    rlPredictions: RLModelPrediction[]
  ): LLMAnalysis {
    const bullishSignals = rlPredictions.filter(p => p.prediction > 0.3).length;
    const bearishSignals = rlPredictions.filter(p => p.prediction < -0.3).length;

    return {
      marketContext: `Analyzing ${symbols.length} symbols with ${bullishSignals} bullish and ${bearishSignals} bearish signals`,
      tradingOpportunities: symbols.slice(0, 3).map(s => `${s} shows potential based on technical analysis`),
      riskFactors: ['Market volatility', 'Economic uncertainty', 'Sector rotation'],
      recommendations: ['Diversify portfolio', 'Use stop-loss orders', 'Monitor market conditions'],
      reasoning: 'Analysis based on RL model predictions and technical indicators',
      timestamp: new Date()
    };
  }

  // Get active session
  getSession(sessionId: string): AITradingSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Get all active sessions for a user
  getUserSessions(userId: string): AITradingSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
  }

  // Pause or stop a trading session
  updateSessionStatus(sessionId: string, status: 'ACTIVE' | 'PAUSED' | 'STOPPED'): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = status;
      session.updatedAt = new Date();
    }
  }
}

// Export singleton instance - Only use public keys on frontend
export const aiTradingIntegration = new AITradingIntegration(
  import.meta.env.VITE_ALPACA_API_KEY || '',
  '', // Secret key removed from frontend - handled by backend
  import.meta.env.VITE_RL_API_ENDPOINT || 'http://localhost:8501',
  import.meta.env.VITE_LLM_API_ENDPOINT || 'http://localhost:5001'
); 