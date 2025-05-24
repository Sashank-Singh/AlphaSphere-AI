
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Brain,
  Wifi,
  Smartphone
} from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency, cn } from '@/lib/utils';
import StockCard from '@/components/StockCard';
import TVTimelineWidget from '@/components/TVTimelineWidget';
import MobileRealTimeDashboard from '@/components/MobileRealTimeDashboard';
import { useRealTimeStock } from '@/hooks/useRealTimeStock';
import { mockIndices, mockStocks, refreshStockPrices } from '@/data/mockData';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stocks, setStocks] = useState(mockStocks);
  
  // Real-time market data
  const { data: spyData } = useRealTimeStock('SPY', 5000);
  const { data: qqqData } = useRealTimeStock('QQQ', 5000);
  const { data: diaData } = useRealTimeStock('DIA', 5000);
  
  useEffect(() => {
    // Refresh stock prices periodically
    const intervalId = setInterval(() => {
      setStocks(refreshStockPrices());
    }, 15000); // every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate watchlist (in a real app this would be user-specific)
  const watchlist = stocks.slice(0, 4);

  const realTimeIndices = [
    { ...mockIndices[0], data: spyData },
    { ...mockIndices[1], data: qqqData },
    { ...mockIndices[2], data: diaData }
  ];

  return (
    <div className={`pb-20 w-full ${isMobile ? 'px-4' : 'px-8'}`}>
      {/* Header */}
      <div className={`py-6 flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-start ${isMobile ? '' : 'sm:items-center'} gap-4 border-b border-border/40`}>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-medium">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className={`${isMobile ? 'text-xl' : 'text-xl'} font-bold tracking-tight`}>
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Your portfolio is waiting
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isMobile && (
            <Badge variant="secondary" className="gap-1">
              <Smartphone className="h-3 w-3" />
              Mobile
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-primary/5"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-primary/5"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className={`py-6 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-12'} gap-6`}>
        {/* Left Column */}
        <div className={`${isMobile ? '' : 'col-span-8'} space-y-6`}>
          {/* Portfolio Summary */}
          <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardContent className="p-6">
              <div className="mb-1 text-sm text-muted-foreground font-medium">
                Portfolio Value
              </div>
              <div className="text-3xl font-bold tracking-tight mb-6">
                {formatCurrency(portfolio.totalValue)}
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground font-medium">
                    Cash Available
                  </div>
                  <div className="text-lg font-semibold tracking-tight">
                    {formatCurrency(portfolio.cash)}
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate('/portfolio')}
                  className="group"
                >
                  View Portfolio
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Real-Time Market Overview */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold tracking-tight">Market Overview</h2>
              <Badge variant="secondary" className="gap-1">
                <Wifi className="h-3 w-3" />
                Live
              </Badge>
            </div>
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-3`}>
              {realTimeIndices.map((index, i) => {
                const realTimeData = index.data;
                const displayPrice = realTimeData?.price || index.price;
                const displayChange = realTimeData?.changePercent || index.change;
                
                return (
                  <Card key={index.symbol} className="overflow-hidden hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium truncate">{index.symbol}</div>
                        {realTimeData && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Zap className="h-2 w-2" />
                            Live
                          </Badge>
                        )}
                      </div>
                      <div className="text-base font-bold mt-1.5">{formatCurrency(displayPrice)}</div>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-medium mt-1.5 px-1.5 py-0.5 rounded-full w-fit",
                        displayChange >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {displayChange >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {(displayChange >= 0 ? '+' : '')}{(displayChange * 100).toFixed(2)}%
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Mobile Real-Time Dashboard */}
          {isMobile && (
            <MobileRealTimeDashboard symbols={['AAPL', 'TSLA', 'NVDA', 'MSFT']} />
          )}

          {/* Watchlist & Trending */}
          <div>
            <Tabs defaultValue="watchlist">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="p-1 bg-muted/50">
                  <TabsTrigger 
                    value="watchlist"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Watchlist
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending"
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    Trending
                  </TabsTrigger>
                </TabsList>
                
                <Button variant="outline" size="sm" className="h-9 px-3 group">
                  <Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90" />
                  Add
                </Button>
              </div>
              
              <TabsContent value="watchlist">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  {watchlist.map(stock => (
                    <StockCard key={stock.id} stock={stock} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="trending">
                <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-3`}>
                  {stocks.slice(2, 6).map(stock => (
                    <StockCard key={stock.id} stock={stock} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column - Hide on mobile or make it collapsible */}
        {!isMobile && (
          <div className="col-span-4 space-y-6">
            {/* AI Insights Quick Access */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">Market Sentiment</span>
                    <Badge variant="default">Bullish</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <span className="text-sm">AI Confidence</span>
                    <span className="text-sm font-semibold">85%</span>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/analytics')}>
                    <Brain className="h-4 w-4 mr-2" />
                    View All Insights
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* TradingView News Widget */}
            <Card className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Market News</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TVTimelineWidget height="400" isMarketNews={true} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
