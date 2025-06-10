import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface Fundamentals {
  growth: number;
  profitability: number;
  value: number;
}

const mockFundamentals = (symbol: string): Fundamentals => ({
  growth: 0.6 + Math.random() * 0.4,
  profitability: 0.5 + Math.random() * 0.5,
  value: 0.4 + Math.random() * 0.6,
});

const calcScore = (f: Fundamentals) => Math.round((f.growth * 0.4 + f.profitability * 0.4 + f.value * 0.2) * 100);

const AIFundamentalScore: React.FC<Props> = ({ symbol, stock, className }) => {
  const [fundamentals, setFundamentals] = useState<Fundamentals | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setFundamentals(mockFundamentals(symbol));
    }, 700);
  }, [symbol]);

  if (!fundamentals) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-green-400" />
            AI Fundamental Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing fundamentals for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  const score = calcScore(fundamentals);
  const scoreColor = score > 70 ? 'text-green-500' : score > 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-green-400" />
          AI Fundamental Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">Fundamental Score:</span> <span className={scoreColor}>{score}/100</span>
        </div>
        <div className="text-xs">
          <div>Growth: <span className="font-semibold">{Math.round(fundamentals.growth * 100)}%</span></div>
          <div>Profitability: <span className="font-semibold">{Math.round(fundamentals.profitability * 100)}%</span></div>
          <div>Value: <span className="font-semibold">{Math.round(fundamentals.value * 100)}%</span></div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {score > 70 ? <span><TrendingUp className="h-3 w-3 inline text-green-500" /> Strong fundamentals</span> :
            score > 50 ? <span>Average fundamentals</span> :
            <span><TrendingDown className="h-3 w-3 inline text-red-500" /> Weak fundamentals</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFundamentalScore; 