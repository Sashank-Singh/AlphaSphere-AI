import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';

interface ManualTradePanelProps {
  onExecuteTrade: (symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number) => Promise<void>;
  availableCapital: number;
  isLoading?: boolean;
}

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'NFLX', name: 'Netflix, Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' }
];

export const ManualTradePanel: React.FC<ManualTradePanelProps> = ({
  onExecuteTrade,
  availableCapital,
  isLoading = false
}) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  // Calculate estimated total when price or quantity changes
  React.useEffect(() => {
    const numPrice = parseFloat(price) || 0;
    const total = numPrice * quantity;
    setEstimatedTotal(total);
  }, [price, quantity]);

  const handleExecuteTrade = async () => {
    if (!selectedStock || !price || quantity <= 0) {
      alert('Please fill in all fields');
      return;
    }

    const numPrice = parseFloat(price);
    if (numPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (tradeSide === 'BUY' && estimatedTotal > availableCapital) {
      alert('Insufficient capital for this trade');
      return;
    }

    try {
      await onExecuteTrade(selectedStock, tradeSide, quantity, numPrice);
      
      // Reset form after successful trade
      setSelectedStock('');
      setPrice('');
      setQuantity(1);
      setEstimatedTotal(0);
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  const getMockPrice = (symbol: string) => {
    // Generate a realistic mock price based on symbol
    const basePrices: { [key: string]: number } = {
      'AAPL': 180,
      'MSFT': 380,
      'GOOGL': 140,
      'TSLA': 250,
      'NVDA': 800,
      'AMZN': 150,
      'META': 350,
      'NFLX': 500,
      'SPY': 450,
      'QQQ': 380
    };
    
    const basePrice = basePrices[symbol] || 100;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    return (basePrice * (1 + variation)).toFixed(2);
  };

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    setPrice(getMockPrice(symbol));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Manual Trading
        </CardTitle>
        <CardDescription>
          Execute trades manually with full control
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Capital */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-medium">Available Capital:</span>
          <span className="text-lg font-bold text-green-600">
            ${availableCapital.toLocaleString()}
          </span>
        </div>

        {/* Stock Selection */}
        <div className="space-y-2">
          <Label htmlFor="stock-select">Select Stock</Label>
          <Select value={selectedStock} onValueChange={handleStockSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a stock..." />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_STOCKS.map((stock) => (
                <SelectItem key={stock.symbol} value={stock.symbol}>
                  <div className="flex items-center justify-between w-full">
                    <span>{stock.symbol}</span>
                    <span className="text-muted-foreground text-sm">{stock.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trade Side */}
        <div className="space-y-2">
          <Label>Trade Type</Label>
          <div className="flex gap-2">
            <Button
              variant={tradeSide === 'BUY' ? 'default' : 'outline'}
              onClick={() => setTradeSide('BUY')}
              className="flex-1"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              BUY
            </Button>
            <Button
              variant={tradeSide === 'SELL' ? 'default' : 'outline'}
              onClick={() => setTradeSide('SELL')}
              className="flex-1"
            >
              <TrendingDown className="h-4 w-4 mr-2" />
              SELL
            </Button>
          </div>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Shares)</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            placeholder="1"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Price per Share ($)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Estimated Total */}
        {estimatedTotal > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Estimated Total:</span>
            <span className="text-lg font-bold">
              ${estimatedTotal.toFixed(2)}
            </span>
          </div>
        )}

        {/* Execute Trade Button */}
        <Button
          onClick={handleExecuteTrade}
          disabled={isLoading || !selectedStock || !price || quantity <= 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            'Executing Trade...'
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              {tradeSide} {selectedStock || 'STOCK'}
            </>
          )}
        </Button>

        {/* Trade Summary */}
        {selectedStock && price && quantity > 0 && (
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">Trade Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Action:</span>
                <Badge variant={tradeSide === 'BUY' ? 'default' : 'destructive'}>
                  {tradeSide}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Stock:</span>
                <span>{selectedStock}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span>Price:</span>
                <span>${parseFloat(price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 