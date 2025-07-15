import React, { useState, useEffect, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, ExternalLink, BarChart3 } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { useNavigate } from 'react-router-dom';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

const MarketPulse: React.FC = memo(() => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleNavigateToMarket = useCallback(() => {
    navigate('/market');
  }, [navigate]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const symbols = ['SPY', 'VIX'];
        const data = await Promise.all(
          symbols.map(async (symbol) => {
            const quote = await stockDataService.getStockQuote(symbol);
            return {
              symbol,
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              volume: quote.volume,
            };
          })
        );
        setMarketData(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  if (loading) {
    return (
      <Card className="h-full enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Pulse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 rounded-lg"></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-2 border-slate-600 pl-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 pulse-glow" />
          Market Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {marketData.map((item, index) => {
          const isPositive = item.change >= 0;
          const changeClass = isPositive ? 'gain-positive' : 'gain-negative';
          return (
            <div key={item.symbol} className={`space-y-2 p-3 rounded-lg interactive-element transition-all fade-in-delay-${index + 2}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg">{item.symbol}</span>
                <span className="text-xl font-bold">${formatPrice(item.price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-base px-2 py-1 rounded-md ${changeClass}`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {formatChange(item.change, item.changePercent)}
                </div>
                {item.volume && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BarChart3 className="h-3 w-3" />
                    {formatVolume(item.volume)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNavigateToMarket}
            className="w-full flex items-center gap-2 interactive-element"
          >
            View Full Market
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

MarketPulse.displayName = 'MarketPulse';

export default MarketPulse;
