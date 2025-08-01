import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockDataService } from '@/lib/stockDataService';
import { cn } from '@/lib/utils';

interface StockMover {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

const TopMovers: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [movers, setMovers] = useState<{ gainers: StockMover[], losers: StockMover[] }>({
    gainers: [],
    losers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        setIsLoading(true);
        
        // Expanded list of popular stocks across different sectors
        const symbols = [
          // Technology - Top Companies (Keep all)
          'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
          'CRM', 'ADBE', 'ORCL', 'CSCO', 'IBM', 'QCOM', 'AVGO', 'TXN', 'MU', 'KLAC',
          'PLTR', 'SNOW', 'CRWD', 'ZS', 'NET', 'DDOG', 'MDB', 'OKTA', 'TEAM', 'ZM',
          
          // Consumer Discretionary - Top 5 Companies
          'HD', 'MCD', 'NKE', 'SBUX', 'TJX',
          
          // Healthcare - Top 5 Companies
          'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO',
          
          // Financial - Top 5 Companies
          'JPM', 'BAC', 'WFC', 'GS', 'MS',
          
          // Energy - Top 5 Companies
          'XOM', 'CVX', 'COP', 'EOG', 'SLB',
          
          // Industrials - Top 5 Companies
          'BA', 'CAT', 'GE', 'MMM', 'HON',
          
          // Materials - Top 5 Companies
          'LIN', 'APD', 'FCX', 'NEM', 'DOW',
          
          // Communications - Top 5 Companies
          'DIS', 'CMCSA', 'CHTR', 'TMUS', 'VZ',
          
          // Real Estate - Top 5 Companies
          'AMT', 'PLD', 'CCI', 'EQIX', 'DLR',
          
          // Consumer Staples - Top 5 Companies
          'PG', 'KO', 'PEP', 'WMT', 'COST',
          
          // Utilities - Top 5 Companies
          'NEE', 'DUK', 'SO', 'D', 'AEP',
          
          // ETFs and Indices - Top 5 Major ETFs
          'SPY', 'QQQ', 'DIA', 'VTI', 'VOO',
          
          // Crypto and Fintech - Top 5 Companies
          'COIN', 'SQ', 'ROKU', 'PYPL', 'MA',
          
          // Electric Vehicles and Clean Energy - Top 5 Companies
          'RIVN', 'LCID', 'NIO', 'XPEV', 'LI',
          
          // Biotech and Pharma - Top 5 Companies
          'MRNA', 'BNTX', 'NVAX', 'INO', 'GILD'
        ];
        
        const stockQuotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await stockDataService.getStockQuote(symbol);
              return {
                symbol: quote.symbol,
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent
              };
            } catch (error) {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            }
          })
        );

        const validQuotes = stockQuotes.filter(quote => quote !== null) as StockMover[];
        
        // Sort by percentage change
        const sorted = validQuotes.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        
        const gainers = sorted
          .filter(stock => stock.changePercent > 0)
          .slice(0, 8); // Increased from 5 to 8
        
        const losers = sorted
          .filter(stock => stock.changePercent < 0)
          .slice(0, 8); // Increased from 5 to 8

        setMovers({ gainers, losers });
      } catch (error) {
        console.error('Error fetching top movers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMovers();
    
    // Update every 30 seconds
    const interval = setInterval(fetchTopMovers, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const handleStockClick = (symbol: string) => {
    navigate(`/stocks/${symbol}`);
  };

  const currentData = activeTab === 'gainers' ? movers.gainers : movers.losers;

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-main">Top Movers</h2>
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-md">
          <button 
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'gainers' 
                ? 'bg-gray-700 text-main' 
                : 'text-secondary hover:text-main'
            }`}
            onClick={() => setActiveTab('gainers')}
          >
            Top Gainers
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'losers' 
                ? 'bg-gray-700 text-main' 
                : 'text-secondary hover:text-main'
            }`}
            onClick={() => setActiveTab('losers')}
          >
            Top Losers
          </button>
        </div>
      </div>
      <p className="text-sm text-secondary mb-4">Today's biggest winners and losers</p>
      
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-left">
          <thead className="text-xs text-secondary uppercase">
            <tr>
              <th className="py-2">Symbol</th>
              <th className="py-2">Last Price</th>
              <th className="py-2 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((stock, index) => (
              <tr 
                key={stock.symbol} 
                className={cn(
                  index < currentData.length - 1 ? 'border-b border-gray-700' : '',
                  'hover:bg-gray-700/20 transition-colors cursor-pointer'
                )}
                onClick={() => handleStockClick(stock.symbol)}
                title={`Click to view ${stock.symbol} details`}
              >
                <td className="py-3 font-medium text-main hover:text-blue-400 transition-colors">
                  {stock.symbol}
                </td>
                <td className="py-3 text-main">{formatCurrency(stock.price)}</td>
                <td className={`py-3 text-right font-medium ${
                  activeTab === 'gainers' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {formatPercent(stock.changePercent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TopMovers; 