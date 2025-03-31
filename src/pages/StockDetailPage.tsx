import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ArrowUpDown, DollarSign, BrainCircuit, TrendingUp, TrendingDown, X, Bell, BarChart2, AlertTriangle, Play, Target, ChevronDown } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock, OptionContract } from '@/types';
import StockPriceChart from '@/components/StockPriceChart';
import TradeModal from '@/components/TradeModal';
import AITradeModal from '@/components/AITradeModal';
import PortfolioHeatMap from '@/components/PortfolioHeatMap';
import Watchlist from '@/components/Watchlist';
import AITradingMetrics from '@/components/AITradingMetrics';
import AIMarketInsights from '@/components/AIMarketInsights';
import BacktestSimulator from '@/components/BacktestSimulator';
import RiskManagementDashboard from '@/components/RiskManagementDashboard';
import { getStockBySymbol, refreshStockPrices } from '@/data/mockData';
import { usePortfolio } from '@/context/PortfolioContext';
import TVQuoteWidget from '@/components/TVQuoteWidget';
import StockNews from '@/components/StockNews';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [error, setError] = useState<string | null>(null);
  const [activeComponents, setActiveComponents] = useState({
    watchlist: false,
    aiInsights: false,
    portfolioAnalytics: false,
    riskManagement: false,
    backtest: false,
    aiMetrics: false,
  });
  const [selectedOption, setSelectedOption] = useState<any | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [portfolioData, setPortfolioData] = useState({
    position: null as any,
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
    // Refresh stock data periodically
    if (!isLoading && stock) {
      const intervalId = setInterval(() => {
        const refreshedStocks = refreshStockPrices();
        const updatedStock = refreshedStocks.find(s => s.symbol === stock.symbol);
        if (updatedStock) {
          setStock(updatedStock);
        }
      }, 10000); // Every 10 seconds
      
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
  
  if (isLoading || !stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col w-full max-w-md space-y-4 p-4">
          <div className="h-8 bg-primary/10 rounded w-1/3"></div>
          <div className="h-16 bg-primary/10 rounded"></div>
          <div className="h-64 bg-primary/10 rounded"></div>
          <div className="h-32 bg-primary/10 rounded"></div>
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
    console.log(`Alert set for ${symbol}: ${type} ${price}`);
  };

  const handleStrategySelect = (strategy: string) => {
    // TODO: Implement strategy selection
    console.log(`Selected strategy: ${strategy}`);
  };

  const handleAlertCreate = (alert: TradeAlert) => {
    // TODO: Implement alert creation
    console.log('Alert created:', alert);
  };

  const toggleComponent = (component: keyof typeof activeComponents) => {
    setActiveComponents(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
  };

  const handleStockTrade = async (quantity: number, price: number, type: 'buy' | 'sell') => {
    if (!stock) return;
    
    try {
      const success = await executeStockTrade(
        stock.symbol,
        quantity,
        price,
        type
      );
      
      if (success) {
        // Trade successful - modal will close automatically
        // Portfolio data will update via the useEffect hook
      }
    } catch (error) {
      console.error('Error executing stock trade:', error);
    }
  };

  const handleOptionTrade = async (option: OptionContract, quantity: number, type: 'buy' | 'sell') => {
    try {
      const success = await executeOptionTrade(
        option,
        quantity,
        type
      );
      
      if (success) {
        // Trade successful - modal will close automatically
        // Portfolio data will update via the useEffect hook
        if (type === 'sell') {
          setIsConfirmDialogOpen(false);
          setSelectedOption(null);
        }
      }
    } catch (error) {
      console.error('Error executing option trade:', error);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold">{stock.symbol}</h1>
        
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Stock Info with TVQuoteWidget */}
      <div className="px-4 mb-4">
        <p className="text-sm text-muted-foreground">{stock.name}</p>
        <TVQuoteWidget 
          symbol={stock.symbol}
          width="100%"
          isTransparent={true}
        />
      </div>

      {/* Chart */}
      <div className="px-4 mb-6">
        <StockPriceChart symbol={stock.symbol} />
      </div>

      {/* Component Toggle Buttons */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={activeComponents.watchlist ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('watchlist')}
            className="flex gap-2 items-center"
          >
            <Bell className="h-4 w-4" />
            Watchlist
          </Button>
          <Button
            variant={activeComponents.aiInsights ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('aiInsights')}
            className="flex gap-2 items-center"
          >
            <BrainCircuit className="h-4 w-4" />
            AI Insights
          </Button>
          <Button
            variant={activeComponents.portfolioAnalytics ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('portfolioAnalytics')}
            className="flex gap-2 items-center"
          >
            <BarChart2 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={activeComponents.riskManagement ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('riskManagement')}
            className="flex gap-2 items-center"
          >
            <AlertTriangle className="h-4 w-4" />
            Risk
          </Button>
          <Button
            variant={activeComponents.backtest ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('backtest')}
            className="flex gap-2 items-center"
          >
            <Play className="h-4 w-4" />
            News
          </Button>
          <Button
            variant={activeComponents.aiMetrics ? "default" : "outline"}
            size="sm"
            onClick={() => toggleComponent('aiMetrics')}
            className="flex gap-2 items-center"
          >
            <Target className="h-4 w-4" />
            AI Metrics
          </Button>
        </div>
      </div>

      {/* Conditional Components */}
      {activeComponents.watchlist && (
        <div className="mx-4 mb-4">
          <Watchlist
            stocks={watchlistStocks}
            onAddStock={handleAddToWatchlist}
            onRemoveStock={handleRemoveFromWatchlist}
            onSetAlert={handleSetAlert}
          />
        </div>
      )}

      {activeComponents.aiInsights && (
        <div className="mx-4 mb-4">
          <AIMarketInsights
            stock={stock}
            watchlist={watchlistStocks}
            onAlertCreate={handleAlertCreate}
          />
        </div>
      )}

      {activeComponents.portfolioAnalytics && (
        <div className="mx-4 mb-4">
          <PortfolioHeatMap portfolio={portfolio} />
        </div>
      )}

      {activeComponents.riskManagement && (
        <div className="mx-4 mb-4">
          <RiskManagementDashboard portfolio={portfolio} />
        </div>
      )}

      {/* Replace Backtest with StockNews */}
      {activeComponents.backtest && (
        <div className="mx-4 mb-4">
          <StockNews symbol={stock.symbol} />
        </div>
      )}

      {activeComponents.aiMetrics && (
        <div className="mx-4 mb-4">
          <AITradingMetrics
            stock={stock}
            onStrategySelect={handleStrategySelect}
          />
        </div>
      )}

      {/* Position Info (if owned) - Updated to use portfolioData */}
      {portfolioData.ownedQuantity > 0 && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Your Stock Position</h3>
            
            <div className="grid grid-cols-2 gap-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Shares</div>
                <div className="font-medium">{portfolioData.ownedQuantity}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Market Value</div>
                <div className="font-medium">{formatCurrency(portfolioData.positionValue)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Avg. Cost</div>
                <div className="font-medium">{formatCurrency(portfolioData.avgPrice)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Total Return</div>
                <div className={cn(
                  "font-medium flex items-center",
                  portfolioData.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(portfolioData.profitLoss)}
                  <span className="text-xs ml-1">
                    ({formatPercentage(portfolioData.profitLossPercent)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Option Positions - Updated to use portfolioData */}
      {portfolioData.optionPositions.length > 0 && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Your Option Positions</h3>
            <div className="space-y-3">
              {portfolioData.optionPositions.map(option => {
                const today = new Date();
                const expiryDate = new Date(option.expiryDate);
                const diffTime = Math.abs(expiryDate.getTime() - today.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                const value = (option.quantity || 0) * option.premium * 100;
                
                // Calculate option P/L
                const isCall = option.type === 'call';
                const isInTheMoney = isCall ? stock.price > option.strikePrice : stock.price < option.strikePrice;
                const intrinsicValue = isCall 
                  ? Math.max(0, stock.price - option.strikePrice)
                  : Math.max(0, option.strikePrice - stock.price);
                const timeValue = option.premium - intrinsicValue;
                
                // Calculate Greeks (simplified)
                const delta = isCall ? 0.5 : -0.5; // Simplified delta
                const theta = -0.1; // Simplified theta (time decay)
                
                return (
                  <div key={option.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium flex items-center gap-1">
                            {option.type.toUpperCase()}
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded",
                              option.type === 'call' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                              ${option.strikePrice} Strike
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedOption(option);
                              setIsConfirmDialogOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {option.quantity} contracts × ${option.premium} per share
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expires: {expiryDate.toLocaleDateString()} ({diffDays} days)
                        </div>
                        
                        {/* Option Greeks */}
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Delta:</span>
                            <span className={cn(
                              "ml-1",
                              delta >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {delta.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Theta:</span>
                            <span className="text-red-500 ml-1">
                              {theta.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(value)}</div>
                        <div className="text-xs text-muted-foreground">
                          Total Value
                        </div>
                        <div className={cn(
                          "text-xs mt-1",
                          isInTheMoney ? "text-green-500" : "text-red-500"
                        )}>
                          {isInTheMoney ? "In The Money" : "Out of The Money"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Separator className="mb-6" />
      
      {/* Trade Buttons */}
      <div className="px-4 grid grid-cols-2 gap-3">
        <Button
          onClick={() => setIsTradeModalOpen(true)}
          className="flex gap-2 items-center"
        >
          <ArrowUpDown className="h-4 w-4" />
          Trade Stock
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setIsAITradeModalOpen(true)}
          className="flex gap-2 items-center"
        >
          <BrainCircuit className="h-4 w-4" />
          Trade with AI
        </Button>
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

      {/* Confirmation Dialog - Updated with new handler */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Option Position</DialogTitle>
            <DialogDescription>
              Are you sure you want to sell {selectedOption?.quantity} {selectedOption?.type.toUpperCase()} 
              option contract{selectedOption?.quantity !== 1 ? 's' : ''} for {stock.symbol}?
            </DialogDescription>
          </DialogHeader>
          
          {selectedOption && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Contract Type:</span>
                  <span className={cn(
                    "font-medium",
                    selectedOption.type === 'call' ? "text-green-500" : "text-red-500"
                  )}>
                    {selectedOption.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Strike Price:</span>
                  <span className="font-medium">${selectedOption.strikePrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Premium:</span>
                  <span className="font-medium">${selectedOption.premium} per share</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Value:</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOption.premium * selectedOption.quantity * 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <span className="font-medium">
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedOption && handleOptionTrade(selectedOption, selectedOption.quantity, 'sell')}
              disabled={isSubmitting}
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
  );
};

export default StockDetailPage;
