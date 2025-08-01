import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      icon: 'home',
      path: '/dashboard'
    },
    {
      name: 'Search',
      icon: 'search',
      path: '/search'
    }, {
      name: 'Market',
      icon: 'bar_chart',
      path: '/market'
    },
    {
      name: 'Alerts',
      icon: 'notifications',
      path: '/dashboard'
    },
    {
      name: 'Community',
      icon: 'people',
      path: '/community'
    },
   
    {
      name: 'Settings',
      icon: 'settings',
      path: '/settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-card flex justify-center p-2 lg:hidden z-[9999] inset-x-0">
      <div className="flex justify-around items-center max-w-md w-full">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center text-xs px-2",
              location.pathname === item.path
                ? "text-main"
                : "text-secondary"
            )}
          >
            <span className="icon text-lg mb-1">{item.icon}</span>
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomNavBar;
