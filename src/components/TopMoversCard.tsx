import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';

interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const TopMoversCard: React.FC = () => {
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const popularSymbols = ['NVDA', 'MSFT', 'AAPL', 'V', 'META', 'TSLA', 'GOOGL', 'AMZN', 'JPM', 'NFLX'];

  const fetchRealTimeData = async () => {
    try {
      const stockPromises = popularSymbols.map(symbol => 
        stockDataService.getStockQuote(symbol).catch(err => {
          console.error(`Error fetching ${symbol}:`, err);
          return null;
        })
      );
      
      const stockData = await Promise.all(stockPromises);
      const validStocks = stockData.filter((stock): stock is StockQuote => stock !== null);
      
      // Sort by change percentage and split into gainers/losers
      const sortedStocks = validStocks.map(stock => ({
        symbol: stock.symbol,
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent
      })).sort((a, b) => b.changePercent - a.changePercent);
      
      const topGainers = sortedStocks.filter(stock => stock.changePercent > 0).slice(0, 5);
      const topLosers = sortedStocks.filter(stock => stock.changePercent < 0).slice(-5).reverse();
      
      setGainers(topGainers);
      setLosers(topLosers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching top movers:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const StockList: React.FC<{ stocks: Stock[], isGainers: boolean }> = ({ stocks, isGainers }) => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg animate-pulse">
              <div>
                <div className="h-4 bg-muted rounded w-12 mb-1"></div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {stocks.map((stock, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/stocks/${stock.symbol}`)}
          >
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
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Badge>
          </div>
        ))}
      </div>
    );
  };

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
