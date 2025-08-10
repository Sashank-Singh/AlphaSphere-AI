import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BrainCircuit, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface Financials {
  peRatio: number;
  debtEquity: number;
  roe: number;
  currentRatio: number;
  profitMargin: number;
}

const mockFinancials = (symbol: string): Financials => ({
  peRatio: 18 + Math.random() * 10,
  debtEquity: 0.5 + Math.random() * 1.2,
  roe: 10 + Math.random() * 15,
  currentRatio: 1.2 + Math.random() * 1.2,
  profitMargin: 10 + Math.random() * 15,
});

const analyzeHealth = (f: Financials) => {
  let score = 0;
  if (f.peRatio < 25) score += 1;
  if (f.debtEquity < 1) score += 1;
  if (f.roe > 15) score += 1;
  if (f.currentRatio > 1.5) score += 1;
  if (f.profitMargin > 15) score += 1;
  return score;
};

const getStrengths = (f: Financials) => {
  const s = [];
  if (f.peRatio < 25) s.push('Attractive P/E Ratio');
  if (f.debtEquity < 1) s.push('Low Debt/Equity');
  if (f.roe > 15) s.push('Strong ROE');
  if (f.currentRatio > 1.5) s.push('Healthy Liquidity');
  if (f.profitMargin > 15) s.push('High Profit Margin');
  return s;
};

const getWeaknesses = (f: Financials) => {
  const w = [];
  if (f.peRatio >= 25) w.push('High P/E Ratio');
  if (f.debtEquity >= 1) w.push('High Debt/Equity');
  if (f.roe <= 15) w.push('Low ROE');
  if (f.currentRatio <= 1.5) w.push('Low Liquidity');
  if (f.profitMargin <= 15) w.push('Low Profit Margin');
  return w;
};

const AIFinancialHealthAnalysis: React.FC<Props> = ({ symbol, stock, className }) => {
  const [financials, setFinancials] = useState<Financials | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setFinancials(mockFinancials(symbol));
    }, 800);
  }, [symbol]);

  if (!financials) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-blue-400" />
            AI Financial Health Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing financials for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  const score = analyzeHealth(financials);
  const strengths = getStrengths(financials);
  const weaknesses = getWeaknesses(financials);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-4 w-4 text-blue-400" />
          AI Financial Health Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">Health Score:</span> <span className={score >= 4 ? 'text-green-500' : score >= 2 ? 'text-yellow-500' : 'text-red-500'}>{score}/5</span>
        </div>
        <div className="mb-2 text-xs text-muted-foreground">
          <div>P/E Ratio: <span className="font-semibold">{financials.peRatio.toFixed(1)}</span></div>
          <div>Debt/Equity: <span className="font-semibold">{financials.debtEquity.toFixed(2)}</span></div>
          <div>ROE: <span className="font-semibold">{financials.roe.toFixed(1)}%</span></div>
          <div>Current Ratio: <span className="font-semibold">{financials.currentRatio.toFixed(2)}</span></div>
          <div>Profit Margin: <span className="font-semibold">{financials.profitMargin.toFixed(1)}%</span></div>
        </div>
        <div className="mb-1 text-xs">
          <span className="font-semibold">Strengths:</span>
          {strengths.length > 0 ? (
            <ul className="ml-2 mt-1">
              {strengths.map((s, i) => (
                <li key={i} className="flex items-center gap-1 text-green-500"><CheckCircle className="h-3 w-3" /> {s}</li>
              ))}
            </ul>
          ) : <span className="ml-2 text-muted-foreground">None</span>}
        </div>
        <div className="text-xs">
          <span className="font-semibold">Weaknesses:</span>
          {weaknesses.length > 0 ? (
            <ul className="ml-2 mt-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-1 text-red-500"><XCircle className="h-3 w-3" /> {w}</li>
              ))}
            </ul>
          ) : <span className="ml-2 text-muted-foreground">None</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIFinancialHealthAnalysis; 