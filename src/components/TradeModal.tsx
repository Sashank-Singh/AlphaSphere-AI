import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptionContract, Stock } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile'; 
import { TrendingUp, TrendingDown, Loader2, Info, DollarSign, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeModalProps {
  stock: Stock;
  open: boolean;
  onClose: () => void;
  onTrade: (quantity: number, price: number, type: 'buy' | 'sell') => Promise<void>;
}

const TradeModal: React.FC<TradeModalProps> = ({ stock, open, onClose, onTrade }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('1');
  const { portfolio } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [showEstimateDetails, setShowEstimateDetails] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity('1');
    }
  }, [open, stock.symbol]);

  const handleQuantityChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setQuantity(value);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onTrade(
        parseInt(quantity),
        stock.price,
        tab
      );
      
      toast({
        title: `${tab === 'buy' ? 'Purchase' : 'Sale'} Successful`,
        description: `${tab === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${stock.symbol} at ${formatCurrency(stock.price)}`,
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: "Trade Failed",
        description: "There was an error processing your trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxAffordableShares = Math.floor(portfolio.cash / stock.price);
  const currentlyOwnedShares = portfolio.positions.find(
    p => p.symbol === stock.symbol
  )?.quantity || 0;

  const estimatedCost = parseInt(quantity) * stock.price;
  const canAfford = tab === 'buy' ? estimatedCost <= portfolio.cash : true;
  const canSell = tab === 'sell' ? parseInt(quantity) <= currentlyOwnedShares : true;
  
  const commission = estimatedCost * 0.005;
  const estimatedTax = estimatedCost * 0.002;
  const totalCost = estimatedCost + commission + estimatedTax;

  const handleQuickTrade = (percentage: number) => {
    if (tab === 'buy') {
      const maxShares = maxAffordableShares * (percentage / 100);
      setQuantity(String(Math.floor(maxShares)));
    } else {
      const sharesToSell = currentlyOwnedShares * (percentage / 100);
      setQuantity(String(Math.floor(sharesToSell)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isMobile ? "p-4 rounded-t-xl w-full mx-0 mt-auto mb-0 max-h-[90vh] overflow-auto" : ""
      )}>
        <DialogHeader className={isMobile ? "mb-2" : ""}>
          <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
            {stock.name} ({stock.symbol})
            <span className={cn(
              "text-sm px-2 py-0.5 rounded-full",
              stock.change >= 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {stock.change >= 0 ? '+' : ''}{(stock.change * 100).toFixed(2)}%
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Current Price: <span className="font-medium">{formatCurrency(stock.price)}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="buy" value={tab} onValueChange={(v) => setTab(v as 'buy' | 'sell')}>
          <TabsList className="w-full p-1 bg-muted/50">
            <TabsTrigger 
              value="buy" 
              className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger 
              value="sell" 
              className="flex-1 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quick Trade</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleQuickTrade(25)}
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleQuickTrade(50)}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleQuickTrade(75)}
                >
                  75%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 text-xs"
                  onClick={() => handleQuickTrade(100)}
                >
                  Max
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="h-10"
              />
              
              {tab === 'buy' && (
                <div className="text-xs text-muted-foreground">
                  You can afford up to <span className="font-medium">{maxAffordableShares}</span> shares
                </div>
              )}
              
              {tab === 'sell' && (
                <div className="text-xs text-muted-foreground">
                  You currently own <span className="font-medium">{currentlyOwnedShares}</span> shares
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <button 
                  className="text-sm font-medium flex items-center gap-1"
                  onClick={() => setShowEstimateDetails(!showEstimateDetails)}
                >
                  Trade Estimate
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <span className="font-bold text-lg">{formatCurrency(totalCost)}</span>
              </div>
              
              {showEstimateDetails && (
                <div className="bg-muted/30 rounded-md p-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission (0.5%)</span>
                    <span>{formatCurrency(commission)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Tax (0.2%)</span>
                    <span>{formatCurrency(estimatedTax)}</span>
                  </div>
                  <div className="border-t border-border pt-1 flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(totalCost)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Cash:</span>
                <span className="font-medium">{formatCurrency(portfolio.cash)}</span>
              </div>
            </div>
            
            {!canAfford && (
              <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
                You don't have enough cash for this purchase.
              </div>
            )}
            
            {!canSell && (
              <div className="text-sm text-red-500 bg-red-500/10 p-2 rounded-lg">
                You don't have enough shares to sell.
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className={cn("flex-1", isMobile && "text-sm h-10")}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={
              isSubmitting || 
              !quantity || 
              parseInt(quantity) <= 0 || 
              !canAfford || 
              !canSell
            }
            className={cn("flex-1", isMobile && "text-sm h-10")}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {tab === 'buy' ? (
                  <>
                    <DollarSign className="mr-1 h-4 w-4" />
                    Buy {quantity} {parseInt(quantity) === 1 ? 'Share' : 'Shares'}
                  </>
                ) : (
                  <>
                    <DollarSign className="mr-1 h-4 w-4" />
                    Sell {quantity} {parseInt(quantity) === 1 ? 'Share' : 'Shares'}
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
