import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, DollarSign, Percent, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OptionPosition {
  id: string;
  symbol: string;
  type: 'call' | 'put';
  strike: number;
  expiryDate: Date;
  quantity: number;
  averageCost: number;
  currentValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  daysToExpiry: number;
}

interface OptionPositionsProps {
  accountId: string;
}

const OptionPositions: React.FC<OptionPositionsProps> = ({ accountId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [positions, setPositions] = useState<OptionPosition[]>([]);

  useEffect(() => {
    const fetchOptionPositions = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call to fetch option positions
        // For now, we'll generate mock data
        
        // Mock option positions
        const mockPositions: OptionPosition[] = [
          {
            id: '1',
            symbol: 'AAPL',
            type: 'call',
            strike: 180,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 14)),
            quantity: 2,
            averageCost: 3.45,
            currentValue: 4.20,
            unrealizedPL: (4.20 - 3.45) * 2 * 100,
            unrealizedPLPercent: ((4.20 - 3.45) / 3.45) * 100,
            daysToExpiry: 14
          },
          {
            id: '2',
            symbol: 'MSFT',
            type: 'put',
            strike: 350,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            quantity: 1,
            averageCost: 5.75,
            currentValue: 4.80,
            unrealizedPL: (4.80 - 5.75) * 1 * 100,
            unrealizedPLPercent: ((4.80 - 5.75) / 5.75) * 100,
            daysToExpiry: 30
          },
          {
            id: '3',
            symbol: 'TSLA',
            type: 'call',
            strike: 250,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            quantity: 3,
            averageCost: 2.85,
            currentValue: 3.10,
            unrealizedPL: (3.10 - 2.85) * 3 * 100,
            unrealizedPLPercent: ((3.10 - 2.85) / 2.85) * 100,
            daysToExpiry: 7
          },
          {
            id: '4',
            symbol: 'NVDA',
            type: 'put',
            strike: 500,
            expiryDate: new Date(new Date().setDate(new Date().getDate() + 21)),
            quantity: 1,
            averageCost: 8.20,
            currentValue: 9.15,
            unrealizedPL: (9.15 - 8.20) * 1 * 100,
            unrealizedPLPercent: ((9.15 - 8.20) / 8.20) * 100,
            daysToExpiry: 21
          }
        ];
        
        setPositions(mockPositions);
      } catch (error) {
        console.error('Error fetching option positions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptionPositions();
  }, [accountId]);

  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalValue = () => {
    return positions.reduce((total, position) => {
      return total + (position.currentValue * position.quantity * 100);
    }, 0);
  };

  const getTotalPL = () => {
    return positions.reduce((total, position) => {
      return total + position.unrealizedPL;
    }, 0);
  };

  const getTotalPLPercent = () => {
    const totalCost = positions.reduce((total, position) => {
      return total + (position.averageCost * position.quantity * 100);
    }, 0);
    
    return (getTotalPL() / totalCost) * 100;
  };

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Option Positions</CardTitle>
        <CardDescription>
          Your current option holdings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading option positions...
            </p>
          </div>
        ) : positions.length === 0 ? (
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Option Positions</h3>
            <p className="text-muted-foreground mb-4">
              You don't have any open option positions. Use the Option Chain or Strategy Builder to start trading options.
            </p>
            <Button onClick={() => document.querySelector('[value="option-chain"]')?.dispatchEvent(new Event('click'))}>
              Go to Option Chain
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    Total Value
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{formatCurrency(getTotalValue())}</div>
                  <div className="text-sm text-muted-foreground">
                    {positions.length} option positions
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-primary" />
                    Unrealized P/L
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className={`text-2xl font-bold ${getTotalPL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(getTotalPL())}
                  </div>
                  <div className={`text-sm ${getTotalPL() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {getTotalPL() >= 0 ? '+' : ''}{getTotalPLPercent().toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800/30 border-gray-700">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    Upcoming Expirations
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">
                    {positions.filter(p => p.daysToExpiry <= 7).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Positions expiring in 7 days
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Strike</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Avg Cost</TableHead>
                    <TableHead>Current</TableHead>
                    <TableHead>P/L</TableHead>
                    <TableHead>P/L %</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id} className={position.daysToExpiry <= 7 ? 'bg-yellow-500/10' : ''}>
                      <TableCell className="font-medium">{position.symbol}</TableCell>
                      <TableCell>
                        <Badge className={position.type === 'call' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                          {position.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>${position.strike}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          {formatExpiryDate(position.expiryDate)}
                          {position.daysToExpiry <= 7 && (
                            <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
                              {position.daysToExpiry}d
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{position.quantity}</TableCell>
                      <TableCell>${position.averageCost.toFixed(2)}</TableCell>
                      <TableCell>${position.currentValue.toFixed(2)}</TableCell>
                      <TableCell className={position.unrealizedPL >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {formatCurrency(position.unrealizedPL)}
                      </TableCell>
                      <TableCell className={position.unrealizedPLPercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {position.unrealizedPLPercent >= 0 ? '+' : ''}{position.unrealizedPLPercent.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                          Close
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OptionPositions;
