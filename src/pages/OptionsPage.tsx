import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, BrainCircuit, Percent, Wifi, WifiOff, Calculator } from 'lucide-react';
import OptionChain from '@/components/OptionChain';
import RealTimeStockChart from '@/components/RealTimeStockChart';
import OptionsChart from '@/components/OptionsChart';
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ChartDataPoint {
  date: string;
  price: number;
}

interface DisplayStockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: number;
  isMockData: boolean;
}

interface WsSymbolData {
  ev?: string;
  sym?: string;
  symbol?: string;
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

interface PolygonWsData {
  [symbol: string]: WsSymbolData;
}

const OptionsPage: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [currentSymbol, setCurrentSymbol] = useState<string>(routeSymbol || 'AAPL');
  const [searchQuery, setSearchQuery] = useState<string>(currentSymbol);
  const [selectedExpiry, setSelectedExpiry] = useState('2024-03-15');
  
  const [stockData, setStockData] = useState<DisplayStockData>({
    symbol: currentSymbol,
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: Date.now(),
    isMockData: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceUpdated, setPriceUpdated] = useState<boolean>(false);

  const prevPriceRef = useRef<number>(0);
  const accountId = 'demo-account-id';

  const expirationDates = [
    '2024-03-15',
    '2024-03-22',
    '2024-03-29',
    '2024-04-05',
    '2024-04-19',
    '2024-05-17',
    '2024-06-21',
  ];

  const { 
    stockData: wsStockData,
    newsData,
    latestNews,
    isConnected 
  } = usePolygonWebSocketData([currentSymbol], [], [currentSymbol]);

  useEffect(() => {
    const currentWsData: WsSymbolData | undefined = (wsStockData as PolygonWsData)?.[currentSymbol];
    
    if (currentWsData) {
      const actualSymbol = currentWsData.symbol ?? currentWsData.sym ?? currentSymbol;
      const priceValue = currentWsData.p ?? currentWsData.price ?? currentWsData.ap ?? currentWsData.bp ?? 0;
      
      if (priceValue > 0 && priceValue !== prevPriceRef.current) {
        let changeValue = currentWsData.c ?? currentWsData.change ?? 0;
        let changePercentValue = currentWsData.pc ?? currentWsData.changePercent ?? 0;
        const pcpForCalc = currentWsData.pcp;

        if (priceValue !== 0 && (changeValue === 0 && changePercentValue === 0) && pcpForCalc) {
          changeValue = priceValue - pcpForCalc;
          changePercentValue = pcpForCalc !== 0 ? (changeValue / pcpForCalc) * 100 : 0;
        }

        prevPriceRef.current = stockData.price;
        
        setStockData({
          symbol: actualSymbol,
          price: priceValue,
          change: changeValue,
          changePercent: changePercentValue,
          lastUpdated: Date.now(),
          isMockData: false
        });
        
        setPriceUpdated(true);
        setTimeout(() => setPriceUpdated(false), 1000);
      }
    }
  }, [wsStockData, currentSymbol]);

  useEffect(() => {
    const fetchDataForCurrentSymbol = async () => {
      setIsLoading(true);
      
      const currentWsData: WsSymbolData | undefined = (wsStockData as PolygonWsData)?.[currentSymbol];
      if (currentWsData && 
          ((currentWsData.p ?? currentWsData.price ?? currentWsData.ap ?? currentWsData.bp) ?? 0) > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const alpacaResponse: AlpacaQuoteResponse = await getLatestQuote(currentSymbol);
        if (alpacaResponse && alpacaResponse.quote) {
          const quote: AlpacaQuote = alpacaResponse.quote;
          const price = quote.ap ?? quote.bp ?? 0;
          const previousClose = quote.pcp ?? 0;

          let change = 0;
          let changePercent = 0;

          if (price !== 0 && previousClose !== 0) {
            change = price - previousClose;
            changePercent = (change / previousClose) * 100;
          }

          prevPriceRef.current = stockData.price;
          const isMock = isMockDataMode();

          setStockData({
            symbol: alpacaResponse.symbol || currentSymbol,
            price: price,
            change: change,
            changePercent: changePercent,
            lastUpdated: Date.now(),
            isMockData: isMock
          });
        } else {
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
        console.error(`Error fetching stock data for ${currentSymbol}:`, error);
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
  }, [currentSymbol]); 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toUpperCase();
    if (trimmedQuery && trimmedQuery !== currentSymbol) {
      navigate(`/options/${trimmedQuery}`);
      setCurrentSymbol(trimmedQuery); 
    }
  };

  let stockFeedConnected = false;
  if (typeof isConnected === 'object' && isConnected !== null) {
    const connectionObject = isConnected as { stocks?: unknown }; 
    if (typeof connectionObject.stocks === 'boolean') {
      stockFeedConnected = connectionObject.stocks;
    }
  } else if (typeof isConnected === 'boolean') {
    stockFeedConnected = isConnected;
  }

  const timeSinceUpdate = Math.floor((Date.now() - stockData.lastUpdated) / 1000);
  const isRecentUpdate = timeSinceUpdate < 5;

  return (
    <TooltipProvider>
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
            <h1 className="text-2xl font-bold">Options Trading</h1>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate(`/trading/${currentSymbol || 'AAPL'}`)}
            className="flex items-center"
          >
            <BrainCircuit className="h-4 w-4 mr-2" />
            Stock Trading
          </Button>
        </div>

        {/* Stock Header */}
        <div className="mb-6">
          <Card className="bg-black border border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Percent className="h-5 w-5 mr-2 text-primary" />
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
                Options trading with real-time Greeks and advanced strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="flex-1">
                  <Input
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
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Stock Chart */}
          <RealTimeStockChart
            symbol={stockData.symbol}
            currentPrice={stockData.price}
            change={stockData.change}
            changePercent={stockData.changePercent}
            isRealTime={stockFeedConnected}
            chartType="area"
            height={350}
          />

          {/* Options Chart */}
          <OptionsChart
            symbol={stockData.symbol}
            underlyingPrice={stockData.price}
            expiryDate={selectedExpiry}
            chartType="payoff"
          />
        </div>

        {/* Options Chain and Sphere AI Advisor */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Options Chain - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="bg-black border border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Options Chain</CardTitle>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="expiry-select">Expiry:</label>
                    <select 
                      id="expiry-select"
                      value={selectedExpiry} 
                      onChange={(e) => setSelectedExpiry(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm"
                    >
                      {expirationDates.map((date) => (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <OptionChain
                  symbol={currentSymbol}
                  stockPrice={stockData.price}
                  expiryDate={selectedExpiry}
                  accountId={accountId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sphere AI Advisor - 1/3 width */}
          <div>
            <Card className="bg-black border border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
                  Sphere AI Options Advisor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <BrainCircuit className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">AI Options Analysis</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="font-medium text-blue-400 mb-1">Contract Suggestion</div>
                    <div className="text-sm">
                      Call ${(stockData.price + 5).toFixed(0)} exp {selectedExpiry}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Bullish momentum detected
                    </div>
                  </div>

                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="font-medium text-green-400 mb-1">IV Rank</div>
                    <div className="text-sm">
                      Medium (45th percentile)
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Good time for credit spreads
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="font-medium text-yellow-400 mb-1">Risk Assessment</div>
                    <div className="text-sm">
                      Moderate volatility expected
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Consider protective puts
                    </div>
                  </div>

                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <div className="font-medium text-purple-400 mb-1">Strategy Idea</div>
                    <div className="text-sm">
                      Iron Condor ${(stockData.price - 10).toFixed(0)}-${(stockData.price + 10).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Neutral strategy for range-bound market
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Get Full Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Insights */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BrainCircuit className="h-5 w-5 mr-2 text-primary" />
            Options Market Insights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Volatility Surface</CardTitle>
                <CardDescription>Implied volatility across strikes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>ATM IV</span>
                    <span className="text-blue-400">24.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ITM Calls</span>
                    <span className="text-green-400">22.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OTM Calls</span>
                    <span className="text-yellow-400">26.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>ITM Puts</span>
                    <span className="text-red-400">25.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>OTM Puts</span>
                    <span className="text-orange-400">27.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Options Flow</CardTitle>
                <CardDescription>Unusual options activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Large Call Sweeps</span>
                      <span className="text-green-500">+15</span>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: '60%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Put Volume</span>
                      <span className="text-red-500">+8</span>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-red-500" style={{ width: '32%' }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Dark Pool</span>
                      <span className="text-purple-500">+3</span>
                    </div>
                    <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-purple-500" style={{ width: '12%' }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">News & Events</CardTitle>
                <CardDescription>Latest updates for {currentSymbol}</CardDescription>
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
                        <a href="#" className="hover:underline font-medium text-sm">Options volume surges ahead of earnings</a>
                        <div className="text-xs text-muted-foreground mt-1">Options Flow • 2h ago</div>
                      </div>
                      <div className="border-b border-gray-800 pb-2">
                        <a href="#" className="hover:underline font-medium text-sm">Unusual call activity detected in tech sector</a>
                        <div className="text-xs text-muted-foreground mt-1">Market Watch • 4h ago</div>
                      </div>
                      <div className="border-b border-gray-800 pb-2">
                        <a href="#" className="hover:underline font-medium text-sm">Volatility compression signals potential breakout</a>
                        <div className="text-xs text-muted-foreground mt-1">Trading View • 5h ago</div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default OptionsPage;
