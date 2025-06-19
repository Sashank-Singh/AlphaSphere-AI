import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ArrowUpDown, BrainCircuit, X, Bell, BarChart2, AlertTriangle, Play, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [tradeAlerts, setTradeAlerts] = useState<Alert[]>([]); // Use Alert[] type
  const [error, setError] = useState<string | null>(null);
  const [activeComponents, setActiveComponents] = useState({
    watchlist: false,
    aiInsights: false,
    portfolioAnalytics: false,
    riskManagement: false,
    news: false,
    aiMetrics: false,
    sentiment: true, // Show sentiment analysis by default
    forecast: true,  // Show price forecasting by default
    smartAlerts: false,
  });
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
    // Refresh stock data periodically using mock service
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

      fetchStockData(); // Initial fetch
      const intervalId = setInterval(fetchStockData, 10000); // Every 10 seconds
      
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
  
  // Define callback functions before the early return
  const handleStockTrade = useCallback(async (quantity: number, price: number, type: 'buy' | 'sell') => {
    if (!stock) return;
    
    console.log('[StockDetailPage] handleStockTrade started. Quantity:', quantity, 'Price:', price, 'Type:', type);
    try {
      console.log('[StockDetailPage] Calling executeStockTrade...');
      const success = await executeStockTrade(
        stock.symbol,
        quantity,
        price,
        type
      );
      
      if (success) {
        console.log('[StockDetailPage] Stock trade successful.');
        // Trade successful - modal will close automatically
        setIsTradeModalOpen(false);
      } else {
        console.log('[StockDetailPage] Stock trade failed (executeStockTrade returned false).');
      }
    } catch (error) {
      console.error('[StockDetailPage] Error executing stock trade:', error);
    }
  }, [stock, executeStockTrade, setIsTradeModalOpen]); // Added dependencies

  const handleOptionTrade = useCallback(async (option: OptionContract, quantity: number, type: 'buy' | 'sell') => {
    console.log('[StockDetailPage] handleOptionTrade started. Option:', option, 'Quantity:', quantity, 'Type:', type);
    try {
      if (!option || !option.symbol) {
        console.error('[StockDetailPage] Invalid option contract:', option);
        return;
      }
      
      setIsSubmitting(true);
      console.log('[StockDetailPage] Calling executeOptionTrade with:', {
        option,
        quantity,
        type
      });
      
      const success = await executeOptionTrade(
        option,
        quantity,
        type
      );
      
      if (success) {
        console.log('[StockDetailPage] Option trade successful. Closing modal.');
        
        // Close the appropriate modal based on the trade type
        if (type === 'buy') {
          setIsAITradeModalOpen(false);
        } else {
          setIsConfirmDialogOpen(false);
        }
        
        // Update local state if needed
        if (stock) {
          const updatedStock = getStockBySymbol(stock.symbol);
          if (updatedStock) {
            setStock(updatedStock);
          }
        }
      } else {
        console.error('[StockDetailPage] Option trade failed (executeOptionTrade returned false).');
      }
    } catch (error) {
      console.error('[StockDetailPage] Error executing option trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [executeOptionTrade, setIsAITradeModalOpen, stock, setIsConfirmDialogOpen]);

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
    // Add the new alert to the state
    setTradeAlerts(prev => [...prev, { symbol, price, type }]); 
  };

  const handleStrategySelect = (strategy: string) => {
    // TODO: Implement strategy selection
    console.log(`Selected strategy: ${strategy}`);
  };

  const handleAlertCreate = (alert: TradeAlert) => {
    // TODO: Implement alert creation logic if needed for AIMarketInsights
    // This might involve adding to a different state or sending to a backend
    console.log('Trade alert created (for AI Insights):', alert);
  };

  const toggleComponent = (component: keyof typeof activeComponents) => {
    setActiveComponents(prev => ({
      ...prev,
      [component]: !prev[component]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <StockHeader symbol={symbol} />
      <div className="mt-8">
        <StockPriceChart symbol={symbol} />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Current Price</h2>
          <TickerPrice symbol={symbol} variant="large" />
        </div>
        {stock && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Trading Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Open</p>
                <p className="font-semibold">${typeof stock.open === 'number' ? stock.open.toFixed(2) : '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Previous Close</p>
                <p className="font-semibold">${typeof stock.previousClose === 'number' ? stock.previousClose.toFixed(2) : '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Day's High</p>
                <p className="font-semibold">${typeof stock.high === 'number' ? stock.high.toFixed(2) : '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Day's Low</p>
                <p className="font-semibold">${typeof stock.low === 'number' ? stock.low.toFixed(2) : '--'}</p>
              </div>
              <div>
                <p className="text-gray-500">Volume</p>
                <p className="font-semibold">{typeof stock.volume === 'number' ? stock.volume.toLocaleString() : '--'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
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

        {/* AI-Powered Insights - Always show these new features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-6">
          {activeComponents.sentiment && (
            <AISentimentAnalysis 
              symbol={stock.symbol} 
              stock={stock}
              className="h-full"
            />
          )}
          
          {activeComponents.forecast && (
            <PredictivePriceForecasting 
              symbol={stock.symbol}
              stock={stock}
              className="h-full"
            />
          )}
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
              variant={activeComponents.news ? "default" : "outline"}
              size="sm"
              onClick={() => toggleComponent('news')}
              className="flex gap-2 items-center"
            >
              <Play className="h-4 w-4" />
              News
            </Button>
            <Button
              variant={activeComponents.smartAlerts ? "default" : "outline"}
              size="sm"
              onClick={() => toggleComponent('smartAlerts')}
              className="flex gap-2 items-center"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </Button>
          </div>
        </div>

        {/* Conditional Components */}
        {activeComponents.watchlist && (
          <div className="mx-4 mb-4">
            <Watchlist
              stocks={watchlistStocks}
              alerts={tradeAlerts} // Now the type matches
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

        {activeComponents.news && (
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
        
        {activeComponents.smartAlerts && (
          <div className="mx-4 mb-4">
            <SmartAlerts symbol={stock.symbol} />
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
    </div>
  );
};

export default StockDetailPage;
