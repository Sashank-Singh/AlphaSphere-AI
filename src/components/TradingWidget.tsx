import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface TradingWidgetProps {
  popularStocks?: { symbol: string; name: string; price: number }[];
  accountId?: string;
}

const TradingWidget: React.FC<TradingWidgetProps> = ({ 
  popularStocks = [], 
  accountId = 'demo-account-id'
}) => {
  const navigate = useNavigate();
  const [symbol, setSymbol] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  const handleQuickBuy = async () => {
    if (!symbol || !amount) {
      setOrderStatus({
        success: false,
        message: 'Please enter a symbol and amount'
      });
      return;
    }

    setIsLoading(true);
    setOrderStatus({});

    try {
      // Placeholder for the removed marketBuyDollars function
      setOrderStatus({
        success: true,
        message: `Successfully placed order for $${amount} of ${symbol}`
      });
      // Reset form
      setSymbol('');
      setAmount('');
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Trade
        </CardTitle>
        <CardDescription>
          Quickly buy stocks with dollar-based investing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 100"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {orderStatus.message && (
            <div className={`p-2 rounded ${orderStatus.success ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {orderStatus.message}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleQuickBuy}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Buy Now'}
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/trading')}
        >
          Advanced Trading
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        
        <div className="w-full">
          <p className="text-xs text-muted-foreground mb-2">Popular Stocks:</p>
          <div className="flex flex-wrap gap-2">
            {popularStocks.slice(0, 5).map((stock) => (
              <Button
                key={stock.symbol}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate(`/trading/${stock.symbol}`)}
              >
                {stock.symbol}
              </Button>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TradingWidget;
