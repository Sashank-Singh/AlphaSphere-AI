import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
    { name: 'Search', icon: 'search', path: '/search' },
    { name: 'Market', icon: 'bar_chart', path: '/market' },
    { name: 'Trading', icon: 'trending_up', path: '/trading' },
    { name: 'Options', icon: 'attach_money', path: '/options' },
    { name: 'Portfolio', icon: 'account_balance_wallet', path: '/portfolio' },
    { name: 'Analytics', icon: 'analytics', path: '/analytics' },
    { name: 'Community', icon: 'forum', path: '/community' }
  ];

  const bottomNavItems = [
    { name: 'Settings', icon: 'settings', path: '/settings' },
    { name: 'Help & Support', icon: 'help_outline', path: '/support' }
  ];

  return (
    <div className={cn(
      "bg-black flex flex-col justify-between transition-all duration-300 ease-in-out h-screen sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Top Section with Chevron */}
      <div>
        <div className="flex justify-between items-center p-4">
          {!collapsed && (
            <div className="text-white font-semibold text-lg">
              AlphaSphere
            </div>
          )}
          <button
            onClick={onToggle}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span className={cn(
              "icon transition-transform duration-300",
              collapsed ? "rotate-180" : ""
            )}>
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* Separator Line */}
        <div className="border-t border-gray-700 mx-3 mb-4"></div>

        {/* Main Navigation */}
        <nav className="px-3 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center w-full rounded-xl transition-all duration-200 group",
                location.pathname === item.path
                  ? "bg-gray-700 text-white shadow-lg"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? item.name : ""}
            >
              <div className={cn(
                "flex items-center p-3 w-full",
                collapsed ? "justify-center" : "px-4"
              )}>
                <span className={cn(
                  "icon transition-all duration-200",
                  collapsed ? "text-xl" : "text-xl mr-3"
                )}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Navigation */}
      <div className="p-3">
        <nav className="space-y-2">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center w-full rounded-xl transition-all duration-200 group",
                "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
              title={collapsed ? item.name : ""}
            >
              <div className={cn(
                "flex items-center p-3 w-full",
                collapsed ? "justify-center" : "px-4"
              )}>
                <span className={cn(
                  "icon transition-all duration-200",
                  collapsed ? "text-xl" : "text-xl mr-3"
                )}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;