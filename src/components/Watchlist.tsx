import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Bell, Trash2 } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Stock } from '@/types';

interface WatchlistProps {
  stocks: Stock[];
  alerts: Alert[];
  onAddStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
  onSetAlert: (symbol: string, price: number, type: 'above' | 'below') => void;
}

interface Alert {
  symbol: string;
  price: number;
  type: 'above' | 'below';
}

const Watchlist: React.FC<WatchlistProps> = ({
  stocks,
  alerts,
  onAddStock,
  onRemoveStock,
  onSetAlert,
}) => {
  const [newTicker, setNewTicker] = useState('');
  const [localAlerts, setLocalAlerts] = useState<Alert[]>([]);
  const navigate = useNavigate();

  const handleAddStock = () => {
    if (newTicker.trim()) {
      onAddStock(newTicker.trim().toUpperCase());
      setNewTicker('');
    }
  };

  const handleSetAlert = (symbol: string, type: 'above' | 'below') => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) {
      const price = stock.price;
      onSetAlert(symbol, price, type);
      setLocalAlerts([...localAlerts, { symbol, price, type }]);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Watchlist</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Add symbol"
              value={newTicker}
              onChange={(e) => setNewTicker(e.target.value)}
              className="w-24"
              onKeyPress={(e) => e.key === 'Enter' && handleAddStock()}
            />
            <Button size="sm" onClick={handleAddStock}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {stocks.map(stock => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-2 rounded-lg border"
            >
              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/stocks/${stock.symbol}`)}
              >
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-muted-foreground">{stock.name}</div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(stock.price)}</div>
                  <div className={cn(
                    "text-sm",
                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {formatPercentage(stock.change)}
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleSetAlert(stock.symbol, 'above')}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleSetAlert(stock.symbol, 'below')}
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onRemoveStock(stock.symbol)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Alerts */}
        {localAlerts.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Price Alerts</h4>
            <div className="space-y-2">
              {localAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{alert.symbol}</span>
                  <span className="text-muted-foreground">
                    {alert.type === 'above' ? 'Above' : 'Below'} {formatCurrency(alert.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Watchlist; 