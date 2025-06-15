
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface SearchSuggestionsProps {
  suggestions: Stock[];
  onSelect: (stock: Stock) => void;
  visible: boolean;
}

const getCompanyLogo = (symbol: string): string => {
  const logoMap: { [key: string]: string } = {
    'AAPL': 'https://companieslogo.com/img/orig/AAPL-e033b5b2.png',
    'MSFT': 'https://companieslogo.com/img/orig/MSFT-e8c5e9b1.png',
    'GOOGL': 'https://companieslogo.com/img/orig/GOOGL-e8b6d1bd.png',
    'AMZN': 'https://companieslogo.com/img/orig/AMZN-e9b42c25.png',
    'TSLA': 'https://companieslogo.com/img/orig/TSLA-b8a7e4a8.png',
    'META': 'https://companieslogo.com/img/orig/META-b5a44e2b.png',
    'NVDA': 'https://companieslogo.com/img/orig/NVDA-02f9b5d7.png',
    'NFLX': 'https://companieslogo.com/img/orig/NFLX-b5b7c8c1.png',
    'CRM': 'https://companieslogo.com/img/orig/CRM-0d7e0a7c.png',
    'ORCL': 'https://companieslogo.com/img/orig/ORCL-d5b3b8d2.png',
    'INTC': 'https://companieslogo.com/img/orig/INTC-c0b3b2d1.png',
    'AMD': 'https://companieslogo.com/img/orig/AMD-c3a2b1d0.png',
    'IBM': 'https://companieslogo.com/img/orig/IBM-c1a2b3d4.png',
    'SPY': 'https://companieslogo.com/img/orig/SPY-e2b3c1d0.png',
    'QQQ': 'https://companieslogo.com/img/orig/QQQ-f1a2b3c4.png'
  };
  
  return logoMap[symbol] || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`;
};

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
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/30 last:border-b-0"
          onClick={() => onSelect(stock)}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-white rounded-lg p-1 border border-border/20">
            <img
              src={stock.logo || getCompanyLogo(stock.symbol)}
              alt={`${stock.name} logo`}
              className="w-full h-full object-contain"
              onError={(e) => {
                const fallbackLogo = getCompanyLogo(stock.symbol);
                if ((e.target as HTMLImageElement).src !== fallbackLogo) {
                  (e.target as HTMLImageElement).src = fallbackLogo;
                } else {
                  (e.target as HTMLImageElement).src = 'https://companieslogo.com/img/orig/STOCK-96087f37.png?t=1648063409';
                }
              }}
            />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">{stock.symbol}</span>
              <span className={`font-medium text-sm ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate mr-2">{stock.name}</span>
              <span className="text-sm font-medium text-foreground">{formatCurrency(stock.price)}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
