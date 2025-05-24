import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchRealTimeStockPrice } from '@/lib/api';
import { X, Clock } from 'lucide-react';

interface StockPosition {
  type: 'CALL' | 'PUT';
  strike: number;
  expiry: string;
  contracts: number;
  pricePerShare: number;
  totalValue: number;
  delta?: number;
}

interface StockHolding {
  shares: number;
  avgCost: number;
  marketValue: number;
  totalReturn: number;
  returnPercent: number;
}

interface StockAnalysisPanelProps {
  symbol: string;
  currentPrice?: number;
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ symbol, currentPrice }) => {
  const [positions, setPositions] = useState<StockPosition[]>([
    // Example positions that match the screenshot
    {
      type: 'PUT',
      strike: 400.0,
      expiry: '2025/03/04',
      contracts: 1,
      pricePerShare: 4.89,
      totalValue: 489.00,
      delta: -0.50
    },
    {
      type: 'PUT',
      strike: 389.0,
      expiry: '2025/06/04',
      contracts: 1,
      pricePerShare: 5.79,
      totalValue: 579.00,
      delta: -0.50
    },
    {
      type: 'CALL',
      strike: 448.0,
      expiry: '2025/03/04',
      contracts: 2,
      pricePerShare: 5.77,
      totalValue: 1154.00,
      delta: 0.50
    }
  ]);
  
  // Example stock holding
  const [stockHolding, setStockHolding] = useState<StockHolding>({
    shares: 5,
    avgCost: 175.50,
    marketValue: 851.50,
    totalReturn: -26.00,
    returnPercent: -2.96
  });

  // Company info
  const [companyInfo, setCompanyInfo] = useState({
    sector: 'Technology',
    industry: 'Semiconductors',
    exchange: 'NASDAQ',
    lastUpdated: new Date().toLocaleTimeString()
  });

  const calculateProfitLoss = (position: StockPosition) => {
    if (position.type === 'CALL') {
      // For call options, profit when price goes above strike + premium
      const breakEven = position.strike + position.pricePerShare;
      if (currentPrice > breakEven) {
        const profit = (currentPrice - breakEven) * 100 * position.contracts;
        return profit;
      } else {
        const loss = Math.min((breakEven - currentPrice) * 100 * position.contracts, position.totalValue);
        return -loss;
      }
    } else {
      // For put options, profit when price goes below strike - premium
      const breakEven = position.strike - position.pricePerShare;
      if (currentPrice < breakEven) {
        const profit = (breakEven - currentPrice) * 100 * position.contracts;
        return profit;
      } else {
        const loss = Math.min((currentPrice - breakEven) * 100 * position.contracts, position.totalValue);
        return -loss;
      }
    }
  };

  // Calculate profit/loss % for display
  const getProfitLossPercent = (position: StockPosition) => {
    const pl = calculateProfitLoss(position);
    const percent = (pl / position.totalValue) * 100;
    return percent;
  };

  // Format the profit/loss display
  const formatProfitLoss = (value: number) => {
    const isPositive = value >= 0;
    const formattedValue = Math.abs(value).toFixed(2);
    return {
      value: isPositive ? `$${formattedValue}` : `-$${formattedValue}`,
      className: isPositive ? 'text-green-500' : 'text-red-500'
    };
  };

  // Format the profit/loss percent display
  const formatProfitLossPercent = (percent: number) => {
    const isPositive = percent >= 0;
    const formattedValue = Math.abs(percent).toFixed(2);
    return {
      value: isPositive ? `+${formattedValue}%` : `-${formattedValue}%`,
      className: isPositive ? 'text-green-500' : 'text-red-500'
    };
  };

  // Remove a position
  const removePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  // Update time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCompanyInfo(prev => ({
        ...prev,
        lastUpdated: new Date().toLocaleTimeString()
      }));
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black text-white rounded-lg shadow-xl overflow-hidden">
        <div className="space-y-6">
          {/* Company Info */}
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4">Company Info</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-400">Sector:</div>
                  <div className="font-semibold">{companyInfo.sector || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Industry:</div>
                  <div className="font-semibold">{companyInfo.industry || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Exchange:</div>
                  <div className="font-semibold">{companyInfo.exchange}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Last updated:</div>
                  <div className="font-semibold flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> {companyInfo.lastUpdated}
                  </div>
                </div>
              </div>
            </div>
          </div>
          

          {/* Stock Position */}
          <div className="rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4">Your Stock Position</h3>
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <div className="text-sm text-gray-400">Shares</div>
                  <div className="font-semibold">{stockHolding.shares}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Market Value</div>
                  <div className="font-semibold">${stockHolding.marketValue.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Avg. Cost</div>
                  <div className="font-semibold">${stockHolding.avgCost.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Total Return</div>
                  <div className={stockHolding.totalReturn >= 0 ? "text-green-500" : "text-red-500"}>
                    ${stockHolding.totalReturn.toFixed(2)} ({stockHolding.returnPercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            Create a watchlist to track your favorite stocks.
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button className="flex-1">Trade Stock</Button>
            <Button className="flex-1" variant="outline">Trade with AI</Button>
          </div>
          
          <Button variant="outline" className="w-full">Show Options</Button>
          
          <div className="text-xs text-gray-500 text-center">
            Chart data provided by TradingView · Stock data from Yahoo Finance
          </div>
        </div>
    </div>
  );
};

// Helper function to calculate days remaining until expiration
function calculateDaysRemaining(expiryDate: string): number {
  const parts = expiryDate.split('/');
  if (parts.length !== 3) return 0;
  
  const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const today = new Date();
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

export default StockAnalysisPanel;
