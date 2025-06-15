
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketPulse from '@/components/dashboard/MarketPulse';
import MainContentTabs from '@/components/dashboard/MainContentTabs';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import MarketAnalytics from '@/components/dashboard/MarketAnalytics';
import SmartNotifications from '@/components/SmartNotifications';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import AIMarketSentiment from '@/components/dashboard/AIMarketSentiment';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();

  if (!user) {
    return <ProtectedRoute><div>Loading...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          {/* Welcome Header */}
          <WelcomeHeader />

          {/* Quick Actions Section - Full Width Centered */}
          <div className="w-full max-w-4xl mx-auto">
            <QuickActions />
          </div>

          {/* Portfolio Overview */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <PortfolioOverview />
            </div>
            <div className="space-y-6">
              <MarketPulse />
            </div>
          </div>

          {/* Market Intelligence */}
          <MarketIntelligence />

          {/* Main Content */}
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-4">
            <div className="xl:col-span-3 space-y-6">
              <MainContentTabs />
            </div>
            <div className="space-y-6">
              <AIMarketSentiment />
            </div>
          </div>

          {/* Bottom sections */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <MarketAnalytics />
            <div className="space-y-6">
              <SmartNotifications />
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
