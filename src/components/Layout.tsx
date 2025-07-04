
import React, { useState, useEffect, createContext, useContext } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavBar from './BottomNavBar';

import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface LayoutContextType {
  isMobile: boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  collapsedSections: Record<string, boolean>;
  toggleSection: (sectionId: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a Layout component');
  }
  return context;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
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

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  const layoutContextValue: LayoutContextType = {
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
    collapsedSections,
    toggleSection,
  };

  return (
    <LayoutContext.Provider value={layoutContextValue}>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className={cn(
          "transition-all duration-300",
          isMobile ? "hidden" : "block"
        )}>
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        
        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileSidebar && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowMobileSidebar(false)}
            />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-background z-50 transform transition-transform duration-300">
              <Sidebar
                collapsed={false}
                onToggle={() => setShowMobileSidebar(false)}
              />
            </div>
          </>
        )}
        
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden",
            isMobile ? "pb-16 safe-bottom" : ""
          )}
        >
          <TopBar 
            onSearch={handleSearch}
            onMenuClick={isMobile ? toggleMobileSidebar : undefined}
          />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
          {/* Show bottom nav bar only on mobile */}
          {isMobile && <BottomNavBar />}
          
          {/* Add Toaster component for notifications */}
          <Toaster />
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
