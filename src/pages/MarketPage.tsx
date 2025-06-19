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
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';
import { stockDataService, StockQuote } from '@/lib/stockDataService';

// Market overview symbols for real-time data
const MARKET_OVERVIEW_SYMBOLS = {
  sp500: 'SPY',
  nasdaq: 'QQQ', 
  dow: 'DIA',
  vix: '^VIX'
};

// Initial market overview data
const initialMarketOverview = {
  sp500: { value: 0, change: 0, changePercent: 0 },
  nasdaq: { value: 0, change: 0, changePercent: 0 },
  dow: { value: 0, change: 0, changePercent: 0 },
  vix: { value: 0, change: 0, changePercent: 0 },
  sentiment: 'neutral' as 'bullish' | 'bearish' | 'neutral',
  volume: '0',
  activeTraders: 0,
  lastUpdated: new Date()
};

// Company names mapping for trending stocks
const TRENDING_COMPANY_NAMES = {
  'NVDA': 'NVIDIA Corp.',
  'TSLA': 'Tesla, Inc.',
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corp.'
};

// Company names and market cap mapping for top stocks
const TOP_STOCKS_INFO = {
  'AAPL': { name: 'Apple Inc.', marketCap: '2.91T' },
  'MSFT': { name: 'Microsoft Corp.', marketCap: '3.12T' },
  'GOOGL': { name: 'Alphabet Inc.', marketCap: '1.78T' },
  'AMZN': { name: 'Amazon.com Inc.', marketCap: '1.52T' },
  'TSLA': { name: 'Tesla, Inc.', marketCap: '635B' },
  'NVDA': { name: 'NVIDIA Corp.', marketCap: '2.15T' },
  'META': { name: 'Meta Platforms', marketCap: '1.23T' },
  'NFLX': { name: 'Netflix Inc.', marketCap: '265B' },
  'AMD': { name: 'Advanced Micro Devices', marketCap: '254B' },
  'CRM': { name: 'Salesforce Inc.', marketCap: '263B' }
};

// Index symbols for real-time data
const INDEX_SYMBOLS = ['SPY', 'QQQ', 'IWM', 'VTI', 'EFA', 'DIA', '^VIX'];

const indexNames = {
  'SPY': 'S&P 500 ETF',
  'QQQ': 'NASDAQ 100 ETF', 
  'IWM': 'Russell 2000 ETF',
  'VTI': 'Total Stock Market ETF',
  'EFA': 'EAFE ETF',
  'DIA': 'Dow Jones ETF',
  '^VIX': 'Volatility Index'
};

// Sector ETF symbols for real-time data
const SECTOR_ETFS = {
  'Technology': { symbol: 'XLK', companies: 67, leader: 'NVDA' },
  'Healthcare': { symbol: 'XLV', companies: 45, leader: 'UNH' },
  'Financials': { symbol: 'XLF', companies: 52, leader: 'JPM' },
  'Consumer Discretionary': { symbol: 'XLY', companies: 38, leader: 'AMZN' },
  'Communication Services': { symbol: 'XLC', companies: 23, leader: 'META' },
  'Industrials': { symbol: 'XLI', companies: 41, leader: 'CAT' },
  'Energy': { symbol: 'XLE', companies: 34, leader: 'XOM' },
  'Consumer Staples': { symbol: 'XLP', companies: 29, leader: 'PG' },
  'Utilities': { symbol: 'XLU', companies: 31, leader: 'NEE' },
  'Real Estate': { symbol: 'XLRE', companies: 26, leader: 'PLD' },
  'Materials': { symbol: 'XLB', companies: 22, leader: 'LIN' }
};

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

// List of symbols to subscribe for real-time data
const REALTIME_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM'];

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  // Use Polygon WebSocket for real-time stock data
  const { stockData, isConnected } = usePolygonWebSocketData(REALTIME_SYMBOLS);

  const [marketOverview, setMarketOverview] = useState(initialMarketOverview);
  const [indices, setIndices] = useState<any[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  // Trending stocks state with real-time data only
  const [trendingStocks, setTrendingStocks] = useState<any[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const trendingSymbols = ['NVDA', 'TSLA', 'AAPL', 'MSFT'];
  
  // Enhanced trending stocks with WebSocket data overlay
  const enhancedTrendingStocks = trendingStocks.map(stock => {
    const realTimeData = stockData[stock.symbol];
    return realTimeData ? {
      ...stock,
      price: realTimeData.price,
      change: realTimeData.change,
      changePercent: realTimeData.changePercent
    } : stock;
  });

  // Top stocks state with real-time data only
  const [topStocks, setTopStocks] = useState<any[]>([]);
  const [isLoadingTopStocks, setIsLoadingTopStocks] = useState(true);
  
  // Enhanced top stocks with WebSocket data overlay
  const enhancedTopStocks = topStocks.map(stock => {
    const realTimeData = stockData[stock.symbol];
    return realTimeData ? {
      ...stock,
      price: realTimeData.price,
      change: realTimeData.change,
      changePercent: realTimeData.changePercent
    } : stock;
  });


  const [sectors, setSectors] = useState<any[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [tab, setTab] = useState<'stocks' | 'indices' | 'sectors'>('stocks'); // Changed default to stocks
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial market data including trending stocks
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoadingMarketData(true);
      setIsLoadingTrending(true);
      try {
        // Fetch market overview data
        const [spyData, qqqData, diaData, vixData] = await Promise.all([
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.sp500),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.nasdaq),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.dow),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.vix)
        ]);
        
        // Fetch trending stocks data
        const trendingData = await Promise.all(
          trendingSymbols.map(symbol => stockDataService.getStockQuote(symbol))
        );
        
        // Update trending stocks with real-time data
        const updatedTrendingStocks = trendingData.map((data) => {
          return {
            symbol: data.symbol,
            name: TRENDING_COMPANY_NAMES[data.symbol as keyof typeof TRENDING_COMPANY_NAMES] || data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: `${(data.volume / 1_000_000).toFixed(1)}M`,
            isHot: Math.abs(data.changePercent) > 3
          };
        });
        
        setTrendingStocks(updatedTrendingStocks);
        setIsLoadingTrending(false);

        // Fetch top stocks data
        const topStocksSymbols = Object.keys(TOP_STOCKS_INFO);
        const topStocksData = await Promise.all(
          topStocksSymbols.map(symbol => stockDataService.getStockQuote(symbol))
        );
        
        const updatedTopStocks = topStocksData.map((data) => {
          const stockInfo = TOP_STOCKS_INFO[data.symbol as keyof typeof TOP_STOCKS_INFO];
          return {
            symbol: data.symbol,
            name: stockInfo?.name || data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume,
            marketCap: stockInfo?.marketCap || ''
          };
        });
        
        setTopStocks(updatedTopStocks);
        setIsLoadingTopStocks(false);

        // Update market overview
        setMarketOverview({
          sp500: {
            value: spyData.price,
            change: spyData.change,
            changePercent: spyData.changePercent
          },
          nasdaq: {
            value: qqqData.price,
            change: qqqData.change,
            changePercent: qqqData.changePercent
          },
          dow: {
            value: diaData.price,
            change: diaData.change,
            changePercent: diaData.changePercent
          },
          vix: {
            value: vixData.price,
            change: vixData.change,
            changePercent: vixData.changePercent
          },
          sentiment: spyData.changePercent > 0 ? 'bullish' : spyData.changePercent < 0 ? 'bearish' : 'neutral',
          volume: `${(spyData.volume / 1_000_000).toFixed(1)}M`,
          activeTraders: Math.floor(spyData.volume / 1000),
          lastUpdated: new Date()
        });

        // Fetch indices data
        const indicesData = await Promise.all(
          INDEX_SYMBOLS.map(symbol => stockDataService.getStockQuote(symbol))
        );

        const formattedIndices = indicesData.map(data => ({
          symbol: data.symbol,
          name: indexNames[data.symbol as keyof typeof indexNames] || data.symbol,
          value: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: `${(data.volume / 1_000_000).toFixed(1)}M`
        }));

        setIndices(formattedIndices);

        // Fetch sectors data using ETF symbols
        const sectorSymbols = Object.values(SECTOR_ETFS).map(sector => sector.symbol);
        const sectorData = await Promise.all(
          sectorSymbols.map(symbol => stockDataService.getStockQuote(symbol))
        );
        
        const updatedSectors = Object.entries(SECTOR_ETFS).map(([sectorName, sectorInfo], index) => {
          const data = sectorData[index];
          return {
            name: sectorName,
            change: data.changePercent,
            price: data.price,
            companies: sectorInfo.companies,
            leader: sectorInfo.leader
          };
        });
        
        setSectors(updatedSectors);
        setIsLoadingSectors(false);
      } catch (error) {
        console.error('Error loading market data:', error);
      } finally {
        setIsLoadingMarketData(false);
        setIsLoadingTrending(false);
      }
    };

    loadMarketData();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Fetch fresh market overview data
      const [spyData, qqqData, diaData, vixData] = await Promise.all([
        stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.sp500),
        stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.nasdaq),
        stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.dow),
        stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.vix)
      ]);
      
      // Fetch fresh trending stocks data
      const trendingData = await Promise.all(
        trendingSymbols.map(symbol => stockDataService.getStockQuote(symbol))
      );
      
      // Update trending stocks
      const updatedTrendingStocks = trendingData.map((data) => {
        return {
          symbol: data.symbol,
          name: TRENDING_COMPANY_NAMES[data.symbol as keyof typeof TRENDING_COMPANY_NAMES] || data.symbol,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: `${(data.volume / 1_000_000).toFixed(1)}M`,
          isHot: Math.abs(data.changePercent) > 3
        };
      });
      
      setTrendingStocks(updatedTrendingStocks);

      // Fetch top stocks data
      const topStocksSymbols = Object.keys(TOP_STOCKS_INFO);
      const topStocksData = await Promise.all(
        topStocksSymbols.map(symbol => stockDataService.getStockQuote(symbol))
      );
      
      const updatedTopStocks = topStocksData.map((data) => {
        const stockInfo = TOP_STOCKS_INFO[data.symbol as keyof typeof TOP_STOCKS_INFO];
        return {
          symbol: data.symbol,
          name: stockInfo?.name || data.symbol,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent,
          volume: data.volume,
          marketCap: stockInfo?.marketCap || ''
        };
      });
      
      setTopStocks(updatedTopStocks);

      // Fetch sectors data using ETF symbols
      const sectorSymbols = Object.values(SECTOR_ETFS).map(sector => sector.symbol);
      const sectorData = await Promise.all(
        sectorSymbols.map(symbol => stockDataService.getStockQuote(symbol))
      );
      
      const updatedSectors = Object.entries(SECTOR_ETFS).map(([sectorName, sectorInfo], index) => {
        const data = sectorData[index];
        return {
          name: sectorName,
          change: data.changePercent,
          price: data.price,
          companies: sectorInfo.companies,
          leader: sectorInfo.leader
        };
      });
      
      setSectors(updatedSectors);

      // Update market overview
      setMarketOverview({
        sp500: {
          value: spyData.price,
          change: spyData.change,
          changePercent: spyData.changePercent
        },
        nasdaq: {
          value: qqqData.price,
          change: qqqData.change,
          changePercent: qqqData.changePercent
        },
        dow: {
          value: diaData.price,
          change: diaData.change,
          changePercent: diaData.changePercent
        },
        vix: {
          value: vixData.price,
          change: vixData.change,
          changePercent: vixData.changePercent
        },
        sentiment: spyData.changePercent > 0 ? 'bullish' : spyData.changePercent < 0 ? 'bearish' : 'neutral',
        volume: `${(spyData.volume / 1_000_000).toFixed(1)}M`,
        activeTraders: Math.floor(spyData.volume / 1000),
        lastUpdated: new Date()
      });

      // Refresh indices data
      const indicesData = await Promise.all(
        INDEX_SYMBOLS.map(symbol => stockDataService.getStockQuote(symbol))
      );

      const formattedIndices = indicesData.map(data => ({
        symbol: data.symbol,
        name: indexNames[data.symbol as keyof typeof indexNames] || data.symbol,
        value: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: `${(data.volume / 1_000_000).toFixed(1)}M`
      }));

      setIndices(formattedIndices);
    } catch (error) {
      console.error('Error refreshing market data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStocks = enhancedTopStocks.filter(stock => 
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
              <div className="flex items-center gap-4 mt-2">
                <p className="text-muted-foreground">Real-time market data and analysis</p>
                {!isLoadingMarketData && marketOverview.lastUpdated && (
                  <Badge variant="outline" className="text-xs">
                    Updated: {marketOverview.lastUpdated.toLocaleTimeString()}
                  </Badge>
                )}
                {isConnected && (
                  <Badge variant="secondary" className="text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </Badge>
                )}
              </div>
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
                    {isLoadingMarketData ? (
                      <div className="space-y-2">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">${marketOverview.sp500.value.toFixed(2)}</p>
                        <p className="text-sm">{formatPercent(marketOverview.sp500.changePercent)}</p>
                      </>
                    )}
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
                    {isLoadingMarketData ? (
                      <div className="space-y-2">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">${marketOverview.nasdaq.value.toFixed(2)}</p>
                        <p className="text-sm">{formatPercent(marketOverview.nasdaq.changePercent)}</p>
                      </>
                    )}
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Dow Jones</p>
                    {isLoadingMarketData ? (
                      <div className="space-y-2">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">${marketOverview.dow.value.toFixed(2)}</p>
                        <p className="text-sm">{formatPercent(marketOverview.dow.changePercent)}</p>
                      </>
                    )}
                  </div>
                  <BarChart2 className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card hover-scale card-hover-effect">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">VIX</p>
                    {isLoadingMarketData ? (
                      <div className="space-y-2">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                        <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl font-bold">{marketOverview.vix.value.toFixed(2)}</p>
                        <p className="text-sm">{formatPercent(marketOverview.vix.changePercent)}</p>
                      </>
                    )}
                  </div>
                  <Activity className="h-8 w-8 text-orange-400" />
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
                {isLoadingTrending ? (
                  // Loading skeleton for trending stocks
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-gray-700/50 animate-pulse">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-16 bg-gray-700 rounded"></div>
                            <div className="h-4 w-8 bg-red-600 rounded"></div>
                          </div>
                          <div className="h-3 w-24 bg-gray-600 rounded mt-1"></div>
                        </div>
                        <div className="h-4 w-4 bg-gray-600 rounded"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-6 w-20 bg-gray-700 rounded"></div>
                        <div className="h-4 w-16 bg-gray-600 rounded"></div>
                        <div className="h-3 w-18 bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  enhancedTrendingStocks.map(stock => (
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
                            {isConnected && <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" title="Live Data"></div>}
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
                  ))
                )}
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
                  {isLoadingTopStocks ? (
                    Array.from({ length: 10 }).map((_, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="h-5 w-16 bg-muted rounded mb-1"></div>
                              <div className="h-3 w-24 bg-muted rounded"></div>
                            </div>
                            <div className="h-4 w-4 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-8 w-20 bg-muted rounded"></div>
                            <div className="h-4 w-16 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-1">
                            <div className="h-3 w-full bg-muted rounded"></div>
                            <div className="h-3 w-full bg-muted rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    filteredStocks.map(stock => (
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
                    ))
                  )}
                </div>
                </CardContent>
              </Card>
        )}

          {tab === 'indices' && (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-purple-400" />
                    Market Indices
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Real-time Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMarketData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="p-6 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-16 bg-muted animate-pulse rounded"></div>
                            <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
                          </div>
                          <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                          <div className="space-y-2">
                            <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                            <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                            <div className="h-3 w-16 bg-muted animate-pulse rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {indices.map(index => (
                      <div
                        key={index.symbol}
                        className="p-6 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 hover:border-primary/50 transition-all hover-scale cursor-pointer"
                        onClick={() => navigate(`/stocks/${index.symbol}`)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{index.symbol}</h3>
                            <div className="flex items-center gap-1">
                              {index.changePercent >= 0 ? (
                                <ArrowUp className="h-4 w-4 text-profit" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-loss" />
                              )}
                              <BarChart2 className="h-5 w-5 text-blue-400" />
                            </div>
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
                )}
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
                  {isLoadingSectors ? (
                    Array.from({ length: 11 }).map((_, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-card/80 to-card/40 border border-border/50 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-32 bg-muted rounded"></div>
                            <div className="h-4 w-4 bg-muted rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-muted rounded"></div>
                            <div className="space-y-1">
                              <div className="h-3 w-full bg-muted rounded"></div>
                              <div className="h-3 w-full bg-muted rounded"></div>
                              <div className="h-3 w-full bg-muted rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    sectors.map(sector => (
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
                    ))
                  )}
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
