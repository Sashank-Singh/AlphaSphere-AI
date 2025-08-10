import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface Pattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  implication: string;
}

const mockPatterns: Pattern[] = [
  { name: 'Bullish Engulfing', type: 'bullish', implication: 'Potential upward reversal' },
  { name: 'Head and Shoulders', type: 'bearish', implication: 'Potential downward reversal' },
  { name: 'Doji', type: 'neutral', implication: 'Indecision, possible trend change' },
  { name: 'Cup and Handle', type: 'bullish', implication: 'Continuation of uptrend' },
  { name: 'Double Top', type: 'bearish', implication: 'Possible trend reversal downward' },
];

const getRandomPatterns = () => {
  const count = 1 + Math.floor(Math.random() * 2);
  return Array.from({ length: count }, () => mockPatterns[Math.floor(Math.random() * mockPatterns.length)]);
};

const AIPatternRecognition: React.FC<Props> = ({ symbol, stock, className }) => {
  const [patterns, setPatterns] = useState<Pattern[] | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setPatterns(getRandomPatterns());
    }, 1000);
  }, [symbol]);

  if (!patterns) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-purple-400" />
            AI Pattern Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Scanning for patterns in <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-4 w-4 text-purple-400" />
          AI Pattern Recognition
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm font-semibold">Detected Patterns:</div>
        <ul className="text-xs space-y-1">
          {patterns.map((p, i) => (
            <li key={i} className="flex items-center gap-2">
              {p.type === 'bullish' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                p.type === 'bearish' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                <AlertTriangle className="h-3 w-3 text-yellow-500" />}
              <span className="font-medium">{p.name}</span>
              <span className="text-muted-foreground ml-auto">{p.implication}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIPatternRecognition; 