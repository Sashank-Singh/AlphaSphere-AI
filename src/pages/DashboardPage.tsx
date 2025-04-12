import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  HelpCircle
} from 'lucide-react';
import { 
  mockStocks, 
  mockIndices, 
  refreshStockPrices, 
} from '@/data/mockData';
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
import { 
  AlertDialog,
  AlertDialogAction,
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

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  date: string;
}

const mapMockNewsToArticles = (mockNews: any[]): NewsArticle[] => {
  return mockNews.map(news => ({
    title: news.title,
    url: news.url,
    source: news.source,
    date: news.timestamp || new Date().toLocaleDateString()
  }));
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [stocks, setStocks] = useState(mockStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsArticle[]>(() => {
    return [
      {
        title: "Fed announces interest rate decision",
        url: "#",
        source: "Financial Times",
        date: "2023-11-01"
      },
      {
        title: "Tech stocks rally on earnings surprises",
        url: "#",
        source: "Wall Street Journal",
        date: "2023-11-01"
      },
      {
        title: "Market volatility expected ahead of jobs report",
        url: "#",
        source: "Bloomberg",
        date: "2023-10-31"
      },
      {
        title: "Oil prices drop on increased production",
        url: "#",
        source: "Reuters",
        date: "2023-10-31"
      }
    ];
  });
  const [riskTolerance, setRiskTolerance] = useState<number>(50);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setStocks(refreshStockPrices());
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trendingStocks = [...stocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
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

  const sectorAllocation = calculateSectorAllocation();

  const getRiskLevel = () => {
    if (riskTolerance > 70) return 'Aggressive';
    if (riskTolerance > 35) return 'Moderate';
    return 'Conservative';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4 md:mb-0">
          Dashboard
        </h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        defaultValue={[50]}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Market Trends
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topGainers.map(stock => (
                    <li key={stock.symbol} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          ({stock.name})
                        </span>
                      </div>
                      <span className="text-green-500">{formatChange(stock.change)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topLosers.map(stock => (
                    <li key={stock.symbol} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          ({stock.name})
                        </span>
                      </div>
                      <span className="text-red-500">{formatChange(stock.change)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Trending Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {trendingStocks.map(stock => (
                    <li key={stock.symbol} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-2">{stock.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          ({stock.name})
                        </span>
                      </div>
                      <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                        {formatChange(stock.change)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Today's News
          </h2>
          <div className="space-y-4">
            {news.map((article, index) => (
              <Card key={index} className="bg-black border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {article.title}
                    </a>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {article.source} - {article.date}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <PortfolioOptimizer className="bg-black border border-gray-800" />
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <HelpCircle className="w-4 h-4 mr-2" />
            Get Help
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <EnhancedSphereAI />
    </div>
  );
};

export default DashboardPage;
