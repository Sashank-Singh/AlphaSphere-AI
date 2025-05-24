
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Brain, AlertTriangle, Zap } from 'lucide-react';

interface SentimentData {
  overall: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  sectors: Array<{
    name: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
  }>;
  signals: Array<{
    type: 'buy' | 'sell' | 'hold';
    strength: number;
    reason: string;
  }>;
}

const AIMarketSentiment: React.FC = () => {
  const [sentiment, setSentiment] = useState<SentimentData>({
    overall: 'bullish',
    confidence: 75,
    sectors: [
      { name: 'Technology', sentiment: 'bullish', score: 85 },
      { name: 'Healthcare', sentiment: 'neutral', score: 55 },
      { name: 'Energy', sentiment: 'bearish', score: 30 },
      { name: 'Finance', sentiment: 'bullish', score: 70 }
    ],
    signals: [
      { type: 'buy', strength: 80, reason: 'Strong technical indicators' },
      { type: 'hold', strength: 60, reason: 'Market volatility detected' }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time sentiment updates
      setSentiment(prev => ({
        ...prev,
        confidence: Math.max(50, Math.min(95, prev.confidence + (Math.random() - 0.5) * 10)),
        sectors: prev.sectors.map(sector => ({
          ...sector,
          score: Math.max(20, Math.min(90, sector.score + (Math.random() - 0.5) * 15))
        }))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-green-500';
      case 'bearish': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4" />;
      case 'bearish': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Market Sentiment
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={getSentimentColor(sentiment.overall)}>
              {getSentimentIcon(sentiment.overall)}
            </span>
            <span className="font-semibold capitalize">{sentiment.overall}</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Confidence</div>
            <div className="font-bold">{sentiment.confidence}%</div>
          </div>
        </div>

        <Progress value={sentiment.confidence} className="h-2" />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Sector Analysis</h4>
          {sentiment.sectors.map((sector) => (
            <div key={sector.name} className="flex items-center justify-between">
              <span className="text-sm">{sector.name}</span>
              <div className="flex items-center gap-2">
                <Progress value={sector.score} className="w-16 h-1" />
                <span className={`text-xs ${getSentimentColor(sector.sentiment)}`}>
                  {sector.score}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">AI Signals</h4>
          {sentiment.signals.map((signal, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <Badge variant={signal.type === 'buy' ? 'default' : signal.type === 'sell' ? 'destructive' : 'secondary'}>
                {signal.type.toUpperCase()}
              </Badge>
              <span className="text-xs flex-1">{signal.reason}</span>
              <span className="text-xs font-semibold">{signal.strength}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMarketSentiment;
