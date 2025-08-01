
import React, { useEffect, useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { stockDataService } from '@/lib/stockDataService';

const PortfolioOverview: React.FC = () => {
  const { portfolio } = usePortfolio();
  const [dailyChange, setDailyChange] = useState({ amount: 0, percent: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculateDailyChange = async () => {
      try {
        setIsLoading(true);
        let totalChange = 0;
        let totalValue = 0;

        // Calculate changes for each position
        for (const position of portfolio.positions) {
          try {
            const quote = await stockDataService.getStockQuote(position.symbol);
            const positionValue = position.quantity * quote.price;
            const positionChange = positionValue - (position.quantity * position.averagePrice);
            
            totalChange += positionChange;
            totalValue += positionValue;
          } catch (error) {
            console.error(`Error fetching quote for ${position.symbol}:`, error);
          }
        }

        const percentChange = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
        
        setDailyChange({
          amount: totalChange,
          percent: percentChange
        });
      } catch (error) {
        console.error('Error calculating daily change:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateDailyChange();
    
    // Update every 30 seconds
    const interval = setInterval(calculateDailyChange, 30000);
    return () => clearInterval(interval);
  }, [portfolio.positions]);

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

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <h2 className="text-lg font-semibold text-main mb-4">Portfolio Overview</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-10 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>
      ) : (
        <>
          <p className="text-4xl font-bold text-white">
            {formatCurrency(portfolio.totalValue)}
          </p>
          <p className={`text-sm ${dailyChange.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatPercent(dailyChange.percent)} ({formatCurrency(dailyChange.amount)}) today
          </p>
        </>
      )}
      
      <div className="flex justify-between mt-6">
        <div>
          <p className="text-sm text-secondary">Available Cash</p>
          <p className="text-lg font-medium text-main">
            {formatCurrency(portfolio.cash)}
          </p>
        </div>
        <div>
          <p className="text-sm text-secondary">Positions</p>
          <p className="text-lg font-medium text-main">
            {portfolio.positions.length + portfolio.optionPositions.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
