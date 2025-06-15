
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockStocks, refreshStockPrices } from '@/data/mockData';
import { getCompanyLogo } from '@/lib/companyLogos';
import SearchSuggestions from './SearchSuggestions';
import { Stock } from '@/types';

interface SearchFormProps {
  onSearch?: (query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Stock[]>([]);

  // Filter stocks based on search query and add logos
  const filterStocks = useCallback((query: string) => {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return mockStocks
      .filter(stock => 
        stock.symbol.toLowerCase().includes(normalizedQuery) ||
        stock.name.toLowerCase().includes(normalizedQuery)
      )
      .map(stock => ({
        ...stock,
        logo: stock.logo || getCompanyLogo(stock.symbol)
      }));
  }, []);

  // Update suggestions when search query changes
  useEffect(() => {
    const filtered = filterStocks(searchQuery);
    setSuggestions(filtered);
    setShowSuggestions(searchQuery.length > 0);
  }, [searchQuery, filterStocks]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  // Handle stock selection
  const handleStockSelect = (stock: Stock) => {
    navigate(`/stocks/${stock.symbol}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    const updatedStocks = refreshStockPrices();
    console.log('Stocks refreshed:', updatedStocks);
  };

  return (
    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
      <div className="relative flex-1 search-container">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stocks..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
        />
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleStockSelect}
          visible={showSuggestions}
        />
      </div>
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Refresh</span>
      </Button>
    </form>
  );
};

export default SearchForm;
