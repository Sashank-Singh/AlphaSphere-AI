
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Search, BarChart2, Settings, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
    },
    {
      path: '/search',
      label: 'Search',
      icon: Search,
    },
    {
      path: '/analytics',
      label: 'AI',
      icon: Brain,
      badge: 'New'
    },
    {
      path: '/portfolio',
      label: 'Portfolio',
      icon: BarChart2,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];
  
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              className={cn(
                "relative flex flex-col items-center justify-center w-16 h-full rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10" : "hover:bg-primary/5"
              )}
              onClick={() => navigate(item.path)}
            >
              <div className={cn(
                "absolute inset-0 rounded-xl transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0"
              )}>
                <div className="absolute inset-0 bg-primary/5 rounded-xl" />
              </div>
              
              <div className="relative">
                <item.icon className={cn(
                  "h-5 w-5 mb-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground"
                )} />
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavBar;
