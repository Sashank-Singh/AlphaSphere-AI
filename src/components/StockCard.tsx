import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';
import { useNavigate } from 'react-router-dom';

interface StockCardProps {
  symbol: string;
  name?: string;
  onClick?: () => void;
  refreshInterval?: number;
}

const StockCard: React.FC<StockCardProps> = ({ 
  symbol, 
  name, 
  onClick, 
  refreshInterval = 30000 
}) => {
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const data = await stockDataService.getStockQuote(symbol);
        setStock(data);
        setIsLoading(false);
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        setIsLoading(false);
      }
    };

    fetchStockData();
    
    // Set up refresh interval
    const interval = setInterval(fetchStockData, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, refreshInterval]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/stocks/${symbol}`);
    }
  };

  if (isLoading) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow animate-pulse">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="h-5 bg-muted rounded w-16 mb-1"></div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stock) {
    return (
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{symbol}</CardTitle>
          <p className="text-sm text-muted-foreground">{name || `${symbol} Inc.`}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load data</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{stock.symbol}</CardTitle>
            <p className="text-sm text-muted-foreground">{name || stock.name || `${stock.symbol} Inc.`}</p>
          </div>
          <Badge variant={stock.changePercent >= 0 ? 'default' : 'destructive'}>
            {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="font-semibold">${stock.price.toFixed(2)}</span>
          <span className={`text-sm ${
            stock.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;
