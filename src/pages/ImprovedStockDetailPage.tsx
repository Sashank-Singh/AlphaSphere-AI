import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, TrendingUp, TrendingDown, ArrowUpDown, RefreshCw, BarChart3, FileText, Lightbulb, Plus } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock, OptionContract } from '@/types';
import { stockDataService } from '@/lib/stockDataService';
import { usePortfolio } from '@/context/PortfolioContext';
import StockPriceChart from '@/components/StockPriceChart';
import TradeModal from '@/components/TradeModal';
import AITradeModal from '@/components/AITradeModal';
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
  const [isAITradeModalOpen, setIsAITradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'options' | 'financials' | 'analysis'>('overview');

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

  const handleAITrade = useCallback(async (option: OptionContract, quantity: number, type: 'buy' | 'sell') => {
    try {
      // Handle AI trade execution - this would typically involve options trading
      console.log('AI Trade executed:', { option, quantity, type });
      setIsAITradeModalOpen(false);
    } catch (error) {
      console.error('AI Trade execution failed:', error);
    }
  }, []);

  if (isLoading || !stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212]">
        <div className="animate-pulse flex flex-col w-full max-w-md space-y-4 p-4">
          <div className="h-8 bg-[#1E1E1E] rounded w-1/3"></div>
          <div className="h-16 bg-[#1E1E1E] rounded"></div>
          <div className="h-64 bg-[#1E1E1E] rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212]">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/market')} className="mt-4 bg-[#2196F3] hover:bg-[#1976D2] text-white">
          Back to Market
        </Button>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const safeChangePercent = stock.changePercent ?? 0;

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Stock Info and Chart */}
              <div className="lg:col-span-2 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
                {/* Stock Header */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-[#E0E0E0]">{stock.symbol}</h2>
                    <p className="text-[#B0B0B0]">{stock.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-[#4CAF50]">{formatCurrency(stock.price)}</p>
                    <p className={cn("text-lg", isPositive ? "text-[#4CAF50]" : "text-red-400")}>
                      {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({formatPercentage(safeChangePercent)})
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-[600px] bg-gray-900 rounded-xl mb-6">
                  {stock && (
                    <StockPriceChart 
                      symbol={symbol!}
                    />
                  )}
                </div>

                {/* Portfolio Position */}
                {portfolioData?.ownedQuantity > 0 && (
                  <div className="flex justify-between items-center bg-gray-900/50 p-4 rounded-xl mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#E0E0E0]">Your Stock Position</h3>
                      <p className="text-[#B0B0B0]">{portfolioData.ownedQuantity} shares</p>
                    </div>
                    <div>
                      <p className="text-[#B0B0B0]">Market Value</p>
                      <p className="text-lg font-semibold text-[#E0E0E0]">{formatCurrency(portfolioData.positionValue)}</p>
                    </div>
                    <div>
                      <p className="text-[#B0B0B0]">Total Gain/Loss</p>
                      <p className={cn("text-lg font-semibold", portfolioData.profitLoss >= 0 ? "text-[#4CAF50]" : "text-red-400")}>
                        {formatCurrency(portfolioData.profitLoss)} ({formatPercentage(portfolioData.profitLossPercent)})
                      </p>
                    </div>
                  </div>
                )}

                {/* Trade Buttons */}
                <div className="flex gap-4 mb-6">
                  <button 
                    onClick={() => setIsTradeModalOpen(true)}
                    className="flex-1 bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                  >
                    <ArrowUpDown className="h-5 w-5" />
                    <span>Trade Stock</span>
                  </button>
                  <div className="relative flex-1 group">
                    <button 
                      onClick={() => setIsAITradeModalOpen(true)}
                      className="w-full bg-[#4CAF50] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-[0_4px_15px_0_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_0_rgba(76,175,80,0.4)]"
                    >
                      <Lightbulb className="h-5 w-5" />
                      <span>Trade with AI</span>
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max">
                      <div className="bg-gray-800 text-white text-sm rounded-md py-1 px-3 shadow-lg">
                        AI-powered trading recommendations
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - AI Insights */}
              <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-[#E0E0E0] mb-6">AI Insights</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-[rgba(33,150,243,0.1)] p-3 rounded-full">
                      <BarChart3 className="h-6 w-6 text-[#2196F3]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#E0E0E0]">AI Price Forecast</h4>
                      <p className="text-[#B0B0B0]">Predicts a slight upward trend in the next week.</p>
                      <p className="text-sm text-gray-400">Confidence: Medium (54%)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[rgba(76,175,80,0.1)] p-3 rounded-full">
                      <TrendingUp className="h-6 w-6 text-[#4CAF50]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#E0E0E0]">AI Sentiment Analysis</h4>
                      <p className="text-[#B0B0B0]">Overall sentiment is positive based on news and social media.</p>
                      <p className="text-sm text-[#4CAF50] font-medium">Strongly Positive</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[rgba(156,39,176,0.1)] p-3 rounded-full">
                      <FileText className="h-6 w-6 text-[#9C27B0]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#E0E0E0]">AI News Impact</h4>
                      <p className="text-[#B0B0B0]">Recent news about product launches positively impacting the stock.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-[rgba(255,193,7,0.1)] p-3 rounded-full">
                      <Lightbulb className="h-6 w-6 text-[#FFC107]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#E0E0E0]">AI Fundamental Score</h4>
                      <p className="text-[#B0B0B0]">Score: <span className="font-bold text-[#E0E0E0]">78/100</span>. Strong fundamentals.</p>
                    </div>
                  </div>
                </div>
                
                {/* Financial Health Section */}
                <div className="mt-8 pt-6 border-t border-[#333333]">
                  <h3 className="text-xl font-bold text-[#E0E0E0] mb-4">Financial Health</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">P/E Ratio</span>
                      <span className="font-semibold text-[#E0E0E0]">28.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">EPS</span>
                      <span className="font-semibold text-[#E0E0E0]">$5.89</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Market Cap</span>
                      <span className="font-semibold text-[#E0E0E0]">{stock.marketCap ? formatCurrency(stock.marketCap) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Dividend Yield</span>
                      <span className="font-semibold text-[#E0E0E0]">0.47%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Data */}
            <div className="mt-8 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">Market Data</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-sm text-[#B0B0B0]">Day High</p>
                  <p className="text-xl font-semibold text-[#E0E0E0]">{dailyData ? formatCurrency(dailyData.high) : '...'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#B0B0B0]">Day Low</p>
                  <p className="text-xl font-semibold text-[#E0E0E0]">{dailyData ? formatCurrency(dailyData.low) : '...'}</p>
                </div>
                <div>
                  <p className="text-sm text-[#B0B0B0]">52 Week High</p>
                  <p className="text-xl font-semibold text-[#E0E0E0]">{formatCurrency((stock.high ?? stock.price) * 1.2)}</p>
                </div>
                <div>
                  <p className="text-sm text-[#B0B0B0]">52 Week Low</p>
                  <p className="text-xl font-semibold text-[#E0E0E0]">{formatCurrency((stock.low ?? stock.price) * 0.8)}</p>
                </div>
              </div>
            </div>
          </>
        );

      case 'news':
        return (
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">{stock.symbol} News</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg hover:bg-gray-800/50 transition duration-300">
                <a className="block" href="#">
                  <p className="text-sm text-[#B0B0B0]">Reuters · 2 hours ago</p>
                  <h4 className="font-semibold text-[#E0E0E0] mt-1">Tech Giant Unveils New AI Features for Its Flagship Phone</h4>
                  <p className="text-sm text-[#B0B0B0] mt-1">The company announced a suite of new AI-powered capabilities coming to its ecosystem, aiming to enhance user experience and productivity.</p>
                </a>
              </div>
              <div className="p-4 rounded-lg hover:bg-gray-800/50 transition duration-300">
                <a className="block" href="#">
                  <p className="text-sm text-[#B0B0B0]">Bloomberg · 5 hours ago</p>
                  <h4 className="font-semibold text-[#E0E0E0] mt-1">Analysts Bullish on {stock.symbol} Ahead of Quarterly Earnings Report</h4>
                  <p className="text-sm text-[#B0B0B0] mt-1">Wall Street sentiment remains high as the tech leader is expected to post strong results, driven by robust sales in its services division.</p>
                </a>
              </div>
              <div className="p-4 rounded-lg hover:bg-gray-800/50 transition duration-300">
                <a className="block" href="#">
                  <p className="text-sm text-[#B0B0B0]">The Wall Street Journal · 1 day ago</p>
                  <h4 className="font-semibold text-[#E0E0E0] mt-1">Inside the Company's Push into Augmented Reality</h4>
                  <p className="text-sm text-[#B0B0B0] mt-1">A deep dive into the long-term strategy and development of the company's much-anticipated AR headset and its potential market impact.</p>
                </a>
              </div>
            </div>
            <div className="mt-4 text-center">
              <button className="text-[#2196F3] hover:text-blue-400 font-semibold transition">View More News</button>
            </div>
          </div>
        );

      case 'options':
        return (
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">Options Trading</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-lg font-semibold text-[#E0E0E0] mb-2">Call Options</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Strike Price</span>
                      <span className="text-[#E0E0E0]">$210</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Premium</span>
                      <span className="text-[#E0E0E0]">$2.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Expiry</span>
                      <span className="text-[#E0E0E0]">Dec 15</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-lg font-semibold text-[#E0E0E0] mb-2">Put Options</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Strike Price</span>
                      <span className="text-[#E0E0E0]">$200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Premium</span>
                      <span className="text-[#E0E0E0]">$1.75</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Expiry</span>
                      <span className="text-[#E0E0E0]">Dec 15</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <button className="bg-[#2196F3] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                  Trade Options
                </button>
              </div>
            </div>
          </div>
        );

      case 'financials':
        return (
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">Financial Statements</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-lg font-semibold text-[#E0E0E0] mb-3">Income Statement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Revenue</span>
                      <span className="text-[#E0E0E0]">$394.3B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Net Income</span>
                      <span className="text-[#E0E0E0]">$96.9B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">EPS</span>
                      <span className="text-[#E0E0E0]">$6.16</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-lg font-semibold text-[#E0E0E0] mb-3">Balance Sheet</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Total Assets</span>
                      <span className="text-[#E0E0E0]">$352.8B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Total Debt</span>
                      <span className="text-[#E0E0E0]">$95.9B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Cash</span>
                      <span className="text-[#E0E0E0]">$48.3B</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <h4 className="text-lg font-semibold text-[#E0E0E0] mb-3">Cash Flow</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Operating CF</span>
                      <span className="text-[#E0E0E0]">$122.2B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Investing CF</span>
                      <span className="text-[#E0E0E0]">-$10.6B</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B0B0B0]">Financing CF</span>
                      <span className="text-[#E0E0E0]">-$110.7B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans">
      <div className="container mx-auto p-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-6 border-b-2 border-[#333333] pb-2">
            <button 
              onClick={() => setActiveTab('overview')}
              className={cn(
                "font-semibold pb-2 transition",
                activeTab === 'overview' 
                  ? "text-[#E0E0E0] border-b-2 border-[#2196F3]" 
                  : "text-[#B0B0B0] hover:text-[#E0E0E0]"
              )}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('news')}
              className={cn(
                "font-semibold pb-2 transition",
                activeTab === 'news' 
                  ? "text-[#E0E0E0] border-b-2 border-[#2196F3]" 
                  : "text-[#B0B0B0] hover:text-[#E0E0E0]"
              )}
            >
              News
            </button>
            <button 
              onClick={() => setActiveTab('options')}
              className={cn(
                "font-semibold pb-2 transition",
                activeTab === 'options' 
                  ? "text-[#E0E0E0] border-b-2 border-[#2196F3]" 
                  : "text-[#B0B0B0] hover:text-[#E0E0E0]"
              )}
            >
              Options Trading
            </button>
            <button 
              onClick={() => setActiveTab('financials')}
              className={cn(
                "font-semibold pb-2 transition",
                activeTab === 'financials' 
                  ? "text-[#E0E0E0] border-b-2 border-[#2196F3]" 
                  : "text-[#B0B0B0] hover:text-[#E0E0E0]"
              )}
            >
              Financials
            </button>
            <button 
              onClick={() => setActiveTab('analysis')}
              className={cn(
                "font-semibold pb-2 transition",
                activeTab === 'analysis' 
                  ? "text-[#E0E0E0] border-b-2 border-[#2196F3]" 
                  : "text-[#B0B0B0] hover:text-[#E0E0E0]"
              )}
            >
              Analysis
            </button>
          </nav>
        </div>

        {/* Render content based on active tab */}
        {renderTabContent()}

        {/* Watchlist Section */}
        <div className="mt-8 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-[#E0E0E0]">Watchlist</h3>
            <button className="flex items-center text-[#2196F3] hover:text-blue-400 font-semibold transition">
              <Plus className="h-5 w-5 mr-1" />
              Add to Watchlist
            </button>
          </div>
          <p className="text-[#B0B0B0]">Create a watchlist to track your favorite stocks.</p>
        </div>

        {/* Trade Modal */}
        {isTradeModalOpen && (
          <TradeModal
            stock={stock}
            open={isTradeModalOpen}
            onClose={() => setIsTradeModalOpen(false)}
            onTrade={handleStockTrade}
          />
        )}

        {/* AI Trade Modal */}
        {isAITradeModalOpen && stock && (
          <AITradeModal
            stock={stock}
            open={isAITradeModalOpen}
            onClose={() => setIsAITradeModalOpen(false)}
            onTrade={handleAITrade}
          />
        )}
      </div>
    </div>
  );
};

export default ImprovedStockDetailPage;
