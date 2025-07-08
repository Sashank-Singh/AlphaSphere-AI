import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';

import MarketPage from '@/pages/MarketPage';
import PortfolioPage from '@/pages/PortfolioPage';
import OptionsPage from '@/pages/OptionsPage';
import SettingsPage from '@/pages/SettingsPage';
import CommunityPage from '@/pages/CommunityPage';
import TradingPage from '@/pages/TradingPage';
import AuthPage from '@/pages/AuthPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SearchPage from '@/pages/SearchPage';
import { AuthProvider } from '@/context/AuthContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import ImprovedStockDetailPage from '@/pages/ImprovedStockDetailPage';
import Layout from '@/components/Layout';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { Loader2 } from 'lucide-react';
import LearnScreen from '@/pages/LearnScreen';
import LearnDetailPage from '@/pages/LearnDetailPage';

const AppContent: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/market" element={
          <Layout>
            <MarketPage />
          </Layout>
        } />
        <Route path="/portfolio" element={
          <Layout>
            <PortfolioPage />
          </Layout>
        } />
        <Route path="/stocks/:symbol" element={
          <Layout>
            <ImprovedStockDetailPage />
          </Layout>
        } />
        <Route path="/stocks/:ticker" element={
          <Layout>
            <ImprovedStockDetailPage />
          </Layout>
        } />
        <Route path="/trading" element={
          <Layout>
            <TradingPage />
          </Layout>
        } />
        <Route path="/trading/:symbol" element={
          <Layout>
            <TradingPage />
          </Layout>
        } />
        <Route path="/options" element={
          <Layout>
            <OptionsPage />
          </Layout>
        } />
        <Route path="/options/:symbol" element={
          <Layout>
            <OptionsPage />
          </Layout>
        } />
        <Route path="/analytics" element={
          <Layout>
            <AnalyticsPage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
        <Route path="/community" element={
          <Layout>
            <CommunityPage />
          </Layout>
        } />
        <Route path="/learn" element={
          <Layout>
            <LearnScreen />
          </Layout>
        } />
        <Route path="/learn/:moduleId" element={
          <Layout>
            <LearnDetailPage />
          </Layout>
        } />
      </Routes>
      <Toaster />
    </Router>
  );
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PortfolioProvider>
          <InitializedApp />
        </PortfolioProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

const InitializedApp: React.FC = () => {
  const { isLoading: isAuthLoading } = useAuth();
  const { isLoading: isPortfolioLoading } = usePortfolio();

  if (isAuthLoading || isPortfolioLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <AppContent />;
}

export default App;
