
import React from 'react';
import Layout from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileRealTimeDashboard from '@/components/MobileRealTimeDashboard';
import ImprovedSphereAI from '@/components/ImprovedSphereAI';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketPulse from '@/components/dashboard/MarketPulse';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import MarketAnalytics from '@/components/dashboard/MarketAnalytics';
import MainContentTabs from '@/components/dashboard/MainContentTabs';

const DashboardPage: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Header */}
        <WelcomeHeader />

        {/* Quick Actions */}
        <QuickActions />

        {/* Mobile Real-Time Dashboard */}
        {isMobile && (
          <MobileRealTimeDashboard symbols={['AAPL', 'TSLA', 'NVDA', 'MSFT']} />
        )}

        {/* Portfolio Overview & Market Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PortfolioOverview />
          <MarketPulse />
        </div>

        {/* Market Intelligence Section */}
        <MarketIntelligence />

        {/* Market Analytics Section */}
        <MarketAnalytics />

        {/* Main Content Tabs */}
        <MainContentTabs />

        {/* Improved Sphere AI */}
        <div>
          <ImprovedSphereAI />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
