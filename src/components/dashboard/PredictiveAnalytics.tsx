import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';

interface PredictionData {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  timeframe: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  riskLevel: 'low' | 'medium' | 'high';
}

const PredictiveAnalytics: React.FC = memo(() => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');

  const timeframes = ['1D', '1W', '1M', '3M'];

  const fetchPredictions = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate AI predictions - in real app, this would call your AI service
      const symbols = ['AAPL', 'TSLA', 'NVDA'];
      const mockPredictions: PredictionData[] = symbols.map(symbol => {
        const currentPrice = Math.random() * 200 + 100;
        const change = (Math.random() - 0.5) * 0.2; // ±10% change
        const predictedPrice = currentPrice * (1 + change);
        const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
        
        return {
          symbol,
          currentPrice,
          predictedPrice,
          confidence,
          timeframe: selectedTimeframe,
          trend: change > 0.05 ? 'bullish' : change < -0.05 ? 'bearish' : 'neutral',
          riskLevel: confidence > 0.8 ? 'low' : confidence > 0.7 ? 'medium' : 'high'
        };
      });
      
      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTimeframe]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercentage = (current: number, predicted: number) => {
    const change = ((predicted - current) / current) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'bullish': return 'sentiment-bullish';
      case 'bearish': return 'sentiment-bearish';
      default: return 'sentiment-neutral';
    }
  };

  const getRiskClass = (risk: string) => {
    switch (risk) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      default: return 'risk-high';
    }
  };

  if (loading) {
    return (
      <Card className="h-full enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-card border border-border rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Predictions
          <Badge variant="secondary" className="ml-auto">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="interactive-element"
            >
              {timeframe}
            </Button>
          ))}
        </div>

        {/* Predictions */}
        <div className="space-y-3">
          {predictions.map((prediction, index) => {
            const changePercent = formatPercentage(prediction.currentPrice, prediction.predictedPrice);
            const isPositive = prediction.predictedPrice > prediction.currentPrice;
            return (
              <div 
                key={prediction.symbol} 
                className="p-3 rounded-lg border bg-background"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{prediction.symbol}</span>
                    {getTrendIcon(prediction.trend)}
                  </div>
                  <Badge className={getRiskClass(prediction.riskLevel)}>
                    {prediction.riskLevel} risk
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-medium text-primary">{formatPrice(prediction.currentPrice)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Predicted</p>
                    <p className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPrice(prediction.predictedPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {changePercent}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(prediction.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Predictions are AI-generated and should not be used as sole investment advice
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

PredictiveAnalytics.displayName = 'PredictiveAnalytics';

export default PredictiveAnalytics;