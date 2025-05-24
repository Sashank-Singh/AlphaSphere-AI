import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ArrowLeft, LineChart, BarChart2, TrendingUp, BrainCircuit, Percent, Loader2, Wifi, WifiOff } from 'lucide-react';
import TradingPanel from '@/components/TradingPanel';
import PositionsPanel from '@/components/PositionsPanel';
import OrdersPanel from '@/components/OrdersPanel';
import AITradeAdvisor from '@/components/AITradeAdvisor';
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  getLatestQuote, 
  getLatestQuotes, 
  AlpacaQuote, 
  AlpacaQuoteResponse, 
  AlpacaMultiQuoteResponse,
  isMockDataMode 
} from '../lib/alpacaApi';

// Define interfaces for the chart and company data
interface ChartDataPoint {
  date: string;
  price: number;
}

interface CompanyData {
  description: string;
  marketCap: string;
  peRatio: string;
  high52Week: string;
  low52Week: string;
  volume: string;
  avgVolume: string;
}

// More specific type for stockData, can be a union if structure varies significantly
interface DisplayStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number; // Timestamp for last update
  isMockData: boolean; // Indicator of whether the data is real or mocked
}

// --- TYPE DEFINITIONS ---
// Using the types imported from alpacaApi.ts
export interface WsSymbolData {
  ev?: string;
  sym?: string;     // Symbol from Polygon (e.g., "TICKER")
  symbol?: string;  // Symbol field if present in the data object (e.g., { symbol: "AAPL", ... })
  p?: number;
  ap?: number;
  bp?: number;
  c?: number;
  pc?: number;
  t?: number;
  price?: number; 
  change?: number; 
  changePercent?: number;
  pcp?: number;
}

export interface PolygonWsData {
  [symbol: string]: WsSymbolData;
}

// --- END TYPE DEFINITIONS ---

const TradingPage: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [currentSymbol, setCurrentSymbol] = useState<string>(routeSymbol || 'AAPL');
  const [searchQuery, setSearchQuery] = useState<string>(currentSymbol);
  
  const [stockData, setStockData] = useState<DisplayStockData>({
    symbol: currentSymbol,
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: Date.now(),
    isMockData: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [multiQuotes, setMultiQuotes] = useState<Record<string, AlpacaQuote> | null>(null);
  const [priceUpdated, setPriceUpdated] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'websocket' | 'alpaca-api' | 'mock'>('websocket');

  // Reference to store previous price for visual indication of change
  const prevPriceRef = useRef<number>(0);
  const apiCallCountRef = useRef<number>(0);
  const mockDataTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Demo account ID - in a real app, this would come from authentication
  const accountId = 'demo-account-id';

  // Update WebSocket hook to use currentSymbol
  const { 
    stockData: wsStockData, // This should be PolygonWsData or similar from the hook
    newsData,
    latestNews,
    isConnected 
  } = usePolygonWebSocketData([currentSymbol], [], [currentSymbol]);

  // Function to generate mock price updates if using mock data
  const generateMockPriceUpdate = () => {
    if (dataSource === 'mock' && !isLoading) {
      // Generate slight random price movement
      const randomChange = (Math.random() - 0.5) * 0.5; // -0.25 to +0.25
      const newPrice = stockData.price + randomChange;
      
      // Store previous price for visual indication
      prevPriceRef.current = stockData.price;
      
      // Update stock data with mock values
      setStockData(prev => ({
        ...prev,
        price: newPrice,
        change: newPrice - (prev.price - prev.change), // Adjust change value
        lastUpdated: Date.now(),
      }));
      
      // Flash the price update indicator
      setPriceUpdated(true);
      setTimeout(() => setPriceUpdated(false), 800);
      
      // Update chart with latest mock data point
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      
      setChartData(prevData => {
        const newData = [...prevData];
        if (newData.length >= 30) {
          newData.shift(); // Remove oldest data point
        }
        newData.push({
          date: timeString,
          price: newPrice
        });
        return newData;
      });
      
      // Schedule next update
      mockDataTimeoutRef.current = setTimeout(generateMockPriceUpdate, 3000 + Math.random() * 2000);
    }
  };

  // Real-time WebSocket data handling effect
  useEffect(() => {
    // Cast wsStockData to PolygonWsData to access specific symbol data
    const currentWsData: WsSymbolData | undefined = (wsStockData as PolygonWsData)?.[currentSymbol];
    
    if (currentWsData) {
      const actualSymbol = currentWsData.symbol ?? currentWsData.sym ?? currentSymbol;
      // Prioritize WebSocket price data from different possible fields
      const priceValue = currentWsData.p ?? currentWsData.price ?? currentWsData.ap ?? currentWsData.bp ?? 0;
      
      // Only update if we have a valid price and it's different from previous
      if (priceValue > 0 && priceValue !== prevPriceRef.current) {
        setDataSource('websocket');
        let changeValue = currentWsData.c ?? currentWsData.change ?? 0;
        let changePercentValue = currentWsData.pc ?? currentWsData.changePercent ?? 0;
        const pcpForCalc = currentWsData.pcp;

        // Calculate change values if they're not provided but we have previous close
        if (priceValue !== 0 && (changeValue === 0 && changePercentValue === 0) && pcpForCalc) {
          changeValue = priceValue - pcpForCalc;
          changePercentValue = pcpForCalc !== 0 ? (changeValue / pcpForCalc) * 100 : 0;
        }

        // Store previous price for visual indication
        prevPriceRef.current = stockData.price;
        
        // Update stock data with real-time values
        setStockData({
          symbol: actualSymbol,
          price: priceValue,
          change: changeValue,
          changePercent: changePercentValue,
          lastUpdated: Date.now(),
          isMockData: false
        });
        
        // Flash the price update indicator
        setPriceUpdated(true);
        setTimeout(() => setPriceUpdated(false), 1000);
      }
    }
  }, [wsStockData, currentSymbol]);

  // Initial data fetch effect - runs on symbol change or if WebSocket not connected
  useEffect(() => {
    const fetchDataForCurrentSymbol = async () => {
      setIsLoading(true);
      
      // If we already have WebSocket data, we can skip the initial fetch
      const currentWsData: WsSymbolData | undefined = (wsStockData as PolygonWsData)?.[currentSymbol];
      if (currentWsData && 
          ((currentWsData.p ?? currentWsData.price ?? currentWsData.ap ?? currentWsData.bp) ?? 0) > 0) {
        // WebSocket data already handled in the other useEffect
        setIsLoading(false);
        return;
      }

      // Fallback to Alpaca REST API
      try {
        const alpacaResponse: AlpacaQuoteResponse = await getLatestQuote(currentSymbol);
        if (alpacaResponse && alpacaResponse.quote) {
          const quote: AlpacaQuote = alpacaResponse.quote;
          const price = quote.ap ?? quote.bp ?? 0; // Prefer ask/bid
          const previousClose = quote.pcp ?? 0; // Previous Close Price from Alpaca

          let change = 0;
          let changePercent = 0;

          if (price !== 0 && previousClose !== 0) {
            change = price - previousClose;
            changePercent = (change / previousClose) * 100;
          }

          // Store previous price for visual indication
          prevPriceRef.current = stockData.price;

          // Determine if this is mock data
          const isMock = isMockDataMode();

          if (isMock) {
            setDataSource('mock');
          } else {
            setDataSource('alpaca-api');
          }

          setStockData({
            symbol: alpacaResponse.symbol || currentSymbol,
            price: price,
            change: change,
            changePercent: changePercent,
            lastUpdated: Date.now(),
            isMockData: isMock
          });

          // Create initial chart data
          const initialChartData = Array.from({ length: 20 }, (_, i) => ({
            date: new Date(Date.now() - (20 - i) * 60 * 1000).toLocaleTimeString(),
            price: price * (0.99 + Math.random() * 0.02) // Small variations around the price
          }));
          setChartData(initialChartData);

          setCompanyData({
            description: `${alpacaResponse.symbol || currentSymbol} is a publicly traded company.`,
            marketCap: (price * 1000000000).toLocaleString(),
            peRatio: (15 + Math.random() * 10).toFixed(2),
            high52Week: (price * 1.2).toFixed(2),
            low52Week: (price * 0.8).toFixed(2),
            volume: (1000000 + Math.random() * 5000000).toLocaleString(),
            avgVolume: (2000000 + Math.random() * 3000000).toLocaleString()
          });
          
          // If we're using mock data, start generating mock updates
          if (isMock) {
            // Clear any existing mock data interval
            if (mockDataTimeoutRef.current) {
              clearTimeout(mockDataTimeoutRef.current);
            }
            // Start the mock data updates
            mockDataTimeoutRef.current = setTimeout(generateMockPriceUpdate, 2000);
          }
        } else {
          console.warn(`No quote data received from Alpaca for ${currentSymbol}`);
          setStockData({ 
            symbol: currentSymbol, 
            price: 0, 
            change: 0, 
            changePercent: 0,
            lastUpdated: Date.now(),
            isMockData: true
          });
        }
      } catch (error) {
        console.error(`Error fetching stock data for ${currentSymbol} from Alpaca:`, error);
        setStockData({ 
          symbol: currentSymbol, 
          price: 0, 
          change: 0, 
          changePercent: 0,
          lastUpdated: Date.now(),
          isMockData: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSymbol) {
      fetchDataForCurrentSymbol();
    }

    // Cleanup function to clear the mock data interval
    return () => {
      if (mockDataTimeoutRef.current) {
        clearTimeout(mockDataTimeoutRef.current);
      }
    };
  }, [currentSymbol]); 

  // Update chart with real-time data points
  useEffect(() => {
    if (stockData.price > 0 && !isLoading && dataSource !== 'mock') {
      // Add the latest price point to the chart data if price has changed
      const now = new Date();
      const timeString = now.toLocaleTimeString();
      
      setChartData(prevData => {
        // Only update if we have new data and a valid price
        if (prevData.length > 0 && stockData.price !== 0) {
          // Keep maximum 30 data points for chart display
          const newData = [...prevData];
          if (newData.length >= 30) {
            newData.shift(); // Remove oldest data point
          }
          newData.push({
            date: timeString,
            price: stockData.price
          });
          return newData;
        }
        return prevData;
      });
    }
  }, [stockData.lastUpdated, isLoading, dataSource]);

  useEffect(() => {
    const fetchMultiQuotes = async () => {
      if (!currentSymbol) return;
      try {
        const symbolsToFetch = Array.from(new Set([currentSymbol, 'AAPL', 'TSLA', 'MSFT']));
        // Get quotes for multiple symbols
        const data: AlpacaMultiQuoteResponse = await getLatestQuotes(symbolsToFetch);
        if (data && data.quotes) {
          setMultiQuotes(data.quotes); // Store quotes for easy access
        } else {
          setMultiQuotes(null);
          console.warn('No data or malformed response from getLatestQuotes', data);
        }
      } catch (error) {
        console.error('Error fetching multiple quotes:', error);
        setMultiQuotes(null);
      }
    };

    fetchMultiQuotes();
    
    // Set up interval for regular quote updates when WebSocket is not connected
    let intervalId: NodeJS.Timeout;
    
    // Check if isConnected is null/undefined before accessing it
    const isWebSocketConnected = 
      isConnected === true || 
      (isConnected && typeof isConnected === 'object' && (isConnected as { stocks?: boolean })?.stocks === true);
    
    // Only poll if not using WebSocket and not in mock data mode
    if (!isWebSocketConnected) {
      // Use a longer interval if in mock data mode
      const pollInterval = isMockDataMode() ? 15000 : 5000;
      intervalId = setInterval(fetchMultiQuotes, pollInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentSymbol, isConnected]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toUpperCase();
    if (trimmedQuery && trimmedQuery !== currentSymbol) {
      navigate(`/trading/${trimmedQuery}`);
      setCurrentSymbol(trimmedQuery); 
    }
  };

  let stockFeedConnected = false;
  // Refined check for isConnected to address linter errors
  if (typeof isConnected === 'object' && isConnected !== null) {
    // Assert isConnected to an object type we expect, or check properties carefully
    const connectionObject = isConnected as { stocks?: unknown }; 
    if (typeof connectionObject.stocks === 'boolean') {
      stockFeedConnected = connectionObject.stocks;
    }
  } else if (typeof isConnected === 'boolean') {
    stockFeedConnected = isConnected;
  }

  // Calculate time since last update
  const timeSinceUpdate = Math.floor((Date.now() - stockData.lastUpdated) / 1000);
  const isRecentUpdate = timeSinceUpdate < 5; // Consider updates within 5 seconds as "recent"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Trading</h1>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/options/${currentSymbol || 'AAPL'}`)}
          className="flex items-center"
        >
          <Percent className="h-4 w-4 mr-2" />
          Options Trading
        </Button>
      </div>

      {/* Stock information - 100% width */}
      <div className="mb-6">
        <Card className="bg-black border border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              {stockData.symbol}
              <span className={`ml-4 text-lg ${priceUpdated ? 'animate-pulse' : ''} ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${stockData.price.toFixed(2)}
                <span className="ml-2">
                  {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                </span>
              </span>
              <div className="ml-auto flex items-center gap-2">
                {isRecentUpdate && (
                  <div className="text-xs text-blue-400">
                    Updated {timeSinceUpdate}s ago
                  </div>
                )}
                {stockFeedConnected ? (
                  <div className="flex items-center text-xs text-green-500">
                    <Wifi className="h-3 w-3 mr-1" />
                    <span>Live</span>
                  </div>
                ) : stockData.isMockData ? (
                  <div className="flex items-center text-xs text-blue-400">
                    <span>Simulated</span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-yellow-500">
                    <WifiOff className="h-3 w-3 mr-1" />
                    <span>Delayed</span>
                  </div>
                )}
              </div>
            </CardTitle>
            <CardDescription>
              Trade stocks and ETFs with real-time market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="flex-1">
                <label htmlFor="stock-search" className="sr-only">Search for a stock symbol</label>
                <Input
                  id="stock-search"
                  name="stock-search"
                  type="text"
                  placeholder="Search for a symbol (e.g., AAPL, MSFT, TSLA)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stock chart */}
              <div className="h-[300px] bg-gray-800/50 rounded-lg p-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <LineChart className="h-10 w-10 text-primary/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading chart data...</p>
                  </div>
                )}
              </div>

              {/* Company info */}
              <div className="h-[300px] bg-gray-800/50 rounded-lg p-4 overflow-y-auto">
                {companyData ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Company Overview</h3>
                      <p className="text-sm text-muted-foreground">{companyData.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Market Cap</p>
                        <p className="text-sm text-muted-foreground">${companyData.marketCap}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">P/E Ratio</p>
                        <p className="text-sm text-muted-foreground">{companyData.peRatio}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">52W High</p>
                        <p className="text-sm text-muted-foreground">${companyData.high52Week}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">52W Low</p>
                        <p className="text-sm text-muted-foreground">${companyData.low52Week}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Volume</p>
                        <p className="text-sm text-muted-foreground">{companyData.volume}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avg Volume</p>
                        <p className="text-sm text-muted-foreground">{companyData.avgVolume}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BarChart2 className="h-10 w-10 text-primary/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading company data...</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading panel and AI Trade Advisor - 50/50 split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left side - Trading panel */}
        <div>
          <TradingPanel
            symbol={stockData.symbol}
            currentPrice={stockData.price}
            accountId={accountId}
          />
        </div>

        {/* Right side - AI Trade Advisor */}
        <div>
          <AITradeAdvisor
            symbol={stockData.symbol}
            price={stockData.price}
            change={stockData.change}
            accountId={accountId}
          />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
          Market Insights & Analysis
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-black border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Market Sentiment</CardTitle>
              <CardDescription>Overall market mood</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>S&P 500</span>
                  <span className="text-green-500">+0.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Nasdaq</span>
                  <span className="text-green-500">+1.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VIX</span>
                  <span className="text-red-500">-3.5%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                  <div className="bg-green-500 h-full" style={{ width: '65%' }} />
                  <div className="bg-yellow-500 h-full" style={{ width: '20%' }} />
                  <div className="bg-red-500 h-full" style={{ width: '15%' }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span>Bullish 65%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span>Neutral 20%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Bearish 15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-800 mt-2">
                  <span className="text-xs text-muted-foreground">Data Feed Status:</span>
                  {stockFeedConnected ? (
                    <div className="flex items-center text-xs text-green-500">
                      <Wifi className="h-3 w-3 mr-1" />
                      <span>Live</span>
                    </div>
                  ) : stockData.isMockData ? (
                    <div className="flex items-center text-xs text-blue-400">
                      <span>Simulated</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-xs text-yellow-500">
                      <WifiOff className="h-3 w-3 mr-1" />
                      <span>Delayed</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sector Performance</CardTitle>
              <CardDescription>Today's sector movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Technology</span>
                    <span className="text-green-500">+1.8%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '36%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Healthcare</span>
                    <span className="text-green-500">+0.5%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '10%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Energy</span>
                    <span className="text-red-500">-1.2%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-red-500" style={{ width: '24%' }} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <span>Financials</span>
                    <span className="text-green-500">+0.3%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">News & Events</CardTitle>
              <CardDescription>Latest market updates for {currentSymbol}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[200px] overflow-y-auto">
              <div className="space-y-3">
                {latestNews && latestNews.length > 0 ? (
                  latestNews.map((newsItem, index) => (
                    <div key={newsItem.id} className="border-b border-gray-800 pb-2">
                      <a 
                        href={newsItem.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline font-medium text-sm"
                      >
                        {newsItem.headline}
                      </a>
                      <div className="text-xs text-muted-foreground mt-1">
                        {newsItem.source} • {new Date(newsItem.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="border-b border-gray-800 pb-2">
                      <a href="#" className="hover:underline font-medium text-sm">Fed signals potential rate cut in upcoming meeting</a>
                      <div className="text-xs text-muted-foreground mt-1">Bloomberg • 2h ago</div>
                    </div>
                    <div className="border-b border-gray-800 pb-2">
                      <a href="#" className="hover:underline font-medium text-sm">Tech stocks rally on strong earnings reports</a>
                      <div className="text-xs text-muted-foreground mt-1">CNBC • 4h ago</div>
                    </div>
                    <div className="border-b border-gray-800 pb-2">
                      <a href="#" className="hover:underline font-medium text-sm">Oil prices drop amid supply concerns</a>
                      <div className="text-xs text-muted-foreground mt-1">Reuters • 5h ago</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
