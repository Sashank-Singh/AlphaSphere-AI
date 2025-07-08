import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

interface TradingPanelProps {
  symbol?: string;
  currentPrice?: number;
  onExecuteTrade: (type: 'buy' | 'sell', quantity: number, price: number) => void;
  isSimulator: boolean;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  symbol = 'AAPL',
  currentPrice = 0,
  onExecuteTrade,
  isSimulator,
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('1');
  const [dollars, setDollars] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice ? currentPrice.toString() : '0');
  const [useDollars, setUseDollars] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<{
    success?: boolean;
    message?: string;
    orderId?: string;
  }>({});
  
  const { portfolio, paperPortfolio } = usePortfolio();
  const currentPortfolio = isSimulator ? paperPortfolio : portfolio;

  const handleSubmitOrder = async () => {
    // For the simulator, we use the simplified context function
    if (isSimulator) {
      onExecuteTrade(orderSide, parseFloat(quantity), currentPrice);
      return;
    }

    // --- Start of Real Trading Logic ---
    // This logic is kept but would need real API functions to work
    if (!symbol) {
      setOrderStatus({ success: false, message: 'Please select a symbol' });
      return;
    }
    setIsLoading(true);
    setOrderStatus({});
    try {
      // Placeholder for real API calls
      console.log('Executing real trade (placeholder)...', { orderSide, orderType, quantity, dollars, limitPrice, useDollars });
      // Example: const response = await limitBuyShares(accountId, symbol, parseFloat(quantity), parseFloat(limitPrice));
      
      // Mock success for UI demonstration
      setTimeout(() => {
        setOrderStatus({ success: true, message: `Real trade for ${quantity} shares of ${symbol} submitted.` });
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error submitting order:', error);
      setOrderStatus({ success: false, message: error instanceof Error ? error.message : 'An error occurred' });
      setIsLoading(false);
    }
    // --- End of Real Trading Logic ---
  };

  const estimatedCost = useDollars
    ? parseFloat(dollars || '0')
    : parseFloat(quantity || '0') * (orderType === 'limit' ? parseFloat(limitPrice || '0') : currentPrice);

  return (
    <Card className="w-full bg-black border border-gray-800 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{isSimulator ? 'Paper Trading' : 'Trade'} {symbol}</CardTitle>
        <CardDescription>
          Current Price: ${currentPrice.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full" onValueChange={(value) => setOrderSide(value as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger
              value="buy"
              className={orderSide === 'buy' ? 'bg-green-500/20 text-green-500' : ''}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              className={orderSide === 'sell' ? 'bg-red-500/20 text-red-500' : ''}
            >
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div>
              <Label htmlFor="orderType-buy">Order Type</Label>
              <Select value={orderType} onValueChange={(value) => setOrderType(value as 'market' | 'limit')}>
                <SelectTrigger id="orderType-buy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'limit' && (
              <div>
                <Label htmlFor="limitPrice-buy">Limit Price</Label>
                <Input id="limitPrice-buy" type="number" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch id="useDollars-buy" checked={useDollars} onCheckedChange={setUseDollars} />
              <Label htmlFor="useDollars-buy">Buy in dollars</Label>
            </div>
            
            {!useDollars && (
              <div>
                <Label htmlFor="quantity-buy">Quantity</Label>
                <Input id="quantity-buy" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
            )}

            {useDollars && (
              <div>
                <Label htmlFor="dollars-buy">Amount in $</Label>
                <Input id="dollars-buy" type="number" value={dollars} onChange={(e) => setDollars(e.target.value)} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4">
              <div>
                <Label htmlFor="quantity-sell">Quantity</Label>
                <Input id="quantity-sell" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between pt-4 mt-4 border-t border-gray-800">
          <span className="text-gray-400 font-semibold">{isSimulator ? 'Virtual Cash:' : 'Available Cash:'}</span>
          <span className="font-semibold">${currentPortfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {orderStatus.message && (
          <div className={`mt-4 p-2 rounded ${orderStatus.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {orderStatus.message}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="text-sm">
          Estimated Cost: <span className="font-bold">${estimatedCost.toFixed(2)}</span>
        </div>
        <Button
          className={`w-full ${orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          onClick={handleSubmitOrder}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${symbol}`}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradingPanel;
