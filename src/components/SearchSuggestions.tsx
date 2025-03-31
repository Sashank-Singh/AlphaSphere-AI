import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SearchSuggestionsProps {
  suggestions: Stock[];
  onSelect: (stock: Stock) => void;
  visible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  visible
}) => {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[400px] overflow-y-auto">
      {suggestions.map((stock) => (
        <button
          key={stock.symbol}
          className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted/50 transition-colors"
          onClick={() => onSelect(stock)}
        >
          <div className="w-8 h-8 flex-shrink-0">
            <img
              src={stock.logo}
              alt={`${stock.name} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://companieslogo.com/img/orig/STOCK-96087f37.png?t=1648063409';
              }}
            />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">{stock.symbol}</span>
              <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {stock.change >= 0 ? '+' : ''}{stock.change}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{stock.name}</span>
              <span>{formatCurrency(stock.price)}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions; 