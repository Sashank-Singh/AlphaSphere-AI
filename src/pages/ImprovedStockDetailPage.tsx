import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, TrendingUp, TrendingDown, ArrowUpDown, RefreshCw } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock } from '@/types';
import { stockDataService } from '@/lib/stockDataService';
import { usePortfolio } from '@/context/PortfolioContext';
import StockPriceChart from '@/components/StockPriceChart';
import TradeModal from '@/components/TradeModal';
import AISentimentAnalysis from '@/components/AISentimentAnalysis';
import PredictivePriceForecasting from '@/components/PredictivePriceForecasting';
import AIFinancialHealthAnalysis from '@/components/AIFinancialHealthAnalysis';
import AINewsImpactAnalysis from '@/components/AINewsImpactAnalysis';
import AIFundamentalScore from '@/components/AIFundamentalScore';
import AIPatternRecognition from '@/components/AIPatternRecognition';
import AIEarningsPrediction from '@/components/AIEarningsPrediction';
import AIInsiderTradingAnalysis from '@/components/AIInsiderTradingAnalysis';
import AIOptionsFlowAnalysis from '@/components/AIOptionsFlowAnalysis';

interface DailyData {
  open: number;
  high: number;
  low: number;
  volume: number;
  previousClose?: number;
}

const ImprovedStockDetailPage: React.FC = () => {
  const params = useParams<{ symbol?: string; ticker?: string }>();
  const symbol = params.symbol || params.ticker;
  const navigate = useNavigate();
  const { portfolio, executeStockTrade } = usePortfolio();
  
  const [stock, setStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);

  // Memoize portfolio calculations to prevent unnecessary recalculations
  const portfolioData = useMemo(() => {
    if (!stock || !portfolio) return null;
    
    const position = portfolio.positions.find(p => p.symbol === stock.symbol);
    const ownedQuantity = position?.quantity || 0;
    const positionValue = ownedQuantity * stock.price;
    const avgPrice = position?.averagePrice || 0;
    const costBasis = ownedQuantity * avgPrice;
    const profitLoss = positionValue - costBasis;
    const profitLossPercent = avgPrice > 0 && costBasis > 0 ? (profitLoss / costBasis) : 0;

    return {
      position,
      ownedQuantity,
      positionValue,
      avgPrice,
      costBasis,
      profitLoss,
      profitLossPercent
    };
  }, [portfolio, stock]);

  // Load all stock data on mount
  const loadStockData = useCallback(async (ticker: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [quote, companyInfo, history] = await Promise.all([
        stockDataService.getStockQuote(ticker),
        stockDataService.getCompanyInfo(ticker),
        stockDataService.getHistoricalPrices(ticker, 2),
      ]);

      // Create a comprehensive stock object
      const stockData: Stock = {
        id: ticker.toUpperCase(),
        symbol: ticker.toUpperCase(),
        name: companyInfo?.name || ticker,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        volume: quote.volume,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        marketCap: companyInfo?.marketCap,
        sector: companyInfo?.sector,
        description: companyInfo?.description,
        lastUpdated: new Date(),
      };

      setStock(stockData);
      setLastUpdated(new Date());

      // Set daily data from history
      if (history && history.length > 0) {
        const latestData = history[history.length - 1];
        setDailyData({
          open: latestData.open,
          high: latestData.high,
          low: latestData.low,
          volume: latestData.volume,
          previousClose: history.length > 1 ? history[history.length - 2].close : undefined,
        });
      }
    } catch (err) {
      console.error('Error loading stock data:', err);
      setError('Failed to fetch stock data. Please check the symbol and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (symbol) {
      loadStockData(symbol);
    }
  }, [symbol, loadStockData]);

  // Periodic price updates
  useEffect(() => {
    if (!stock || isLoading) return;
    
    const updatePrice = async () => {
      try {
        const quote = await stockDataService.getStockQuote(stock.symbol);
        setStock(prev => prev ? {
          ...prev,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          lastUpdated: new Date()
        } : null);
        setLastUpdated(new Date());
        setError(null); 
      } catch (error) {
        console.error('Error updating stock price:', error);
      }
    };

    const intervalId = setInterval(updatePrice, 15000);
    return () => clearInterval(intervalId);
  }, [stock, isLoading]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (!symbol || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await loadStockData(symbol);
    } catch (error) {
      console.error('Error refreshing stock data:', error);
      setError('Failed to refresh stock data');
    } finally {
      setIsRefreshing(false);
    }
  }, [symbol, isRefreshing, loadStockData]);

  const handleStockTrade = useCallback(async (quantity: number, price: number, type: 'buy' | 'sell') => {
    if (!stock) return;
    
    try {
      const success = await executeStockTrade(stock.symbol, quantity, price, type);
      if (success) {
        setIsTradeModalOpen(false);
      }
    } catch (error) {
      console.error('Error executing stock trade:', error);
    }
  }, [stock, executeStockTrade]);

  if (isLoading || !stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col w-full max-w-md space-y-4 p-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/market')} className="mt-4">
          Back to Market
        </Button>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const safeChangePercent = stock.changePercent ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-gray-600">{stock.name}</p>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
          <Button onClick={() => setIsTradeModalOpen(true)} className="flex gap-2 items-center">
            <ArrowUpDown className="h-4 w-4" />
            Trade
          </Button>
        </div>
      </div>

      {/* Price Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{formatCurrency(stock.price)}</div>
              <div className={cn("flex items-center gap-2 text-lg", isPositive ? "text-green-600" : "text-red-600")}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span>{isPositive ? '+' : ''}{formatCurrency(stock.change)}</span>
                <span>({formatPercentage(safeChangePercent)})</span>
              </div>
            </div>
            
            {portfolioData?.ownedQuantity > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-600">Your Position</div>
                <div className="text-xl font-semibold">{portfolioData.ownedQuantity} shares</div>
                <div className={cn("text-sm", portfolioData.profitLoss >= 0 ? "text-green-600" : "text-red-600")}>
                  {formatCurrency(portfolioData.profitLoss)} ({formatPercentage(portfolioData.profitLossPercent)})
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <div className="mb-12">
        {stock && (
          <StockPriceChart 
            symbol={symbol!}
          />
        )}
      </div>

      {/* Stock Details */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-600">Open</div>
              <div className="font-semibold">{dailyData ? formatCurrency(dailyData.open) : '...'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">High</div>
              <div className="font-semibold">{dailyData ? formatCurrency(dailyData.high) : '...'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Low</div>
              <div className="font-semibold">{dailyData ? formatCurrency(dailyData.low) : '...'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Volume</div>
              <div className="font-semibold">{dailyData ? (dailyData.volume || 0).toLocaleString() : '...'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Prev. Close</div>
              <div className="font-semibold">{dailyData && dailyData.previousClose ? formatCurrency(dailyData.previousClose) : '...'}</div>
            </div>
            {stock.marketCap && (
              <div>
                <div className="text-sm text-gray-600">Market Cap</div>
                <div className="font-semibold">{formatCurrency(stock.marketCap)}</div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600">52W Range</div>
              <div className="font-semibold text-xs">
                {formatCurrency((stock.low ?? stock.price) * 0.8)} - {formatCurrency((stock.high ?? stock.price) * 1.2)}
              </div>
            </div>
            {stock.sector && (
              <div>
                <div className="text-sm text-gray-600">Sector</div>
                <div className="font-semibold">{stock.sector}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 my-12">
        <AISentimentAnalysis symbol={stock.symbol} stock={stock} className="w-full" />
        <PredictivePriceForecasting symbol={stock.symbol} stock={stock} className="w-full" />
        <AIFinancialHealthAnalysis symbol={stock.symbol} stock={stock} className="w-full" />
        <AINewsImpactAnalysis symbol={stock.symbol} stock={stock} className="w-full" />
        <AIFundamentalScore symbol={stock.symbol} stock={stock} className="w-full" />
        <AIPatternRecognition symbol={stock.symbol} stock={stock} className="w-full" />
        <AIEarningsPrediction symbol={stock.symbol} stock={stock} className="w-full" />
        <AIInsiderTradingAnalysis symbol={stock.symbol} stock={stock} className="w-full" />
        <AIOptionsFlowAnalysis symbol={stock.symbol} stock={stock} className="w-full" />
      </div>

      {stock.description && (
        <Card className="mb-6">
          <CardHeader><CardTitle>About {stock.name}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{stock.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Watchlist Section */}
      <Card>
        <CardHeader>
          <CardTitle>Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Create a watchlist to track your favorite stocks.</div>
          {/* Remove or comment out the buttons below */}
          {/* <Button>Trade Stock</Button>
          <Button>Trade with AI</Button>
          <Button>Show Options</Button> */}
        </CardContent>
      </Card>

      {/* Trade Modal */}
      {isTradeModalOpen && (
        <TradeModal
          stock={stock}
          open={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          onTrade={handleStockTrade}
        />
      )}
    </div>
  );
};

export default ImprovedStockDetailPage;
