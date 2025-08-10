import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Newspaper, 
  DollarSign,
  Shield,
  Activity,
  Timer,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useUnifiedAI } from '@/hooks/useUnifiedAI';
import { StockData } from '@/lib/unifiedGroqService';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface UnifiedAIDemoProps {
  className?: string;
}

const UnifiedAIDemo: React.FC<UnifiedAIDemoProps> = ({ className = "" }) => {
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData] = useState<StockData>({
    symbol: 'AAPL',
    price: 175.50,
    change: 2.25,
    changePercent: 1.3,
    volume: 45000000,
    marketCap: 2.8e12,
    pe: 28.5,
    eps: 6.15
  });

  const {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
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
  } = useUnifiedAI({
    symbol,
    stockData,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 minutes
  });

  const handleSymbolChange = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd fetch new stock data here
    console.log('Analyzing', symbol);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            Unified AI Analysis Demo
            <Zap className="h-5 w-5 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <form onSubmit={handleSymbolChange} className="flex gap-2">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter symbol (e.g., AAPL)"
                className="w-32"
              />
              <Button type="submit" size="sm">
                Analyze
              </Button>
            </form>
            
            <Button 
              onClick={refresh} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>

            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              Error: {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="trades">Trades</TabsTrigger>
          <TabsTrigger value="risk">Risk</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sentiment Overview */}
            {sentiment && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Overall Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {sentiment.overall > 0 ? '+' : ''}{sentiment.overall}
                  </div>
                  <Progress value={(sentiment.overall + 100) / 2} className="mb-2" />
                  <div className="text-sm text-muted-foreground">
                    {sentiment.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Signal */}
            {technicalAnalysis && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    Technical Signal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline" 
                    className={`mb-2 ${
                      technicalAnalysis.signal === 'BUY' ? 'border-green-500 text-green-500' :
                      technicalAnalysis.signal === 'SELL' ? 'border-red-500 text-red-500' :
                      'border-yellow-500 text-yellow-500'
                    }`}
                  >
                    {technicalAnalysis.signal}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {technicalAnalysis.confidence}% confidence
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Strength: {technicalAnalysis.strength}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Forecast */}
            {priceForecast && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-500" />
                    1W Price Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(priceForecast.timeframes['1w'].price)}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatPercentage((priceForecast.timeframes['1w'].price - stockData.price) / stockData.price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {priceForecast.timeframes['1w'].confidence}% confidence
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            {riskAssessment && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    Risk Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline"
                    className={`mb-2 ${
                      riskAssessment.level === 'low' ? 'border-green-500 text-green-500' :
                      riskAssessment.level === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }`}
                  >
                    {riskAssessment.level.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    Score: {riskAssessment.score}/100
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Volatility: {riskAssessment.volatility.current.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fundamental Score */}
            {fundamentalScore && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    Fundamental Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {fundamentalScore.score}/100
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {fundamentalScore.rating}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {fundamentalScore.description}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trade Recommendation */}
            {tradeRecommendations && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    AI Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant="outline"
                    className={`mb-2 ${
                      tradeRecommendations.stock.action === 'BUY' ? 'border-green-500 text-green-500' :
                      tradeRecommendations.stock.action === 'SELL' ? 'border-red-500 text-red-500' :
                      'border-yellow-500 text-yellow-500'
                    }`}
                  >
                    {tradeRecommendations.stock.action}
                  </Badge>
                  <div className="text-sm text-muted-foreground mb-1">
                    Target: {formatCurrency(tradeRecommendations.stock.targetPrice)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tradeRecommendations.stock.confidence}% confidence
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Individual Analysis Tabs */}
        <TabsContent value="sentiment">
          <Card>
            <CardContent className="pt-6">
              {sentiment ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(sentiment, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading sentiment analysis...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical">
          <Card>
            <CardContent className="pt-6">
              {technicalAnalysis ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(technicalAnalysis, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading technical analysis...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast">
          <Card>
            <CardContent className="pt-6">
              {priceForecast ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(priceForecast, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading price forecast...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardContent className="pt-6">
              {tradeRecommendations ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(tradeRecommendations, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading trade recommendations...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardContent className="pt-6">
              {riskAssessment ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(riskAssessment, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading risk assessment...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news">
          <Card>
            <CardContent className="pt-6">
              {newsImpact ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(newsImpact, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading news impact analysis...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardContent className="pt-6">
              {tradingMetrics ? (
                <ScrollArea className="h-64">
                  <pre className="text-sm">
                    {JSON.stringify(tradingMetrics, null, 2)}
                  </pre>
                </ScrollArea>
              ) : (
                <div>Loading trading metrics...</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Stats */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">API Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Single API Call</div>
                <div className="font-medium text-green-600">✓ Unified</div>
              </div>
              <div>
                <div className="text-muted-foreground">Data Points</div>
                <div className="font-medium">14 AI Insights</div>
              </div>
              <div>
                <div className="text-muted-foreground">Cache Duration</div>
                <div className="font-medium">5 minutes</div>
              </div>
              <div>
                <div className="text-muted-foreground">Auto Refresh</div>
                <div className="font-medium text-blue-600">✓ Enabled</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedAIDemo;



