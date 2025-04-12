import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Search, ExternalLink } from 'lucide-react';
import { mockStocks, mockIndices, refreshStockPrices } from '@/data/mockData';

interface Stock {
  id?: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  logo?: string;
  sector?: string;
}

interface Index {
  symbol: string;
  name: string;
  value: number;
  change: number;
}

const fallbackLogo = 'https://via.placeholder.com/32'; // Fallback logo image URL

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStocks(refreshStockPrices());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatChange = (change: number) => {
    return (change >= 0 ? '+' : '') + (change * 100).toFixed(2) + '%';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">Market Overview</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="stocks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
        </TabsList>

        <TabsContent value="stocks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStocks.map((stock) => (
              <Card key={stock.symbol} className="hover:bg-accent/5 transition-colors shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <img 
                      src={stock.logo} 
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackLogo; }}
                      alt={`${stock.name} logo`}
                      loading="lazy"
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {stock.symbol}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <div className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {stock.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-2xl font-bold">{formatPrice(stock.price)}</div>
                    <p className={`text-sm font-medium ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {formatChange(stock.change)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Vol: {stock.volume.toLocaleString()}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                      className="text-xs bg-white text-black"
                    >
                      View <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="indices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockIndices.map((index) => (
              <Card key={index.symbol} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {index.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {index.symbol}
                    </p>
                  </div>
                  <div className={index.change >= 0 ? "text-green-500" : "text-red-500"}>
                    {index.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice((index as any).value)}</div>
                  <p className={`text-xs ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatChange(index.change)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Add sector performance data here */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketPage;
