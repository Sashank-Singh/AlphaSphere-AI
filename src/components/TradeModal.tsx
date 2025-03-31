import React, { useState } from 'react';
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
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onTrade(
        parseInt(quantity),
        stock.price,
        tab
      );
      onClose();
    } catch (error) {
      console.error('Error executing trade:', error);
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {stock.name} ({stock.symbol})
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
          
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
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
                <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                <span className="font-bold text-lg">{formatCurrency(estimatedCost)}</span>
              </div>
              
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
          <Button variant="outline" onClick={onClose} className="flex-1">
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
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              tab === 'buy' ? "Buy" : "Sell"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
