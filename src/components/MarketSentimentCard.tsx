
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const MarketSentimentCard: React.FC = () => {
  const [sentiment, setSentiment] = useState({
    overall: 'Bullish',
    bullish: 65,
    neutral: 25,
    bearish: 10
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSentiment(prev => ({
        ...prev,
        bullish: Math.max(40, Math.min(80, prev.bullish + (Math.random() - 0.5) * 5)),
        neutral: Math.max(15, Math.min(35, prev.neutral + (Math.random() - 0.5) * 3)),
        bearish: Math.max(5, Math.min(25, prev.bearish + (Math.random() - 0.5) * 3))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Normalize percentages
  const total = sentiment.bullish + sentiment.neutral + sentiment.bearish;
  const normalizedSentiment = {
    bullish: Math.round((sentiment.bullish / total) * 100),
    neutral: Math.round((sentiment.neutral / total) * 100),
    bearish: Math.round((sentiment.bearish / total) * 100)
  };

  const overallSentiment = normalizedSentiment.bullish > 50 ? 'Bullish' : 
                          normalizedSentiment.bearish > 35 ? 'Bearish' : 'Neutral';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Market Sentiment
        </CardTitle>
        <p className="text-sm text-muted-foreground">Overall market mood and positioning</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Market Sentiment</span>
            <Badge 
              variant={overallSentiment === 'Bullish' ? 'default' : 
                      overallSentiment === 'Bearish' ? 'destructive' : 'secondary'}
              className="flex items-center gap-1"
            >
              {overallSentiment === 'Bullish' ? <TrendingUp className="h-3 w-3" /> :
               overallSentiment === 'Bearish' ? <TrendingDown className="h-3 w-3" /> :
               <Activity className="h-3 w-3" />}
              {overallSentiment}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-500">Bullish</span>
              <span className="font-semibold text-green-500">{normalizedSentiment.bullish}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${normalizedSentiment.bullish}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Neutral</span>
              <span className="font-semibold text-gray-500">{normalizedSentiment.neutral}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gray-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${normalizedSentiment.neutral}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-500">Bearish</span>
              <span className="font-semibold text-red-500">{normalizedSentiment.bearish}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${normalizedSentiment.bearish}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSentimentCard;
