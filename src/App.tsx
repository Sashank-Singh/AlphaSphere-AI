
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
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
          </Routes>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;
