import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, TrendingUp, TrendingDown, Volume2, Clock, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'price_spike' | 'volume_surge' | 'volatility' | 'news_sentiment' | 'technical';
  symbol: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  actionRequired: boolean;
}

const SmartAlerts: React.FC = memo(() => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const generateMockAlerts = useCallback((): Alert[] => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'price_spike',
        symbol: 'TSLA',
        title: 'Unusual Price Movement',
        message: 'TSLA up 8.5% in last 30 minutes - 3x normal volatility',
        severity: 'high',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'volume_surge',
        symbol: 'AAPL',
        title: 'Volume Surge Detected',
        message: 'Trading volume 5x above average - potential breakout',
        severity: 'medium',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        isRead: false,
        actionRequired: false
      },
      {
        id: '3',
        type: 'news_sentiment',
        symbol: 'NVDA',
        title: 'Sentiment Shift',
        message: 'AI news sentiment turned bullish - 85% positive mentions',
        severity: 'medium',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true,
        actionRequired: false
      },
      {
        id: '4',
        type: 'technical',
        symbol: 'SPY',
        title: 'Technical Breakout',
        message: 'SPY broke above resistance at $485 - momentum building',
        severity: 'low',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        isRead: true,
        actionRequired: false
      }
    ];
    return mockAlerts;
  }, []);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(generateMockAlerts());
      setLoading(false);
    }, 1000);
  }, [generateMockAlerts]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'price_spike': return <TrendingUp className="h-4 w-4" />;
      case 'volume_surge': return <Volume2 className="h-4 w-4" />;
      case 'volatility': return <TrendingDown className="h-4 w-4" />;
      case 'news_sentiment': return <Bell className="h-4 w-4" />;
      case 'technical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityClass = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-l-red-500 bg-red-500/5';
      case 'high': return 'border-l-4 border-l-orange-500 bg-orange-500/5';
      case 'medium': return 'border-l-4 border-l-yellow-500 bg-yellow-500/5';
      case 'low': return 'border-l-4 border-l-blue-500 bg-blue-500/5';
      default: return 'border-l-4 border-l-gray-500 bg-gray-500/5';
    }
  };

  const getSeverityBadgeVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      return `${diffHours}h ago`;
    }
  };

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    switch (filter) {
      case 'unread': return !alert.isRead;
      case 'critical': return alert.severity === 'critical' || alert.severity === 'high';
      default: return true;
    }
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  if (loading) {
    return (
      <Card className="h-full enhanced-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full enhanced-card fade-in-delay-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </div>
          Smart Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'unread', 'critical'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="interactive-element capitalize"
            >
              {filterType}
              {filterType === 'unread' && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No alerts to show</p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg transition-all duration-200 interactive-element fade-in-delay-${index + 1} ${
                  getSeverityClass(alert.severity)
                } ${!alert.isRead ? 'ring-1 ring-primary/20' : 'opacity-75'}`}
                onClick={() => !alert.isRead && markAsRead(alert.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-base">{alert.symbol}</span>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-sm">
                          {alert.severity}
                        </Badge>
                        {!alert.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      <h4 className="font-medium text-base mb-1">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(alert.timestamp)}
                        {alert.actionRequired && (
                          <Badge variant="outline" className="text-sm">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissAlert(alert.id);
                    }}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredAlerts.length > 0 && (
          <div className="pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full interactive-element"
              onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))}
            >
              Mark All as Read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SmartAlerts.displayName = 'SmartAlerts';

export default SmartAlerts;