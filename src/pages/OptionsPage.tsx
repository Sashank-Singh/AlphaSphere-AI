import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WifiOff, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import { useYahooFinanceData } from '@/hooks/useYahooFinanceData';
import { TooltipProvider } from '@/components/ui/tooltip';
import { stockDataService } from '@/lib/stockDataService';
import { toast } from '@/components/ui/use-toast';
import StockHeader from '@/components/trading/StockHeader';
import PriceDisplay from '@/components/trading/PriceDisplay';
import ChartSection from '@/components/trading/ChartSection';
import AIInsightsPanel from '@/components/trading/AIInsightsPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import OptionTradeModal, { OptionTradeDetails } from '@/components/options/OptionTradeModal';


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

interface CompanyData {
  description: string;
  marketCap: string;
  peRatio: string;
  high52Week: string;
  low52Week: string;
  volume: string;
  avgVolume: string;
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

interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility?: number;
  percentChange?: number;
  contractSymbol?: string;
  expiry?: string;
}

interface OptionsChainData {
  calls: OptionContract[];
  puts: OptionContract[];
}

const OptionsPage: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [currentSymbol, setCurrentSymbol] = useState<string>(routeSymbol || 'AAPL');
  const [searchQuery, setSearchQuery] = useState<string>(currentSymbol);
  const [expirations, setExpirations] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  
  const [stockData, setStockData] = useState<DisplayStockData>({
    symbol: currentSymbol,
    price: 202.38,
    change: -5.19,
    changePercent: -2.50,
    lastUpdated: Date.now(),
    isMockData: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [optionChainData, setOptionChainData] = useState<OptionsChainData | null>(null);
  const [priceUpdated, setPriceUpdated] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string>('Apple Inc.');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<OptionTradeDetails | null>(null);

  const prevPriceRef = useRef<number>(0);
  const accountId = 'demo-account-id';

  // Normalize backend response to OptionContract[]
  const normalizeOptions = (data: unknown): OptionsChainData => {
    if (!data || typeof data !== 'object') return { calls: [], puts: [] };
    const record = data as Record<string, unknown>;
    const rawCalls = Array.isArray(record.calls) ? (record.calls as unknown[]) : [];
    const rawPuts = Array.isArray(record.puts) ? (record.puts as unknown[]) : [];

    const calls: OptionContract[] = rawCalls.map((item) => {
      const c = (item || {}) as Record<string, unknown>;
      return {
        contractSymbol: (c.contractSymbol as string) || (c.symbol as string) || undefined,
        strike: Number(c.strike ?? 0) || 0,
        bid: Number(c.bid ?? 0) || 0,
        ask: Number(c.ask ?? 0) || 0,
        volume: Number(c.volume ?? 0) || 0,
        openInterest: Number(c.openInterest ?? 0) || 0,
        impliedVolatility: typeof c.impliedVolatility === 'number' ? (c.impliedVolatility as number) : undefined,
        percentChange: typeof c.percentChange === 'number' ? (c.percentChange as number) : undefined,
        expiry: (c.expiry as string) || undefined,
      };
    });

    const puts: OptionContract[] = rawPuts.map((item) => {
      const p = (item || {}) as Record<string, unknown>;
      return {
        contractSymbol: (p.contractSymbol as string) || (p.symbol as string) || undefined,
        strike: Number(p.strike ?? 0) || 0,
        bid: Number(p.bid ?? 0) || 0,
        ask: Number(p.ask ?? 0) || 0,
        volume: Number(p.volume ?? 0) || 0,
        openInterest: Number(p.openInterest ?? 0) || 0,
        impliedVolatility: typeof p.impliedVolatility === 'number' ? (p.impliedVolatility as number) : undefined,
        percentChange: typeof p.percentChange === 'number' ? (p.percentChange as number) : undefined,
        expiry: (p.expiry as string) || undefined,
      };
    });

    return { calls, puts };
  };

  const { 
    stockData: wsStockData,
    newsData,
    latestNews,
    isConnected 
  } = useYahooFinanceData([currentSymbol], [currentSymbol]);

  // Update symbol when route changes to keep state in sync with URL
  useEffect(() => {
    if (routeSymbol && routeSymbol !== currentSymbol) {
      setCurrentSymbol(routeSymbol);
      setSearchQuery(routeSymbol);
      setError(null);
    }
  }, [routeSymbol, currentSymbol]);

  useEffect(() => {
    const currentWsData = wsStockData[currentSymbol];
    
    if (currentWsData) {
      const priceValue = currentWsData.price;
      
      if (priceValue > 0 && priceValue !== prevPriceRef.current) {
        prevPriceRef.current = stockData.price;
        
        setStockData({
          symbol: currentWsData.symbol,
          price: priceValue,
          change: currentWsData.change,
          changePercent: currentWsData.changePercent,
          lastUpdated: Date.now(),
          isMockData: false
        });
        
        setPriceUpdated(true);
        setTimeout(() => setPriceUpdated(false), 1000);
      }
    }
  }, [wsStockData, currentSymbol, stockData.price]);

  useEffect(() => {
    const fetchDataForCurrentSymbol = async () => {
      setIsLoading(true);

      const currentWsData = wsStockData[currentSymbol];
      if (currentWsData && currentWsData.price > 0) {
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
          setCompanyName(info.name || getCompanyName(currentSymbol));
        } else {
          setCompanyName(getCompanyName(currentSymbol));
        }
      } catch (err) {
        console.error(`Error fetching stock data for ${currentSymbol}:`, err);
        setError(`Failed to load data for ${currentSymbol}`);
        toast({
          title: 'Error',
          description: `Failed to load data for ${currentSymbol}`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (currentSymbol) {
      fetchDataForCurrentSymbol();
    }
  }, [currentSymbol, wsStockData]);

  // Helper function to get company name for common stocks
  const getCompanyName = (symbol: string): string => {
    const companies: { [key: string]: string } = {
      AAPL: 'Apple Inc.',
      TSLA: 'Tesla, Inc.',
      MSFT: 'Microsoft Corporation',
      GOOGL: 'Alphabet Inc.',
      AMZN: 'Amazon.com, Inc.',
      META: 'Meta Platforms, Inc.',
      NVDA: 'NVIDIA Corporation',
      NFLX: 'Netflix, Inc.',
      SPY: 'SPDR S&P 500 ETF Trust',
      QQQ: 'Invesco QQQ Trust',
    };
    return companies[symbol] || `${symbol} Inc.`;
  };

  const handleAITrade = () => {
    navigate(`/ai-trading/${currentSymbol}`);
  };

  // Load expirations when symbol changes
  useEffect(() => {
    let isActive = true;
    const loadExpirations = async () => {
      if (!currentSymbol) return;
      try {
        const expiries: Array<{ date: string; daysToExpiry: number; formatted: string }>
          = await stockDataService.getOptionsExpirations(currentSymbol);
        if (!isActive) return;
        const dates = expiries.map((e) => e.date);
        setExpirations(dates);
      } catch (e) {
        console.error('Error loading expirations:', e);
        setExpirations([]);
        setSelectedExpiry(null);
      }
    };
    loadExpirations();
    return () => {
      isActive = false;
    };
  }, [currentSymbol]);

  // When expirations change, set default selected expiry if not set
  useEffect(() => {
    if (!selectedExpiry && expirations.length > 0) {
      setSelectedExpiry(expirations[0]);
    }
  }, [expirations, selectedExpiry]);

  // Load options data for selected expiry, limited to ±20 strikes (total ~40)
  useEffect(() => {
    let isActive = true;
    const loadOptionsData = async () => {
      if (!currentSymbol || !selectedExpiry) return;
      setOptionsLoading(true);
      try {
        const resp = await stockDataService.getOptionsChain(currentSymbol, selectedExpiry, 40);
        if (!isActive) return;
        setOptionChainData(normalizeOptions(resp));
        setLastUpdateTime(Date.now());
      } catch (error) {
        console.error('Error loading options data:', error);
      } finally {
        if (isActive) setOptionsLoading(false);
      }
    };
      loadOptionsData();
    return () => {
      isActive = false;
    };
  }, [currentSymbol, selectedExpiry]);

  // Poll options chain periodically for real-time-ish updates
  useEffect(() => {
    if (!currentSymbol || !selectedExpiry) return;
    const interval = setInterval(async () => {
      try {
        const resp = await stockDataService.getOptionsChain(currentSymbol, selectedExpiry, 40);
        setOptionChainData(normalizeOptions(resp));
        setLastUpdateTime(Date.now());
      } catch (e) {
        console.warn('Polling options chain failed:', e);
      }
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [currentSymbol, selectedExpiry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim().toUpperCase();
    if (trimmedQuery && trimmedQuery !== currentSymbol) {
      navigate(`/options/${trimmedQuery}`);
      setCurrentSymbol(trimmedQuery); 
    }
  };

  const handleRefresh = async () => {
    if (!currentSymbol || !selectedExpiry) return;
      setOptionsLoading(true);
      try {
      const resp = await stockDataService.getOptionsChain(currentSymbol, selectedExpiry, 40);
      setOptionChainData(normalizeOptions(resp));
        setLastUpdateTime(Date.now());
      } catch (error) {
        console.error('Error refreshing options data:', error);
      } finally {
        setOptionsLoading(false);
      }
    };

  const handleOptionOrder = (side: 'buy' | 'sell', option: OptionContract) => {
    setPendingTrade({
      symbol: currentSymbol,
      side,
      contractSymbol: option.contractSymbol,
      strike: option.strike,
      expiry: option.expiry,
      bid: option.bid,
      ask: option.ask,
    });
    setTradeModalOpen(true);
  };

  const confirmOptionOrder = async (
    params: { side: 'buy' | 'sell'; quantity: number; price: number; orderType: 'market' | 'limit' }
  ) => {
    // For now, simulate locally. Later, integrate with backend broker route.
    console.log('Simulated option order', { ...params, details: pendingTrade });
  };

  const getMoneyness = (strike: number) => {
    const currentPrice = stockData.price;
    if (strike < currentPrice * 0.9) return 'Deep ITM';
    if (strike < currentPrice * 0.98) return 'ITM';
    if (strike < currentPrice * 1.02) return 'Near ATM';
    if (strike < currentPrice * 1.1) return 'OTM';
    return 'Deep OTM';
  };

  const getMoneynessColor = (strike: number) => {
    const moneyness = getMoneyness(strike);
    switch (moneyness) {
      case 'Deep ITM':
      case 'ITM':
        return 'text-green-400';
      case 'Near ATM':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getMoneynessBg = (strike: number) => {
    const moneyness = getMoneyness(strike);
    switch (moneyness) {
      case 'Deep ITM':
      case 'ITM':
        return 'bg-green-900';
      case 'Near ATM':
        return 'bg-yellow-900';
      default:
        return 'bg-gray-700';
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

  const timeSinceOptionsUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);

  return (
    <TooltipProvider>
      <div className="min-h-screen text-gray-100 p-6" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#0E1117' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Header Component */}
            <StockHeader
              symbol={stockData.symbol}
              companyName={companyName}
              onSymbolChange={(newSymbol) => navigate(`/options/${newSymbol}`)}
              isLoading={isLoading}
            />

            {/* Price Display Component */}
            <PriceDisplay
              price={stockData.price}
              change={stockData.change}
              changePercent={stockData.changePercent}
              priceUpdated={priceUpdated}
              isConnected={stockFeedConnected}
              lastUpdated={stockData.lastUpdated}
            />

            {/* Chart Section Component */}
            <ChartSection
              symbol={stockData.symbol}
              price={stockData.price}
              change={stockData.change}
              changePercent={stockData.changePercent}
              isRealTime={stockFeedConnected}
              isLoading={isLoading}
            />

            {/* Options Chain */}
            <div className="pt-8 space-y-6">
            <div className="bg-[#161b22] p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-end space-x-4">
                  <h1 className="text-2xl font-bold text-white">Options Chain: {stockData.symbol}</h1>
                  <div className="flex items-center space-x-2 text-sm pb-0.5">
                    <span className="text-white">${stockData.price.toFixed(2)}</span>
                    <span className={stockData.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {stockData.change >= 0 ? '+' : ''}
                        {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  {stockFeedConnected ? (
                    <button className="text-green-400 font-medium flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Live Data</span>
                    </button>
                  ) : (
                    <button className="text-gray-400 font-medium flex items-center space-x-1">
                      <WifiOff className="text-sm" />
                      <span>Delayed</span>
                    </button>
                  )}
                  <button 
                    className="text-gray-400 hover:text-white flex items-center space-x-1"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="text-sm" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Expiration:</span>
                  <select 
                    className="bg-[#1c2128] border border-[#30363d] rounded-md px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedExpiry || ''}
                    onChange={(e) => {
                      setSelectedExpiry(e.target.value);
                    }}
                  >
                      {expirations.map((date) => {
                        const label = new Date(date).toLocaleDateString('en-US', {
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric',
                        });
                        return (
                          <option key={date} value={date}>
                            {label}
                          </option>
                        );
                      })}
                  </select>
                  <span className="text-gray-400 text-sm">5d</span>
                </div>
                  {/* Additional expiry display removed to avoid duplication */}
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Call Options */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Call Options</h3>
                    <div className="text-sm text-gray-400">{optionChainData?.calls.length || 0} contracts</div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="py-2 font-medium text-gray-400 text-left">Strike</th>
                        <th className="py-2 font-medium text-gray-400 text-center">Status</th>
                        <th className="py-2 font-medium text-gray-400 text-right">Bid</th>
                        <th className="py-2 font-medium text-gray-400 text-right">Ask</th>
                          <th className="py-2 font-medium text-gray-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChainData?.calls.map((option, index) => (
                        <tr key={index} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                          <td className="py-2.5 font-medium text-white">${option.strike}</td>
                          <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMoneynessBg(
                                  option.strike
                                )} ${getMoneynessColor(option.strike)}`}
                              >
                              {getMoneyness(option.strike)}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">${option.bid.toFixed(2)}</td>
                          <td className="py-2.5 text-right">${option.ask.toFixed(2)}</td>
                            <td className="py-2.5 text-right space-x-2">
                              <button
                                className="px-2 py-1 text-xs rounded bg-green-700 hover:bg-green-600"
                                onClick={() => handleOptionOrder('buy', option)}
                              >
                                Buy
                              </button>
                              <button
                                className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                                onClick={() => handleOptionOrder('sell', option)}
                              >
                                Sell
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Put Options */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Put Options</h3>
                    <div className="text-sm text-gray-400">{optionChainData?.puts.length || 0} contracts</div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="py-2 font-medium text-gray-400 text-left">Strike</th>
                        <th className="py-2 font-medium text-gray-400 text-center">Status</th>
                        <th className="py-2 font-medium text-gray-400 text-right">Bid</th>
                        <th className="py-2 font-medium text-gray-400 text-right">Ask</th>
                          <th className="py-2 font-medium text-gray-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChainData?.puts.map((option, index) => (
                        <tr key={index} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                          <td className="py-2.5 font-medium text-white">${option.strike}</td>
                          <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMoneynessBg(
                                  option.strike
                                )} ${getMoneynessColor(option.strike)}`}
                              >
                              {getMoneyness(option.strike)}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">${option.bid.toFixed(2)}</td>
                          <td className="py-2.5 text-right">${option.ask.toFixed(2)}</td>
                            <td className="py-2.5 text-right space-x-2">
                              <button
                                className="px-2 py-1 text-xs rounded bg-green-700 hover:bg-green-600"
                                onClick={() => handleOptionOrder('buy', option)}
                              >
                                Buy
                              </button>
                              <button
                                className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                                onClick={() => handleOptionOrder('sell', option)}
                              >
                                Sell
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <AIInsightsPanel
              symbol={stockData.symbol}
              isConnected={stockFeedConnected}
              onAITrade={handleAITrade}
            />
          </aside>
        </div>

        {error && (
          <Alert variant="destructive" className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <OptionTradeModal
          open={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          details={pendingTrade}
          onConfirm={confirmOptionOrder}
        />
      </div>
    </TooltipProvider>
  );
};

export default OptionsPage;
