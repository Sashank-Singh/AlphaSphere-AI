import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Settings } from 'lucide-react';
import { CompanyInfo, stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';

interface StockAnalysisPanelProps {
  symbol: string;
  shares?: number;
  avgCost?: number;
}

const StockAnalysisPanel: React.FC<StockAnalysisPanelProps> = ({ 
  symbol, 
  shares = 5,
  avgCost = 175.50
}) => {
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [quoteData, companyData] = await Promise.all([
          stockDataService.getStockQuote(symbol),
          stockDataService.getCompanyInfo(symbol)
        ]);
        
        setStockData(quoteData);
        setCompanyInfo(companyData);
        
        if (quoteData.latestTradingDay) {
          setLastUpdated(new Date(quoteData.latestTradingDay).toLocaleTimeString());
        }
        
      } catch (error) {
        console.error('Error fetching stock analysis data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [symbol]);

  const marketValue = stockData ? stockData.price * shares : 0;
  const totalCost = avgCost * shares;
  const totalReturn = marketValue - totalCost;
  const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  
  return (
    <div className="space-y-4">
      {/* Your Stock Position */}
      <Card>
        <CardHeader>
          <CardTitle>Your Stock Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Shares</span>
              <div className="font-semibold">{shares}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Market Value</span>
              <div className="font-semibold">
                {isLoading ? 'Loading...' : `$${marketValue.toFixed(2)}`}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Avg. Cost</span>
              <div>${avgCost.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Total Return</span>
              <div className={totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}>
                {isLoading ? 'Loading...' : `$${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)} (${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(2)}%)`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlist & Actions */}
      
    </div>
  );
};

export default StockAnalysisPanel;
