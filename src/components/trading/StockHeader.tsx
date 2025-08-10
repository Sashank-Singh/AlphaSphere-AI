import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockHeaderProps {
  symbol: string;
  companyName: string;
  onSymbolChange: (symbol: string) => void;
  isLoading?: boolean;
}

const StockHeader: React.FC<StockHeaderProps> = ({
  symbol,
  companyName,
  onSymbolChange,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(symbol);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Common stock suggestions
  const commonStocks = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'NFLX', 'SPY', 'QQQ'];

  useEffect(() => {
    setSearchQuery(symbol);
  }, [symbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toUpperCase();
    if (trimmedQuery && trimmedQuery !== symbol) {
      onSymbolChange(trimmedQuery);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = commonStocks.filter(stock => 
        stock.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    onSymbolChange(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="flex items-center justify-between" style={{ backgroundColor: 'transparent' }}>
      <div>
        <h1 className="text-2xl font-bold text-white">{symbol}</h1>
        <p className={cn(
          "text-gray-400 text-sm transition-opacity",
          isLoading && "opacity-50"
        )}>
          {companyName}
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <form onSubmit={handleSearch} className="relative">
            <Input
              className="bg-slate-800 text-white rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 border-slate-700 text-sm"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
          <Bell className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    </header>
  );
};

export default StockHeader;
