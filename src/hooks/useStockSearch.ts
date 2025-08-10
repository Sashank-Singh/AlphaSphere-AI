import { useState, useEffect, useCallback } from 'react';

interface StockSuggestion {
  symbol: string;
  name: string;
  exchange: string;
}

export const useStockSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Common stock suggestions for demo
  const commonStocks: StockSuggestion[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE' },
    { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE' }
  ];

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = commonStocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(filtered);
      setShowSuggestions(true);
      setIsLoading(false);
    }, 300),
    []
  );

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsLoading(true);
    debouncedSearch(query);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: StockSuggestion) => {
    setSearchQuery(suggestion.symbol);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return {
    searchQuery,
    suggestions,
    isLoading,
    showSuggestions,
    handleSearchChange,
    handleSuggestionSelect,
    clearSearch,
    setShowSuggestions
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
