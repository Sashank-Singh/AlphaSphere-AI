import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PortfolioOverview from '@/components/dashboard/PortfolioOverview';
import MarketPulse from '@/components/dashboard/MarketPulse';
import MarketIntelligence from '@/components/dashboard/MarketIntelligence';
import MarketAnalytics from '@/components/dashboard/MarketAnalytics';
import SmartAlerts from '@/components/dashboard/SmartAlerts';
import QuickActions from '@/components/dashboard/QuickActions';
import TopMovers from '@/components/dashboard/TopMovers';
import AIPortfolioOptimizer from '@/components/dashboard/AIPortfolioOptimizer';


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();

  if (!user) {
    return <ProtectedRoute><div>Loading...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-main mb-2">
              Welcome, {user.name || user.email || 'User'}
            </h1>
            <p className="text-secondary">Here's your market overview and portfolio insights</p>
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2 spans */}
            <div className="col-span-1 lg:col-span-2 space-y-6">
              {/* Top Row - Portfolio and Market Intelligence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PortfolioOverview />
                <MarketIntelligence />
              </div>
              
              {/* Bottom Row - Top Movers and Market Analytics */}
              <TopMovers />
              <MarketAnalytics />
            </div>
            
            {/* Right Column - 1 span */}
            <div className="col-span-1 space-y-6">
              <MarketPulse />
              <SmartAlerts />
              <AIPortfolioOptimizer />
              
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="fixed bottom-0 left-64 right-0 bg-card border-t border-card flex justify-around p-2 lg:hidden">
            <button className="flex flex-col items-center text-main text-xs">
              <span className="icon">home</span>
              <span>Positions</span>
            </button>
            <button className="flex flex-col items-center text-secondary text-xs">
              <span className="icon">insights</span>
              <span>Sphere AI Insights</span>
            </button>
            <button className="flex flex-col items-center text-secondary text-xs">
              <span className="icon">people</span>
              <span>Community</span>
            </button>
            <button className="flex flex-col items-center text-secondary text-xs">
              <span className="icon">notifications</span>
              <span>Alerts</span>
            </button>
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
};

export default DashboardPage;
