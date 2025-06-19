import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

interface TradingPanelProps {
  symbol?: string;
  currentPrice?: number;
  accountId?: string;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  symbol = 'AAPL',
  currentPrice = 0,
  accountId = 'demo-account-id'
}) => {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('');
  const [dollars, setDollars] = useState<string>('');
  const [limitPrice, setLimitPrice] = useState<string>(currentPrice ? currentPrice.toString() : '0');
  const [useDollars, setUseDollars] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<{
    success?: boolean;
    message?: string;
    orderId?: string;
  }>({});

  const handleSubmitOrder = async () => {
    if (!symbol) {
      setOrderStatus({
        success: false,
        message: 'Please select a symbol'
      });
      return;
    }

    setIsLoading(true);
    setOrderStatus({});

    try {
      let response;

      if (orderType === 'market') {
        if (orderSide === 'buy') {
          if (useDollars && dollars) {
            response = await marketBuyDollars(accountId, symbol, parseFloat(dollars));
          } else if (!useDollars && quantity) {
            response = await marketBuyShares(accountId, symbol, parseFloat(quantity));
          } else {
            throw new Error('Please enter a valid amount');
          }
        } else { // sell
          if (quantity) {
            response = await marketSellShares(accountId, symbol, parseFloat(quantity));
          } else {
            throw new Error('Please enter a valid quantity');
          }
        }
      } else { // limit
        if (!limitPrice) {
          throw new Error('Please enter a limit price');
        }

        if (orderSide === 'buy') {
          if (quantity) {
            response = await limitBuyShares(accountId, symbol, parseFloat(quantity), parseFloat(limitPrice));
          } else {
            throw new Error('Please enter a valid quantity');
          }
        } else { // sell
          if (quantity) {
            response = await limitSellShares(accountId, symbol, parseFloat(quantity), parseFloat(limitPrice));
          } else {
            throw new Error('Please enter a valid quantity');
          }
        }
      }

      setOrderStatus({
        success: true,
        message: `Order submitted successfully!`,
        orderId: response.id
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      setOrderStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedCost = useDollars
    ? parseFloat(dollars || '0')
    : parseFloat(quantity || '0') * (orderType === 'limit' ? parseFloat(limitPrice || '0') : currentPrice);

  return (
    <Card className="w-full bg-black border border-gray-800 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Trade {symbol}</CardTitle>
        <CardDescription>
          Current Price: ${currentPrice.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger
              value="buy"
              onClick={() => setOrderSide('buy')}
              className={orderSide === 'buy' ? 'bg-green-500/20 text-green-500' : ''}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="sell"
              onClick={() => setOrderSide('sell')}
              className={orderSide === 'sell' ? 'bg-red-500/20 text-red-500' : ''}
            >
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as 'market' | 'limit')}
                >
                  <SelectTrigger id="orderType">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === 'limit' && (
                <div>
                  <Label htmlFor="limitPrice">Limit Price</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              {orderSide === 'buy' && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="useDollars"
                    checked={useDollars}
                    onCheckedChange={setUseDollars}
                  />
                  <Label htmlFor="useDollars">Buy in dollars</Label>
                </div>
              )}

              {(orderSide === 'sell' || !useDollars) && (
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
              )}

              {orderSide === 'buy' && useDollars && (
                <div>
                  <Label htmlFor="dollars">Amount in $</Label>
                  <Input
                    id="dollars"
                    type="number"
                    step="0.01"
                    value={dollars}
                    onChange={(e) => setDollars(e.target.value)}
                    placeholder="Enter dollar amount"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="orderType">Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(value) => setOrderType(value as 'market' | 'limit')}
                >
                  <SelectTrigger id="orderType">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {orderType === 'limit' && (
                <div>
                  <Label htmlFor="limitPrice">Limit Price</Label>
                  <Input
                    id="limitPrice"
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {orderStatus.message && (
          <div className={`mt-4 p-2 rounded ${orderStatus.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
            {orderStatus.message}
            {orderStatus.orderId && (
              <div className="text-xs mt-1">Order ID: {orderStatus.orderId}</div>
            )}
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
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `${orderSide === 'buy' ? 'Buy' : 'Sell'} ${symbol}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TradingPanel;
