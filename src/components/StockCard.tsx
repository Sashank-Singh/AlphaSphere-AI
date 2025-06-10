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
    <div
      className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-sm p-3 sm:p-4 flex flex-col items-start min-w-[140px] max-w-full transition-colors duration-200 cursor-pointer select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:bg-gray-700/80"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${stock.symbol}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="font-bold text-base sm:text-lg mb-1">{stock.symbol}</div>
      <div className="text-xs sm:text-sm text-gray-400 truncate mb-2">{stock.name}</div>
      {showDetail && (
        <div className="flex flex-col gap-1 w-full">
          <div className="flex justify-between w-full text-xs">
            <span>Price:</span>
            <span className="font-semibold">${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between w-full text-xs">
            <span>Change:</span>
            <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockCard;
