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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


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
  mark?: number;
  last?: number;
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
  const [showBackgroundFlash, setShowBackgroundFlash] = useState<boolean>(false);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);
  const [expirationsLoading, setExpirationsLoading] = useState<boolean>(false);
  const [optionSide, setOptionSide] = useState<'calls' | 'puts'>('calls');
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
      const bid = Number(c.bid ?? c.bestBid ?? c.b ?? 0) || 0;
      const ask = Number(c.ask ?? c.bestAsk ?? c.a ?? 0) || 0;
      const last = Number(c.last ?? c.lastPrice ?? 0) || undefined;
      const mid = bid > 0 && ask > 0 ? (bid + ask) / 2 : (last || 0);
      return {
        contractSymbol: (c.contractSymbol as string) || (c.symbol as string) || undefined,
        strike: Number(c.strike ?? 0) || 0,
        bid,
        ask,
        mark: Number(mid.toFixed(2)),
        last: last ? Number(Number(last).toFixed(2)) : undefined,
        volume: Number(c.volume ?? 0) || 0,
        openInterest: Number(c.openInterest ?? 0) || 0,
        impliedVolatility: typeof c.impliedVolatility === 'number' ? (c.impliedVolatility as number) : undefined,
        percentChange: typeof c.percentChange === 'number' ? (c.percentChange as number) : undefined,
        expiry: (c.expiry as string) || (c.expiration as string) || undefined,
      };
    });

    const puts: OptionContract[] = rawPuts.map((item) => {
      const p = (item || {}) as Record<string, unknown>;
      const bid = Number(p.bid ?? p.bestBid ?? p.b ?? 0) || 0;
      const ask = Number(p.ask ?? p.bestAsk ?? p.a ?? 0) || 0;
      const last = Number(p.last ?? p.lastPrice ?? 0) || undefined;
      const mid = bid > 0 && ask > 0 ? (bid + ask) / 2 : (last || 0);
      return {
        contractSymbol: (p.contractSymbol as string) || (p.symbol as string) || undefined,
        strike: Number(p.strike ?? 0) || 0,
        bid,
        ask,
        mark: Number(mid.toFixed(2)),
        last: last ? Number(Number(last).toFixed(2)) : undefined,
        volume: Number(p.volume ?? 0) || 0,
        openInterest: Number(p.openInterest ?? 0) || 0,
        impliedVolatility: typeof p.impliedVolatility === 'number' ? (p.impliedVolatility as number) : undefined,
        percentChange: typeof p.percentChange === 'number' ? (p.percentChange as number) : undefined,
        expiry: (p.expiry as string) || (p.expiration as string) || undefined,
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
        setShowBackgroundFlash(true);
        setTimeout(() => setPriceUpdated(false), 1000);
        setTimeout(() => setShowBackgroundFlash(false), 3000);
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

  // Format an expiry date (YYYY-MM-DD) as a local date without timezone shift
  const formatExpiryLocal = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== 'string') return dateStr as string;
    const parts = dateStr.split('-').map((p) => Number(p));
    const y = parts[0];
    const m = (parts[1] || 1) - 1;
    const d = parts[2] || 1;
    const localNoon = new Date(y, m, d, 12, 0, 0, 0);
    return localNoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate days to expiry (DTE) using local dates to avoid timezone issues
  const getDaysToExpiry = (dateStr: string | null): number | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-').map((p) => Number(p));
    const y = parts[0];
    const m = (parts[1] || 1) - 1;
    const d = parts[2] || 1;
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
    const expiryLocal = new Date(y, m, d, 12, 0, 0, 0);
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.max(0, Math.round((expiryLocal.getTime() - todayLocal.getTime()) / msInDay));
  };

  const handleAITrade = () => {
    navigate(`/ai-trading/${currentSymbol}`);
  };

  // Load expirations when symbol changes
  useEffect(() => {
    let isActive = true;
    const loadExpirations = async () => {
      if (!currentSymbol) return;
      setExpirationsLoading(true);
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
      } finally {
        if (isActive) setExpirationsLoading(false);
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
        const resp = await stockDataService.getOptionsChain(currentSymbol, selectedExpiry, 60);
        const normalized = normalizeOptions(resp);
        // Only update if data materially changed to reduce flicker
        setOptionChainData((prev) => {
          const prevKey = JSON.stringify(prev?.calls?.slice(0, 5)) + JSON.stringify(prev?.puts?.slice(0, 5));
          const nextKey = JSON.stringify(normalized.calls.slice(0, 5)) + JSON.stringify(normalized.puts.slice(0, 5));
          if (prevKey !== nextKey) return normalized;
          return prev || normalized;
        });
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

  const getMoneynessShort = (strike: number) => {
    const label = getMoneyness(strike);
    switch (label) {
      case 'Deep ITM': return 'Deep';
      case 'Near ATM': return 'ATM';
      default: return label;
    }
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
      <div className="min-h-screen text-gray-100 p-6 transition-colors duration-300" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: showBackgroundFlash ? (stockData.change >= 0 ? '#0a1a0a' : '#1a0a0a') : '#0E1117' }}>
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
                  <div className="ml-4 flex items-center gap-2 text-xs bg-[#1c2128] border border-[#30363d] rounded-md p-1">
                    <button
                      className={`px-2 py-1 rounded ${optionSide === 'calls' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                      aria-pressed={optionSide === 'calls'}
                      onClick={() => setOptionSide('calls')}
                    >
                      Calls
                    </button>
                    <button
                      className={`px-2 py-1 rounded ${optionSide === 'puts' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                      aria-pressed={optionSide === 'puts'}
                      onClick={() => setOptionSide('puts')}
                    >
                      Puts
                    </button>
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
                  <Select
                    value={selectedExpiry || ''}
                    onValueChange={(value) => setSelectedExpiry(value)}
                    disabled={expirationsLoading || expirations.length === 0}
                  >
                    <SelectTrigger className="w-56 h-9 bg-[#1c2128] border border-[#30363d] text-white">
                      <SelectValue placeholder={expirationsLoading ? 'Loading…' : 'Select expiry'} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c2128] text-white border border-[#30363d]">
                      {expirations.map((date) => (
                        <SelectItem key={date} value={date}>
                          <div className="flex w-full items-center justify-between">
                            <span>{formatExpiryLocal(date)}</span>
                            <span className="ml-3 text-xs text-gray-400">DTE {getDaysToExpiry(date)}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedExpiry && (
                    <span className="text-gray-400 text-sm">{getDaysToExpiry(selectedExpiry)}d</span>
                  )}
                </div>
                  {/* Additional expiry display removed to avoid duplication */}
              </div>

              <div className="grid grid-cols-1 gap-6">
                {/* Call Options */}
                {optionSide === 'calls' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Call Options</h3>
                      <div className="text-sm text-gray-400">{optionChainData?.calls.length || 0} contracts</div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-left">Strike {optionSide === 'calls' ? '(C)' : ''}</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-center">Stat</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Bid</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Ask</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Mark</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChainData?.calls.map((option, index) => (
                        <tr key={index} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                          <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">${option.strike}</td>
                          <td className="px-3 py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMoneynessBg(
                                  option.strike
                                )} ${getMoneynessColor(option.strike)}`}
                              >
                              {getMoneynessShort(option.strike)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">${option.bid.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-mono">${option.ask.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-mono">${(option.mark ?? ((option.bid > 0 && option.ask > 0) ? (option.bid + option.ask) / 2 : (option.last ?? 0))).toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right space-x-1">
                              <button
                                className="px-2 py-1 text-xs rounded bg-green-700 hover:bg-green-600"
                                onClick={() => {
                                  const datePart = (selectedExpiry || '').replace(/-/g, '').slice(2);
                                  const contractSymbol = `${currentSymbol}${datePart}C${option.strike}`;
                                  handleOptionOrder('buy', { ...option, contractSymbol });
                                }}
                              >
                                Buy
                              </button>
                              <button
                                className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                                onClick={() => {
                                  const datePart = (selectedExpiry || '').replace(/-/g, '').slice(2);
                                  const contractSymbol = `${currentSymbol}${datePart}C${option.strike}`;
                                  handleOptionOrder('sell', { ...option, contractSymbol });
                                }}
                              >
                                Sell
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}

                {/* Put Options */}
                {optionSide === 'puts' && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">Put Options</h3>
                      <div className="text-sm text-gray-400">{optionChainData?.puts.length || 0} contracts</div>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#30363d]">
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-left">Strike {optionSide === 'puts' ? '(P)' : ''}</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-center">Stat</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Bid</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Ask</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Mark</th>
                        <th className="px-3 py-2.5 font-medium text-gray-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionChainData?.puts.map((option, index) => (
                        <tr key={index} className="border-b border-[#30363d] hover:bg-[#1c2128]">
                          <td className="px-3 py-2.5 font-medium text-white whitespace-nowrap">${option.strike}</td>
                          <td className="px-3 py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMoneynessBg(
                                  option.strike
                                )} ${getMoneynessColor(option.strike)}`}
                              >
                              {getMoneynessShort(option.strike)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono">${option.bid.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-mono">${option.ask.toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-right font-mono">${(option.mark ?? ((option.bid > 0 && option.ask > 0) ? (option.bid + option.ask) / 2 : (option.last ?? 0))).toFixed(2)}</td>
                            <td className="px-3 py-2.5 text-right space-x-1">
                              <button
                                className="px-2 py-1 text-xs rounded bg-green-700 hover:bg-green-600"
                                onClick={() => {
                                  const datePart = (selectedExpiry || '').replace(/-/g, '').slice(2);
                                  const contractSymbol = `${currentSymbol}${datePart}P${option.strike}`;
                                  handleOptionOrder('buy', { ...option, contractSymbol });
                                }}
                              >
                                Buy
                              </button>
                              <button
                                className="px-2 py-1 text-xs rounded bg-red-700 hover:bg-red-600"
                                onClick={() => {
                                  const datePart = (selectedExpiry || '').replace(/-/g, '').slice(2);
                                  const contractSymbol = `${currentSymbol}${datePart}P${option.strike}`;
                                  handleOptionOrder('sell', { ...option, contractSymbol });
                                }}
                              >
                                Sell
                              </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
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
