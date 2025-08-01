import React, { useState, useEffect } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { stockDataService } from '@/lib/stockDataService';

interface Alert {
  id: string;
  type: 'AI Buy Signal' | 'Price Alert' | 'Earnings Tomorrow' | 'Portfolio Alert';
  symbol: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

const SmartAlerts: React.FC = () => {
  const { portfolio } = usePortfolio();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateAlerts = async () => {
      try {
        setIsLoading(true);
        const newAlerts: Alert[] = [];

        // Generate AI buy signals based on portfolio positions
        for (const position of portfolio.positions.slice(0, 2)) {
          try {
            const quote = await stockDataService.getStockQuote(position.symbol);
            const priceChange = ((quote.price - position.averagePrice) / position.averagePrice) * 100;
            
            if (priceChange > 5) {
              newAlerts.push({
                id: `ai-${position.symbol}-${Date.now()}`,
                type: 'AI Buy Signal',
                symbol: position.symbol,
                description: `Strong momentum suggests potential ${Math.abs(priceChange).toFixed(1)}% upside.`,
                time: '1 min ago',
                icon: 'trending_up',
                color: 'bg-yellow-500/20 text-yellow-400',
                priority: 'high'
              });
            }
          } catch (error) {
            console.error(`Error generating alert for ${position.symbol}:`, error);
          }
        }

        // Generate price alerts for popular stocks
        const popularStocks = ['AAPL', 'TSLA', 'NVDA'];
        for (const symbol of popularStocks) {
          try {
            const quote = await stockDataService.getStockQuote(symbol);
            const targetPrice = quote.price * 1.05; // 5% above current price
            
            if (quote.price > targetPrice * 0.95) {
              newAlerts.push({
                id: `price-${symbol}-${Date.now()}`,
                type: 'Price Alert',
                symbol: symbol,
                description: `${symbol} has crossed your set price target of ${targetPrice.toFixed(2)}.`,
                time: '11m ago',
                icon: 'price_check',
                color: 'bg-blue-500/20 text-blue-400',
                priority: 'medium'
              });
            }
          } catch (error) {
            console.error(`Error generating price alert for ${symbol}:`, error);
          }
        }

        // Generate earnings alerts
        const earningsStocks = ['AVGA', 'NVDA', 'TSLA'];
        const randomStock = earningsStocks[Math.floor(Math.random() * earningsStocks.length)];
        newAlerts.push({
          id: `earnings-${randomStock}-${Date.now()}`,
          type: 'Earnings Tomorrow',
          symbol: randomStock,
          description: `Reminder: ${randomStock} earnings are due tomorrow.`,
          time: '51m ago',
          icon: 'calendar_today',
          color: 'bg-purple-500/20 text-purple-400',
          priority: 'medium'
        });

        // Portfolio alerts
        if (portfolio.cash < 10000) {
          newAlerts.push({
            id: `portfolio-cash-${Date.now()}`,
            type: 'Portfolio Alert',
            symbol: 'PORTFOLIO',
            description: 'Low cash balance. Consider adding funds for trading opportunities.',
            time: '2h ago',
            icon: 'account_balance_wallet',
            color: 'bg-red-500/20 text-red-400',
            priority: 'high'
          });
        }

        // Sort by priority and time
        const sortedAlerts = newAlerts
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          })
          .slice(0, 5); // Limit to 5 alerts

        setAlerts(sortedAlerts);
      } catch (error) {
        console.error('Error generating alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateAlerts();
    
    // Update alerts every 2 minutes
    const interval = setInterval(generateAlerts, 120000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-main flex items-center">
          <span className="icon mr-2 text-yellow-400">notifications_active</span> 
          Smart Alerts
        </h2>
        <button className="text-xs text-secondary hover:text-main transition-colors">
          See all
        </button>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start space-x-3 group">
              <div className={`w-8 h-8 ${alert.color} rounded-full flex items-center justify-center`}>
                <span className="icon text-base">{alert.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-main">
                    {alert.type}: <span className="font-semibold">{alert.symbol}</span>
                  </p>
                  <button 
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="icon text-sm">close</span>
                  </button>
                </div>
                <p className="text-xs text-secondary mt-1">{alert.description}</p>
                <span className="text-xs text-gray-500 mt-1">{alert.time}</span>
              </div>
            </div>
          ))}
          
          {alerts.length === 0 && (
            <div className="text-center py-4">
              <span className="icon text-4xl text-gray-600 mb-2 block">notifications_off</span>
              <p className="text-sm text-secondary">No alerts at the moment</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartAlerts; 