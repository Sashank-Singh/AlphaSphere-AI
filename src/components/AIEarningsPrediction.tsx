import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface EarningsForecast {
  nextEarnings: string;
  predictedEPS: number;
  predictedRevenue: number;
  surpriseProb: number;
  direction: 'up' | 'down';
}

const mockEarnings = (symbol: string): EarningsForecast => {
  const now = new Date();
  const nextEarnings = new Date(now.getTime() + (Math.floor(Math.random() * 30) + 7) * 24 * 60 * 60 * 1000);
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  return {
    nextEarnings: nextEarnings.toLocaleDateString(),
    predictedEPS: 1.2 + Math.random() * 1.5,
    predictedRevenue: 10 + Math.random() * 5,
    surpriseProb: 0.5 + Math.random() * 0.4,
    direction,
  };
};

const AIEarningsPrediction: React.FC<Props> = ({ symbol, stock, className }) => {
  const [forecast, setForecast] = useState<EarningsForecast | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setForecast(mockEarnings(symbol));
    }, 900);
  }, [symbol]);

  if (!forecast) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-pink-400" />
            AI Earnings Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Predicting earnings for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-400" />
          AI Earnings Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">Next Earnings:</span> <Calendar className="inline h-3 w-3 mb-0.5" /> {forecast.nextEarnings}
        </div>
        <div className="text-xs">
          <div>Predicted EPS: <span className="font-semibold">${forecast.predictedEPS.toFixed(2)}</span></div>
          <div>Predicted Revenue: <span className="font-semibold">${forecast.predictedRevenue.toFixed(2)}B</span></div>
          <div>Surprise Probability: <span className="font-semibold">{Math.round(forecast.surpriseProb * 100)}%</span></div>
        </div>
        <div className="mt-2 text-xs">
          <span className="font-semibold">AI Forecast:</span> {forecast.direction === 'up' ? (
            <span className="text-green-500 ml-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Beat expected</span>
          ) : (
            <span className="text-red-500 ml-1 flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> Miss expected</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIEarningsPrediction; 