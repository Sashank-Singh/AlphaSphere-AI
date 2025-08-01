
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { stockDataService } from '@/lib/stockDataService';
import { usePortfolio } from '@/context/PortfolioContext';

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

interface TopMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [topLosers, setTopLosers] = useState<TopMover[]>([]);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const { executeStockTrade } = usePortfolio();

  // Fetch top movers and losers
  useEffect(() => {
    const fetchTopMovers = async () => {
      setIsLoadingMovers(true);
      try {
        // Popular stocks for top movers/losers
        const popularStocks = [
          'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
          'JPM', 'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO',
          'CRM', 'ADBE', 'PYPL', 'NKE', 'DIS', 'V', 'MA', 'HD', 'MCD', 'KO'
        ];

        const stockData = await Promise.all(
          popularStocks.map(async (symbol) => {
            try {
              const quote = await stockDataService.getStockQuote(symbol);
              return {
                symbol: quote.symbol,
                name: quote.symbol, // In real app, this would be company name
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );

        const validStocks = stockData.filter(stock => stock !== null) as TopMover[];
        
        // Sort by percentage change
        const sortedStocks = validStocks.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        
        // Get top 5 movers (positive change)
        const movers = sortedStocks
          .filter(stock => stock.changePercent > 0)
          .slice(0, 5);
        
        // Get top 5 losers (negative change)
        const losers = sortedStocks
          .filter(stock => stock.changePercent < 0)
          .slice(0, 5);

        setTopMovers(movers);
        setTopLosers(losers);
      } catch (error) {
        console.error('Error fetching top movers:', error);
      } finally {
        setIsLoadingMovers(false);
      }
    };

    fetchTopMovers();
  }, []);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Popular stocks to search through
        const searchableStocks = [
          'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
          'JPM', 'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO'
        ];

        const filteredStocks = searchableStocks.filter(stock => 
          stock.toLowerCase().includes(query.toLowerCase())
        );

        const searchResults = await Promise.all(
          filteredStocks.slice(0, 10).map(async (symbol) => {
            try {
              const quote = await stockDataService.getStockQuote(symbol);
              return {
                symbol: quote.symbol,
                name: quote.symbol, // In real app, this would be company name
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );

        setResults(searchResults.filter(result => result !== null) as SearchResult[]);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  const handleQuickTrade = async (symbol: string, action: 'buy' | 'sell') => {
    try {
      const quote = await stockDataService.getStockQuote(symbol);
      const quantity = action === 'buy' ? 10 : 5; // Default quantities
      
      const success = await executeStockTrade(symbol, quantity, quote.price, action);
      if (success) {
        console.log(`${action} trade executed for ${symbol}`);
      }
    } catch (error) {
      console.error(`Error executing ${action} trade for ${symbol}:`, error);
    }
  };

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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    return volume.toLocaleString();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Search Results Section */}
          {query && (
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-main mb-6">
                Search Results for "{query}"
              </h1>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-card p-4 rounded-lg border border-card animate-pulse">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="h-8 w-16 bg-gray-700 rounded"></div>
                          <div className="h-4 w-32 bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex space-x-4">
                          <div className="h-4 w-20 bg-gray-700 rounded"></div>
                          <div className="h-4 w-16 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((stock) => (
                    <div key={stock.symbol} className="bg-card p-4 rounded-lg border border-card hover:border-gray-600 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-main">{stock.symbol}</h3>
                            <p className="text-sm text-secondary">{stock.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <p className="font-semibold text-main">{formatCurrency(stock.price)}</p>
                            <p className={`text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {formatPercent(stock.changePercent)}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-secondary">Volume</p>
                            <p className="text-sm text-main">{formatVolume(stock.volume)}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleQuickTrade(stock.symbol, 'buy')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Buy
                            </button>
                            <button
                              onClick={() => handleQuickTrade(stock.symbol, 'sell')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              Sell
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="icon text-6xl text-gray-600 mb-4 block">search_off</span>
                  <h3 className="text-xl font-semibold text-main mb-2">No results found</h3>
                  <p className="text-secondary">Try searching for a different stock symbol</p>
                </div>
              )}
            </div>
          )}

          {/* Top Movers and Losers Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Movers */}
            <div className="bg-card p-6 rounded-lg border border-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-main flex items-center gap-2">
                  <span className="icon text-green-500">trending_up</span>
                  Top Movers
                </h2>
                <span className="text-xs text-secondary flex items-center gap-1">
                  <span className="icon">visibility</span>
                  Live Data
                </span>
              </div>
              
              {isLoadingMovers ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-12 bg-gray-700 rounded"></div>
                        <div className="h-4 w-20 bg-gray-700 rounded"></div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="h-4 w-16 bg-gray-700 rounded"></div>
                        <div className="h-4 w-12 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topMovers.map((stock, index) => (
                    <div 
                      key={stock.symbol} 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-secondary w-6">#{index + 1}</span>
                        <div>
                          <h3 className="font-semibold text-main">{stock.symbol}</h3>
                          <p className="text-xs text-secondary">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-main">{formatCurrency(stock.price)}</p>
                        <p className="text-sm text-green-500 font-medium">
                          +{stock.change.toFixed(2)} (+{stock.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Losers */}
            <div className="bg-card p-6 rounded-lg border border-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-main flex items-center gap-2">
                  <span className="icon text-red-500">trending_down</span>
                  Top Losers
                </h2>
                <span className="text-xs text-secondary flex items-center gap-1">
                  <span className="icon">visibility</span>
                  Live Data
                </span>
              </div>
              
              {isLoadingMovers ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-12 bg-gray-700 rounded"></div>
                        <div className="h-4 w-20 bg-gray-700 rounded"></div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="h-4 w-16 bg-gray-700 rounded"></div>
                        <div className="h-4 w-12 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topLosers.map((stock, index) => (
                    <div 
                      key={stock.symbol} 
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-secondary w-6">#{index + 1}</span>
                        <div>
                          <h3 className="font-semibold text-main">{stock.symbol}</h3>
                          <p className="text-xs text-secondary">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-main">{formatCurrency(stock.price)}</p>
                        <p className="text-sm text-red-500 font-medium">
                          {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Empty State when no search query */}
          {!query && (
            <div className="text-center py-12 mt-8">
              <span className="icon text-6xl text-gray-600 mb-4 block">search</span>
              <h3 className="text-xl font-semibold text-main mb-2">Search for stocks</h3>
              <p className="text-secondary">Enter a stock symbol to get started</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
