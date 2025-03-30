
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Position, OptionContract } from '@/types';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StockPositionCardProps {
  position: Position;
}

export const StockPositionCard: React.FC<StockPositionCardProps> = ({ position }) => {
  const navigate = useNavigate();
  const currentValue = position.quantity * position.currentPrice;
  const costBasis = position.quantity * position.averagePrice;
  const gainLoss = currentValue - costBasis;
  const gainLossPercent = gainLoss / costBasis;
  const isPositive = gainLoss >= 0;
  
  return (
    <Card 
      className="overflow-hidden transition-transform duration-200 cursor-pointer hover:scale-[1.02]"
      onClick={() => navigate(`/stock/${position.ticker}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold">{position.ticker}</h3>
            <p className="text-sm text-muted-foreground">{position.quantity} shares</p>
          </div>
          
          <div className="text-right">
            <div className="font-bold">{formatCurrency(currentValue)}</div>
            <div className={cn(
              "text-sm flex items-center gap-1 justify-end",
              isPositive ? "text-green-500" : "text-red-500"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span>{formatPercentage(gainLossPercent)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface OptionPositionCardProps {
  option: OptionContract;
}

export const OptionPositionCard: React.FC<OptionPositionCardProps> = ({ option }) => {
  const navigate = useNavigate();
  
  // Calculate days until expiry
  const today = new Date();
  const expiryDate = new Date(option.expiryDate);
  const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Format expiry date
  const expiryFormatted = expiryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  const value = (option.quantity || 0) * option.premium * 100;
  
  return (
    <Card 
      className="overflow-hidden transition-transform duration-200 cursor-pointer hover:scale-[1.02]"
      onClick={() => navigate(`/stock/${option.ticker}`)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-bold flex items-center gap-1">
              {option.ticker}
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                option.type === 'call' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                {option.type.toUpperCase()}
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">
              {option.quantity} × ${option.strikePrice} 
              <span className="ml-1 text-xs">
                Exp: {expiryFormatted} ({diffDays}d)
              </span>
            </p>
          </div>
          
          <div className="text-right">
            <div className="font-bold">{formatCurrency(value)}</div>
            <div className="text-xs text-muted-foreground">
              ${option.premium} per share
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
