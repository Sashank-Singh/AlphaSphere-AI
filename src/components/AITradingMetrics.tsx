import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, TrendingUp, TrendingDown, BarChart2, Target } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock } from '@/types';

interface AITradingMetricsProps {
  stock: Stock;
  onStrategySelect: (strategy: string) => void;
}

interface SentimentData {
  score: number;
  news: number;
  social: number;
}

interface StrategyPerformance {
  name: string;
  returns: number;
  sharpe: number;
  maxDrawdown: number;
}

const AITradingMetrics: React.FC<AITradingMetricsProps> = ({
  stock,
  onStrategySelect,
}) => {
  // Mock data for demonstration
  const sentiment: SentimentData = {
    score: 0.75,
    news: 0.8,
    social: 0.7,
  };

  const strategies: StrategyPerformance[] = [
    {
      name: 'Momentum',
      returns: 0.15,
      sharpe: 1.2,
      maxDrawdown: -0.08,
    },
    {
      name: 'Mean Reversion',
      returns: 0.12,
      sharpe: 1.5,
      maxDrawdown: -0.05,
    },
    {
      name: 'Machine Learning',
      returns: 0.18,
      sharpe: 1.8,
      maxDrawdown: -0.10,
    },
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BrainCircuit className="h-5 w-5" />
          <h3 className="text-sm font-medium">AI Trading Analysis</h3>
        </div>

        {/* Sentiment Analysis */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Market Sentiment</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Sentiment</span>
                <span className={cn(
                  "font-medium",
                  sentiment.score >= 0.5 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPercentage(sentiment.score)}
                </span>
              </div>
              <Progress value={sentiment.score * 100} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">News Sentiment:</span>
                <span className={cn(
                  "ml-1",
                  sentiment.news >= 0.5 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPercentage(sentiment.news)}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Social Sentiment:</span>
                <span className={cn(
                  "ml-1",
                  sentiment.social >= 0.5 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPercentage(sentiment.social)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Strategies */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Trading Strategies</h4>
          <div className="space-y-2">
            {strategies.map(strategy => (
              <div
                key={strategy.name}
                className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 cursor-pointer"
                onClick={() => onStrategySelect(strategy.name)}
              >
                <div>
                  <div className="font-medium">{strategy.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Sharpe: {strategy.sharpe.toFixed(2)} | Max Drawdown: {formatPercentage(strategy.maxDrawdown)}
                  </div>
                </div>
                <div className={cn(
                  "text-sm font-medium",
                  strategy.returns >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPercentage(strategy.returns)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Confidence Score */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Confidence Score</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress value={85} className="h-2" />
            </div>
            <div className="text-sm font-medium text-green-500">85%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITradingMetrics; 