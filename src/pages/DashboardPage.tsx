import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  BarChart,
  LineChart,
  Sparkles,
  FileBarChart,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Activity,
  Globe,
  Layers,
  PieChart,
  Zap,
  Clock,
  DollarSign,
  Percent,
  Volume2,
  BarChart2,
  Share2,
  Newspaper
} from 'lucide-react';
import { mockStockService } from '@/lib/mockStockService';
import {
  usePortfolio
} from '@/context/PortfolioContext';
import {
  formatCurrency,
  formatPercentage,
  cn
} from '@/lib/utils';
import StockPriceChart from '@/components/StockPriceChart';
import PortfolioOptimizer from '@/components/PortfolioOptimizer';
import EnhancedSphereAI from '@/components/EnhancedSphereAI';
import TradingWidget from '@/components/TradingWidget';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"


interface NewsArticle {
  title: string;
  url: string;
  source: string;
  date: string;
  symbols?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface MarketSentiment {
  overall: number; // 0-100 scale
  bullish: number; // percentage
  bearish: number; // percentage
  neutral: number; // percentage
  trending: 'up' | 'down' | 'sideways';
  volatility: 'high' | 'medium' | 'low';
  description: string;
}

interface MarketSummary {
  leadingIndex: string;
  leadingValue: number;
  leadingChange: number;
  hotSector: string;
  hotSectorChange: number;
  worstSector: string;
  worstSectorChange: number;
  topStock: string;
  topStockChange: number;
  worstStock: string;
  worstStockChange: number;
}

// Convert API NewsItem to our NewsArticle format
const convertNewsToArticles = (newsItems: NewsItem[]): NewsArticle[] => {
  return newsItems.map(news => ({
    title: news.title,
    url: news.url,
    source: news.source,
    date: news.timestamp ? new Date(news.timestamp).toLocaleDateString() : new Date().toLocaleDateString(),
    symbols: news.symbols || [],
    sentiment: news.sentiment || 'neutral'
  }));
};

const DashboardPage: React.FC = () => {
  // Using usePortfolio hook for portfolio data
  const { portfolio } = usePortfolio();

  // State for market data
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<{
    indices: 'real-time' | 'mixed' | 'mock';
    sectors: 'real-time' | 'mixed' | 'mock';
    stocks: 'real-time' | 'mixed' | 'mock';
  }>({
    indices: 'mock',
    sectors: 'mock',
    stocks: 'mock'
  });

  // Market sentiment state
  const [marketSentiment, setMarketSentiment] = useState<MarketSentiment>({
    overall: 50,
    bullish: 50,
    bearish: 30,
    neutral: 20,
    trending: 'sideways',
    volatility: 'medium',
    description: 'Loading market sentiment data...'
  });

  // Market summary state
  const [marketSummary, setMarketSummary] = useState<MarketSummary>({
    leadingIndex: 'SPX',
    leadingValue: 0,
    leadingChange: 0,
    hotSector: 'Technology',
    hotSectorChange: 0,
    worstSector: 'Utilities',
    worstSectorChange: 0,
    topStock: 'AAPL',
    topStockChange: 0,
    worstStock: 'XOM',
    worstStockChange: 0
  });

  // Function to update market summary
  const updateMarketSummary = (indicesData: MarketIndex[], sectorsData: Sector[], stocksData: Stock[]) => {
    const leadingIndex = [...indicesData].sort((a, b) => b.change - a.change)[0];
    const sortedSectors = [...sectorsData].sort((a, b) => b.change - a.change);
    const hotSector = sortedSectors[0];
    const worstSector = sortedSectors[sortedSectors.length - 1];
    const sortedStocks = [...stocksData].sort((a, b) => b.change - a.change);
    const topStock = sortedStocks[0];
    const worstStock = sortedStocks[sortedStocks.length - 1];

    setMarketSummary({
      leadingIndex: leadingIndex.symbol,
      leadingValue: leadingIndex.price,
      leadingChange: leadingIndex.change,
      hotSector: hotSector.name,
      hotSectorChange: hotSector.change,
      worstSector: worstSector.name,
      worstSectorChange: worstSector.change,
      topStock: topStock.symbol,
      topStockChange: topStock.change,
      worstStock: worstStock.symbol,
      worstStockChange: worstStock.change
    });
  };

  // Initial data fetch
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const [indices, popularStocks] = await Promise.all([
          mockStockService.getMarketIndices(),
          mockStockService.getPopularStocks()
        ]);
        
        setIndices(indices);
        setStocks(popularStocks);
        
        // Mock sector performance data
        const mockSectors = [
          { name: 'Technology', performance: 2.5 },
          { name: 'Healthcare', performance: 1.8 },
          { name: 'Finance', performance: -0.5 },
          { name: 'Consumer', performance: 1.2 },
          { name: 'Energy', performance: -1.5 }
        ];
        setSectors(mockSectors);
        
        // Mock market sentiment
        const mockSentiment = {
          overall: 0.65,
          technical: 0.7,
          fundamental: 0.6,
          news: 0.65
        };
        setMarketSentiment(mockSentiment);
        
        // Mock market news
        const mockNews = [
          {
            id: '1',
            title: 'Market Update: Stocks Rally on Economic Data',
            source: 'Market News',
            timestamp: new Date(),
            url: '#'
          },
          {
            id: '2',
            title: 'Tech Sector Leads Market Gains',
            source: 'Financial Times',
            timestamp: new Date(),
            url: '#'
          }
        ];
        setNews(mockNews.map(convertNewsToArticles));
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const topGainers = [...stocks].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => a.change - b.change).slice(0, 5);

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

  // Helper component for market summary items
  const MarketSummaryItem = ({
    label,
    value,
    change,
    icon
  }: {
    label: string;
    value: string | number;
    change: number;
    icon: React.ReactNode
  }) => {
    return (
      <div className="flex flex-col space-y-1">
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </div>
        <div className="font-medium">{value}</div>
        <div className={cn(
          "text-xs font-medium",
          change >= 0 ? "text-green-500" : "text-red-500"
        )}>
          {change >= 0 ? <ChevronUp className="inline h-3 w-3" /> : <ChevronDown className="inline h-3 w-3" />}
          {formatChange(change)}
        </div>
      </div>
    );
  };

  // Helper component for market sentiment visualization
  const SentimentIndicator = ({ sentiment }: { sentiment: MarketSentiment }) => {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Market Sentiment</div>
          <Badge
            variant={sentiment.overall > 60 ? "default" : sentiment.overall < 40 ? "destructive" : "outline"}
            className={cn(
              sentiment.overall > 60 ? "bg-green-500/20 text-green-500 hover:bg-green-500/30" :
              sentiment.overall < 40 ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" :
              "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
            )}
          >
            {sentiment.overall > 60 ? "Bullish" : sentiment.overall < 40 ? "Bearish" : "Neutral"}
          </Badge>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          <div
            className="bg-green-500 h-full"
            style={{ width: `${sentiment.bullish}%` }}
          />
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${sentiment.neutral}%` }}
          />
          <div
            className="bg-red-500 h-full"
            style={{ width: `${sentiment.bearish}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>Bullish {sentiment.bullish}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>Neutral {sentiment.neutral}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span>Bearish {sentiment.bearish}%</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          {sentiment.description}
        </div>
      </div>
    );
  };

  // Helper component for sector performance visualization
  const SectorPerformance = ({ sectors }: { sectors: Sector[] }) => {
    const sortedSectors = [...sectors].sort((a, b) => b.change - a.change);

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium">Sector Performance</div>
        <div className="space-y-2">
          {sortedSectors.map((sector, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span>{sector.name}</span>
                </div>
                <div className={cn(
                  "font-medium text-xs",
                  sector.change >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatChange(sector.change)}
                </div>
              </div>
              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full",
                    sector.change >= 0 ? "bg-green-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.abs(sector.change) * 20}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const calculateTotalPortfolioValue = () => {
    let total = portfolio.cash || 0;
    portfolio.positions?.forEach(position => {
      total += position.quantity * position.currentPrice;
    });
    portfolio.optionPositions?.forEach(option => {
      total += (option.quantity || 0) * option.premium * 100;
    });
    return total;
  };

  const totalPortfolioValue = calculateTotalPortfolioValue();

  const calculatePortfolioReturn = () => {
    const initialInvestment = 10000;
    const currentPortfolioValue = totalPortfolioValue;
    const portfolioReturn = ((currentPortfolioValue - initialInvestment) / initialInvestment) * 100;
    return portfolioReturn;
  };

  const portfolioReturn = calculatePortfolioReturn();

  const calculateSectorAllocation = () => {
    const allocation: Record<string, number> = {};
    portfolio.positions?.forEach(position => {
      const sector = position.sector || 'Other';
      allocation[sector] = (allocation[sector] || 0) + (position.quantity * position.currentPrice);
    });
    return allocation;
  };

  // Calculate sector allocation for potential future use
  calculateSectorAllocation();

  const getRiskLevel = () => {
    if (riskTolerance > 70) return 'Aggressive';
    if (riskTolerance > 35) return 'Moderate';
    return 'Conservative';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">
          Market Dashboard
          {isLoading && (
            <span className="ml-3 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-500/20 text-blue-500">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fetching real-time data...
            </span>
          )}
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsLoading(true);
              // Call the fetchData function from the useEffect
              fetchMarketData().then(indicesData => {
                console.log('Refreshed indices data:', indicesData);
                setIndices(indicesData);

                // Determine data source for indices
                const realTimeIndices = indicesData.filter(index => index.price > 0).length;
                const indicesSource =
                  realTimeIndices === indicesData.length ? 'real-time' :
                  realTimeIndices > 0 ? 'mixed' : 'mock';

                fetchSectorPerformance().then(sectorsData => {
                  console.log('Refreshed sectors data:', sectorsData);
                  setSectors(sectorsData);

                  // Determine data source for sectors
                  const realTimeSectors = sectorsData.filter(sector => sector.change !== 0).length;
                  const sectorsSource =
                    realTimeSectors === sectorsData.length ? 'real-time' :
                    realTimeSectors > 0 ? 'mixed' : 'mock';

                  fetchPopularStocks().then(stocksData => {
                    console.log('Refreshed stocks data:', stocksData);
                    setStocks(stocksData);

                    // Determine data source for stocks
                    const realTimeStocks = stocksData.filter(stock => stock.price > 0).length;
                    const stocksSource =
                      realTimeStocks === stocksData.length ? 'real-time' :
                      realTimeStocks > 0 ? 'mixed' : 'mock';

                    // Update data source state
                    setDataSource({
                      indices: indicesSource as 'real-time' | 'mixed' | 'mock',
                      sectors: sectorsSource as 'real-time' | 'mixed' | 'mock',
                      stocks: stocksSource as 'real-time' | 'mixed' | 'mock'
                    });

                    fetchMarketNews().then(newsData => {
                      const formattedNews = convertNewsToArticles(newsData);
                      console.log('Refreshed news data:', formattedNews);
                      setNews(formattedNews);

                      const sentiment = calculateMarketSentiment(indicesData, sectorsData);
                      console.log('Refreshed market sentiment:', sentiment);
                      setMarketSentiment({
                        ...sentiment,
                        trending: sentiment.trending as 'up' | 'down' | 'sideways',
                        volatility: sentiment.volatility as 'high' | 'medium' | 'low'
                      });

                      // Update market summary
                      if (indicesData.length > 0 && sectorsData.length > 0 && stocksData.length > 0) {
                        updateMarketSummary(indicesData, sectorsData, stocksData);
                      }

                      setIsLoading(false);
                    });
                  });
                });
              }).catch(error => {
                console.error('Error refreshing data:', error);
                setIsLoading(false);

                // Set data source to mock if there's an error
                setDataSource({
                  indices: 'mock',
                  sectors: 'mock',
                  stocks: 'mock'
                });
              });
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Fetching...' : 'Refresh'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-2" />
                Help
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Dashboard Help</AlertDialogTitle>
                <AlertDialogDescription>
                  This dashboard provides an overview of market trends, your portfolio performance, and AI-powered insights.
                  Use the tabs to navigate between different views and the search bar to find specific stocks.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <MarketSummaryItem
              label="S&P 500"
              value={indices.find(i => i.symbol === 'SPY')?.price || 0}
              change={indices.find(i => i.symbol === 'SPY')?.change || 0}
              icon={<Globe className="h-3 w-3 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <MarketSummaryItem
              label="Nasdaq"
              value={indices.find(i => i.symbol === 'QQQ')?.price || 0}
              change={indices.find(i => i.symbol === 'QQQ')?.change || 0}
              icon={<Activity className="h-3 w-3 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <MarketSummaryItem
              label="Dow Jones"
              value={indices.find(i => i.symbol === 'DIA')?.price || 0}
              change={indices.find(i => i.symbol === 'DIA')?.change || 0}
              icon={<BarChart className="h-3 w-3 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <MarketSummaryItem
              label="Hot Sector"
              value={marketSummary.hotSector}
              change={marketSummary.hotSectorChange}
              icon={<TrendingUp className="h-3 w-3 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <MarketSummaryItem
              label="Top Stock"
              value={marketSummary.topStock}
              change={marketSummary.topStockChange}
              icon={<Zap className="h-3 w-3 text-muted-foreground" />}
            />
          </CardContent>
        </Card>

        <Card className="bg-black border border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>Last Updated</span>
              </div>
              <div className="font-medium">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-xs text-muted-foreground flex flex-col gap-1">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-4 px-1",
                    isLoading ? "bg-blue-500/20 text-blue-500" :
                    dataSource.indices === 'real-time' ? "bg-green-500/20 text-green-500" :
                    dataSource.indices === 'mixed' ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  )}
                >
                  {isLoading ? 'Fetching...' :
                    dataSource.indices === 'real-time' ? 'Alpaca real-time indices' :
                    dataSource.indices === 'mixed' ? 'Partial real-time indices' :
                    'Mock indices'}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-4 px-1",
                    isLoading ? "bg-blue-500/20 text-blue-500" :
                    dataSource.stocks === 'real-time' ? "bg-green-500/20 text-green-500" :
                    dataSource.stocks === 'mixed' ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  )}
                >
                  {isLoading ? 'Fetching...' :
                    dataSource.stocks === 'real-time' ? 'Alpaca real-time stocks' :
                    dataSource.stocks === 'mixed' ? 'Partial real-time stocks' :
                    'Mock stocks'}
                </Badge>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Powered by Alpaca API
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="summary">Market Summary</TabsTrigger>
          <TabsTrigger value="stocks">Active Stocks</TabsTrigger>
          <TabsTrigger value="sectors">Sectors</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>

        {/* Market Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Market Sentiment Card */}
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Market Sentiment</CardTitle>
                <CardDescription>Overall market mood and positioning</CardDescription>
              </CardHeader>
              <CardContent>
                <SentimentIndicator sentiment={marketSentiment} />
              </CardContent>
            </Card>

            {/* Sector Performance Card */}
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Sector Performance</CardTitle>
                <CardDescription>Today's sector movements</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorPerformance sectors={sectors} />
              </CardContent>
            </Card>

            {/* Market News Card */}
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Newspaper className="h-4 w-4" />
                  Market News
                </CardTitle>
                <CardDescription>Latest market updates</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4">
                  {news.map((article, index) => (
                    <div key={index} className="border-b border-gray-800 pb-3 last:border-0">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-medium text-sm"
                      >
                        {article.title}
                      </a>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {article.source}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {article.date}
                        </span>
                      </div>
                      {article.symbols && article.symbols.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {article.symbols.map(symbol => (
                            <Badge key={symbol} variant="outline" className="text-xs">
                              {symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Trends Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topGainers.map(stock => (
                    <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        {stock.logo && (
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                            <img src={stock.logo} alt={stock.symbol} className="w-5 h-5 object-contain" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(stock.price)}</div>
                        <div className="text-xs text-green-500">{formatChange(stock.change)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topLosers.map(stock => (
                    <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <div className="flex items-center gap-3">
                        {stock.logo && (
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                            <img src={stock.logo} alt={stock.symbol} className="w-5 h-5 object-contain" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(stock.price)}</div>
                        <div className="text-xs text-red-500">{formatChange(stock.change)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Stocks Tab */}
        <TabsContent value="stocks" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Active Stocks</CardTitle>
                <CardDescription>Stocks with high trading volume and price movement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-2 px-4 font-medium text-sm">Symbol</th>
                        <th className="text-left py-2 px-4 font-medium text-sm">Name</th>
                        <th className="text-right py-2 px-4 font-medium text-sm">Price</th>
                        <th className="text-right py-2 px-4 font-medium text-sm">Change</th>
                        <th className="text-right py-2 px-4 font-medium text-sm">Volume</th>
                        <th className="text-left py-2 px-4 font-medium text-sm">Sector</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map(stock => (
                        <tr key={stock.symbol} className="border-b border-gray-800 hover:bg-gray-900/50">
                          <td className="py-2 px-4 font-medium">{stock.symbol}</td>
                          <td className="py-2 px-4 text-sm text-muted-foreground">{stock.name}</td>
                          <td className="py-2 px-4 text-right">{formatPrice(stock.price)}</td>
                          <td className={`py-2 px-4 text-right ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {formatChange(stock.change)}
                          </td>
                          <td className="py-2 px-4 text-right text-sm">
                            {stock.volume.toLocaleString()}
                          </td>
                          <td className="py-2 px-4 text-sm">{stock.sector}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sectors Tab */}
        <TabsContent value="sectors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Sector Performance</CardTitle>
                <CardDescription>Performance by market sector</CardDescription>
              </CardHeader>
              <CardContent>
                <SectorPerformance sectors={sectors} />
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Sector Heatmap</CardTitle>
                <CardDescription>Visual representation of sector performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {sectors.map((sector, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-3 rounded-md flex flex-col justify-between",
                        sector.change >= 2 ? "bg-green-500/30" :
                        sector.change >= 1 ? "bg-green-500/20" :
                        sector.change >= 0 ? "bg-green-500/10" :
                        sector.change >= -1 ? "bg-red-500/10" :
                        "bg-red-500/20"
                      )}
                      style={{ minHeight: '100px' }}
                    >
                      <div className="font-medium text-sm">{sector.name}</div>
                      <div className={cn(
                        "text-sm font-bold",
                        sector.change >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatChange(sector.change)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Portfolio Value
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
                <p className={`text-sm font-medium ${portfolioReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {portfolioReturn >= 0 ? "+" : ""}
                  {formatPercentage(portfolioReturn)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cash Balance
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</div>
                <p className="text-sm text-muted-foreground">
                  Available for trading
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Risk Tolerance
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{riskTolerance}</div>
                    <p className="text-sm text-muted-foreground">
                      {getRiskLevel()}
                    </p>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        Adjust Risk
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Risk Tolerance</h4>
                          <p className="text-sm text-muted-foreground">
                            Adjust your risk tolerance to personalize your investment
                            strategy.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor="risk">Conservative</Label>
                          <Slider
                            id="risk"
                            defaultValue={[riskTolerance]}
                            max={100}
                            step={1}
                            onValueChange={(value) => {
                              const newValue = Array.isArray(value) ? value[0] : value;
                              setRiskTolerance(Number(newValue));
                            }}
                          />
                          <Label htmlFor="risk">Aggressive</Label>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PortfolioOptimizer className="bg-black border border-gray-800" />
            <TradingWidget popularStocks={stocks.slice(0, 5)} />
          </div>
        </TabsContent>
      </Tabs>

      <EnhancedSphereAI />
    </div>
  );
};

export default DashboardPage;
