import React, { memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LazyLoad from '@/components/ui/LazyLoad';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketPulse from '@/components/dashboard/MarketPulse';
import MainContentTabs from '@/components/dashboard/MainContentTabs';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import MarketAnalytics from '@/components/dashboard/MarketAnalytics';
import SmartNotifications from '@/components/SmartNotifications';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import AIMarketSentiment from '@/components/dashboard/AIMarketSentiment';
import PredictiveAnalytics from '@/components/dashboard/PredictiveAnalytics';
import SmartAlerts from '@/components/dashboard/SmartAlerts';

import SentimentAnalysis from '@/components/dashboard/SentimentAnalysis';


const DashboardPage: React.FC = memo(() => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  
  // Monitor dashboard performance
  usePerformanceMonitor({
    componentName: 'DashboardPage',
    enableLogging: process.env.NODE_ENV === 'development',
    threshold: 50 // Dashboard should render within 50ms
  });

  if (!user) {
    return <ProtectedRoute><div>Loading...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <main className="flex-1 space-y-4 p-3 sm:p-4 lg:p-6 pb-24 sm:pb-6">
          <WelcomeHeader />

          <div className="w-full">
            <QuickActions />
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PortfolioOverview />
            <MarketPulse />
          </div>

          <div className="w-full">
            <MarketAnalytics />
          </div>

          {/* Advanced Analytics & AI Section (Collapsible) */}
          <details className="mt-6" open={false}>
            <summary className="cursor-pointer text-primary font-semibold text-lg mb-2 p-4 bg-card border border-border rounded-lg hover:bg-accent transition-colors duration-200 flex items-center justify-between min-h-[60px] touch-manipulation select-none">
              <span>Show Advanced Analytics & AI Insights</span>
              <svg className="w-5 h-5 transition-transform duration-200 chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <LazyLoad minHeight={300} delay={100}>
                <PredictiveAnalytics />
              </LazyLoad>
              <LazyLoad minHeight={250} delay={200}>
                <MarketIntelligence />
              </LazyLoad>

              <LazyLoad minHeight={200} delay={150}>
                <SmartAlerts />
              </LazyLoad>
              
              <div className="lg:col-span-2">
                <LazyLoad minHeight={200} delay={350}>
                  <AIMarketSentiment />
                </LazyLoad>
              </div>

              <LazyLoad minHeight={400} delay={500}>
                <SentimentAnalysis />
              </LazyLoad>
            </div>
            <div>
              <LazyLoad minHeight={300} delay={600}>
                <MainContentTabs />
            </LazyLoad>
            </div>
          </details>
        </main>
      </Layout>
    </ProtectedRoute>
  );
});

DashboardPage.displayName = 'DashboardPage';

export default DashboardPage;
