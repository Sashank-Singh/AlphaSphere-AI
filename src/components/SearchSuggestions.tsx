
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';
import { useNavigate } from 'react-router-dom';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (symbol: string) => void;
}



const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ query, onSelect }) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' }
  ];

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 0) {
        setIsLoading(true);
        try {
          const filtered = popularStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
            stock.name.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5);
          
          const stockPromises = filtered.map(stock => 
            stockDataService.getStockQuote(stock.symbol).catch(err => {
              console.error(`Error fetching ${stock.symbol}:`, err);
              return null;
            })
          );
          
          const stockData = await Promise.all(stockPromises);
          const validStocks = stockData.filter((stock): stock is StockQuote => stock !== null);
          setSuggestions(validStocks);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-[300px] overflow-y-auto">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-3">
            <div className="flex items-center space-x-3 animate-pulse">
              <div className="h-4 w-4 bg-muted rounded"></div>
              <div>
                <div className="h-4 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
            </div>
          </div>
        ) : (
          suggestions.map((stock) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
              onClick={() => {
                onSelect(stock.symbol);
                navigate(`/stocks/${stock.symbol}`);
              }}
            >
              <div className="flex items-center space-x-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-semibold">{stock.symbol}</div>
                  <div className="text-sm text-muted-foreground">{stock.name || `${stock.symbol} Inc.`}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="font-semibold">${stock.price.toFixed(2)}</div>
                  <div className={`text-sm flex items-center ${
                    stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SearchSuggestions;
