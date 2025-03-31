import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Bell, Search, TrendingUp, TrendingDown, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, cn } from '@/lib/utils';
import StockCard from '@/components/StockCard';
import TVTimelineWidget from '@/components/TVTimelineWidget';
import { mockIndices, mockStocks, refreshStockPrices } from '@/data/mockData';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(mockStocks);
  
  useEffect(() => {
    // Refresh stock prices periodically
    const intervalId = setInterval(() => {
      setStocks(refreshStockPrices());
    }, 15000); // every 15 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Simulate watchlist (in a real app this would be user-specific)
  const watchlist = stocks.slice(0, 4);

  return (
    <div className="pb-20 w-full">
      {/* Header */}
      <div className="px-8 py-6 flex justify-between items-center border-b border-border/40">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarFallback className="bg-primary/5 text-primary font-medium">
              {user?.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              Your portfolio is waiting
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
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
      
      <div className="px-8 py-6 grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-8 space-y-6">
          {/* Portfolio Summary */}
          <Card className="overflow-hidden border-primary/10 hover:border-primary/20 transition-colors">
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

          {/* Market Overview */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold tracking-tight">Market Overview</h2>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {mockIndices.map(index => (
                <Card key={index.symbol} className="overflow-hidden hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="text-sm font-medium truncate">{index.symbol}</div>
                    <div className="text-base font-bold mt-1.5">{formatCurrency(index.price)}</div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium mt-1.5 px-1.5 py-0.5 rounded-full w-fit",
                      index.change >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {index.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {(index.change >= 0 ? '+' : '')}{(index.change * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

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
                <div className="grid grid-cols-2 gap-3">
                  {watchlist.map(stock => (
                    <StockCard key={stock.id} stock={stock} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="trending">
                <div className="grid grid-cols-2 gap-3">
                  {stocks.slice(2, 6).map(stock => (
                    <StockCard key={stock.id} stock={stock} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-6">
          {/* TradingView News Widget */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Market News</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <TVTimelineWidget height="800" isMarketNews={true} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
