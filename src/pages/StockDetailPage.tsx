import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ArrowUpDown, BrainCircuit, X, Bell, BarChart2, AlertTriangle, Play, ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, Percent, Volume2, BarChart3, FileText, Lightbulb } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock, OptionContract, Position } from '@/types';
import StockPriceChart from '@/components/StockPriceChart';
import TradeModal from '@/components/TradeModal';
import AITradeModal from '@/components/AITradeModal';
import PortfolioHeatMap from '@/components/PortfolioHeatMap';
import Watchlist from '@/components/Watchlist';
import AITradingMetrics from '@/components/AITradingMetrics';
import AIMarketInsights from '@/components/AIMarketInsights';
import BacktestSimulator from '@/components/BacktestSimulator';
import RiskManagementDashboard from '@/components/RiskManagementDashboard';
import { getStockBySymbol } from '@/data/mockData';
import { stockDataService } from '@/lib/stockDataService';
import { usePortfolio } from '@/context/PortfolioContext';
import TVQuoteWidget from '@/components/TVQuoteWidget';
import StockNews from '@/components/StockNews';
import AISentimentAnalysis from '@/components/AISentimentAnalysis';
import PredictivePriceForecasting from '@/components/PredictivePriceForecasting';
import SmartAlerts from '@/components/SmartAlerts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StockHeader from '@/components/StockHeader';
import TickerPrice from '@/components/TickerPrice';

// Define Alert type matching WatchlistProps
interface Alert {
  symbol: string;
  price: number;
  type: 'above' | 'below';
}

// Keep TradeAlert for AIMarketInsights
interface TradeAlert {
  id: string;
  type: 'opportunity' | 'risk' | 'rebalancing';
  title: string;
  description: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  action?: 'buy' | 'sell' | 'hold';
}

const StockDetailPage: React.FC = () => {
  const params = useParams<{ symbol?: string; ticker?: string }>();
  const symbol = params.symbol || params.ticker;
  const navigate = useNavigate();
  const { portfolio, executeOptionTrade, executeStockTrade } = usePortfolio();
  const [stock, setStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAITradeModalOpen, setIsAITradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [tradeAlerts, setTradeAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOption, setSelectedOption] = useState<OptionContract | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioData, setPortfolioData] = useState({
    position: null as Position | null,
    optionPositions: [] as OptionContract[],
    ownedQuantity: 0,
    positionValue: 0,
    avgPrice: 0,
    costBasis: 0,
    profitLoss: 0,
    profitLossPercent: 0
  });
  
  useEffect(() => {
    if (symbol) {
      try {
        const foundStock = getStockBySymbol(symbol);
        if (foundStock) {
          setStock(foundStock);
          setIsLoading(false);
        } else {
          setError('Stock not found');
          navigate('/market');
        }
      } catch (err) {
        setError('Failed to fetch stock data');
        setIsLoading(false);
      }
    }
  }, [symbol, navigate]);
  
  useEffect(() => {
    if (!isLoading && stock) {
      const fetchStockData = async () => {
        try {
          const quote = await stockDataService.getStockQuote(stock.symbol);
          setStock(prev => prev ? {
            ...prev,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume,
            lastUpdated: new Date()
          } : null);
        } catch (error) {
          console.error('Error fetching stock data:', error);
        }
      };

      fetchStockData();
      const intervalId = setInterval(fetchStockData, 10000);
      
      return () => clearInterval(intervalId);
    }
  }, [isLoading, stock]);
  
  useEffect(() => {
    if (stock && portfolio) {
      const position = portfolio.positions.find(p => p.symbol === stock.symbol);
      const optionPositions = portfolio.optionPositions.filter(opt => opt.symbol === stock.symbol);
      const ownedQuantity = position?.quantity || 0;
      const positionValue = ownedQuantity * stock.price;
      const avgPrice = position?.averagePrice || 0;
      const costBasis = ownedQuantity * avgPrice;
      const profitLoss = positionValue - costBasis;
      const profitLossPercent = avgPrice > 0 && costBasis > 0 ? (profitLoss / costBasis) : 0;

      setPortfolioData({
        position,
        optionPositions,
        ownedQuantity,
        positionValue,
        avgPrice,
        costBasis,
        profitLoss,
        profitLossPercent
      });
    }
  }, [portfolio, stock]);
  
  const handleStockTrade = useCallback(async (quantity: number, price: number, type: 'buy' | 'sell') => {
    if (!stock) return;
    
    try {
      const success = await executeStockTrade(
        stock.symbol,
        quantity,
        price,
        type
      );
      
      if (success) {
        setIsTradeModalOpen(false);
      }
    } catch (error) {
      console.error('Error executing stock trade:', error);
    }
  }, [stock, executeStockTrade]);

  const handleOptionTrade = useCallback(async (option: OptionContract, quantity: number, type: 'buy' | 'sell') => {
    try {
      if (!option || !option.symbol) {
        console.error('Invalid option contract:', option);
        return;
      }
      
      setIsSubmitting(true);
      
      const success = await executeOptionTrade(
        option,
        quantity,
        type
      );
      
      if (success) {
        if (type === 'buy') {
          setIsAITradeModalOpen(false);
        } else {
          setIsConfirmDialogOpen(false);
        }
        
        if (stock) {
          const updatedStock = getStockBySymbol(stock.symbol);
          if (updatedStock) {
            setStock(updatedStock);
          }
        }
      }
    } catch (error) {
      console.error('Error executing option trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [executeOptionTrade, stock]);

  if (isLoading || !stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212]">
        <div className="animate-pulse flex flex-col w-full max-w-md space-y-4 p-4">
          <div className="h-8 bg-[#1E1E1E] rounded w-1/3"></div>
          <div className="h-16 bg-[#1E1E1E] rounded"></div>
          <div className="h-64 bg-[#1E1E1E] rounded"></div>
          <div className="h-32 bg-[#1E1E1E] rounded"></div>
        </div>
      </div>
    );
  }

  const handleAddToWatchlist = (symbol: string) => {
    const stock = getStockBySymbol(symbol);
    if (stock && !watchlistStocks.find(s => s.symbol === symbol)) {
      setWatchlistStocks([...watchlistStocks, stock]);
    }
  };

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlistStocks(watchlistStocks.filter(s => s.symbol !== symbol));
  };

  const handleSetAlert = (symbol: string, price: number, type: 'above' | 'below') => {
    setTradeAlerts(prev => [...prev, { symbol, price, type }]); 
  };

  const handleStrategySelect = (strategy: string) => {
    console.log(`Selected strategy: ${strategy}`);
  };

  const handleAlertCreate = (alert: TradeAlert) => {
    console.log('Trade alert created:', alert);
  };

  const isPositive = stock.change >= 0;
  const isNegative = stock.change < 0;

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] font-sans">
      <div className="container mx-auto p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-[#E0E0E0]">Stock Details</h1>
          <p className="text-[#B0B0B0]">Real-time stock market data and analysis</p>
        </header>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-6 border-b-2 border-[#333333] pb-2">
            <a 
              className={`font-semibold border-b-2 pb-2 transition ${
                activeTab === 'overview' 
                  ? 'text-[#E0E0E0] border-[#2196F3]' 
                  : 'text-[#B0B0B0] hover:text-[#E0E0E0] border-transparent'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </a>
            <a 
              className={`font-semibold border-b-2 pb-2 transition ${
                activeTab === 'news' 
                  ? 'text-[#E0E0E0] border-[#2196F3]' 
                  : 'text-[#B0B0B0] hover:text-[#E0E0E0] border-transparent'
              }`}
              onClick={() => setActiveTab('news')}
            >
              News
            </a>
            <a 
              className={`font-semibold border-b-2 pb-2 transition ${
                activeTab === 'options' 
                  ? 'text-[#E0E0E0] border-[#2196F3]' 
                  : 'text-[#B0B0B0] hover:text-[#E0E0E0] border-transparent'
              }`}
              onClick={() => setActiveTab('options')}
            >
              Options Trading
            </a>
            <a 
              className={`font-semibold border-b-2 pb-2 transition ${
                activeTab === 'financials' 
                  ? 'text-[#E0E0E0] border-[#2196F3]' 
                  : 'text-[#B0B0B0] hover:text-[#E0E0E0] border-transparent'
              }`}
              onClick={() => setActiveTab('financials')}
            >
              Financials
            </a>
            <a 
              className={`font-semibold border-b-2 pb-2 transition ${
                activeTab === 'analysis' 
                  ? 'text-[#E0E0E0] border-[#2196F3]' 
                  : 'text-[#B0B0B0] hover:text-[#E0E0E0] border-transparent'
              }`}
              onClick={() => setActiveTab('analysis')}
            >
              Analysis
            </a>
          </nav>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stock Information and Chart */}
          <div className="lg:col-span-2">
            {/* Stock Header */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#E0E0E0]">{stock.symbol}</h2>
                  <p className="text-[#B0B0B0]">{stock.name}</p>
                  <p className="text-sm text-[#B0B0B0] mt-1">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-[#E0E0E0]">
                    {formatCurrency(stock.price)}
                  </p>
                  <div className="flex items-center justify-end space-x-1">
                    <p className={`text-lg ${isPositive ? 'text-[#4CAF50]' : 'text-[#f44336]'}`}>
                      {isPositive ? '+' : ''}{formatCurrency(stock.change)} ({formatPercentage(stock.changePercent)})
                    </p>
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-[#4CAF50]" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-[#f44336]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Position Info */}
              {portfolioData.ownedQuantity > 0 && (
                <div className="bg-[#0a0a0a]/50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-[#E0E0E0]">Your Position</h3>
                      <p className="text-[#B0B0B0]">{portfolioData.ownedQuantity} shares</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${portfolioData.profitLoss >= 0 ? 'text-[#4CAF50]' : 'text-[#f44336]'}`}>
                        {formatCurrency(portfolioData.profitLoss)} ({formatPercentage(portfolioData.profitLossPercent)})
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg mb-6">
              <div className="h-96 bg-[#0a0a0a] rounded-xl overflow-hidden">
                <StockPriceChart symbol={stock.symbol} />
              </div>
            </div>

            {/* Trade Buttons */}
            <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg mb-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsTradeModalOpen(true)}
                  className="flex-1 bg-[#2196F3] hover:bg-[#1976D2] text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2"
                >
                  <ArrowUpDown className="h-5 w-5" />
                  <span>Trade Stock</span>
                </button>
                
                <div className="relative flex-1 group">
                  <button 
                    onClick={() => setIsAITradeModalOpen(true)}
                    className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center space-x-2 shadow-[0_4px_15px_0_rgba(76,175,80,0.3)] hover:shadow-[0_4px_20px_0_rgba(76,175,80,0.4)]"
                  >
                    <BrainCircuit className="h-5 w-5" />
                    <span>Trade with AI</span>
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max">
                    <div className="bg-[#1E1E1E] text-white text-sm rounded-md py-1 px-3 shadow-lg">
                      AI-powered trading recommendations
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1E1E1E]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="bg-[#1E1E1E] p-6 rounded-2xl shadow-lg h-fit">
            <h3 className="text-2xl font-bold text-[#E0E0E0] mb-6">AI Insights</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[rgba(33,150,243,0.1)] p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-[#2196F3]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#E0E0E0]">AI Price Forecast</h4>
                  <p className="text-[#B0B0B0]">Predicts a slight upward trend in the next week.</p>
                  <p className="text-sm text-[#9CA3AF]">Confidence: Medium (54%)</p>
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
                  <p className="text-[#B0B0B0]">
                    Score: <span className="font-bold text-[#E0E0E0]">78/100</span>. Strong fundamentals.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Health */}
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
                  <span className="font-semibold text-[#E0E0E0]">$3.1T</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0B0]">Dividend Yield</span>
                  <span className="font-semibold text-[#E0E0E0]">0.47%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* News Section */}
        <div className="mt-8 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">{stock.symbol} News</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg hover:bg-[#0a0a0a]/50 transition duration-300">
              <a className="block" href="#">
                <p className="text-sm text-[#B0B0B0]">Reuters · 2 hours ago</p>
                <h4 className="font-semibold text-[#E0E0E0] mt-1">
                  Tech Giant Unveils New AI Features for Its Flagship Phone
                </h4>
                <p className="text-sm text-[#B0B0B0] mt-1">
                  The company announced a suite of new AI-powered capabilities coming to its ecosystem, aiming to enhance user experience and productivity.
                </p>
              </a>
            </div>
            <div className="p-4 rounded-lg hover:bg-[#0a0a0a]/50 transition duration-300">
              <a className="block" href="#">
                <p className="text-sm text-[#B0B0B0]">Bloomberg · 5 hours ago</p>
                <h4 className="font-semibold text-[#E0E0E0] mt-1">
                  Analysts Bullish on {stock.symbol} Ahead of Quarterly Earnings Report
                </h4>
                <p className="text-sm text-[#B0B0B0] mt-1">
                  Wall Street sentiment remains high as the tech leader is expected to post strong results, driven by robust sales in its services division.
                </p>
              </a>
            </div>
            <div className="p-4 rounded-lg hover:bg-[#0a0a0a]/50 transition duration-300">
              <a className="block" href="#">
                <p className="text-sm text-[#B0B0B0]">The Wall Street Journal · 1 day ago</p>
                <h4 className="font-semibold text-[#E0E0E0] mt-1">
                  Inside the Company's Push into Augmented Reality
                </h4>
                <p className="text-sm text-[#B0B0B0] mt-1">
                  A deep dive into the long-term strategy and development of the company's much-anticipated AR headset and its potential market impact.
                </p>
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button className="text-[#2196F3] hover:text-[#1976D2] font-semibold transition">View More News</button>
          </div>
        </div>

        {/* Market Data */}
        <div className="mt-8 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">Market Data</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-sm text-[#B0B0B0]">Day High</p>
              <p className="text-xl font-semibold text-[#E0E0E0]">
                {formatCurrency(stock.high || stock.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#B0B0B0]">Day Low</p>
              <p className="text-xl font-semibold text-[#E0E0E0]">
                {formatCurrency(stock.low || stock.price)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#B0B0B0]">52 Week High</p>
              <p className="text-xl font-semibold text-[#E0E0E0]">
                {formatCurrency((stock.price || 0) * 1.05)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#B0B0B0]">52 Week Low</p>
              <p className="text-xl font-semibold text-[#E0E0E0]">
                {formatCurrency((stock.price || 0) * 0.8)}
              </p>
            </div>
          </div>
        </div>

        {/* Watchlist */}
        <div className="mt-8 bg-[#1E1E1E] p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-[#E0E0E0]">Watchlist</h3>
            <button 
              onClick={() => handleAddToWatchlist(stock.symbol)}
              className="flex items-center text-[#2196F3] hover:text-[#1976D2] font-semibold transition"
            >
              <Bell className="mr-1 h-5 w-5" />
              Add to Watchlist
            </button>
          </div>
          <p className="text-[#B0B0B0]">Create a watchlist to track your favorite stocks.</p>
        </div>

        {/* Modals */}
        {isTradeModalOpen && stock && (
          <TradeModal
            stock={stock}
            open={isTradeModalOpen}
            onClose={() => setIsTradeModalOpen(false)}
            onTrade={handleStockTrade}
          />
        )}
        
        {isAITradeModalOpen && stock && (
          <AITradeModal
            stock={stock}
            open={isAITradeModalOpen}
            onClose={() => setIsAITradeModalOpen(false)}
            onTrade={handleOptionTrade}
          />
        )}

        {/* Confirmation Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="bg-[#1E1E1E] border-[#333333] text-[#E0E0E0]">
            <DialogHeader>
              <DialogTitle>Close Option Position</DialogTitle>
              <DialogDescription className="text-[#B0B0B0]">
                Are you sure you want to sell {selectedOption?.quantity} {selectedOption?.type.toUpperCase()} 
                option contract{selectedOption?.quantity !== 1 ? 's' : ''} for {stock.symbol}?
              </DialogDescription>
            </DialogHeader>
            
            {selectedOption && (
              <div className="py-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B0]">Contract Type:</span>
                    <span className={cn(
                      "font-medium",
                      selectedOption.type === 'call' ? "text-[#4CAF50]" : "text-[#f44336]"
                    )}>
                      {selectedOption.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B0]">Strike Price:</span>
                    <span className="font-medium text-[#E0E0E0]">${selectedOption.strikePrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B0]">Premium:</span>
                    <span className="font-medium text-[#E0E0E0]">${selectedOption.premium} per share</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B0]">Total Value:</span>
                    <span className="font-medium text-[#E0E0E0]">
                      {formatCurrency(selectedOption.premium * selectedOption.quantity * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B0B0B0]">Expiry Date:</span>
                    <span className="font-medium text-[#E0E0E0]">
                      {new Date(selectedOption.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmDialogOpen(false)}
                disabled={isSubmitting}
                className="border-[#333333] text-[#E0E0E0] hover:bg-[#333333]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedOption && handleOptionTrade(selectedOption, selectedOption.quantity, 'sell')}
                disabled={isSubmitting}
                className="bg-[#f44336] hover:bg-[#d32f2f]"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Selling...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  'Sell Position'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StockDetailPage;
