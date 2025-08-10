import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BrainCircuit, Sparkles, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle, Target, DollarSign, Zap } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useAITradeRecommendations } from '@/hooks/useUnifiedAI';
import { StockData } from '@/lib/unifiedGroqService';

interface AITradeAdvisorProps {
  symbol: string;
  stockData: StockData;
  onExecuteTrade?: (recommendation: any) => void;
}

const AITradeAdvisor: React.FC<AITradeAdvisorProps> = ({ 
  symbol, 
  stockData, 
  onExecuteTrade 
}) => {
  const { tradeRecommendations, isLoading, error } = useAITradeRecommendations(symbol, stockData);

  // Helper functions
  const getSignalColor = (signal: string) => {
    switch (signal.toUpperCase()) {
      case 'BUY': return 'text-green-600 bg-green-50';
      case 'SELL': return 'text-red-600 bg-red-50';
      case 'HOLD': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal.toUpperCase()) {
      case 'BUY': return <TrendingUp className="h-4 w-4" />;
      case 'SELL': return <TrendingDown className="h-4 w-4" />;
      case 'HOLD': return <Minus className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" />
          AI Trade Advisor
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardTitle>
        <CardDescription>
          Real-time AI-powered trading recommendations for {symbol}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex items-center justify-center p-4 text-red-500">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Error loading recommendations</span>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Generating AI trading recommendations...
              </span>
            </div>
            <div className="space-y-3">
              <div className="h-20 bg-muted rounded-lg animate-pulse" />
              <div className="h-16 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        ) : tradeRecommendations ? (
          <Tabs defaultValue="stock" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stock">Stock Trade</TabsTrigger>
              <TabsTrigger value="options">Options Strategy</TabsTrigger>
            </TabsList>

            {/* Stock Recommendation */}
            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getSignalColor(tradeRecommendations.stock.action)}>
                      {getSignalIcon(tradeRecommendations.stock.action)}
                      {tradeRecommendations.stock.action}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {tradeRecommendations.stock.timeframe}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getConfidenceColor(tradeRecommendations.stock.confidence)}`}>
                      {tradeRecommendations.stock.confidence}% Confidence
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                    <div className="font-semibold">{formatCurrency(stockData.price)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Target Price</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(tradeRecommendations.stock.targetPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                    <div className="font-semibold text-red-600">
                      {formatCurrency(tradeRecommendations.stock.stopLoss)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Potential Return</div>
                    <div className="font-semibold">
                      {formatPercentage((tradeRecommendations.stock.targetPrice - stockData.price) / stockData.price)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs font-medium text-muted-foreground">AI Reasoning</div>
                  <div className="text-sm bg-muted p-3 rounded">
                    {tradeRecommendations.stock.reasoning}
                  </div>
                </div>

                {onExecuteTrade && (
                  <Button 
                    onClick={() => onExecuteTrade(tradeRecommendations.stock)}
                    className="w-full"
                    variant={tradeRecommendations.stock.action === 'BUY' ? 'default' : 'outline'}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Execute {tradeRecommendations.stock.action} Order
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Options Recommendation */}
            <TabsContent value="options" className="space-y-4 mt-4">
              {tradeRecommendations.options ? (
                <div className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{tradeRecommendations.options.strategy}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Max Risk</div>
                      <div className="font-semibold text-red-600">
                        {formatCurrency(tradeRecommendations.options.maxRisk)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Max Profit</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(tradeRecommendations.options.maxProfit)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-muted-foreground">Contracts</div>
                    {tradeRecommendations.options.contracts.map((contract, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                        <span>
                          {contract.action.toUpperCase()} {contract.type.toUpperCase()} ${contract.strike}
                        </span>
                        <span className="text-muted-foreground">{contract.expiry}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-muted-foreground">Strategy Reasoning</div>
                    <div className="text-sm bg-muted p-3 rounded">
                      {tradeRecommendations.options.reasoning}
                    </div>
                  </div>

                  {onExecuteTrade && (
                    <Button 
                      onClick={() => onExecuteTrade(tradeRecommendations.options)}
                      className="w-full"
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Execute Options Strategy
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div>No options strategy recommended</div>
                  <div className="text-xs mt-1">Focus on stock position for now</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No recommendations available
          </div>
        )}

        {/* AI Attribution */}
        <div className="pt-4 mt-4 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Powered by Meta Llama via Groq</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live AI Analysis</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITradeAdvisor;