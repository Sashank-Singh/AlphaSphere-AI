import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  BarChart2,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      name: 'Market',
      icon: LineChart,
      path: '/market'
    },
    {
      name: 'Trading',
      icon: TrendingUp,
      path: '/trading'
    },
    {
      name: 'Options',
      icon: Percent,
      path: '/options'
    },
    {
      name: 'Portfolio',
      icon: Wallet,
      path: '/portfolio'
    },
    {
      name: 'Analytics',
      icon: BarChart2,
      path: '/analytics'
    },
    {
      name: 'Community',
      icon: Users,
      path: '/community'
    }
  ];

  const bottomNavItems = [
    {
      name: 'Settings',
      icon: Settings,
      path: '/settings'
    },
    {
      name: 'Help & Support',
      icon: HelpCircle,
      path: '/support'
    }
  ];

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center">
          {!collapsed && (
            <span className="text-xl font-bold">AlphaSphere</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hidden md:inline-flex"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && (
                <span className="ml-3">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;