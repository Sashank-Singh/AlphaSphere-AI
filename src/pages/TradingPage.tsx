import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useYahooFinanceData } from '@/hooks/useYahooFinanceData';
import { stockDataService } from '@/lib/stockDataService';
// Import the trading components
import StockHeader from '@/components/trading/StockHeader';
import PriceDisplay from '@/components/trading/PriceDisplay';
import ChartSection from '@/components/trading/ChartSection';
import MarketDataGrid from '@/components/trading/MarketDataGrid';
import AIInsightsPanel from '@/components/trading/AIInsightsPanel';
import EnhancedTradingPanel from '@/components/trading/EnhancedTradingPanel';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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
// Yahoo Finance data types
// (Types are imported from useYahooFinanceData hook)

// --- END TYPE DEFINITIONS ---

const TradingPage: React.FC = () => {
  const { symbol: routeSymbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [currentSymbol, setCurrentSymbol] = useState<string>(routeSymbol || 'AAPL');
  const [companyName, setCompanyName] = useState<string>('Apple Inc.');
  const [stockData, setStockData] = useState<DisplayStockData>({
    symbol: currentSymbol,
    price: 202.38,
    change: -5.19,
    changePercent: -2.50,
    lastUpdated: Date.now(),
    isMockData: false
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceUpdated, setPriceUpdated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [news, setNews] = useState<Array<{ title: string; url: string; publisher?: string; publishedAt?: string; summary?: string; imageUrl?: string }>>([]);

  const prevPriceRef = useRef<number>(0);

  const { 
    stockData: wsStockData,
    isConnected 
  } = useYahooFinanceData([currentSymbol], [currentSymbol]);

  // Update symbol when route changes
  useEffect(() => {
    if (routeSymbol && routeSymbol !== currentSymbol) {
      setCurrentSymbol(routeSymbol);
      // Clear previous data
      setError(null);
    }
  }, [routeSymbol, currentSymbol]);

  // Remove the estimated cost effect since quantity is handled by components
  // useEffect(() => {
  //   const qty = parseFloat(quantity) || 0;
  //   setEstimatedCost(qty * stockData.price);
  // }, [quantity, stockData.price]);

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
        const [quote, info, newsItems] = await Promise.all([
          stockDataService.getStockQuote(currentSymbol),
          stockDataService.getCompanyInfo(currentSymbol),
          stockDataService.getCompanyNews(currentSymbol, 6)
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
          // Update company name
          setCompanyName(info.name || getCompanyName(currentSymbol));
        } else {
          setCompanyName(getCompanyName(currentSymbol));
        }

        if (newsItems && Array.isArray(newsItems)) {
          setNews(newsItems);
        } else {
          setNews([]);
        }
      } catch (error) {
        console.error(`Error fetching stock data for ${currentSymbol}:`, error);
        setError(`Failed to load data for ${currentSymbol}`);
        toast({
          title: "Error",
          description: `Failed to load data for ${currentSymbol}`,
          variant: "destructive",
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
      'AAPL': 'Apple Inc.',
      'TSLA': 'Tesla, Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com, Inc.',
      'META': 'Meta Platforms, Inc.',
      'NVDA': 'NVIDIA Corporation',
      'NFLX': 'Netflix, Inc.',
      'SPY': 'SPDR S&P 500 ETF Trust',
      'QQQ': 'Invesco QQQ Trust'
    };
    return companies[symbol] || `${symbol} Inc.`;
  };

  const handlePlaceOrder = (action: 'buy' | 'sell') => {
    console.log(`${action.toUpperCase()} order for ${stockData.symbol} - quantity handled by component`);
    // The trading components now handle the order placement
  };

  const handleAITrade = () => {
    navigate(`/ai-trading/${currentSymbol}`);
  };

  // Options data fetching removed here; handled in dedicated components if needed

  let stockFeedConnected = false;
  if (typeof isConnected === 'object' && isConnected !== null) {
    const connectionObject = isConnected as { stocks?: unknown }; 
    if (typeof connectionObject.stocks === 'boolean') {
      stockFeedConnected = connectionObject.stocks;
    }
  } else if (typeof isConnected === 'boolean') {
    stockFeedConnected = isConnected;
  }

  // Derived UI state handled within child components

  return (
    <div className="min-h-screen text-gray-100 p-6" style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#0E1117' }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Header Component */}
          <StockHeader 
            symbol={stockData.symbol}
            companyName={companyName}
            onSymbolChange={(newSymbol) => navigate(`/trading/${newSymbol}`)}
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

          {/* Market Data Grid Component */}
          <div className="pt-8 space-y-6">
            <MarketDataGrid symbol={stockData.symbol} />
            {/* Trading Controls under Market Data */}
            <EnhancedTradingPanel 
              symbol={stockData.symbol}
              currentPrice={stockData.price}
              onPlaceOrder={(action, quantity, orderType, limitPrice) => {
                console.log(`${action.toUpperCase()} ${quantity} shares of ${stockData.symbol} at $${stockData.price} via ${orderType} order`);
                alert(`${action.toUpperCase()} order placed for ${quantity} shares of ${stockData.symbol}`);
              }}
            />

            {/* Latest News below trade controls */}
            <div className="p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#0E1117' }}>
              <h2 className="text-lg font-bold text-white mb-4">Latest News</h2>
              <div className="space-y-3">
                {news.length === 0 ? (
                  <p className="text-sm text-slate-400">No recent news available.</p>
                ) : (
                  news.map((item, idx) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white group-hover:text-blue-300 leading-relaxed">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.publisher || 'Source'} • {item.publishedAt ? new Date(item.publishedAt).toLocaleString() : ''}</p>
            </div>
          </div>
                    </a>
                  ))
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* AI Insights Panel Component */}
          <AIInsightsPanel 
            key={stockData.symbol}
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
    </div>
  );
};

export default TradingPage;
