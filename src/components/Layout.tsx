
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

import { Toaster } from '@/components/ui/toaster';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  
  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search functionality
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Show sidebar on desktop, hide on mobile */}
      <div className={cn(
        "transition-all duration-300",
        isMobile ? "hidden" : "block"
      )}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
      
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden",
        isMobile ? "pb-16" : "" // Add padding for bottom nav on mobile
      )}>
        <TopBar onSearch={handleSearch} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Show bottom nav bar only on mobile */}
        {isMobile && <BottomNavBar />}
        
        {/* Add Toaster component for notifications */}
        <Toaster />
      </div>
    </div>
  );
};

export default Layout;
