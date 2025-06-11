import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'; // Added Loader2
import { Stock } from '@/types';
import { getFinnhubQuote } from '../../lib/finnhubApi';

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
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(true);
  const [priceFetchError, setPriceFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;

      setIsLoadingPrice(true);
      setPriceFetchError(null);
      try {
        const quote = await getFinnhubQuote(symbol);
        if (quote && quote.c) {
          setCurrentPrice(quote.c);
          // TODO: Integrate currentPrice into the 'value' score calculation or other fundamental aspects.
          // For now, it's just fetched and available.
        } else {
          setPriceFetchError('Finnhub quote unavailable.');
          setCurrentPrice(null);
        }
      } catch (error) {
        console.error("Error fetching Finnhub quote for AIFundamentalScore:", error);
        setPriceFetchError('Failed to fetch current price.');
        setCurrentPrice(null);
      } finally {
        setIsLoadingPrice(false);
      }

      // Set fundamentals (mocked) - this can happen regardless of price fetch success
      setFundamentals(mockFundamentals(symbol));
    };

    fetchData();
    // Original setTimeout for mockFundamentals is removed as it's set after price fetch attempt.
  }, [symbol]);

  if (isLoadingPrice && !fundamentals) { // Show loading if price is loading and fundamentals not yet set
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-green-400" />
            AI Fundamental Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading fundamental data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fundamentals) { // Fallback if fundamentals are still null
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
        <div className="text-xs space-y-0.5">
          <div>Growth: <span className="font-semibold">{Math.round(fundamentals.growth * 100)}%</span></div>
          <div>Profitability: <span className="font-semibold">{Math.round(fundamentals.profitability * 100)}%</span></div>
          <div>Value: <span className="font-semibold">{Math.round(fundamentals.value * 100)}%</span>
            {/* TODO: Indicate if 'Value' score considers live price */}
          </div>
          {isLoadingPrice && (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin mr-1" /> Fetching live price...
            </div>
          )}
          {priceFetchError && !isLoadingPrice && (
            <div className="text-red-500">Price: {priceFetchError}</div>
          )}
          {currentPrice && !isLoadingPrice && (
            <div className="text-blue-500">Live Price: <span className="font-semibold">${currentPrice.toFixed(2)}</span></div>
          )}
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