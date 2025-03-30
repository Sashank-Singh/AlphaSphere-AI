
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import StockCard from '@/components/StockCard';
import { mockStocks } from '@/data/mockData';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(!!searchQuery);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };
  
  // Filter stocks based on search query
  const filteredStocks = mockStocks.filter(stock => {
    if (!searchQuery) return false;
    
    const query = searchQuery.toLowerCase();
    return (
      stock.ticker.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    );
  });
  
  // Popular/trending stocks for when no search is active
  const trendingStocks = mockStocks.slice(0, 6);
  
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <form onSubmit={handleSearch} className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickers or companies"
            className="pl-9 pr-9"
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </form>
      </div>
      
      {/* Search Results */}
      {isSearching ? (
        <div className="px-4">
          <h2 className="text-lg font-medium mb-3">Search Results</h2>
          
          {filteredStocks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredStocks.map(stock => (
                <StockCard key={stock.id} stock={stock} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="px-4">
          <div className="flex items-center mb-3">
            <TrendingUp className="h-5 w-5 mr-2" />
            <h2 className="text-lg font-medium">Popular Stocks</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {trendingStocks.map(stock => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </div>
          
          <Separator className="my-6" />
          
          <h2 className="text-lg font-medium mb-3">Browse By Sector</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial'].map(sector => (
              <Button
                key={sector}
                variant="outline"
                className="h-16 flex flex-col justify-center"
                onClick={() => setSearchQuery(sector)}
              >
                <span>{sector}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
