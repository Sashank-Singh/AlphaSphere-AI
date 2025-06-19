import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, BarChart2, BrainCircuit, Percent, Wifi, WifiOff } from 'lucide-react';
import TradingPanel from '@/components/TradingPanel';
import AITradeAdvisor from '@/components/AITradeAdvisor';
import RealTimeStockChart from '@/components/RealTimeStockChart';
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';
import { stockDataService } from '@/lib/stockDataService';
import { CompanyInfo } from '@/lib/stockDataService';

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
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [priceUpdated, setPriceUpdated] = useState<boolean>(false);

  const prevPriceRef = useRef<number>(0);
  const accountId = 'demo-account-id';

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
      if (currentWsData && ((currentWsData.p ?? currentWsData.price ?? currentWsData.ap ?? currentWsData.bp) ?? 0) > 0) {
        setIsLoading(false);
        return;
      }

      try {
        const [quote, info] = await Promise.all([
          stockDataService.getStockQuote(currentSymbol),
          stockDataService.getCompanyInfo(currentSymbol)
        ]);

        if (quote) {
          setStockData({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            lastUpdated: Date.now(),
            isMockData: false
          });
        }

        if (info) {
          setCompanyData({
            description: info.description || `${info.name} is a publicly traded company.`,
            marketCap: (info.marketCap || 0).toLocaleString(),
            peRatio: (info.peRatio || 0).toFixed(2),
            high52Week: (info.high52Week || 0).toFixed(2),
            low52Week: (info.low52Week || 0).toFixed(2),
            volume: (quote?.volume || 0).toLocaleString(),
            avgVolume: (info.avgVolume || 0).toLocaleString()
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
        setCompanyData(null);
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
      navigate(`/trading/${trimmedQuery}`);
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

      {/* Stock Header */}
      <div className="mb-6">
        <Card className="bg-black border border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center">
              <span className="text-primary mr-2">{stockData.symbol}</span>
              <span className={`text-lg ${priceUpdated ? 'animate-pulse' : ''} ${stockData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
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

      {/* Enhanced Chart */}
      <div className="mb-6">
        <RealTimeStockChart
          symbol={stockData.symbol}
          currentPrice={stockData.price}
          change={stockData.change}
          changePercent={stockData.changePercent}
          isRealTime={stockFeedConnected}
          chartType="area"
          height={400}
        />
      </div>

      {/* Trading Panel and Company Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TradingPanel
          symbol={stockData.symbol}
          currentPrice={stockData.price}
          accountId={accountId}
        />

        <Card className="bg-black border border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            {companyData ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{companyData.description}</p>
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
          </CardContent>
        </Card>
      </div>

      {/* AI Trade Advisor */}
      <div className="mb-6">
        <AITradeAdvisor
          symbol={stockData.symbol}
          accountId={accountId}
        />
      </div>

      {/* Market Insights */}
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
