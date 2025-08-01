import React, { useEffect, useState } from 'react';
import { stockDataService } from '@/lib/stockDataService';

interface MarketData {
  spy: {
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  };
  vix: number;
}

const MarketPulse: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    spy: { price: 0, change: 0, changePercent: 0, volume: 0 },
    vix: 18.2
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch SPY data
        const spyQuote = await stockDataService.getStockQuote('SPY');
        
        // Calculate VIX (simplified - in real app this would come from a VIX API)
        const vix = Math.max(10, Math.min(30, 18.2 + (Math.random() - 0.5) * 2));
        
        setMarketData({
          spy: {
            price: spyQuote.price,
            change: spyQuote.change,
            changePercent: spyQuote.changePercent,
            volume: spyQuote.volume
          },
          vix: vix
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    
    // Update every 10 seconds
    const interval = setInterval(fetchMarketData, 10000);
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    }
    return volume.toLocaleString();
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-main">Market Pulse</h2>
        <span className="text-xs text-secondary flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Live
        </span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="font-bold text-main">S&P 500 (SPY)</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(marketData.spy.price)}
              </p>
            </div>
            <div className="text-right">
              <p className={marketData.spy.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercent(marketData.spy.changePercent)}
              </p>
              <p className={marketData.spy.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatCurrency(marketData.spy.change)}
              </p>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm mt-4">
            <span className="text-secondary">VIX</span>
            <span className="text-main">{marketData.vix.toFixed(1)}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-secondary">SPY Trading Volume</span>
            <span className="text-main">{formatVolume(marketData.spy.volume)}</span>
          </div>
        </>
      )}
      
      <button className="mt-4 w-full text-center py-2 text-sm text-main bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors">
        View Full Market
      </button>
    </div>
  );
};

export default MarketPulse;
