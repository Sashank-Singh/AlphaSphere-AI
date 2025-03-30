
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stock } from '@/types';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StockCardProps {
  stock: Stock;
  showDetail?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, showDetail = true }) => {
  const navigate = useNavigate();
  const isPositive = stock.change >= 0;
  
  const handleClick = () => {
    if (showDetail) {
      navigate(`/stock/${stock.ticker}`);
    }
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-transform duration-200 cursor-pointer", 
        showDetail && "hover:scale-[1.02]"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold">{stock.ticker}</h3>
            {stock.name && <p className="text-sm text-muted-foreground truncate">{stock.name}</p>}
          </div>
          
          <div className="text-right">
            <div className="font-bold">{formatCurrency(stock.price)}</div>
            <div className={cn(
              "text-sm flex items-center gap-1 justify-end",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercentage(stock.change)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;
