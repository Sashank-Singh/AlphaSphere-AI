import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedTradingPanelProps {
  symbol: string;
  currentPrice: number;
  onPlaceOrder: (action: 'buy' | 'sell', quantity: number, orderType: string, limitPrice?: number) => void;
}

interface OrderPreview {
  action: 'buy' | 'sell';
  quantity: number;
  orderType: string;
  limitPrice?: number;
  estimatedCost: number;
  commission: number;
  totalCost: number;
}

const EnhancedTradingPanel: React.FC<EnhancedTradingPanelProps> = ({
  symbol,
  currentPrice,
  onPlaceOrder
}) => {
  const [orderType, setOrderType] = useState<string>('Market');
  const [quantity, setQuantity] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [riskPercentage, setRiskPercentage] = useState<string>('2');
  const [accountBalance, setAccountBalance] = useState<string>('10000');
  const [showOrderPreview, setShowOrderPreview] = useState(false);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [showPositionSizer, setShowPositionSizer] = useState(false);

  const commission = 3.99;
  const estimatedCost = (parseFloat(quantity) || 0) * currentPrice;
  const totalCost = estimatedCost + commission;

  // Calculate position size based on risk
  const calculatePositionSize = () => {
    const risk = parseFloat(riskPercentage) / 100;
    const balance = parseFloat(accountBalance);
    const maxRiskAmount = balance * risk;
    const positionSize = maxRiskAmount / currentPrice;
    setQuantity(Math.floor(positionSize).toString());
  };

  const handleQuantityChange = (value: string) => {
    setQuantity(value);
    if (showOrderPreview) {
      updateOrderPreview();
    }
  };

  const updateOrderPreview = () => {
    const qty = parseFloat(quantity) || 0;
    if (qty > 0) {
      const preview: OrderPreview = {
        action: 'buy',
        quantity: qty,
        orderType,
        limitPrice: orderType === 'Limit' ? parseFloat(limitPrice) : undefined,
        estimatedCost: qty * currentPrice,
        commission,
        totalCost: (qty * currentPrice) + commission
      };
      setOrderPreview(preview);
    }
  };

  const handlePlaceOrder = (action: 'buy' | 'sell') => {
    const qty = parseFloat(quantity);
    if (qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (orderType === 'Limit' && !limitPrice) {
      alert('Please enter a limit price');
      return;
    }

    updateOrderPreview();
    setShowOrderPreview(true);
  };

  const confirmOrder = () => {
    if (orderPreview) {
      onPlaceOrder(
        orderPreview.action,
        orderPreview.quantity,
        orderPreview.orderType,
        orderPreview.limitPrice
      );
      setShowOrderPreview(false);
      setQuantity('');
      setLimitPrice('');
      setOrderPreview(null);
    }
  };

  const cancelOrder = () => {
    setShowOrderPreview(false);
    setOrderPreview(null);
  };

  return (
    <div className="p-4 md:p-5 rounded-lg border border-slate-700" style={{ backgroundColor: '#0E1117' }}>
      <h2 className="text-base md:text-lg font-bold text-white mb-3">Trade {symbol}</h2>

      {/* Horizontal Controls */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:items-end">
        {/* Buy/Sell */}
        <div className="grid grid-cols-2 gap-2">
          <button
            className="bg-green-600 text-white font-semibold py-2.5 rounded hover:bg-green-500 transition-colors"
            onClick={() => handlePlaceOrder('buy')}
          >
            Buy
          </button>
          <button
            className="bg-red-600 text-white font-semibold py-2.5 rounded hover:bg-red-500 transition-colors"
            onClick={() => handlePlaceOrder('sell')}
          >
            Sell
          </button>
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Order Type</label>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Market">Market</SelectItem>
              <SelectItem value="Limit">Limit</SelectItem>
              <SelectItem value="Stop">Stop</SelectItem>
              <SelectItem value="Stop Limit">Stop Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Limit Price */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Limit Price</label>
          <Input
            type="number"
            step="0.01"
            placeholder={orderType === 'Limit' ? `$${currentPrice.toFixed(2)}` : '—'}
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className={cn(
              "bg-slate-700 border-slate-600 text-white h-10",
              orderType !== 'Limit' && 'opacity-60'
            )}
            disabled={orderType !== 'Limit'}
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Quantity</label>
          <Input
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => handleQuantityChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white h-10"
          />
        </div>

        {/* Position Sizer */}
        <div>
          <label className="block text-xs font-medium text-transparent mb-1.5">Position Sizer</label>
          <button
            onClick={() => setShowPositionSizer(!showPositionSizer)}
            className="w-full flex items-center justify-center gap-2 text-sm h-10 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded border border-slate-600"
          >
            <Calculator className="h-4 w-4" />
            Position Sizer
          </button>
        </div>
      </div>

      {/* Position Sizer Panel */}
      {showPositionSizer && (
        <div className="mt-3 p-3 bg-slate-700 rounded border border-slate-600">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-300 mb-1">Risk %</label>
              <Input
                type="number"
                step="0.1"
                value={riskPercentage}
                onChange={(e) => setRiskPercentage(e.target.value)}
                className="bg-slate-600 border-slate-500 text-white text-sm h-8"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-300 mb-1">Account Balance</label>
              <Input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(e.target.value)}
                className="bg-slate-600 border-slate-500 text-white text-sm h-8"
              />
            </div>
          </div>
          <Button
            onClick={calculatePositionSize}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm h-8"
          >
            Calculate Position Size
          </Button>
        </div>
      )}

      {/* Order Summary */}
      {quantity && parseFloat(quantity) > 0 && (
        <div className="bg-slate-700 p-3 rounded border border-slate-600 mb-4">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Quantity:</span>
              <span className="text-white">{quantity} shares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="text-white">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Cost:</span>
              <span className="text-white">${estimatedCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Commission:</span>
              <span className="text-white">${commission.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-600 pt-1">
              <span className="text-gray-300 font-medium">Total:</span>
              <span className="text-white font-medium">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Order Preview Modal */}
      {showOrderPreview && orderPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Confirm Order</h3>
              <button onClick={cancelOrder} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className={cn(
                  "font-medium",
                  orderPreview.action === 'buy' ? 'text-green-400' : 'text-red-400'
                )}>
                  {orderPreview.action.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Symbol:</span>
                <span className="text-white font-medium">{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity:</span>
                <span className="text-white font-medium">{orderPreview.quantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Type:</span>
                <span className="text-white font-medium">{orderPreview.orderType}</span>
              </div>
              {orderPreview.limitPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Limit Price:</span>
                  <span className="text-white font-medium">${orderPreview.limitPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-600 pt-2">
                <span className="text-gray-300 font-medium">Total Cost:</span>
                <span className="text-white font-medium">${orderPreview.totalCost.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={cancelOrder}
                variant="outline"
                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmOrder}
                className={cn(
                  "flex-1",
                  orderPreview.action === 'buy' 
                    ? "bg-green-600 hover:bg-green-500" 
                    : "bg-red-600 hover:bg-red-500"
                )}
              >
                Confirm {orderPreview.action.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTradingPanel;
