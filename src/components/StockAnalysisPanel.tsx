
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Settings } from 'lucide-react';
import { CompanyInfo } from '@/lib/stockDataService';

interface StockAnalysisPanelProps {
  symbol: string;
  companyInfo?: CompanyInfo;
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ 
  symbol, 
  companyInfo 
}) => {
  return (
    <div className="space-y-4">
      {/* Portfolio Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {['1D', '1W', '1M', '3M', '1Y', '5Y'].map((period) => (
              <Button key={period} variant="outline" size="sm">
                {period}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              Show Volume
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sector:</span>
              <div>{companyInfo?.sector || '-'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Industry:</span>
              <div>{companyInfo?.industry || '-'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Exchange:</span>
              <div>{companyInfo?.exchange || 'NASDAQ'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last updated:</span>
              <div>7:00:21 PM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Stock Position */}
      <Card>
        <CardHeader>
          <CardTitle>Your Stock Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Shares</span>
              <div className="font-semibold">5</div>
            </div>
            <div>
              <span className="text-muted-foreground">Market Value</span>
              <div className="font-semibold">$851.50</div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Cost</span>
              <div>$175.50</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Return</span>
              <div className="text-red-500">$-26.00 (-2.96%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist & Actions */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h4 className="font-semibold">Watchlist</h4>
            <p className="text-sm text-muted-foreground">
              Create a watchlist to track your favorite stocks.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button className="w-full">Trade Stock</Button>
            <Button variant="outline" className="w-full">Trade with AI</Button>
            <Button variant="outline" className="w-full">Show Options</Button>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Chart data provided by TradingView · Stock data from Yahoo Finance
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockAnalysisPanel;
