
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
}

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setNotifications([
      { id: '1', message: 'AAPL up 5% - Consider taking profits', isRead: false },
      { id: '2', message: 'New AI trading opportunity available', isRead: false },
      { id: '3', message: 'Market volatility alert: VIX above 25', isRead: true },
    ]);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative hidden md:inline-flex">
          <Bell className="h-4 w-4" />
          {notifications.some(n => !n.isRead) && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map(notification => (
          <DropdownMenuItem key={notification.id} className="flex items-start p-3">
            <div className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
              {notification.message}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
