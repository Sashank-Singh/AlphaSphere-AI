
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import StockCard from '@/components/StockCard';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';
import Layout from '@/components/Layout';

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Popular stock symbols to display
  const popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA'];
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll search through popular symbols
      // In a real app, you'd have a search API
      const query = searchQuery.toLowerCase();
      const matchingSymbols = popularSymbols.filter(symbol => 
        symbol.toLowerCase().includes(query)
      );
      
      if (matchingSymbols.length > 0) {
        const results = await Promise.all(
          matchingSymbols.map(symbol => stockDataService.getStockQuote(symbol))
        );
        setSearchResults(results.filter(Boolean));
      } else {
        // Try to fetch the search query as a symbol directly
        try {
          const result = await stockDataService.getStockQuote(searchQuery.toUpperCase());
          setSearchResults([result]);
        } catch {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setSearchResults([]);
  };
  

  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Search Stocks</h1>
          <p className="text-muted-foreground">Find and analyze stocks, ETFs, and market data</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbols or companies (e.g., AAPL, Apple)"
              className="pl-9 pr-9 h-12 text-lg"
            />
            
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
        
        {/* Search Results */}
        {isSearching ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Search Results for "{searchQuery}"
            </h2>
            
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-2">No results found</p>
                <p className="text-sm text-muted-foreground">Try searching with different keywords or stock symbols</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(stock => (
                  <StockCard key={stock.symbol} symbol={stock.symbol} name={stock.name} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 mr-2" />
              <h2 className="text-xl font-semibold">Popular Stocks</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {popularSymbols.map(symbol => (
                <StockCard key={symbol} symbol={symbol} />
              ))}
            </div>
            
            <Separator className="my-8" />
            
            <h2 className="text-xl font-semibold mb-4">Browse By Sector</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Industrial'].map(sector => (
                <Button
                  key={sector}
                  variant="outline"
                  className="h-16 flex flex-col justify-center hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setSearchQuery(sector);
                    setIsSearching(true);
                  }}
                >
                  <span className="font-medium">{sector}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
