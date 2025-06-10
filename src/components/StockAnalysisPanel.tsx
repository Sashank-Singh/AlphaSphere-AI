
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
      
    </div>
  );
};

export default StockAnalysisPanel;
