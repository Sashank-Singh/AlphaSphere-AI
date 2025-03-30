
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Bell, Search, TrendingUp, Plus } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import StockCard from '@/components/StockCard';
import NewsCard from '@/components/NewsCard';
import { mockIndices, mockStocks, mockNews, refreshStockPrices } from '@/data/mockData';

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
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-2">
            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold">Welcome back, {user?.name.split(' ')[0]}</h1>
            <p className="text-sm text-muted-foreground">Your portfolio is waiting</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/search')}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <Card className="mx-4 mb-4">
        <CardContent className="p-4">
          <div className="mb-1 text-sm text-muted-foreground">Portfolio Value</div>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          
          <div className="flex justify-between items-center mt-4">
            <div>
              <div className="text-sm text-muted-foreground">Cash Available</div>
              <div className="font-medium">{formatCurrency(portfolio.cash)}</div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/portfolio')}
            >
              View Portfolio
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Market Overview */}
      <div className="px-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">Market Overview</h2>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {mockIndices.map(index => (
            <Card key={index.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="text-xs font-medium truncate">{index.ticker}</div>
                <div className="text-sm font-bold mt-1">{formatCurrency(index.price)}</div>
                <div className={`text-xs mt-1 ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(index.change >= 0 ? '+' : '')}{(index.change * 100).toFixed(2)}%
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Watchlist & Trending */}
      <div className="px-4 mb-4">
        <Tabs defaultValue="watchlist">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
            </TabsList>
            
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="h-4 w-4 mr-1" />
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
      
      <Separator className="my-4" />
      
      {/* Market News */}
      <div className="px-4">
        <h2 className="text-lg font-bold mb-4">Market News</h2>
        
        {mockNews.map(news => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
