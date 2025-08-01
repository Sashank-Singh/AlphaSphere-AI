
import React from 'react';
import { stockDataService } from '@/lib/stockDataService';

interface SearchSuggestion {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (symbol: string) => void;
  onViewAllClick: (query: string) => void;
  isLoading: boolean;
  suggestions: SearchSuggestion[];
  selectedIndex?: number;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  query,
  onSuggestionClick,
  onViewAllClick,
  isLoading,
  suggestions,
  selectedIndex = -1
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-card rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-secondary mt-2">Searching...</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0 && query.trim()) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-card rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <span className="icon text-2xl text-gray-600 mb-2 block">search_off</span>
          <p className="text-sm text-secondary">No stocks found</p>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-card rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
      <div className="py-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.symbol}
            className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between group ${
              index === selectedIndex 
                ? 'bg-gray-700/70 border-l-2 border-primary' 
                : 'hover:bg-gray-700/50'
            }`}
            onClick={() => onSuggestionClick(suggestion.symbol)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                index === selectedIndex 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-700 group-hover:bg-gray-600'
              }`}>
                <span className="text-xs font-semibold">
                  {suggestion.symbol.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-main">{suggestion.symbol}</p>
                <p className="text-sm text-secondary">{suggestion.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-main">{formatCurrency(suggestion.price)}</p>
              <p className={`text-sm ${suggestion.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(suggestion.changePercent)}
              </p>
            </div>
          </button>
        ))}
        
        <div className="border-t border-card mt-2 pt-2">
          <button
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center ${
              selectedIndex === suggestions.length 
                ? 'text-main bg-gray-700/50' 
                : 'text-secondary hover:text-main'
            }`}
            onClick={() => onViewAllClick(query)}
          >
            <span className="icon text-sm mr-2">search</span>
            View all results for "{query}"
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSuggestions;
