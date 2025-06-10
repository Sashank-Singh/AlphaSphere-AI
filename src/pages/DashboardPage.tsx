import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity,
  Smartphone,
  Brain,
  Users,
  Bell,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  LineChart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePortfolio } from '@/context/PortfolioContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/lib/utils';
import ImprovedSphereAI from '@/components/ImprovedSphereAI';
import { useRealTimeStock } from '@/hooks/useRealTimeStock';
import MarketSentimentCard from '@/components/MarketSentimentCard';
import SectorPerformanceCard from '@/components/SectorPerformanceCard';
import TopMoversCard from '@/components/TopMoversCard';
import SectorHeatmapCard from '@/components/SectorHeatmapCard';
import CommunityPage from '@/pages/CommunityPage';
import Layout from '@/components/Layout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Real-time data for popular stocks
  const { data: aaplData } = useRealTimeStock('AAPL', 5000);
  const { data: tslaData } = useRealTimeStock('TSLA', 5000);
  const { data: nvdaData } = useRealTimeStock('NVDA', 5000);
  
  const [marketStats, setMarketStats] = useState({
    spyChange: 0.85,
    vixLevel: 18.4,
    cryptoSentiment: 'bullish',
    activeTraders: 15420
  });

  // Update market stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketStats(prev => ({
        ...prev,
        spyChange: prev.spyChange + (Math.random() - 0.5) * 0.1,
        vixLevel: Math.max(10, Math.min(30, prev.vixLevel + (Math.random() - 0.5) * 0.5)),
        activeTraders: prev.activeTraders + Math.floor((Math.random() - 0.5) * 100)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { label: 'Quick Trade', icon: Zap, action: () => navigate('/trading'), color: 'bg-blue-500' },
    { label: 'AI Insights', icon: Brain, action: () => {}, color: 'bg-green-500' },
    { label: 'Options', icon: Target, action: () => navigate('/options'), color: 'bg-amber-500' },
    { label: 'Analytics', icon: BarChart3, action: () => navigate('/analytics'), color: 'bg-cyan-500' }
  ];

  const portfolioPositions = portfolio.positions.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-6 p-4 pb-20 bg-black min-h-screen">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your portfolio today
            </p>
          </div>
          
          {isMobile && (
            <Badge variant="secondary" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile Optimized
            </Badge>
          )}
        </div>

        {/* Quick Actions - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 flex-col gap-2 hover:scale-105 transition-transform"
              onClick={action.action}
            >
              <div className={`p-2 rounded-full ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Mobile Real-Time Dashboard */}
        {isMobile && (
          <MobileRealTimeDashboard symbols={['AAPL', 'TSLA', 'NVDA', 'MSFT']} />
        )}

        {/* Portfolio Overview & Market Pulse */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-black text-white border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Portfolio Overview
                <Badge variant="secondary" className="text-black">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
                  <div className="flex items-center gap-2 text-green-300">
                    <TrendingUp className="h-4 w-4" />
                    <span>+2.4% (+${((portfolio.totalValue * 0.024)).toFixed(2)}) today</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-80">Available Cash</div>
                    <div className="text-xl font-semibold">{formatCurrency(portfolio.cash)}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Positions</div>
                    <div className="text-xl font-semibold">{portfolio.positions.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Pulse */}
          <Card className="bg-black text-white border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Pulse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">S&P 500</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-semibold">
                    +{marketStats.spyChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">VIX</span>
                <span className="font-semibold">{marketStats.vixLevel.toFixed(1)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Traders</span>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="font-semibold">{marketStats.activeTraders.toLocaleString()}</span>
                </div>
              </div>
              
              <Button className="w-full mt-4" onClick={() => navigate('/market')}>
                View Full Market
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Market Intelligence Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Market Intelligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MarketSentimentCard className="bg-black text-white border border-gray-800" />
            <SectorPerformanceCard className="bg-black text-white border border-gray-800" />
            <TopMoversCard className="bg-black text-white border border-gray-800" />
          </div>
        </div>

        {/* Market Analytics Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Analytics
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectorHeatmapCard className="bg-black text-white border border-gray-800" />
            <Card className="bg-black text-white border border-gray-800">
              <CardHeader>
                <CardTitle>Market News</CardTitle>
                <p className="text-sm text-muted-foreground">Latest market updates</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-semibold text-sm">Fed Maintains Interest Rates</h4>
                    <p className="text-xs text-muted-foreground mt-1">Markets react positively to stable monetary policy...</p>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-semibold text-sm">Tech Earnings Beat Expectations</h4>
                    <p className="text-xs text-muted-foreground mt-1">Major tech companies report strong quarterly results...</p>
                    <span className="text-xs text-muted-foreground">4 hours ago</span>
                  </div>
                  <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <h4 className="font-semibold text-sm">Oil Prices Surge on Supply Concerns</h4>
                    <p className="text-xs text-muted-foreground mt-1">Energy sector sees significant gains amid geopolitical tensions...</p>
                    <span className="text-xs text-muted-foreground">6 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="positions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{position.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{position.name}</p>
                      </div>
                      <Badge variant={position.currentPrice > position.averagePrice ? "default" : "destructive"}>
                        {position.quantity} shares
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Current</span>
                        <span className="font-semibold">${position.currentPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Cost</span>
                        <span>${position.averagePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P&L</span>
                        <span className={position.currentPrice > position.averagePrice ? 'text-green-500' : 'text-red-500'}>
                          ${((position.currentPrice - position.averagePrice) * position.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => navigate(`/stocks/${position.symbol}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {portfolio.positions.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No positions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your portfolio by making your first trade
                  </p>
                  <Button onClick={() => navigate('/trading')}>
                    Start Trading
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ai-insights">
            <ImprovedSphereAI />
          </TabsContent>

          <TabsContent value="community">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Trading Community</h3>
              </div>
              <CommunityPage />
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            <ImprovedSphereAI />
          </TabsContent>
        </Tabs>

        {/* Improved Sphere AI */}
        <ImprovedSphereAI />
      </div>
    </Layout>
  );
};

export default DashboardPage;
