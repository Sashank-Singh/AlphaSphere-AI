
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Activity, Users } from 'lucide-react';

const MarketPulse: React.FC = () => {
  const navigate = useNavigate();
  const [marketStats, setMarketStats] = useState({
    spyChange: 0.85,
    vixLevel: 18.4,
    cryptoSentiment: 'bullish',
    activeTraders: 15420
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStats(prev => ({
        ...prev,
        spyChange: prev.spyChange + (Math.random() - 0.5) * 0.1,
        vixLevel: Math.max(10, Math.min(30, prev.vixLevel + (Math.random() - 0.5) * 0.5)),
        activeTraders: prev.activeTraders + Math.floor((Math.random() - 0.5) * 100)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card text-foreground border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="h-5 w-5" />
          Market Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">S&P 500</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            <span className="text-green-500 font-semibold">
              +{marketStats.spyChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">VIX</span>
          <span className="font-semibold">{marketStats.vixLevel.toFixed(1)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-sm">Active Traders</span>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-blue-500" />
            <span className="font-semibold">{marketStats.activeTraders.toLocaleString()}</span>
          </div>
        </div>
        
        <Button className="w-full mt-6" onClick={() => navigate('/market')}>
          View Full Market
        </Button>
      </CardContent>
    </Card>
  );
};

export default MarketPulse;
