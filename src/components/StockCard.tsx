import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Stock } from '@/types';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
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
      navigate(`/stocks/${stock.symbol}`);
    }
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 cursor-pointer border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        showDetail && "hover:translate-y-[-2px]"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{stock.symbol}</h3>
              {showDetail && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
            </div>
            {stock.name && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {stock.name}
              </p>
            )}
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="font-bold text-lg tracking-tight">
              {formatCurrency(stock.price)}
            </div>
            <div className={cn(
              "text-sm flex items-center gap-1.5 px-2 py-0.5 rounded-full",
              isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="font-medium">{formatPercentage(stock.change)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockCard;
