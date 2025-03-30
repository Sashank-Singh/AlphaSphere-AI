
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ArrowUpDown, DollarSign, BrainCircuit } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock } from '@/types';
import StockPriceChart from '@/components/StockPriceChart';
import TradeModal from '@/components/TradeModal';
import AITradeModal from '@/components/AITradeModal';
import { getStockByTicker, refreshStockPrices } from '@/data/mockData';
import { usePortfolio } from '@/context/PortfolioContext';

const StockDetailPage: React.FC = () => {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [stock, setStock] = useState<Stock | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAITradeModalOpen, setIsAITradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (ticker) {
      const foundStock = getStockByTicker(ticker);
      if (foundStock) {
        setStock(foundStock);
      } else {
        // Handle stock not found
        navigate('/search');
      }
      setIsLoading(false);
    }
  }, [ticker, navigate]);
  
  useEffect(() => {
    // Refresh stock data periodically
    if (!isLoading && stock) {
      const intervalId = setInterval(() => {
        const refreshedStocks = refreshStockPrices();
        const updatedStock = refreshedStocks.find(s => s.ticker === ticker);
        if (updatedStock) {
          setStock(updatedStock);
        }
      }, 10000); // Every 10 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isLoading, stock, ticker]);
  
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
  
  // Check if the user owns this stock
  const position = portfolio.positions.find(p => p.ticker === stock.ticker);
  const ownedQuantity = position?.quantity || 0;
  
  // Calculate position value and profit/loss if user owns the stock
  const positionValue = ownedQuantity * stock.price;
  const avgPrice = position?.averagePrice || 0;
  const costBasis = ownedQuantity * avgPrice;
  const profitLoss = positionValue - costBasis;
  const profitLossPercent = avgPrice > 0 ? (profitLoss / costBasis) : 0;
  
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold">{stock.ticker}</h1>
        
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Stock Info */}
      <div className="px-4 mb-4">
        <p className="text-sm text-muted-foreground">{stock.name}</p>
        <div className="flex items-baseline justify-between mt-1">
          <div className="text-2xl font-bold">{formatCurrency(stock.price)}</div>
          <div className={cn(
            "text-sm",
            stock.change >= 0 ? "text-green-500" : "text-red-500"
          )}>
            {formatPercentage(stock.change)} Today
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="px-4 mb-6">
        <StockPriceChart 
          ticker={stock.ticker} 
          currentPrice={stock.price}
        />
      </div>
      
      {/* Position Info (if owned) */}
      {ownedQuantity > 0 && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Your Position</h3>
            
            <div className="grid grid-cols-2 gap-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Shares</div>
                <div className="font-medium">{ownedQuantity}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Market Value</div>
                <div className="font-medium">{formatCurrency(positionValue)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Avg. Cost</div>
                <div className="font-medium">{formatCurrency(avgPrice)}</div>
              </div>
              
              <div>
                <div className="text-xs text-muted-foreground">Total Return</div>
                <div className={cn(
                  "font-medium flex items-center",
                  profitLoss >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(profitLoss)}
                  <span className="text-xs ml-1">
                    ({formatPercentage(profitLossPercent)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stock Details */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-medium mb-3">About {stock.ticker}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {stock.marketCap !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Market Cap</div>
              <div className="font-medium">
                {stock.marketCap >= 1e12
                  ? `$${(stock.marketCap / 1e12).toFixed(2)}T`
                  : stock.marketCap >= 1e9
                  ? `$${(stock.marketCap / 1e9).toFixed(2)}B`
                  : `$${(stock.marketCap / 1e6).toFixed(2)}M`}
              </div>
            </div>
          )}
          
          {stock.pe !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">P/E Ratio</div>
              <div className="font-medium">{stock.pe.toFixed(2)}</div>
            </div>
          )}
          
          {stock.volume !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground">Volume</div>
              <div className="font-medium">
                {stock.volume >= 1e9
                  ? `${(stock.volume / 1e9).toFixed(2)}B`
                  : stock.volume >= 1e6
                  ? `${(stock.volume / 1e6).toFixed(2)}M`
                  : stock.volume.toLocaleString()}
              </div>
            </div>
          )}
          
          {stock.sector && (
            <div>
              <div className="text-xs text-muted-foreground">Sector</div>
              <div className="font-medium">{stock.sector}</div>
            </div>
          )}
        </div>
      </div>
      
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
        />
      )}
      
      {isAITradeModalOpen && stock && (
        <AITradeModal
          stock={stock}
          open={isAITradeModalOpen}
          onClose={() => setIsAITradeModalOpen(false)}
        />
      )}
    </div>
  );
};

export default StockDetailPage;
