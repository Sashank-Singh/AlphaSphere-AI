import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart2, 
  Search, 
  Star, 
  Activity, 
  Globe, 
  Zap,
  ArrowUp,
  ArrowDown,
  Eye,
  Filter,
  RefreshCw
} from 'lucide-react';

// Enhanced mock data for demonstration
const mockMarketOverview = {
  sp500: { value: 5234.18, change: 23.45, changePercent: 0.45 },
  nasdaq: { value: 16345.67, change: -12.34, changePercent: -0.08 },
  dow: { value: 39156.78, change: 156.89, changePercent: 0.40 },
  vix: { value: 18.24, change: -0.67, changePercent: -3.54 },
  sentiment: 'bullish',
  volume: '12.4B',
  activeTraders: 24680
};

const mockTrendingStocks = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.43, change: 42.17, changePercent: 5.06, volume: '45.2M', isHot: true },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 198.87, change: -8.94, changePercent: -4.30, volume: '38.1M', isHot: true },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 3.42, changePercent: 1.84, volume: '52.3M', isHot: false },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 421.56, change: 7.89, changePercent: 1.91, volume: '28.7M', isHot: false },
];

const mockTopStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.25, change: 3.42, changePercent: 1.84, volume: 52300000, marketCap: '2.91T' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 421.56, change: 7.89, changePercent: 1.91, volume: 28700000, marketCap: '3.12T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.32, change: 15.67, changePercent: 0.55, volume: 18900000, marketCap: '1.78T' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3654.21, change: 23.45, changePercent: 0.65, volume: 22100000, marketCap: '1.52T' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 198.87, change: -8.94, changePercent: -4.30, volume: 38100000, marketCap: '635B' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.43, change: 42.17, changePercent: 5.06, volume: 45200000, marketCap: '2.15T' },
  { symbol: 'META', name: 'Meta Platforms', price: 487.23, change: 12.67, changePercent: 2.67, volume: 19800000, marketCap: '1.23T' },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 598.45, change: -5.23, changePercent: -0.87, volume: 8900000, marketCap: '265B' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 156.78, change: 8.45, changePercent: 5.70, volume: 32400000, marketCap: '254B' },
  { symbol: 'CRM', name: 'Salesforce Inc.', price: 267.89, change: 4.56, changePercent: 1.73, volume: 12300000, marketCap: '263B' },
];

const mockIndices = [
  { symbol: 'SPY', name: 'S&P 500 ETF', value: 523.12, change: 2.34, changePercent: 0.45, volume: '89.2M' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF', value: 389.67, change: -1.23, changePercent: -0.31, volume: '67.4M' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', value: 198.45, change: 0.89, changePercent: 0.45, volume: '45.1M' },
  { symbol: 'VTI', name: 'Total Stock Market ETF', value: 267.34, change: 1.67, changePercent: 0.63, volume: '23.8M' },
  { symbol: 'EFA', name: 'EAFE ETF', value: 78.92, change: -0.34, changePercent: -0.43, volume: '18.7M' },
];

const mockSectors = [
  { name: 'Technology', change: 2.1, price: 3289, companies: 67, leader: 'NVDA' },
  { name: 'Healthcare', change: -0.3, price: 2134, companies: 45, leader: 'UNH' },
  { name: 'Financials', change: 1.8, price: 1876, companies: 52, leader: 'JPM' },
  { name: 'Consumer Discretionary', change: 0.9, price: 1534, companies: 38, leader: 'AMZN' },
  { name: 'Communication Services', change: 1.4, price: 1298, companies: 23, leader: 'META' },
  { name: 'Industrials', change: 0.6, price: 1187, companies: 41, leader: 'CAT' },
  { name: 'Energy', change: -1.2, price: 956, companies: 34, leader: 'XOM' },
  { name: 'Consumer Staples', change: 0.2, price: 834, companies: 29, leader: 'PG' },
  { name: 'Utilities', change: -0.5, price: 745, companies: 31, leader: 'NEE' },
  { name: 'Real Estate', change: 0.1, price: 678, companies: 26, leader: 'PLD' },
  { name: 'Materials', change: -0.7, price: 567, companies: 22, leader: 'LIN' },
];

const formatChange = (change: number, showSign: boolean = true) => (
  <span className={change >= 0 ? 'text-profit' : 'text-loss'}>
    {showSign && change >= 0 ? '+' : ''}{change.toFixed(2)}
  </span>
);

const formatPercent = (percent: number) => (
  <span className={percent >= 0 ? 'text-profit' : 'text-loss'}>
    {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
  </span>
);

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  const [marketOverview, setMarketOverview] = useState(mockMarketOverview);
  const [trendingStocks, setTrendingStocks] = useState(mockTrendingStocks);
  const [stocks, setStocks] = useState(mockTopStocks);
  const [indices, setIndices] = useState(mockIndices);
  const [sectors, setSectors] = useState(mockSectors);
  const [tab, setTab] = useState<'stocks' | 'indices' | 'sectors'>('stocks'); // Changed default to stocks
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      // Update market overview
      setMarketOverview(prev => ({
        ...prev,
        sp500: { ...prev.sp500, value: prev.sp500.value + (Math.random() - 0.5) * 2 },
        nasdaq: { ...prev.nasdaq, value: prev.nasdaq.value + (Math.random() - 0.5) * 10 },
        dow: { ...prev.dow, value: prev.dow.value + (Math.random() - 0.5) * 20 },
        vix: { ...prev.vix, value: Math.max(10, Math.min(40, prev.vix.value + (Math.random() - 0.5) * 0.5)) },
      }));

      // Update stocks
      setStocks(stocks => stocks.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 5,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
      })));

      // Update trending stocks
      setTrendingStocks(trending => trending.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 5,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
      })));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-8">
        
        {/* Market Overview Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                Market Overview
              </h1>
              <p className="text-muted-foreground mt-2">Real-time market data and analysis</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="glass-card"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Key Market Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">S&P 500</p>
                    <p className="text-2xl font-bold">{marketOverview.sp500.value.toFixed(2)}</p>
                    <p className="text-sm">{formatPercent(marketOverview.sp500.changePercent)}</p>
                  </div>
                  <BarChart2 className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">NASDAQ</p>
                    <p className="text-2xl font-bold">{marketOverview.nasdaq.value.toFixed(2)}</p>
                    <p className="text-sm">{formatPercent(marketOverview.nasdaq.changePercent)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">VIX</p>
                    <p className="text-2xl font-bold">{marketOverview.vix.value.toFixed(2)}</p>
                    <p className="text-sm">{formatPercent(marketOverview.vix.changePercent)}</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-2xl font-bold">{marketOverview.volume}</p>
                    <p className="text-sm text-green-400">Active</p>
                  </div>
                  <Globe className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Stocks Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingStocks.map(stock => (
                  <div
                    key={stock.symbol}
                    className="p-4 rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 hover:border-primary/50 transition-all cursor-pointer hover-scale"
                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{stock.symbol}</span>
                          {stock.isHot && <Badge variant="destructive" className="text-xs">HOT</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                      </div>
                      {stock.changePercent >= 0 ? (
                        <ArrowUp className="h-4 w-4 text-profit" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-loss" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-semibold">${stock.price.toFixed(2)}</p>
                      <p className="text-sm">{formatPercent(stock.changePercent)}</p>
                      <p className="text-xs text-muted-foreground">Vol: {stock.volume}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                tab === 'stocks' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
              onClick={() => setTab('stocks')}
            >
              <TrendingUp className="h-4 w-4 mr-2 inline" />
              Stocks
            </button>
          <button
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                tab === 'indices' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
            onClick={() => setTab('indices')}
          >
              <BarChart2 className="h-4 w-4 mr-2 inline" />
            Indices
          </button>
          <button
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                tab === 'sectors' 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
            onClick={() => setTab('sectors')}
          >
              <Activity className="h-4 w-4 mr-2 inline" />
            Sectors
          </button>
          </div>

          {tab === 'stocks' && (
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border"
                />
              </div>
              <Button variant="outline" size="icon" className="border-border">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {tab === 'stocks' && (
            <Card className="glass-card">
                <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                    Top Stocks
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {filteredStocks.map(stock => (
                    <div
                      key={stock.symbol}
                      className="p-4 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 hover:border-primary/50 transition-all cursor-pointer hover-scale group"
                      onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                              {stock.symbol}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                          </div>
                          <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-400 transition-colors" />
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-2xl font-bold">${stock.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            {formatChange(stock.change)}
                            {formatPercent(stock.changePercent)}
                          </div>
                        </div>
                        
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span>{(stock.volume / 1_000_000).toFixed(1)}M</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Cap:</span>
                            <span>{stock.marketCap}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
        )}

          {tab === 'indices' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-purple-400" />
                  Market Indices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {indices.map(index => (
                    <div
                      key={index.symbol}
                      className="p-6 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 hover:border-primary/50 transition-all hover-scale"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg">{index.symbol}</h3>
                          <BarChart2 className="h-5 w-5 text-blue-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">{index.name}</p>
                        <div className="space-y-2">
                          <p className="text-3xl font-bold">${index.value.toFixed(2)}</p>
                          <div className="flex items-center gap-2">
                            {formatChange(index.change)}
                            {formatPercent(index.changePercent)}
                          </div>
                          <p className="text-xs text-muted-foreground">Volume: {index.volume}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        )}

          {tab === 'sectors' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  Sector Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectors.map(sector => (
                    <div
                      key={sector.name}
                      className="p-4 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 hover:border-primary/50 transition-all hover-scale"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{sector.name}</h3>
                          {sector.change >= 0 ? (
                            <ArrowUp className="h-4 w-4 text-profit" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-loss" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {formatPercent(sector.change)}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Index Value:</span>
                              <span>${sector.price.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Companies:</span>
                              <span>{sector.companies}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Leader:</span>
                              <span className="font-medium">{sector.leader}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          </div>
      </div>
    </div>
  );
};

export default MarketPage;
