
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
import { Loader2, BrainCircuit, Clock, Sparkles } from 'lucide-react';
import { AIRecommendation, Stock, OptionContract } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { getAIRecommendation } from '@/data/mockData';

interface AITradeModalProps {
  stock: Stock;
  open: boolean;
  onClose: () => void;
  onTrade: (option: OptionContract, quantity: number, type: 'buy' | 'sell') => Promise<void>;
}

const AITradeModal: React.FC<AITradeModalProps> = ({ stock, open, onClose, onTrade }) => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      // Simulate AI analysis delay
      setTimeout(() => {
        const rec = getAIRecommendation(stock.symbol, user.riskTolerance);
        setRecommendation(rec);
        setIsLoading(false);
      }, 2000);
    }
  }, [open, stock.symbol, user]);

  const handleTrade = async () => {
    if (!recommendation) return;
    
    setIsSubmitting(true);
    try {
      await onTrade(
        recommendation.optionContract,
        parseInt(quantity),
        'buy'
      );
      onClose();
    } catch (error) {
      console.error('Error executing AI trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format expiry date
  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Calculate maximum contracts user can afford
  const contractCost = recommendation ? recommendation.optionContract.premium * 100 : 0;
  const maxContracts = Math.floor(portfolio.cash / contractCost);
  const estimatedCost = parseInt(quantity || '0') * contractCost;
  const canAfford = estimatedCost <= portfolio.cash;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Trade Recommendation
          </DialogTitle>
          <DialogDescription>
            {stock.name} ({stock.symbol})
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                AI analyzing market conditions...
              </p>
            </div>
          ) : recommendation ? (
            <div>
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Recommended Option:</div>
                    <div className="font-semibold flex items-center gap-1">
                      {recommendation.symbol}
                      <span className={recommendation.optionContract.type === 'call' 
                        ? "text-green-500 text-xs bg-green-500/10 px-1.5 py-0.5 rounded-full" 
                        : "text-red-500 text-xs bg-red-500/10 px-1.5 py-0.5 rounded-full"
                      }>
                        {recommendation.optionContract.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{recommendation.confidence.toUpperCase()} confidence</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Strike Price:</div>
                    <div className="font-medium">{formatCurrency(recommendation.optionContract.strikePrice)}</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Premium:</div>
                    <div className="font-medium">{formatCurrency(recommendation.optionContract.premium)} per share</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Contract Cost:</div>
                    <div className="font-medium">{formatCurrency(recommendation.optionContract.premium * 100)}</div>
                  </div>
                  
                  <div>
                    <div className="text-muted-foreground">Expiry:</div>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatExpiryDate(recommendation.optionContract.expiryDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-sm mb-4">
                <div className="font-medium mb-1">AI Reasoning:</div>
                <p className="text-muted-foreground">{recommendation.reasoning}</p>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="quantity">Quantity (contracts)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  You can afford up to {maxContracts} contracts
                </div>
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
            </div>
          ) : (
            <div className="text-center py-4">
              Unable to generate recommendation. Please try again.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isLoading && recommendation && (
            <Button 
              onClick={handleTrade} 
              disabled={
                isSubmitting || 
                !quantity || 
                parseInt(quantity) <= 0 || 
                !canAfford
              }
              className="flex gap-1 items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Execute AI Trade
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITradeModal;
