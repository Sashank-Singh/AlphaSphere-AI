import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYahooFinanceData } from '@/hooks/useYahooFinanceData';
import { stockDataService, StockQuote } from '@/lib/stockDataService';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MarketOverview, TopStock, MarketIndex, Sector } from '@/types';

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
  <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
    {showSign && change >= 0 ? '+' : ''}{change.toFixed(2)}
  </span>
);

const formatPercent = (percent: number) => (
  <span className={percent >= 0 ? 'text-green-500' : 'text-red-500'}>
    {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
  </span>
);

// List of symbols to subscribe for real-time data
const REALTIME_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM'];

const MarketPage: React.FC = () => {
  const navigate = useNavigate();
  // Use Yahoo Finance for real-time stock data
  const { stockData, isConnected } = useYahooFinanceData(REALTIME_SYMBOLS);

  const [marketOverview, setMarketOverview] = useState<MarketOverview>(initialMarketOverview);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);


  // Top stocks state with real-time data only
  const [topStocks, setTopStocks] = useState<TopStock[]>([]);
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

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [tab, setTab] = useState<'stocks' | 'indices' | 'sectors'>('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load initial market data
  useEffect(() => {
    const loadMarketData = async () => {
      setIsLoadingMarketData(true);
      try {
        // Fetch market overview data
        const [spyData, qqqData, diaData, vixData] = await Promise.all([
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.sp500),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.nasdaq),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.dow),
          stockDataService.getStockQuote(MARKET_OVERVIEW_SYMBOLS.vix)
        ]);

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
    <ProtectedRoute>
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Market Overview Header */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-main mb-2">Market Overview</h1>
                <div className="flex items-center gap-4">
                  <p className="text-secondary">Real-time market data and analysis</p>
                  {!isLoadingMarketData && marketOverview.lastUpdated && (
                    <span className="text-xs text-secondary">
                      Updated: {marketOverview.lastUpdated.toLocaleTimeString()}
                    </span>
                  )}
                  {isConnected && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Live
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-card border border-card px-4 py-2 rounded-lg text-main hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <span className={`icon ${isRefreshing ? 'animate-spin' : ''}`}>
                  refresh
                </span>
                Refresh
              </button>
            </div>

            {/* Key Market Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className="bg-card p-4 rounded-lg border border-card hover:border-primary/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/stocks/SPY')}
              >
                <div>
                  <p className="text-sm text-secondary">S&P 500</p>
                  {isLoadingMarketData ? (
                    <div className="space-y-2">
                      <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-main">${marketOverview.sp500.value.toFixed(2)}</p>
                      <p className={`text-sm ${marketOverview.sp500.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatChange(marketOverview.sp500.change, true)} ({formatPercent(marketOverview.sp500.changePercent)})
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="bg-card p-4 rounded-lg border border-card hover:border-primary/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/stocks/QQQ')}
              >
                <div>
                  <p className="text-sm text-secondary">NASDAQ</p>
                  {isLoadingMarketData ? (
                    <div className="space-y-2">
                      <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-main">${marketOverview.nasdaq.value.toFixed(2)}</p>
                      <p className={`text-sm ${marketOverview.nasdaq.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatChange(marketOverview.nasdaq.change, true)} ({formatPercent(marketOverview.nasdaq.changePercent)})
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="bg-card p-4 rounded-lg border border-card hover:border-primary/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/stocks/DIA')}
              >
                <div>
                  <p className="text-sm text-secondary">Dow Jones</p>
                  {isLoadingMarketData ? (
                    <div className="space-y-2">
                      <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-main">${marketOverview.dow.value.toFixed(2)}</p>
                      <p className={`text-sm ${marketOverview.dow.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatChange(marketOverview.dow.change, true)} ({formatPercent(marketOverview.dow.changePercent)})
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div 
                className="bg-card p-4 rounded-lg border border-card hover:border-primary/50 hover:bg-gray-700/50 transition-all duration-300 cursor-pointer"
                onClick={() => navigate('/stocks/^VIX')}
              >
                <div>
                  <p className="text-sm text-secondary">VIX</p>
                  {isLoadingMarketData ? (
                    <div className="space-y-2">
                      <div className="h-8 w-20 bg-gray-700 animate-pulse rounded"></div>
                      <div className="h-4 w-16 bg-gray-700 animate-pulse rounded"></div>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-main">{marketOverview.vix.value.toFixed(2)}</p>
                      <p className={`text-sm ${marketOverview.vix.changePercent >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {formatChange(marketOverview.vix.change, true)} ({formatPercent(marketOverview.vix.changePercent)})
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Market Sentiment and Volume */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-lg border border-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Market Sentiment</p>
                    <p className={`text-lg font-semibold ${
                      marketOverview.sentiment === 'bullish' ? 'text-green-500' : 
                      marketOverview.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                    }`}>
                      {marketOverview.sentiment.charAt(0).toUpperCase() + marketOverview.sentiment.slice(1)}
                    </p>
                  </div>
                  <span className={`icon text-2xl ${
                    marketOverview.sentiment === 'bullish' ? 'text-green-500' : 
                    marketOverview.sentiment === 'bearish' ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    {marketOverview.sentiment === 'bullish' ? 'trending_up' : 
                     marketOverview.sentiment === 'bearish' ? 'trending_down' : 'trending_flat'}
                  </span>
                </div>
              </div>

              <div className="bg-card p-4 rounded-lg border border-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-secondary">Total Volume</p>
                    <p className="text-lg font-semibold text-main">{marketOverview.volume}</p>
                  </div>
                  <span className="icon text-blue-400 text-2xl">analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mt-8">
            <div className="flex gap-2">
              <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === 'stocks' 
                    ? 'bg-primary text-white' 
                    : 'bg-card text-secondary hover:text-main border border-card'
                }`}
                onClick={() => setTab('stocks')}
              >
                Stocks
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === 'indices' 
                    ? 'bg-primary text-white' 
                    : 'bg-card text-secondary hover:text-main border border-card'
                }`}
                onClick={() => setTab('indices')}
              >
                Indices
              </button>
              <button
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  tab === 'sectors' 
                    ? 'bg-primary text-white' 
                    : 'bg-card text-secondary hover:text-main border border-card'
                }`}
                onClick={() => setTab('sectors')}
              >
                Sectors
              </button>
            </div>

            {tab === 'stocks' && (
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <span className="icon absolute left-3 top-3 text-secondary">search</span>
                  <input
                    placeholder="Search stocks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-card border border-card rounded-lg px-4 py-2 text-main placeholder-secondary w-full"
                  />
                </div>
                <button className="bg-card border border-card px-4 py-2 rounded-lg text-main hover:bg-gray-700 transition-colors">
                  <span className="icon">filter_list</span>
                </button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="space-y-6 mt-6">
            {tab === 'stocks' && (
              <div className="bg-card p-6 rounded-lg border border-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-main flex items-center gap-2">
                    <span className="icon text-blue-400">trending_up</span>
                    Top Stocks
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary flex items-center gap-1">
                      <span className="icon">visibility</span>
                      Live Data
                    </span>
                    <button className="bg-primary px-3 py-1 rounded text-white text-xs hover:bg-primary/80 transition-colors">
                      View All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {isLoadingTopStocks ? (
                    Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 animate-pulse">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="h-6 w-20 bg-gray-700 rounded mb-2"></div>
                              <div className="h-4 w-32 bg-gray-700 rounded"></div>
                            </div>
                            <div className="h-5 w-5 bg-gray-700 rounded"></div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-10 w-24 bg-gray-700 rounded"></div>
                            <div className="h-5 w-20 bg-gray-700 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-700 rounded"></div>
                            <div className="h-4 w-full bg-gray-700 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    filteredStocks.slice(0, 8).map(stock => (
                      <div
                        key={stock.symbol}
                        className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-primary/50 hover:bg-gray-800/70 transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(`/stocks/${stock.symbol}`)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-xl text-main group-hover:text-primary transition-colors">
                                {stock.symbol}
                              </h3>
                              <p className="text-sm text-secondary truncate mt-1">{stock.name}</p>
                            </div>
                            <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-yellow-500/20 transition-colors group">
                              <span className="icon text-secondary group-hover:text-yellow-400 transition-colors">star</span>
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-3xl font-bold text-main">${stock.price.toFixed(2)}</p>
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-semibold ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                              </span>
                              <span className={`text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm text-secondary">
                            <div className="flex justify-between items-center">
                              <span>Volume</span>
                              <span className="font-medium text-main">{(stock.volume / 1_000_000).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Market Cap</span>
                              <span className="font-medium text-main">{stock.marketCap}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {tab === 'indices' && (
              <div className="bg-card p-6 rounded-lg border border-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-main flex items-center gap-2">
                    <span className="icon text-purple-400">bar_chart</span>
                    Market Indices
                  </h2>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <span className="icon">visibility</span>
                    Real-time Data
                  </span>
                </div>
                {isLoadingMarketData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="p-6 rounded-lg bg-gray-800 border border-gray-700">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="h-6 w-16 bg-gray-700 animate-pulse rounded"></div>
                            <div className="h-5 w-5 bg-gray-700 animate-pulse rounded"></div>
                          </div>
                          <div className="h-4 w-32 bg-gray-700 animate-pulse rounded"></div>
                          <div className="space-y-2">
                            <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
                            <div className="h-4 w-20 bg-gray-700 animate-pulse rounded"></div>
                            <div className="h-3 w-16 bg-gray-700 animate-pulse rounded"></div>
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
                        className="p-6 rounded-lg bg-gray-800 border border-gray-700 hover:border-primary transition-all cursor-pointer"
                        onClick={() => navigate(`/stocks/${index.symbol}`)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg text-main">{index.symbol}</h3>
                            <div className="flex items-center gap-1">
                              {index.changePercent >= 0 ? (
                                <span className="icon text-green-500">trending_up</span>
                              ) : (
                                <span className="icon text-red-500">trending_down</span>
                              )}
                              <span className="icon text-blue-400">bar_chart</span>
                            </div>
                          </div>
                          <p className="text-sm text-secondary">{index.name}</p>
                          <div className="space-y-2">
                            <p className="text-3xl font-bold text-main">${index.value.toFixed(2)}</p>
                            <div className="flex items-center gap-2">
                              {formatChange(index.change)}
                              {formatPercent(index.changePercent)}
                            </div>
                            <p className="text-xs text-secondary">Volume: {index.volume}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'sectors' && (
              <div className="bg-card p-6 rounded-lg border border-card">
                <h2 className="text-lg font-semibold text-main mb-4 flex items-center gap-2">
                  <span className="icon text-green-400">activity</span>
                  Sector Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoadingSectors ? (
                    Array.from({ length: 11 }).map((_, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-800 border border-gray-700 animate-pulse">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-32 bg-gray-700 rounded"></div>
                            <div className="h-4 w-4 bg-gray-700 rounded"></div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-16 bg-gray-700 rounded"></div>
                            <div className="space-y-1">
                              <div className="h-3 w-full bg-gray-700 rounded"></div>
                              <div className="h-3 w-full bg-gray-700 rounded"></div>
                              <div className="h-3 w-full bg-gray-700 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    sectors.map(sector => (
                      <div
                        key={sector.name}
                        className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-primary transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-main">{sector.name}</h3>
                            {sector.change >= 0 ? (
                              <span className="icon text-green-500">trending_up</span>
                            ) : (
                              <span className="icon text-red-500">trending_down</span>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {formatPercent(sector.change)}
                            </div>
                            <div className="text-xs text-secondary space-y-1">
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
                                <span className="font-medium text-main">{sector.leader}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
    </ProtectedRoute>
  );
};

export default MarketPage;
