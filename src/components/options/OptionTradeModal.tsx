import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export interface OptionTradeDetails {
  symbol: string;
  side: 'buy' | 'sell';
  contractSymbol?: string;
  strike: number;
  expiry?: string;
  bid: number;
  ask: number;
}

interface OptionTradeModalProps {
  open: boolean;
  onClose: () => void;
  details: OptionTradeDetails | null;
  onConfirm: (params: { side: 'buy' | 'sell'; quantity: number; price: number; orderType: 'market' | 'limit' }) => Promise<void> | void;
}

const OptionTradeModal: React.FC<OptionTradeModalProps> = ({ open, onClose, details, onConfirm }) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setOrderType('market');
      setLimitPrice('');
      setQuantity('1');
    }
  }, [open]);

  const execPrice = useMemo(() => {
    if (!details) return 0;
    if (orderType === 'market') {
      return details.side === 'buy' ? details.ask : details.bid;
    }
    const lp = parseFloat(limitPrice);
    return Number.isFinite(lp) && lp > 0 ? lp : 0;
  }, [details, orderType, limitPrice]);

  const estimatedCost = useMemo(() => {
    const q = parseInt(quantity || '0');
    if (!Number.isFinite(execPrice) || execPrice <= 0 || !Number.isFinite(q)) return 0;
    // Options contract multiplier 100
    return q * 100 * execPrice;
  }, [quantity, execPrice]);

  const disabled = useMemo(() => {
    if (!details) return true;
    if (!quantity || parseInt(quantity) <= 0) return true;
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) return true;
    if (!execPrice || execPrice <= 0) return true;
    return false;
  }, [details, quantity, orderType, limitPrice, execPrice]);

  const handleConfirm = async () => {
    if (!details) return;
    try {
      setIsSubmitting(true);
      await onConfirm({
        side: details.side,
        quantity: parseInt(quantity),
        price: execPrice,
        orderType,
      });
      toast({
        title: `${details.side.toUpperCase()} option placed` ,
        description: `${details.side.toUpperCase()} ${quantity}x ${details.contractSymbol || details.symbol} ${details.strike} for $${execPrice.toFixed(2)} (${orderType})`,
      });
      onClose();
    } catch (e) {
      toast({ title: 'Order failed', description: 'Could not place order', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm {details?.side === 'sell' ? 'Sell' : 'Buy'} Option</DialogTitle>
          <DialogDescription>
            {details ? (
              <span>
                {details.symbol} {details.contractSymbol ? `• ${details.contractSymbol}` : ''} • {details.strike}
                {details.expiry ? ` • ${details.expiry}` : ''}
              </span>
            ) : (
              '—'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Order Type</Label>
              <select
                className="mt-1 w-full bg-[#1c2128] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </div>
            <div>
              <Label className="text-sm">Quantity (contracts)</Label>
              <Input
                value={quantity}
                onChange={(e) => { if (/^\d*$/.test(e.target.value)) setQuantity(e.target.value); }}
                placeholder="1"
              />
            </div>
          </div>

          {orderType === 'limit' && (
            <div>
              <Label className="text-sm">Limit Price</Label>
              <Input value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} placeholder="0.00" />
            </div>
          )}

          <div className="text-sm text-gray-300">
            <div className="flex justify-between"><span>Bid</span><span>${details?.bid.toFixed(2) ?? '0.00'}</span></div>
            <div className="flex justify-between"><span>Ask</span><span>${details?.ask.toFixed(2) ?? '0.00'}</span></div>
            <div className="flex justify-between font-medium mt-2"><span>Estimated Cost</span><span>${estimatedCost.toFixed(2)}</span></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={disabled || isSubmitting}>
            {isSubmitting ? 'Placing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OptionTradeModal;


