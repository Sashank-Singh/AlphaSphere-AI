
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Set sidebar state based on current location
  useEffect(() => {
    const isDashboard = location.pathname === '/dashboard';
    setSidebarCollapsed(!isDashboard);
  }, [location.pathname]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSidebarMouseEnter = () => {
    if (sidebarCollapsed && !isMobile) {
      setIsHovered(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    setIsHovered(false);
  };

  // Mobile layout with sidebar overlay
  if (isMobile) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <TopBar onMenuClick={toggleSidebar} />
          <main className="pb-20">
            {children}
          </main>
          
          {/* Mobile Sidebar Overlay */}
          {!sidebarCollapsed && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={toggleSidebar}></div>
              <div className="absolute left-0 top-0 h-full">
                <Sidebar collapsed={false} onToggle={toggleSidebar} />
              </div>
            </div>
          )}
        </div>
        <BottomNavBar />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <Sidebar collapsed={sidebarCollapsed && !isHovered} onToggle={toggleSidebar} />
      </div>
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          sidebarCollapsed && !isHovered ? "ml-0" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
