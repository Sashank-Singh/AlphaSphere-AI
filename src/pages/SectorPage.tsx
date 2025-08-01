import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { stockDataService } from '@/lib/stockDataService';
import { usePortfolio } from '@/context/PortfolioContext';

interface SectorStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

const SectorPage: React.FC = () => {
  const { sectorName } = useParams<{ sectorName: string }>();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<SectorStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { executeStockTrade } = usePortfolio();

  // Sector definitions with representative stocks
  const sectorStocks: { [key: string]: string[] } = {
    'technology': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC', 'CRM', 'ADBE'],
    'healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO', 'DHR', 'ABT', 'LLY', 'BMY', 'AMGN', 'GILD', 'REGN'],
    'consumer-disc': ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TJX', 'LOW', 'TGT', 'COST', 'WMT', 'BKNG'],
    'energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'VLO', 'PSX', 'MPC', 'KMI', 'OKE', 'WMB', 'EOG'],
    'industrials': ['BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'RTX', 'LMT', 'DE', 'UNP', 'NSC', 'FDX'],
    'materials': ['LIN', 'APD', 'FCX', 'NEM', 'DOW', 'DD', 'NUE', 'BLL', 'ECL', 'ALB', 'BLL', 'NEM'],
    'comms': ['META', 'GOOGL', 'NFLX', 'CMCSA', 'CHTR', 'TMUS', 'VZ', 'T', 'DIS', 'CMCSA', 'CHTR', 'TMUS'],
    'real-estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'DLR', 'PSA', 'O', 'SPG', 'WELL', 'PLD', 'CCI', 'EQIX'],
    'finance': ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'AXP', 'USB', 'PNC', 'TFC', 'COF'],
    'staples': ['PG', 'KO', 'PEP', 'WMT', 'COST', 'PM', 'MO', 'CL', 'KMB', 'GIS', 'HSY', 'SJM'],
    'utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'XEL', 'SRE', 'DTE', 'AEE', 'ED', 'EIX', 'PEG']
  };

  useEffect(() => {
    const fetchSectorStocks = async () => {
      if (!sectorName) return;

      try {
        setIsLoading(true);
        const stockSymbols = sectorStocks[sectorName] || [];
        
        const stockData = await Promise.all(
          stockSymbols.map(async (symbol) => {
            try {
              const quote = await stockDataService.getStockQuote(symbol);
              return {
                symbol: quote.symbol,
                name: quote.symbol, // In real app, this would be company name
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent,
                volume: quote.volume,
                marketCap: quote.price * quote.volume // Simplified market cap calculation
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );

        const validStocks = stockData.filter(stock => stock !== null) as SectorStock[];
        setStocks(validStocks);
      } catch (error) {
        console.error('Error fetching sector stocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSectorStocks();
  }, [sectorName]);

  const handleQuickTrade = async (symbol: string, action: 'buy' | 'sell') => {
    try {
      const quote = await stockDataService.getStockQuote(symbol);
      const quantity = action === 'buy' ? 10 : 5;
      
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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000000) {
      return `$${(marketCap / 1000000000000).toFixed(1)}T`;
    } else if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    return formatCurrency(marketCap);
  };

  const getSectorDisplayName = (sectorSlug: string) => {
    const displayNames: { [key: string]: string } = {
      'technology': 'Technology',
      'healthcare': 'Healthcare',
      'consumer-disc': 'Consumer Discretionary',
      'energy': 'Energy',
      'industrials': 'Industrials',
      'materials': 'Materials',
      'comms': 'Communications',
      'real-estate': 'Real Estate',
      'finance': 'Financial',
      'staples': 'Consumer Staples',
      'utilities': 'Utilities'
    };
    return displayNames[sectorSlug] || sectorSlug;
  };

  return (
    <Layout>
      <div className="p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-main mb-2">
              {getSectorDisplayName(sectorName || '')} Sector
            </h1>
            <p className="text-sm sm:text-base text-secondary">
              Explore stocks in the {getSectorDisplayName(sectorName || '')} sector
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card p-3 sm:p-4 rounded-lg border border-card animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="h-8 w-16 bg-gray-700 rounded"></div>
                      <div className="h-4 w-32 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex space-x-2 sm:space-x-4">
                      <div className="h-4 w-20 bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {stocks.map((stock) => (
                <div key={stock.symbol} className="bg-card p-3 sm:p-4 rounded-lg border border-card hover:border-gray-600 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                    <div 
                      className="flex items-center space-x-3 sm:space-x-4 cursor-pointer hover:bg-gray-700/20 p-2 rounded-lg transition-colors"
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                      title={`Click to view ${stock.symbol} details`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs sm:text-sm font-semibold text-main">
                          {stock.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-main hover:text-blue-400 transition-colors">{stock.symbol}</h3>
                        <p className="text-xs sm:text-sm text-secondary">{stock.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                      <div className="flex justify-between sm:flex-col sm:text-right">
                        <p className="text-sm sm:text-base font-semibold text-main">{formatCurrency(stock.price)}</p>
                        <p className={`text-xs sm:text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatPercent(stock.changePercent)}
                        </p>
                      </div>
                      
                      <div className="flex justify-between sm:flex-col sm:text-right">
                        <p className="text-xs sm:text-sm text-secondary">Volume</p>
                        <p className="text-xs sm:text-sm text-main">{formatVolume(stock.volume)}</p>
                      </div>
                      
                      <div className="flex justify-between sm:flex-col sm:text-right">
                        <p className="text-xs sm:text-sm text-secondary">Market Cap</p>
                        <p className="text-xs sm:text-sm text-main">{formatMarketCap(stock.marketCap)}</p>
                      </div>
                      
                      <div className="flex space-x-2 pt-2 sm:pt-0">
                        <button
                          onClick={() => handleQuickTrade(stock.symbol, 'buy')}
                          className="flex-1 sm:flex-none px-3 py-2 sm:py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => handleQuickTrade(stock.symbol, 'sell')}
                          className="flex-1 sm:flex-none px-3 py-2 sm:py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SectorPage; 