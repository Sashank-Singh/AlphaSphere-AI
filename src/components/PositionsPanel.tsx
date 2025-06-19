import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface PositionsPanelProps {
  accountId: string;
}

const PositionsPanel: React.FC<PositionsPanelProps> = ({ accountId }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [closingPositions, setClosingPositions] = useState<Record<string, boolean>>({});

  const fetchPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Placeholder for the removed getPositions function
      // Replace with actual implementation
      setPositions([]);
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError('Failed to load positions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // Set up interval to refresh positions every minute
    const intervalId = setInterval(fetchPositions, 60000);
    return () => clearInterval(intervalId);
  }, [accountId]);

  const handleClosePosition = async (symbol: string) => {
    setClosingPositions(prev => ({ ...prev, [symbol]: true }));
    try {
      // Placeholder for the removed closePosition function
      // Replace with actual implementation
    } catch (err) {
      console.error(`Error closing position for ${symbol}:`, err);
      setError(`Failed to close position for ${symbol}. Please try again.`);
    } finally {
      setClosingPositions(prev => ({ ...prev, [symbol]: false }));
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatPercent = (value: string) => {
    const num = parseFloat(value) * 100;
    return `${num.toFixed(2)}%`;
  };

  return (
    <Card className="w-full bg-black border border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Your Positions</CardTitle>
          <CardDescription>
            {positions.length} positions in your portfolio
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchPositions} 
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-500/20 text-red-500 p-2 rounded mb-4">
            {error}
          </div>
        )}
        
        {positions.length === 0 && !isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            You don't have any open positions.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>P&L %</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <div className="mt-2 text-muted-foreground">Loading positions...</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((position) => (
                    <TableRow key={position.symbol}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>{parseFloat(position.qty).toFixed(2)}</TableCell>
                      <TableCell>{formatCurrency(position.avg_entry_price)}</TableCell>
                      <TableCell>{formatCurrency(position.current_price)}</TableCell>
                      <TableCell>{formatCurrency(position.market_value)}</TableCell>
                      <TableCell className={parseFloat(position.unrealized_pl) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(position.unrealized_pl)}
                      </TableCell>
                      <TableCell className={parseFloat(position.unrealized_plpc) >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatPercent(position.unrealized_plpc)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleClosePosition(position.symbol)}
                          disabled={closingPositions[position.symbol]}
                        >
                          {closingPositions[position.symbol] ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Closing...
                            </>
                          ) : (
                            'Close'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PositionsPanel;
