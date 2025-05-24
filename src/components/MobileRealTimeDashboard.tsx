
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wifi, DollarSign } from 'lucide-react';
import { useRealTimeStock } from '@/hooks/useRealTimeStock';

interface MobileRealTimeDashboardProps {
  symbols: string[];
}

const MobileRealTimeDashboard: React.FC<MobileRealTimeDashboardProps> = ({ symbols }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live Prices</h3>
        <Badge variant="secondary" className="gap-1">
          <Wifi className="h-3 w-3" />
          Live
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        {symbols.map((symbol) => (
          <StockTicker key={symbol} symbol={symbol} />
        ))}
      </div>
    </div>
  );
};

const StockTicker: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { data, isLoading } = useRealTimeStock(symbol, 3000);

  if (isLoading || !data) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-muted rounded w-16"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <Card className={`transition-all duration-300 ${isPositive ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{data.symbol}</span>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
          </div>
          
          <div className="text-right">
            <div className="font-bold">${data.price.toFixed(2)}</div>
            <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <DollarSign className="h-2 w-2" />
              {isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(1)}%)
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-2 pt-2 border-t">
          <span>Vol: {(data.volume / 1000000).toFixed(1)}M</span>
          <span>H: ${data.high.toFixed(2)}</span>
          <span>L: ${data.low.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileRealTimeDashboard;
