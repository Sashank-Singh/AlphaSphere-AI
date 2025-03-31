import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchRealTimeStockPrice } from '@/lib/api';
import { X } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<string>('watchlist');
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

  return (
    <div className="bg-black text-white rounded-lg shadow-xl overflow-hidden">
      <Tabs defaultValue="watchlist" value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-gray-800">
          <TabsList className="bg-black w-full">
            <TabsTrigger 
              value="watchlist" 
              className="flex-1 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Watchlist
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex-1 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              AI Insights
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex-1 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="metrics" 
              className="flex-1 bg-transparent data-[state=active]:bg-gray-800 data-[state=active]:text-white"
            >
              AI Metrics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="watchlist" className="p-4">
          <div className="space-y-6">
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
          </div>
        </TabsContent>

        <TabsContent value="positions" className="p-0">
          <div className="p-4">
            <CardTitle className="text-md mb-4">Your Option Positions</CardTitle>
            
            {positions.map((position, index) => (
              <div key={index} className="border border-gray-800 rounded-md mb-3 relative overflow-hidden">
                <div className="flex justify-between items-start p-3">
                  <div>
                    <div className="flex items-center">
                      <span className={`font-semibold ${position.type === 'CALL' ? 'text-green-500' : 'text-red-500'}`}>
                        {position.type} {position.strike.toFixed(1)} Strike
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {position.contracts} contract{position.contracts !== 1 ? 's' : ''} × ${position.pricePerShare} per share
                    </div>
                    <div className="text-sm text-gray-400">
                      Expires: {position.expiry} ({calculateDaysRemaining(position.expiry)} days)
                    </div>
                    <div className="text-sm text-gray-400">
                      Delta: {position.delta}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${position.totalValue.toFixed(2)}</div>
                    <div className={formatProfitLoss(calculateProfitLoss(position)).className}>
                      {formatProfitLoss(calculateProfitLoss(position)).value}
                    </div>
                    <div className={formatProfitLossPercent(getProfitLossPercent(position)).className}>
                      {formatProfitLossPercent(getProfitLossPercent(position)).value}
                    </div>
                  </div>
                  
                  <button 
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={() => removePosition(index)}
                    aria-label="Remove position"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div 
                  className={`h-1 w-full ${position.type === 'CALL' ? 'bg-green-900' : 'bg-red-900'}`}
                ></div>
              </div>
            ))}
            
            {positions.length === 0 && (
              <Alert className="bg-gray-900 border-gray-700">
                <AlertDescription>
                  You have no open option positions. Use the Options Chain to add positions.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="p-4">
          <CardTitle className="text-md mb-4">AI Insights</CardTitle>
          <div className="text-sm text-gray-400">
            AI-powered analysis of {symbol} based on current market conditions and historical data.
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="p-4">
          <CardTitle className="text-md mb-4">Analytics</CardTitle>
          <div className="text-sm text-gray-400">
            Comprehensive analytics for {symbol} including technical indicators and sentiment analysis.
          </div>
        </TabsContent>
        
        <TabsContent value="metrics" className="p-4">
          <CardTitle className="text-md mb-4">AI Metrics</CardTitle>
          <div className="text-sm text-gray-400">
            AI-generated metrics and predictions for {symbol} performance.
          </div>
        </TabsContent>
      </Tabs>
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