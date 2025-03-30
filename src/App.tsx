
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <PortfolioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <>
                    <HomePage />
                    <BottomNavBar />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/stock/:ticker" element={
                <ProtectedRoute>
                  <>
                    <StockDetailPage />
                    <BottomNavBar />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/portfolio" element={
                <ProtectedRoute>
                  <>
                    <PortfolioPage />
                    <BottomNavBar />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/search" element={
                <ProtectedRoute>
                  <>
                    <SearchPage />
                    <BottomNavBar />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <>
                    <SettingsPage />
                    <BottomNavBar />
                  </>
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PortfolioProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
