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
        <main className="flex-1 space-y-4 p-3 sm:p-4 lg:p-6">
          <WelcomeHeader />

          <div className="w-full max-w-4xl mx-auto">
            <QuickActions />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <PortfolioOverview />
              <MarketIntelligence />
              <MarketAnalytics />
              
            </div>
            <div className="space-y-4">
              <MarketPulse />
              <SmartNotifications />
              <AIMarketSentiment />
            </div>
          </div>

          <MainContentTabs />
        </main>
      </Layout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
