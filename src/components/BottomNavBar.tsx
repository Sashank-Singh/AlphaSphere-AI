
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Search, BarChart2, Settings } from 'lucide-react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-10">
      <div className="flex justify-around items-center h-16">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              className="flex flex-col items-center justify-center w-1/4 h-full"
              onClick={() => navigate(item.path)}
            >
              <item.icon className={cn(
                "h-5 w-5 mb-1",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
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
