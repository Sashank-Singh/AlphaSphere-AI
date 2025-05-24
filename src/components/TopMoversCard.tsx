
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Stock {
  symbol: string;
  price: number;
  change: number;
}

const TopMoversCard: React.FC = () => {
  const [gainers, setGainers] = useState<Stock[]>([
    { symbol: 'NVDA', price: 480.65, change: 8.33 },
    { symbol: 'MSFT', price: 340.81, change: 5.28 },
    { symbol: 'AAPL', price: 176.25, change: 4.72 },
    { symbol: 'V', price: 254.18, change: 3.35 },
    { symbol: 'META', price: 325.40, change: 2.60 }
  ]);

  const [losers, setLosers] = useState<Stock[]>([
    { symbol: 'TSLA', price: 238.15, change: -4.94 },
    { symbol: 'GOOGL', price: 132.18, change: -2.50 },
    { symbol: 'AMZN', price: 144.08, change: -1.80 },
    { symbol: 'JPM', price: 146.71, change: -1.23 },
    { symbol: 'NFLX', price: 425.40, change: -0.95 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGainers(prev => prev.map(stock => ({
        ...stock,
        price: stock.price * (1 + (Math.random() - 0.3) * 0.02),
        change: stock.change + (Math.random() - 0.5) * 0.3
      })));

      setLosers(prev => prev.map(stock => ({
        ...stock,
        price: stock.price * (1 + (Math.random() - 0.7) * 0.02),
        change: stock.change + (Math.random() - 0.5) * 0.3
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const StockList: React.FC<{ stocks: Stock[], isGainers: boolean }> = ({ stocks, isGainers }) => (
    <div className="space-y-2">
      {stocks.map((stock, index) => (
        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
          <div>
            <div className="font-semibold">{stock.symbol}</div>
            <div className="text-sm text-muted-foreground">
              ${stock.price.toFixed(2)}
            </div>
          </div>
          <Badge 
            variant={isGainers ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {isGainers ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isGainers ? '+' : ''}{stock.change.toFixed(2)}%
          </Badge>
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Movers</CardTitle>
        <p className="text-sm text-muted-foreground">Today's biggest winners and losers</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="gainers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="gainers" className="mt-4">
            <StockList stocks={gainers} isGainers={true} />
          </TabsContent>
          <TabsContent value="losers" className="mt-4">
            <StockList stocks={losers} isGainers={false} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TopMoversCard;
