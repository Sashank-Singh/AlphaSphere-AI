import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  AlertTriangle,
  Play,
  Pause,
  Square,
  RefreshCw,
  DollarSign,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react';
import { 
  aiTradingIntegration,
  AITradingSession, 
  AITradingSignal, 
  RLModelPrediction, 
  LLMAnalysis,
  AITrade 
} from '@/lib/aiTradingIntegration';
import { ManualTradePanel } from './ManualTradePanel';

interface AITradingDashboardProps {
  userId: string;
  initialCapital?: number;
}

export const AITradingDashboard: React.FC<AITradingDashboardProps> = ({
  userId,
  initialCapital = 10000
}) => {
  const [activeSession, setActiveSession] = useState<AITradingSession | null>(null);
  const [signals, setSignals] = useState<AITradingSignal[]>([]);
  const [rlPredictions, setRlPredictions] = useState<RLModelPrediction[]>([]);
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTrading, setAutoTrading] = useState(false);

  // Use the singleton instance instead of creating new one
  const aiIntegration = aiTradingIntegration;

  // Initialize AI trading session
  const initializeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const session = await aiIntegration.createTradingSession(userId, initialCapital);
      setActiveSession(session);
      
      // Start initial analysis
      await performAIAnalysis(session.sessionId);
    } catch (err) {
      setError('Failed to initialize AI trading session');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, initialCapital]);

  // Perform complete AI analysis cycle
  const performAIAnalysis = useCallback(async (sessionId: string) => {
    if (!activeSession) return;

    try {
      setIsLoading(true);
      
      // Get RL predictions
      const predictions = await aiIntegration.getRLPredictions(
        Object.keys(activeSession.positions).length > 0 
          ? Object.keys(activeSession.positions) 
          : ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'NVDA']
      );
      setRlPredictions(predictions);

      // Get LLM analysis
      const analysis = await aiIntegration.getLLMAnalysis(
        predictions.map(p => p.symbol),
        {}, // Market data would be passed here
        predictions
      );
      setLlmAnalysis(analysis);

      // Generate trading signals
      const newSignals = aiIntegration.generateTradingSignals(
        predictions,
        analysis,
        activeSession
      );
      setSignals(newSignals);

      // Execute trades if auto-trading is enabled
      if (autoTrading && newSignals.length > 0) {
        await executeTrades(sessionId, newSignals);
      }

    } catch (err) {
      setError('Failed to perform AI analysis');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, autoTrading]);

  // Execute trades based on signals
  const executeTrades = useCallback(async (sessionId: string, tradingSignals: AITradingSignal[]) => {
    try {
      const executedTrades = await aiIntegration.executeAITrades(sessionId, tradingSignals);
      
      // Update session with new trades
      if (activeSession) {
        const updatedSession = aiIntegration.getSession(sessionId);
        if (updatedSession) {
          setActiveSession(updatedSession);
        }
      }

      return executedTrades;
    } catch (err) {
      setError('Failed to execute trades');
      console.error(err);
      return [];
    }
  }, [activeSession]);

  // Execute a single trade
  const executeSingleTrade = useCallback(async (signal: AITradingSignal) => {
    if (!activeSession) return;
    
    try {
      setIsLoading(true);
      const executedTrades = await executeTrades(activeSession.sessionId, [signal]);
      
      if (executedTrades.length > 0) {
        // Refresh signals after trade execution
        await performAIAnalysis(activeSession.sessionId);
      }
    } catch (err) {
      setError('Failed to execute trade');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, executeTrades, performAIAnalysis]);

  // View trade details
  const viewTradeDetails = useCallback((signal: AITradingSignal) => {
    // For now, just log the details. In a real app, this would open a modal
    console.log('Trade Details:', signal);
    alert(`Trade Details for ${signal.symbol}:\nAction: ${signal.action}\nConfidence: ${(signal.confidence * 100).toFixed(1)}%\nReasoning: ${signal.reasoning}`);
  }, []);

  // Handle manual trade execution
  const handleManualTrade = useCallback(async (symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number) => {
    if (!activeSession) return;
    
    try {
      setIsLoading(true);
      
      // Create a manual trade signal
      const manualSignal: AITradingSignal = {
        symbol,
        action: side,
        confidence: 1.0, // Manual trades have 100% confidence
        reasoning: `Manual ${side} order for ${quantity} shares at $${price}`,
        timestamp: new Date(),
        price: price,
        quantity: quantity
      };
      
      // Execute the trade
      await executeTrades(activeSession.sessionId, [manualSignal]);
      
      // Refresh the session
      await performAIAnalysis(activeSession.sessionId);
      
    } catch (err) {
      setError('Failed to execute manual trade');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeSession, executeTrades, performAIAnalysis]);

  // Toggle auto-trading
  const toggleAutoTrading = useCallback(() => {
    setAutoTrading(!autoTrading);
  }, [autoTrading]);

  // Update session status
  const updateSessionStatus = useCallback((status: 'ACTIVE' | 'PAUSED' | 'STOPPED') => {
    if (activeSession) {
      aiIntegration.updateSessionStatus(activeSession.sessionId, status);
      setActiveSession(prev => prev ? { ...prev, status } : null);
    }
  }, [activeSession]);

  // Initialize session on component mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Auto-refresh analysis every 5 minutes
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'ACTIVE') return;

    const interval = setInterval(() => {
      performAIAnalysis(activeSession.sessionId);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [activeSession, performAIAnalysis]);

  if (isLoading && !activeSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing AI Trading Session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!activeSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Trading Dashboard</CardTitle>
          <CardDescription>Initialize your AI trading session to begin</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={initializeSession} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Start AI Trading Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Trading Session
              </CardTitle>
              <CardDescription>
                Session ID: {activeSession.sessionId}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeSession.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {activeSession.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSessionStatus(activeSession.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
              >
                {activeSession.status === 'ACTIVE' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateSessionStatus('STOPPED')}
              >
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${activeSession.currentCapital.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Current Capital</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {activeSession.performance.totalReturn.toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground">Total Return</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {activeSession.performance.winRate.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {activeSession.performance.totalTrades}
              </p>
              <p className="text-sm text-muted-foreground">Total Trades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="signals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="signals">Trading Signals</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Trading Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          {/* Quick Trading Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Trading
              </CardTitle>
              <CardDescription>
                Manually execute trades or enable auto-trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant={autoTrading ? "default" : "outline"}
                    onClick={toggleAutoTrading}
                    className="flex items-center gap-2"
                  >
                    {autoTrading ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {autoTrading ? "Auto-Trading ON" : "Auto-Trading OFF"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => performAIAnalysis(activeSession.sessionId)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Generate Signals
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {autoTrading ? "AI will automatically execute trades" : "Manual trading mode"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Trading Signals
              </CardTitle>
              <CardDescription>
                AI-generated trading signals with confidence scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              {signals.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trading signals available</p>
                  <p className="text-sm text-muted-foreground">Click refresh to generate new signals</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {signals.map((signal, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {signal.action === 'BUY' ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-red-600" />
                              )}
                              <span className="font-semibold">{signal.symbol}</span>
                            </div>
                            <Badge variant={signal.action === 'BUY' ? 'default' : 'destructive'}>
                              {signal.action}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{(signal.confidence * 100).toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">Confidence</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{signal.reasoning}</p>
                        <div className="mt-3">
                          <Progress value={signal.confidence * 100} className="h-2" />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => executeSingleTrade(signal)}
                            disabled={isLoading}
                          >
                            Execute Trade
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewTradeDetails(signal)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* RL Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  RL Model Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rlPredictions.length === 0 ? (
                  <p className="text-muted-foreground">No predictions available</p>
                ) : (
                  <div className="space-y-3">
                    {rlPredictions.map((prediction, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-semibold">{prediction.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            Prediction: {prediction.prediction.toFixed(3)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(prediction.confidence * 100).toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">Confidence</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LLM Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  LLM Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {llmAnalysis ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Market Context</h4>
                      <p className="text-sm text-muted-foreground">{llmAnalysis.marketContext}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Trading Opportunities</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {llmAnalysis.tradingOpportunities.map((opportunity, index) => (
                          <li key={index}>• {opportunity}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Risk Factors</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {llmAnalysis.riskFactors.map((risk, index) => (
                          <li key={index}>• {risk}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {llmAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No analysis available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Manual Trading Panel */}
            <ManualTradePanel
              onExecuteTrade={handleManualTrade}
              availableCapital={activeSession.capital}
              isLoading={isLoading}
            />
            
            {/* Current Positions */}
            <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Current Positions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(activeSession.positions).length === 0 ? (
                <p className="text-muted-foreground">No positions yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(activeSession.positions).map(([symbol, quantity]) => (
                    <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {quantity} shares
                        </p>
                      </div>
                      <Badge variant={quantity > 0 ? "default" : "secondary"}>
                        {quantity > 0 ? "Long" : "Short"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Recent Trades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeSession.trades.length === 0 ? (
                <p className="text-muted-foreground">No trades yet</p>
              ) : (
                <div className="space-y-3">
                  {activeSession.trades.slice(-5).reverse().map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-semibold">{trade.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {trade.quantity} shares @ ${trade.price}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={trade.side === 'BUY' ? "default" : "destructive"}>
                          {trade.side}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trade.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {activeSession.performance.totalReturn.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Total Return</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {activeSession.performance.sharpeRatio.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {activeSession.performance.maxDrawdown.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Max Drawdown</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {activeSession.performance.winRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold">
                    {activeSession.performance.totalTrades}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {activeSession.performance.profitableTrades}
                  </p>
                  <p className="text-sm text-muted-foreground">Profitable Trades</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    ${activeSession.performance.averageWin.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Win</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600">
                    ${activeSession.performance.averageLoss.toFixed(0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Loss</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 