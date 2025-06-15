
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SkeletonLoader from '@/components/ui/skeleton-loader';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  type: 'alert' | 'info' | 'warning';
}

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setNotifications([
        { 
          id: '1', 
          message: 'AAPL up 5% - Consider taking profits', 
          isRead: false,
          timestamp: new Date(),
          type: 'alert'
        },
        { 
          id: '2', 
          message: 'New AI trading opportunity available', 
          isRead: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'info'
        },
        { 
          id: '3', 
          message: 'Market volatility alert: VIX above 25', 
          isRead: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'warning'
        },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <ErrorBoundary>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative hidden md:inline-flex">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} unread
              </span>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {loading ? (
            <div className="p-3 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} lines={2} className="h-12" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No notifications
            </div>
          ) : (
            notifications.map(notification => (
              <DropdownMenuItem 
                key={notification.id} 
                className="flex items-start p-3 cursor-pointer"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-1">
                  <div className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                    {notification.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </ErrorBoundary>
  );
};

export default NotificationsDropdown;
