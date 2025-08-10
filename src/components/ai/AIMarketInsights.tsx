import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, TrendingUp, TrendingDown, AlertCircle, Calendar, BrainCircuit } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock } from '@/types';

interface AIMarketInsightsProps {
  stock: Stock;
  watchlist: Stock[];
  onAlertCreate: (alert: TradeAlert) => void;
}

interface TradeAlert {
  id: string;
  type: 'opportunity' | 'risk' | 'rebalancing';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  action?: 'buy' | 'sell' | 'hold';
}

interface MarketSummary {
  date: Date;
  overview: string;
  keyEvents: string[];
  sentiment: number;
  recommendations: string[];
}

const AIMarketInsights: React.FC<AIMarketInsightsProps> = ({
  stock,
  watchlist,
  onAlertCreate,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'summary'>('alerts');
  const [alerts, setAlerts] = useState<TradeAlert[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Strong Buy Signal',
      description: 'Technical indicators suggest a potential breakout in the next 24 hours.',
      timestamp: new Date(),
      priority: 'high',
      action: 'buy',
    },
    {
      id: '2',
      type: 'risk',
      title: 'Market Volatility Warning',
      description: 'Increased volatility detected in related sector stocks.',
      timestamp: new Date(),
      priority: 'medium',
      action: 'hold',
    },
  ]);

  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    date: new Date(),
    overview: 'Market showing strong momentum with tech sector leading gains. Key economic indicators suggest continued growth.',
    keyEvents: [
      'Fed maintains current interest rates',
      'Tech sector earnings exceed expectations',
      'New regulatory framework announced',
    ],
    sentiment: 0.75,
    recommendations: [
      'Consider increasing tech exposure',
      'Monitor interest rate sensitive positions',
      'Watch for sector rotation opportunities',
    ],
  });

  const handleCreateAlert = (alert: TradeAlert) => {
    setAlerts([alert, ...alerts]);
    onAlertCreate(alert);
  };

  useEffect(() => {
    const fetchMarketData = async () => {
      // TODO: Implement real market data fetching
      // This would replace the mock data
    };
    
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            <h3 className="text-sm font-medium">AI Market Insights</h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'alerts' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('alerts')}
            >
              <Bell className="h-4 w-4 mr-1" />
              Alerts
            </Button>
            <Button
              variant={activeTab === 'summary' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('summary')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Summary
            </Button>
          </div>
        </div>

        {activeTab === 'alerts' ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={cn(
                  "p-3 rounded-lg border",
                  alert.priority === 'high' ? "border-red-500/20 bg-red-500/5" :
                  alert.priority === 'medium' ? "border-yellow-500/20 bg-yellow-500/5" :
                  "border-green-500/20 bg-green-500/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className={cn(
                        "h-4 w-4",
                        alert.type === 'opportunity' ? "text-green-500" :
                        alert.type === 'risk' ? "text-red-500" :
                        "text-blue-500"
                      )} />
                      <span className="font-medium">{alert.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleString()}
                      </span>
                      {alert.action && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          alert.action === 'buy' ? "bg-green-500/10 text-green-500" :
                          alert.action === 'sell' ? "bg-red-500/10 text-red-500" :
                          "bg-yellow-500/10 text-yellow-500"
                        )}>
                          {alert.action.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCreateAlert(alert)}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Market Overview</h4>
              <p className="text-sm">{marketSummary.overview}</p>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Key Events</h4>
              <ul className="space-y-2">
                {marketSummary.keyEvents.map((event, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {event}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">AI Recommendations</h4>
              <ul className="space-y-2">
                {marketSummary.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Market Sentiment</h4>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        marketSummary.sentiment >= 0.5 ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{ width: `${marketSummary.sentiment * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {formatPercentage(marketSummary.sentiment)}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIMarketInsights; 