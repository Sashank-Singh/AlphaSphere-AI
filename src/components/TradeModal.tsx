
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
import { formatCurrency } from '@/lib/utils';

interface TradeModalProps {
  stock: Stock;
  open: boolean;
  onClose: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ stock, open, onClose }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('1');
  const { portfolio, executeStockTrade } = usePortfolio();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await executeStockTrade(
        stock.ticker,
        parseInt(quantity),
        stock.price,
        tab
      );
      
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxAffordableShares = Math.floor(portfolio.cash / stock.price);
  const currentlyOwnedShares = portfolio.positions.find(
    p => p.ticker === stock.ticker
  )?.quantity || 0;

  const estimatedCost = parseInt(quantity) * stock.price;
  const canAfford = tab === 'buy' ? estimatedCost <= portfolio.cash : true;
  const canSell = tab === 'sell' ? parseInt(quantity) <= currentlyOwnedShares : true;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{stock.name} ({stock.ticker})</DialogTitle>
          <DialogDescription>
            Current Price: {formatCurrency(stock.price)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="buy" value={tab} onValueChange={(v) => setTab(v as 'buy' | 'sell')}>
          <TabsList className="w-full">
            <TabsTrigger value="buy" className="flex-1">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="flex-1">Sell</TabsTrigger>
          </TabsList>
          
          <div className="py-4">
            <div className="mb-4">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1"
              />
              
              {tab === 'buy' && (
                <div className="text-xs text-muted-foreground mt-1">
                  You can afford up to {maxAffordableShares} shares
                </div>
              )}
              
              {tab === 'sell' && (
                <div className="text-xs text-muted-foreground mt-1">
                  You currently own {currentlyOwnedShares} shares
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span>Estimated Cost:</span>
              <span className="font-bold">{formatCurrency(estimatedCost)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span>Available Cash:</span>
              <span>{formatCurrency(portfolio.cash)}</span>
            </div>
            
            {!canAfford && (
              <div className="text-red-500 text-sm mt-2">
                You don't have enough cash for this purchase.
              </div>
            )}
            
            {!canSell && (
              <div className="text-red-500 text-sm mt-2">
                You don't have enough shares to sell.
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
          >
            {isSubmitting ? "Processing..." : (tab === 'buy' ? "Buy" : "Sell")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeModal;
