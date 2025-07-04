import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePortfolio } from '@/context/PortfolioContext';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

const PortfolioOverview: React.FC = memo(() => {
  const { portfolio } = usePortfolio();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (percentage?: number) => {
    const safeValue = percentage ?? 0;
    return `${safeValue >= 0 ? '+' : ''}${safeValue.toFixed(2)}%`;
  };

  const isPositive = portfolio.dailyChange >= 0;
  const changeClass = isPositive ? 'gain-positive' : 'gain-negative';

  return (
    <Card className="border-l-2 border-slate-600 pl-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Portfolio Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 interactive-element p-3 rounded-lg transition-all">
            <p className="text-base text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
          </div>
          <div className="space-y-2 interactive-element p-3 rounded-lg transition-all">
            <p className="text-base text-muted-foreground">Daily Change</p>
            <div className={`flex items-center gap-1 text-lg font-semibold px-2 py-1 rounded-md ${changeClass}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {formatPercentage(portfolio.dailyChangePercent)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2 interactive-element p-3 rounded-lg transition-all">
            <p className="text-base text-muted-foreground">Available Cash</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(portfolio.cash)}
            </p>
          </div>
          <div className="space-y-2 interactive-element p-3 rounded-lg transition-all">
            <p className="text-base text-muted-foreground">Positions</p>
            <p className="text-lg font-semibold">{portfolio.positions.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PortfolioOverview.displayName = 'PortfolioOverview';

export default PortfolioOverview;
