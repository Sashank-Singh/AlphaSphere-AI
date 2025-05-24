import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpDown, TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useOptionsWebSocket, OptionQuote } from '@/hooks/useAlpacaWebSocket';

interface OptionContract {
  strike: number;
  expiryDate: string;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  last: number;
  change: number;
  volume: number;
  openInterest: number;
  iv: number; // Implied volatility
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

interface OptionChainProps {
  symbol: string;
  stockPrice: number;
  expiryDate: string;
  accountId: string;
}

const OptionChain: React.FC<OptionChainProps> = ({
  symbol,
  stockPrice,
  expiryDate,
  accountId
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<{
    calls: OptionContract[];
    puts: OptionContract[];
  }>({
    calls: [],
    puts: []
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  }>({
    key: 'strike',
    direction: 'ascending'
  });

  // Generate option symbols for the selected stock and expiry
  const generateOptionSymbols = (stockSymbol: string, expiryDate: string): string[] => {
    if (!expiryDate) return [];

    // Format: AAPL230616C00150000
    // Remove dashes from date
    const formattedDate = expiryDate.replace(/-/g, '').substring(2);

    // Generate strikes around current price
    const strikes = [];
    const baseStrike = Math.round(stockPrice / 5) * 5;

    for (let i = -5; i <= 5; i++) {
      const strike = baseStrike + (i * 5);
      strikes.push(strike);
    }

    // Generate option symbols for calls and puts
    const optionSymbols: string[] = [];

    strikes.forEach(strike => {
      // Format strike price with padding (e.g., 00150000 for $150)
      const formattedStrike = (strike * 1000).toString().padStart(8, '0');

      // Call option
      const callSymbol = `${stockSymbol}${formattedDate}C${formattedStrike}`;
      optionSymbols.push(callSymbol);

      // Put option
      const putSymbol = `${stockSymbol}${formattedDate}P${formattedStrike}`;
      optionSymbols.push(putSymbol);
    });

    return optionSymbols;
  };

  // Generate option symbols based on selected expiry
  const [optionSymbols, setOptionSymbols] = useState<string[]>([]);

  // Use WebSocket for real-time option data
  const { optionsData: wsOptionData, isConnected } = useOptionsWebSocket(optionSymbols);

  // Update option symbols when expiry date or stock price changes
  useEffect(() => {
    if (expiryDate && symbol) {
      const symbols = generateOptionSymbols(symbol, expiryDate);
      setOptionSymbols(symbols);
    }
  }, [expiryDate, symbol, stockPrice]);

  // Process WebSocket option data
  useEffect(() => {
    setIsLoading(true);

    try {
      if (wsOptionData && Object.keys(wsOptionData).length > 0) {
        // Process WebSocket data
        const calls: OptionContract[] = [];
        const puts: OptionContract[] = [];

        // Process each option from WebSocket data
        Object.values(wsOptionData).forEach(option => {
          // Extract option details from the symbol
          const isCall = option.symbol.includes('C');
          const isPut = option.symbol.includes('P');

          if (!isCall && !isPut) return;

          // Extract strike price from the symbol
          const strikeMatch = option.symbol.match(/[CP](\d+)/);
          if (!strikeMatch) return;

          const strike = parseInt(strikeMatch[1]) / 1000;

          // Create option contract
          const contract: OptionContract = {
            strike,
            expiryDate: option.expirationDate || expiryDate,
            type: isCall ? 'call' : 'put',
            bid: option.bidPrice || 0,
            ask: option.askPrice || 0,
            last: option.lastPrice || 0,
            change: 0, // Not provided in real-time data
            volume: option.volume || 0,
            openInterest: option.openInterest || 0,
            iv: option.impliedVolatility || Math.random() * 0.3 + 0.2, // Use WebSocket IV or generate mock
            delta: isCall ? Math.random() * 0.5 + 0.5 : -Math.random() * 0.5 - 0.5,
            gamma: Math.random() * 0.05,
            theta: -Math.random() * 0.1,
            vega: Math.random() * 0.2
          };

          if (isCall) {
            calls.push(contract);
          } else {
            puts.push(contract);
          }
        });

        // If we have WebSocket data, use it
        if (calls.length > 0 || puts.length > 0) {
          setOptions({
            calls: sortOptionsByKey(calls, sortConfig.key, sortConfig.direction),
            puts: sortOptionsByKey(puts, sortConfig.key, sortConfig.direction)
          });
          setIsLoading(false);
          return;
        }
      }

      // Fallback to mock data if WebSocket data is not available
      // Generate strikes around the current stock price
      const strikes = [];
      const roundedPrice = Math.round(stockPrice / 5) * 5; // Round to nearest $5

      for (let i = -5; i <= 5; i++) {
        strikes.push(roundedPrice + (i * 5));
      }

      // Generate mock option data
      const calls: OptionContract[] = [];
      const puts: OptionContract[] = [];

      strikes.forEach(strike => {
        // Calculate rough option prices based on distance from strike
        const callInTheMoney = strike < stockPrice;
        const putInTheMoney = strike > stockPrice;

        const strikeDiff = Math.abs(stockPrice - strike);
        const timeValue = Math.random() * 2 + 0.5; // Random time value between $0.50 and $2.50

        // Call option
        const callPrice = callInTheMoney ? (stockPrice - strike) + timeValue : timeValue;
        const callIv = Math.random() * 0.3 + 0.2; // IV between 20% and 50%

        calls.push({
          strike,
          expiryDate,
          type: 'call',
          bid: parseFloat((callPrice - 0.05).toFixed(2)),
          ask: parseFloat((callPrice + 0.05).toFixed(2)),
          last: parseFloat(callPrice.toFixed(2)),
          change: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)),
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          iv: callIv,
          delta: callInTheMoney ? 0.5 + Math.random() * 0.5 : Math.random() * 0.5,
          gamma: Math.random() * 0.05,
          theta: -Math.random() * 0.1,
          vega: Math.random() * 0.2
        });

        // Put option
        const putPrice = putInTheMoney ? (strike - stockPrice) + timeValue : timeValue;
        const putIv = Math.random() * 0.3 + 0.2; // IV between 20% and 50%

        puts.push({
          strike,
          expiryDate,
          type: 'put',
          bid: parseFloat((putPrice - 0.05).toFixed(2)),
          ask: parseFloat((putPrice + 0.05).toFixed(2)),
          last: parseFloat(putPrice.toFixed(2)),
          change: parseFloat((Math.random() * 0.4 - 0.2).toFixed(2)),
          volume: Math.floor(Math.random() * 1000),
          openInterest: Math.floor(Math.random() * 5000),
          iv: putIv,
          delta: putInTheMoney ? -0.5 - Math.random() * 0.5 : -Math.random() * 0.5,
          gamma: Math.random() * 0.05,
          theta: -Math.random() * 0.1,
          vega: Math.random() * 0.2
        });
      });

      setOptions({
        calls: sortOptionsByKey(calls, sortConfig.key, sortConfig.direction),
        puts: sortOptionsByKey(puts, sortConfig.key, sortConfig.direction)
      });
    } catch (error) {
      console.error('Error processing option data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, stockPrice, expiryDate, sortConfig, wsOptionData]);

  const sortOptionsByKey = (options: OptionContract[], key: string, direction: 'ascending' | 'descending') => {
    return [...options].sort((a, b) => {
      if (a[key as keyof OptionContract] < b[key as keyof OptionContract]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key as keyof OptionContract] > b[key as keyof OptionContract]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortConfig.direction === 'ascending' ?
      <TrendingUp className="h-4 w-4 ml-1 text-primary" /> :
      <TrendingDown className="h-4 w-4 ml-1 text-primary" />;
  };

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Option Chain for {symbol}</CardTitle>
            <CardDescription>
              Expiration: {expiryDate ? new Date(expiryDate).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Select an expiration date'}
            </CardDescription>
          </div>
          <div className="flex items-center text-xs">
            <span className="mr-1">Data:</span>
            {isConnected ? (
              <span className="flex items-center text-green-500">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </span>
            ) : (
              <span className="flex items-center text-yellow-500">
                <WifiOff className="h-3 w-3 mr-1" />
                Delayed
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Loading option chain...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calls */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Badge className="bg-green-500/20 text-green-500 mr-2">CALLS</Badge>
                {symbol} Call Options
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('strike')}>
                        <div className="flex items-center">
                          Strike {getSortIcon('strike')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('last')}>
                        <div className="flex items-center">
                          Last {getSortIcon('last')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('change')}>
                        <div className="flex items-center">
                          Change {getSortIcon('change')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('bid')}>
                        <div className="flex items-center">
                          Bid {getSortIcon('bid')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('ask')}>
                        <div className="flex items-center">
                          Ask {getSortIcon('ask')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('iv')}>
                        <div className="flex items-center">
                          IV {getSortIcon('iv')}
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.calls.map((option) => (
                      <TableRow key={`call-${option.strike}`} className={option.strike < stockPrice ? 'bg-green-500/10' : ''}>
                        <TableCell className="font-medium">{option.strike}</TableCell>
                        <TableCell>{formatCurrency(option.last)}</TableCell>
                        <TableCell className={option.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {option.change >= 0 ? '+' : ''}{option.change.toFixed(2)}
                        </TableCell>
                        <TableCell>{formatCurrency(option.bid)}</TableCell>
                        <TableCell>{formatCurrency(option.ask)}</TableCell>
                        <TableCell>{(option.iv * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Buy
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Sell
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Puts */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Badge className="bg-red-500/20 text-red-500 mr-2">PUTS</Badge>
                {symbol} Put Options
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('strike')}>
                        <div className="flex items-center">
                          Strike {getSortIcon('strike')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('last')}>
                        <div className="flex items-center">
                          Last {getSortIcon('last')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('change')}>
                        <div className="flex items-center">
                          Change {getSortIcon('change')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('bid')}>
                        <div className="flex items-center">
                          Bid {getSortIcon('bid')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('ask')}>
                        <div className="flex items-center">
                          Ask {getSortIcon('ask')}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => requestSort('iv')}>
                        <div className="flex items-center">
                          IV {getSortIcon('iv')}
                        </div>
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {options.puts.map((option) => (
                      <TableRow key={`put-${option.strike}`} className={option.strike > stockPrice ? 'bg-red-500/10' : ''}>
                        <TableCell className="font-medium">{option.strike}</TableCell>
                        <TableCell>{formatCurrency(option.last)}</TableCell>
                        <TableCell className={option.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {option.change >= 0 ? '+' : ''}{option.change.toFixed(2)}
                        </TableCell>
                        <TableCell>{formatCurrency(option.bid)}</TableCell>
                        <TableCell>{formatCurrency(option.ask)}</TableCell>
                        <TableCell>{(option.iv * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Buy
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                              Sell
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OptionChain;
