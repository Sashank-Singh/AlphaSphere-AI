
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency } from '@/lib/utils';

const PortfolioOverview: React.FC = () => {
  const { portfolio } = usePortfolio();

  return (
    <Card className="lg:col-span-2 bg-card text-foreground border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          Portfolio Overview
          <Badge variant="secondary" className="gap-1">
            <Activity className="h-3 w-3" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          <div className="flex items-center gap-2 text-green-500">
            <TrendingUp className="h-3 w-3" />
            <span className="text-sm">+2.4% (+${((portfolio.totalValue * 0.024)).toFixed(2)}) today</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="text-xs opacity-80">Available Cash</div>
            <div className="text-lg font-semibold">{formatCurrency(portfolio.cash)}</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs opacity-80">Positions</div>
            <div className="text-lg font-semibold">{portfolio.positions.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioOverview;
