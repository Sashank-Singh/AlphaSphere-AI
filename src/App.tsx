
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
import { AuthProvider } from '@/context/AuthContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import ImprovedStockDetailPage from '@/pages/ImprovedStockDetailPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/stocks/:symbol" element={<ImprovedStockDetailPage />} />
            <Route path="/stocks/:ticker" element={<ImprovedStockDetailPage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/trading/:symbol" element={<TradingPage />} />
            <Route path="/options" element={<OptionsPage />} />
            <Route path="/options/:symbol" element={<OptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </Router>
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default App;
