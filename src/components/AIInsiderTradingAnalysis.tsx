import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, User, CheckCircle, XCircle } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface InsiderTrade {
  name: string;
  type: 'buy' | 'sell';
  shares: number;
  value: number;
  date: string;
}

const mockInsiderTrades = (symbol: string): InsiderTrade[] => [
  { name: 'CEO John Doe', type: 'buy', shares: 5000, value: 750000, date: '2024-05-10' },
  { name: 'CFO Jane Smith', type: 'sell', shares: 2000, value: 300000, date: '2024-05-08' },
  { name: 'Director Alex Lee', type: 'buy', shares: 1000, value: 150000, date: '2024-05-05' },
];

const calcActivityScore = (trades: InsiderTrade[]) => {
  let score = 0;
  trades.forEach(t => {
    if (t.type === 'buy') score += 1;
    if (t.type === 'sell') score -= 1;
  });
  return Math.max(0, Math.min(1, 0.5 + score * 0.2));
};

const AIInsiderTradingAnalysis: React.FC<Props> = ({ symbol, stock, className }) => {
  const [trades, setTrades] = useState<InsiderTrade[] | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTrades(mockInsiderTrades(symbol));
    }, 800);
  }, [symbol]);

  if (!trades) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-orange-400" />
            AI Insider Trading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing insider trades for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  const score = calcActivityScore(trades);
  const scoreLabel = score > 0.6 ? 'Bullish' : score < 0.4 ? 'Bearish' : 'Neutral';
  const scoreColor = score > 0.6 ? 'text-green-500' : score < 0.4 ? 'text-red-500' : 'text-yellow-500';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange-400" />
          AI Insider Trading Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">Insider Activity Score:</span> <span className={scoreColor}>{scoreLabel}</span>
        </div>
        <ul className="text-xs space-y-1">
          {trades.map((t, i) => (
            <li key={i} className="flex items-center gap-2">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{t.name}</span>
              {t.type === 'buy' ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
              <span>{t.type === 'buy' ? 'Buy' : 'Sell'}</span>
              <span className="ml-auto">{t.shares} shares (${(t.value / 1000).toFixed(1)}k)</span>
              <span className="text-muted-foreground">{t.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AIInsiderTradingAnalysis; 