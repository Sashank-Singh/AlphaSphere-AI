import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, BarChart2, Target } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Portfolio } from '@/types';
import { getStockBySymbol } from '@/data/mockData';
import { stockDataService } from '@/lib/stockDataService';

interface RiskManagementDashboardProps {
  portfolio: Portfolio;
}

interface RiskMetrics {
  var: number;
  varConfidence: number;
  maxDrawdown: number;
  beta: number;
  correlation: number;
  volatility: number;
}

const RiskManagementDashboard: React.FC<RiskManagementDashboardProps> = ({
  portfolio,
}) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    var: 5000,
    varConfidence: 0.95,
    maxDrawdown: -0.15,
    beta: 1.2,
    correlation: 0.8,
    volatility: 0.25,
  });

  // Calculate portfolio exposure by sector
  const sectorExposure = portfolio.positions.reduce((acc, pos) => {
    const stock = getStockBySymbol(pos.symbol);
    if (stock?.sector) {
      acc[stock.sector] = (acc[stock.sector] || 0) + (pos.quantity * stock.price);
    }
    return acc;
  }, {} as Record<string, number>);

  const totalValue = Object.values(sectorExposure).reduce((a, b) => a + b, 0);

  // Add mock risk calculations
  useEffect(() => {
    const calculateRiskMetrics = async () => {
      try {
        // Get mock quotes for all portfolio positions
        const symbols = portfolio.positions.map(pos => pos.symbol);
        const quotes = await Promise.all(
          symbols.map(symbol => stockDataService.getStockQuote(symbol))
        );
        
        // Calculate portfolio value and risk metrics
        const portfolioValue = quotes.reduce((total, quote) => {
          const position = portfolio.positions.find(pos => pos.symbol === quote.symbol);
          return total + (position?.quantity || 0) * quote.price;
        }, 0);
        
        // Calculate volatility and VaR based on price changes
        const volatility = quotes.reduce((sum, quote) => {
          return sum + Math.abs(quote.changePercent);
        }, 0) / quotes.length;
        
        // Update risk metrics
        setRiskMetrics(prev => ({
          ...prev,
          volatility,
          var: portfolioValue * volatility * 2.33, // 99% confidence VaR
          varConfidence: 0.99,
          maxDrawdown: Math.min(...quotes.map(q => q.changePercent)),
          beta: volatility / 0.12 // Compare to market volatility (assumed 12%)
        }));
      } catch (error) {
        console.error('Error calculating risk metrics:', error);
      }
    };
    
    calculateRiskMetrics();
    const interval = setInterval(calculateRiskMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [portfolio]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="text-sm font-medium">Risk Management</h3>
        </div>

        {/* Key Risk Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs text-muted-foreground">Value at Risk (VaR)</div>
            <div className="font-medium text-red-500">
              {formatCurrency(riskMetrics.var)}
            </div>
            <div className="text-xs text-muted-foreground">
              {riskMetrics.varConfidence * 100}% confidence
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Max Drawdown</div>
            <div className="font-medium text-red-500">
              {formatPercentage(riskMetrics.maxDrawdown)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Portfolio Beta</div>
            <div className="font-medium">
              {riskMetrics.beta.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Volatility</div>
            <div className="font-medium">
              {formatPercentage(riskMetrics.volatility)}
            </div>
          </div>
        </div>

        {/* Sector Exposure */}
        <div className="mb-6">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Sector Exposure</h4>
          <div className="space-y-2">
            {Object.entries(sectorExposure).map(([sector, value]) => {
              const percentage = (value / totalValue) * 100;
              return (
                <div key={sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{sector}</span>
                    <span className="font-medium">{formatPercentage(percentage / 100)}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Risk Score */}
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Portfolio Risk Score</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress value={65} className="h-2" />
            </div>
            <div className="text-sm font-medium">65%</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Moderate Risk Level
          </div>
        </div>

        {/* Risk Alerts */}
        <div className="mt-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Risk Alerts</h4>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium">High Tech Sector Exposure</div>
                <div className="text-xs text-muted-foreground">
                  Consider diversifying to reduce sector concentration risk
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2 rounded-lg border border-red-500/20 bg-red-500/5">
              <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Above Target Volatility</div>
                <div className="text-xs text-muted-foreground">
                  Portfolio volatility exceeds target range
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskManagementDashboard;