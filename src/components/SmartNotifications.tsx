
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, TrendingUp, AlertTriangle, DollarSign, Bot } from 'lucide-react';

interface Notification {
  id: string;
  type: 'price_alert' | 'ai_recommendation' | 'news' | 'earnings';
  title: string;
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  symbol?: string;
}

const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'ai_recommendation',
      title: 'AI Buy Signal: TSLA',
      message: 'Strong momentum indicators suggest potential 8% upside in next 5 days',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: 'high',
      actionable: true,
      symbol: 'TSLA'
    },
    {
      id: '2',
      type: 'price_alert',
      title: 'Price Alert: AAPL',
      message: 'AAPL reached your target price of $180',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: 'medium',
      actionable: true,
      symbol: 'AAPL'
    },
    {
      id: '3',
      type: 'earnings',
      title: 'Earnings Tomorrow',
      message: 'NVDA reports earnings after market close tomorrow',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      priority: 'medium',
      actionable: false,
      symbol: 'NVDA'
    }
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ai_recommendation': return <Bot className="h-4 w-4" />;
      case 'price_alert': return <TrendingUp className="h-4 w-4" />;
      case 'earnings': return <DollarSign className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <Card className="max-h-96 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Smart Alerts
          <Badge variant="secondary" className="ml-auto">
            {notifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border ${getPriorityColor(notification.priority)} relative`}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            
            <div className="flex items-start gap-2 pr-6">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                  {notification.symbol && (
                    <Badge variant="outline" className="text-xs">
                      {notification.symbol}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.timestamp)}
                  </span>
                  {notification.actionable && (
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {notifications.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No new notifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartNotifications;
