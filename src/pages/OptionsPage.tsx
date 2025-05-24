import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ArrowLeft, TrendingUp, TrendingDown, BrainCircuit, Calendar, DollarSign, Percent, Activity, Wifi, WifiOff, Loader2, Info, AlertTriangle, BarChart2, LineChart, Clock, Zap, BookOpen, Target, ChevronUp, ChevronDown, Newspaper, Globe, PieChart, Share2, Volume2, HelpCircle } from 'lucide-react';
import { useStockWebSocket, useOptionsWebSocket, useNewsWebSocket } from '@/hooks/useAlpacaWebSocket';
import OptionChain from '@/components/OptionChain';
import OptionStrategyBuilder from '@/components/OptionStrategyBuilder';
import OptionPositions from '@/components/OptionPositions';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import StockPriceChart from '@/components/StockPriceChart';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { mockStockService } from '@/lib/mockStockService';

const OptionsPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stockData, setStockData] = useState<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    iv: number; // Implied volatility
    open: number;
    high: number;
    low: number;
    close: number;
    marketCap: number;
    peRatio: number;
    dividend: number;
    beta: number;
  }>({
    symbol: symbol || 'AAPL',
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    iv: 0,
    open: 0,
    high: 0,
    low: 0,
    close: 0,
    marketCap: 0,
    peRatio: 0,
    dividend: 0,
    beta: 0
  });
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  const [showGreeks, setShowGreeks] = useState<boolean>(true);
  const [optionMetrics, setOptionMetrics] = useState<{
    putCallRatio: number;
    impliedMovePercent: number;
    maxPainStrike: number;
    topOpenInterestCalls: {strike: number, openInterest: number}[];
    topOpenInterestPuts: {strike: number, openInterest: number}[];
  }>({  
    putCallRatio: 0.85,
    impliedMovePercent: 0,
    maxPainStrike: 0,
    topOpenInterestCalls: [],
    topOpenInterestPuts: []
  });
  const [marketData, setMarketData] = useState<{
    vix: number;
    vixChange: number;
    sectorPerformance: {name: string, change: number}[];
    earningsDate: string | null;
    analystRating: string;
    priceTarget: number;
  }>({  
    vix: 15.2,
    vixChange: -0.3,
    sectorPerformance: [
      {name: 'Technology', change: 0.8},
      {name: 'Healthcare', change: -0.2},
      {name: 'Financials', change: 0.5},
      {name: 'Consumer', change: 0.1},
      {name: 'Energy', change: -0.7}
    ],
    earningsDate: null,
    analystRating: 'Buy',
    priceTarget: 0
  });
  
  // Demo account ID - in a real app, this would come from authentication
  const accountId = 'demo-account-id';
  
  // Generate price chart data
  const [priceChartData, setPriceChartData] = useState<{date: string, price: number}[]>([]);
  const [optionVolumeData, setOptionVolumeData] = useState<{strike: number, calls: number, puts: number}[]>([]);

  // Use WebSocket for real-time stock data
  const { stockData: wsStockData, isConnected: stockConnected } = useStockWebSocket([symbol || 'AAPL']);

  // Generate option symbols for the selected stock and expiry
  const generateOptionSymbols = (stockSymbol: string, expiryDate: string): string[] => {
    if (!expiryDate) return [];

    // Format: AAPL230616C00150000
    // Remove dashes from date
    const formattedDate = expiryDate.replace(/-/g, '').substring(2);

    // Generate strikes around current price (if available)
    const currentPrice = stockData.price;
    const strikes = [];
    const baseStrike = Math.round(currentPrice / 5) * 5;

    for (let i = -5; i <= 5; i++) {
      const strike = baseStrike + (i * 5);
      strikes.push(strike);
    }

    // Generate option symbols for calls and puts
    const optionSymbols: string[] = [];

    strikes.forEach(strike => {
      // Format strike price with padding (e.g., 00150000 for $150)
      const formattedStrike = (strike * 1000).toString().padStart(8, '0');

      // Call option
      const callSymbol = `${stockSymbol}${formattedDate}C${formattedStrike}`;
      optionSymbols.push(callSymbol);

      // Put option
      const putSymbol = `${stockSymbol}${formattedDate}P${formattedStrike}`;
      optionSymbols.push(putSymbol);
    });

    return optionSymbols;
  };

  // Generate option symbols based on selected expiry
  const [optionSymbols, setOptionSymbols] = useState<string[]>([]);

  // Use WebSocket for real-time option data
  const { optionsData: wsOptionData, isConnected: optionsConnected } = useOptionsWebSocket(optionSymbols);

  // Use WebSocket for real-time news data
  const { newsData: wsNewsData, latestNews, isConnected: newsConnected } = useNewsWebSocket([symbol || 'AAPL']);

  // Function to generate price chart data
  const generatePriceChartData = (currentPrice: number, timeframe: '1D' | '1W' | '1M' | '3M' | '1Y') => {
    const data = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) { // Example for 30 days
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const price = currentPrice + (Math.random() * 10 - 5); // Random fluctuation
      data.push({ date: date.toISOString().split('T')[0], price });
    }
    
    setPriceChartData(data.reverse()); // Set the state with the generated data
  };

  // Function to generate option volume data
  const generateOptionVolumeData = (currentPrice: number) => {
    const data = [];
    
    for (let i = 0; i < 10; i++) { // Example for 10 strikes
      const strike = currentPrice + (i - 5) * 5; // Strikes around the current price
      const calls = Math.floor(Math.random() * 1000);
      const puts = Math.floor(Math.random() * 1000);
      data.push({ strike, calls, puts });
    }
    
    setOptionVolumeData(data); // Set the state with the generated data
  };

  // Function to calculate option metrics
  const calculateOptionMetrics = (currentPrice: number, impliedVolatility: number) => {
    const putCallRatio = Math.random(); // Example calculation
    const impliedMovePercent = impliedVolatility * 100; // Example calculation
    const maxPainStrike = currentPrice; // Example calculation
    const topOpenInterestCalls = []; // Populate with real data
    const topOpenInterestPuts = []; // Populate with real data
    
    setOptionMetrics({
      putCallRatio,
      impliedMovePercent,
      maxPainStrike,
      topOpenInterestCalls,
      topOpenInterestPuts
    });
  };

  // Function to get a random future date
  const getRandomFutureDate = () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 1); // Random date within the next 30 days
    return futureDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  };

  useEffect(() => {
    // Update stock data from WebSocket
    if (wsStockData && wsStockData[symbol || 'AAPL']) {
      const data = wsStockData[symbol || 'AAPL'];
      const mockIV = Math.random() * 0.5 + 0.2; // Mock IV between 20% and 70%
      
      setStockData({
        symbol: data.symbol,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        iv: mockIV,
        open: data.price * 0.99,
        high: data.price * 1.02,
        low: data.price * 0.98,
        close: data.price,
        marketCap: data.price * (symbol === 'AAPL' ? 2.5 : 1) * 1000000000,
        peRatio: 15 + Math.random() * 10,
        dividend: 0.5 + Math.random() * 1.5,
        beta: 0.8 + Math.random() * 0.8
      });
      
      // Generate price chart data based on current price
      generatePriceChartData(data.price, chartTimeframe);
      
      // Generate option volume data
      generateOptionVolumeData(data.price);
      
      // Calculate option metrics
      calculateOptionMetrics(data.price, mockIV);
      
      // Set market data
      setMarketData(prevData => ({
        ...prevData,
        priceTarget: data.price * (1 + (Math.random() * 0.2 - 0.05)),
        earningsDate: getRandomFutureDate()
      }));
      
      setIsLoading(false);
    } else {
      // Fallback to REST API if WebSocket data is not available
      const fetchStockData = async () => {
        setIsLoading(true);
        try {
          const data = await mockStockService.getStockQuote(symbol || 'AAPL');
          const mockIV = Math.random() * 0.5 + 0.2; // Mock IV between 20% and 70%
          
          setStockData({
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            volume: data.volume || 0,
            iv: mockIV,
            open: data.price * 0.99,
            high: data.price * 1.02,
            low: data.price * 0.98,
            close: data.price,
            marketCap: data.price * (symbol === 'AAPL' ? 2.5 : 1) * 1000000000,
            peRatio: 15 + Math.random() * 10,
            dividend: 0.5 + Math.random() * 1.5,
            beta: 0.8 + Math.random() * 0.8
          });
          
          // Generate price chart data based on current price
          generatePriceChartData(data.price, chartTimeframe);
          
          // Generate option volume data
          generateOptionVolumeData(data.price);
          
          // Calculate option metrics
          calculateOptionMetrics(data.price, mockIV);
          
          // Set market data
          setMarketData(prevData => ({
            ...prevData,
            priceTarget: data.price * (1 + (Math.random() * 0.2 - 0.05)),
            earningsDate: getRandomFutureDate()
          }));
        } catch (error) {
          console.error('Error fetching stock data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStockData();
    }

    // Generate mock expiry dates (next 4 Fridays)
    const generateExpiryDates = () => {
      const dates = [];
      const today = new Date();
      let friday = new Date(today);
      friday.setDate(today.getDate() + (5 - today.getDay()) % 7);

      for (let i = 0; i < 4; i++) {
        dates.push(friday.toISOString().split('T')[0]);
        friday.setDate(friday.getDate() + 7);
      }

      // Add monthly expirations
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      nextMonth.setDate(20);
      dates.push(nextMonth.toISOString().split('T')[0]);

      const nextQuarter = new Date(today);
      nextQuarter.setMonth(today.getMonth() + 3);
      nextQuarter.setDate(20);
      dates.push(nextQuarter.toISOString().split('T')[0]);

      return dates;
    };

    const dates = generateExpiryDates();
    setExpiryDates(dates);
    if (!selectedExpiry) {
      setSelectedExpiry(dates[0]);
    }
  }, [symbol, wsStockData]);

  // Update option symbols when expiry date changes
  useEffect(() => {
    if (selectedExpiry && stockData.symbol) {
      const symbols = generateOptionSymbols(stockData.symbol, selectedExpiry);
      setOptionSymbols(symbols);
    }
  }, [selectedExpiry, stockData.symbol, stockData.price]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/options/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/trading')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Options Trading</h1>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/trading/${symbol || 'AAPL'}`)}
          className="flex items-center"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Stock Trading
        </Button>
      </div>

      {/* Stock information - 100% width */}
      <div className="mb-6">
        <Card className="bg-black border border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              {stockData.symbol} Options
              <span className={`ml-4 text-lg ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${stockData.price.toFixed(2)}
                <span className="ml-2">
                  {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </span>
              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center text-xs">
                  <span className="mr-1">Stock:</span>
                  {stockConnected ? (
                    <span className="flex items-center text-green-500">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-500">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Delayed
                    </span>
                  )}
                </div>
                <div className="flex items-center text-xs">
                  <span className="mr-1">Options:</span>
                  {optionsConnected ? (
                    <span className="flex items-center text-green-500">
                      <Wifi className="h-3 w-3 mr-1" />
                      Live
                    </span>
                  ) : (
                    <span className="flex items-center text-yellow-500">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Delayed
                    </span>
                  )}
                </div>
              </div>
            </CardTitle>
            <CardDescription>
              Trade options contracts with advanced strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <Input
                    id="options-search"
                    type="text"
                    placeholder="Search for a symbol (e.g., AAPL, MSFT, TSLA)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    aria-label="Search for an options symbol"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </div>

              <div className="flex-1 flex items-center gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Expiration Date</label>
                  <Select
                    value={selectedExpiry}
                    onValueChange={setSelectedExpiry}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      {expiryDates.map(date => (
                        <SelectItem key={date} value={date}>
                          {formatDate(date)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      Implied Volatility
                    </div>
                    <div className="text-lg font-semibold">
                      {(stockData.iv * 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Days to Expiry
                    </div>
                    <div className="text-lg font-semibold">
                      {selectedExpiry ? Math.max(1, Math.floor((new Date(selectedExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    Stock Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{formatCurrency(stockData.price)}</div>
                  <div className={`text-sm ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-primary" />
                    Implied Volatility
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{(stockData.iv * 100).toFixed(2)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {stockData.iv > 0.3 ? 'High' : stockData.iv > 0.2 ? 'Medium' : 'Low'} volatility
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="h-4 w-4 mr-1 text-primary" />
                    Volume
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{stockData.volume.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Daily trading volume
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="option-chain" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="option-chain">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Option Chain
            </div>
          </TabsTrigger>
          <TabsTrigger value="strategy-builder">
            <div className="flex items-center">
              <BrainCircuit className="h-4 w-4 mr-2" />
              Strategy Builder
            </div>
          </TabsTrigger>
          <TabsTrigger value="positions">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Option Positions
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="option-chain">
          <OptionChain
            symbol={stockData.symbol}
            stockPrice={stockData.price}
            expiryDate={selectedExpiry}
            accountId={accountId}
          />
        </TabsContent>

        <TabsContent value="strategy-builder">
          <OptionStrategyBuilder
            symbol={stockData.symbol}
            stockPrice={stockData.price}
            expiryDate={selectedExpiry}
            iv={stockData.iv}
            accountId={accountId}
          />
        </TabsContent>

        <TabsContent value="positions">
          <OptionPositions
            accountId={accountId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OptionsPage;
