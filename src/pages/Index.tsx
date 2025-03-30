
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNavBar from '@/components/BottomNavBar';
import AuthPage from '@/pages/AuthPage';
import HomePage from '@/pages/HomePage';
import StockDetailPage from '@/pages/StockDetailPage';
import PortfolioPage from '@/pages/PortfolioPage';
import SearchPage from '@/pages/SearchPage';
import SettingsPage from '@/pages/SettingsPage';

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <div className="bg-background text-foreground min-h-screen">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
                <BottomNavBar />
              </ProtectedRoute>
            } />
            
            <Route path="/stock/:ticker" element={
              <ProtectedRoute>
                <StockDetailPage />
                <BottomNavBar />
              </ProtectedRoute>
            } />
            
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <PortfolioPage />
                <BottomNavBar />
              </ProtectedRoute>
            } />
            
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchPage />
                <BottomNavBar />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
                <BottomNavBar />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </PortfolioProvider>
    </AuthProvider>
  );
};

export default Index;
