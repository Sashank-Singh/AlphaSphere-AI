
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Search, ExternalLink, Wifi, Zap } from 'lucide-react';
import { useRealTimeStock } from '@/hooks/useRealTimeStock';
import { useIsMobile } from '@/hooks/use-mobile';

// Local interface for Market page stocks to avoid type conflicts
interface MarketStock {
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

const fallbackLogo = 'https://via.placeholder.com/32';

// Mock data specific to this component
const mockMarketStocks: MarketStock[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 0.025, volume: 45000000, sector: 'Technology' },
  { id: '2', symbol: 'MSFT', name: 'Microsoft Corp.', price: 338.11, change: 0.018, volume: 32000000, sector: 'Technology' },
  { id: '3', symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: -0.012, volume: 28000000, sector: 'Technology' },
  { id: '4', symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 0.045, volume: 75000000, sector: 'Automotive' },
  { id: '5', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 0.067, volume: 35000000, sector: 'Technology' },
  { id: '6', symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.89, change: 0.021, volume: 42000000, sector: 'Consumer' }
];

const mockIndices: Index[] = [
  { symbol: 'SPY', name: 'S&P 500', value: 4587.44, change: 0.008 },
  { symbol: 'QQQ', name: 'NASDAQ 100', value: 388.92, change: 0.015 },
  { symbol: 'DIA', name: 'Dow Jones', value: 37248.73, change: 0.005 }
];

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stocks, setStocks] = useState<MarketStock[]>(mockMarketStocks);
  const [searchQuery, setSearchQuery] = useState('');

  // Real-time data for featured stocks
  const { data: aaplData } = useRealTimeStock('AAPL', 5000);
  const { data: tslaData } = useRealTimeStock('TSLA', 5000);
  const { data: nvdaData } = useRealTimeStock('NVDA', 5000);

  useEffect(() => {
    // Update stocks with real-time data when available
    setStocks(prevStocks => 
      prevStocks.map(stock => {
        let realTimeData = null;
        if (stock.symbol === 'AAPL') realTimeData = aaplData;
        if (stock.symbol === 'TSLA') realTimeData = tslaData;
        if (stock.symbol === 'NVDA') realTimeData = nvdaData;

        if (realTimeData) {
          return {
            ...stock,
            price: realTimeData.price,
            change: realTimeData.changePercent / 100,
            volume: realTimeData.volume
          };
        }
        return stock;
      })
    );
  }, [aaplData, tslaData, nvdaData]);

  useEffect(() => {
    // Simulate real-time updates for other stocks
    const intervalId = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => ({
          ...stock,
          price: stock.price * (1 + (Math.random() * 0.004 - 0.002)),
          change: stock.change + (Math.random() * 0.002 - 0.001),
          volume: Math.floor(stock.volume * (1 + (Math.random() * 0.1 - 0.05)))
        }))
      );
    }, 10000);

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

  const StockCard: React.FC<{ stock: MarketStock; hasRealTimeData?: boolean }> = ({ stock, hasRealTimeData }) => (
    <Card className="hover:bg-accent/5 transition-colors shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <img 
            src={stock.logo || fallbackLogo} 
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackLogo; }}
            alt={`${stock.name} logo`}
            loading="lazy"
            className="w-8 h-8 object-contain"
          />
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              {stock.symbol}
              {hasRealTimeData && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Zap className="h-2 w-2" />
                  Live
                </Badge>
              )}
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
            Vol: {(stock.volume / 1000000).toFixed(1)}M
          </p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/stocks/${stock.symbol}`)}
            className="text-xs bg-white text-black hover:bg-gray-100"
          >
            View <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`container mx-auto ${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-col md:flex-row'} items-center justify-between mb-8`}>
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
          <Badge variant="secondary" className="gap-1">
            <Wifi className="h-3 w-3" />
            Live Data
          </Badge>
        </div>
        <div className={`relative ${isMobile ? 'w-full' : 'w-full md:w-64'}`}>
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
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {filteredStocks.map((stock) => {
              const hasRealTimeData = ['AAPL', 'TSLA', 'NVDA'].includes(stock.symbol);
              return (
                <StockCard 
                  key={stock.symbol} 
                  stock={stock}
                  hasRealTimeData={hasRealTimeData}
                />
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="indices" className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
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
                  <div className="text-2xl font-bold">{formatPrice(index.value)}</div>
                  <p className={`text-xs ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatChange(index.change)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
            {/* Sector performance data placeholder */}
            <Card className="shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Sector data coming soon...</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketPage;
