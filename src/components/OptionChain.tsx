import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpDown, TrendingUp, TrendingDown, Wifi, WifiOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
  iv: number;
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

  const generateOptionSymbols = (stockSymbol: string, expiryDate: string): string => {
    if (!expiryDate) return '';
    const formattedDate = expiryDate.replace(/-/g, '').substring(2);
    return `${stockSymbol}${formattedDate}`;
  };

  const [optionSymbols, setOptionSymbols] = useState<string>('');

  useEffect(() => {
    if (expiryDate && symbol) {
      const symbols = generateOptionSymbols(symbol, expiryDate);
      setOptionSymbols(symbols);
    }
  }, [expiryDate, symbol, stockPrice]);

  useEffect(() => {
    setIsLoading(true);

    try {
      const calls: OptionContract[] = [];
      const puts: OptionContract[] = [];

      const strikes = [];
      const roundedPrice = Math.round(stockPrice / 5) * 5;

      for (let i = -5; i <= 5; i++) {
        strikes.push(roundedPrice + (i * 5));
      }

      strikes.forEach(strike => {
        const callInTheMoney = strike < stockPrice;
        const putInTheMoney = strike > stockPrice;
        const strikeDiff = Math.abs(stockPrice - strike);
        const timeValue = Math.random() * 2 + 0.5;

        const callPrice = callInTheMoney ? (stockPrice - strike) + timeValue : timeValue;
        const callIv = Math.random() * 0.3 + 0.2;

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

        const putPrice = putInTheMoney ? (strike - stockPrice) + timeValue : timeValue;
        const putIv = Math.random() * 0.3 + 0.2;

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
  }, [symbol, stockPrice, expiryDate, sortConfig]);

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

  // Tooltip content for Greeks
  const greekTooltips = {
    iv: 'Implied Volatility: Market expectation of future volatility.',
    delta: 'Delta: Sensitivity to price changes in the underlying.',
    gamma: 'Gamma: Rate of change of delta.',
    theta: 'Theta: Time decay of the option.',
    vega: 'Vega: Sensitivity to volatility changes.'
  };

  // Show option details on Buy/Sell
  const handleTrade = (option: OptionContract, action: 'Buy' | 'Sell') => {
    window.alert(
      `${action} ${option.type.toUpperCase()}\nStrike: $${option.strike}\nExpiry: ${option.expiryDate}\nLast: $${option.last}\nBid: $${option.bid}\nAsk: $${option.ask}`
    );
  };

  return (
    <TooltipProvider>
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
              <span className="flex items-center text-yellow-500">
                <WifiOff className="h-3 w-3 mr-1" />
                Delayed
              </span>
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
              <div className="shadow-lg border border-green-700 rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Badge className="bg-green-500/20 text-green-500 mr-2">CALLS</Badge>
                  {symbol} Call Options
                </h3>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-black/90">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">
                                IV {getSortIcon('iv')}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.iv}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('delta')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Δ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.delta}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('gamma')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Γ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.gamma}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('theta')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Θ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.theta}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('vega')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Vega</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.vega}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {options.calls.map((option) => (
                        <TableRow
                          key={`call-${option.strike}`}
                          className={`transition-colors ${option.strike < stockPrice ? 'bg-green-500/10' : ''} hover:bg-green-700/10 cursor-pointer`}
                        >
                          <TableCell className="font-medium">{option.strike}</TableCell>
                          <TableCell>{formatCurrency(option.last)}</TableCell>
                          <TableCell className={option.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {option.change >= 0 ? '+' : ''}{option.change.toFixed(2)}
                          </TableCell>
                          <TableCell>{formatCurrency(option.bid)}</TableCell>
                          <TableCell>{formatCurrency(option.ask)}</TableCell>
                          <TableCell>{(option.iv * 100).toFixed(1)}%</TableCell>
                          <TableCell>{option.delta.toFixed(2)}</TableCell>
                          <TableCell>{option.gamma.toFixed(3)}</TableCell>
                          <TableCell>{option.theta.toFixed(3)}</TableCell>
                          <TableCell>{option.vega.toFixed(3)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleTrade(option, 'Buy')}>
                                Buy
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleTrade(option, 'Sell')}>
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

              <div className="shadow-lg border border-red-700 rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Badge className="bg-red-500/20 text-red-500 mr-2">PUTS</Badge>
                  {symbol} Put Options
                </h3>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-black/90">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">
                                IV {getSortIcon('iv')}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.iv}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('delta')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Δ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.delta}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('gamma')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Γ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.gamma}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('theta')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Θ</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.theta}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('vega')}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center cursor-help">Vega</div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{greekTooltips.vega}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {options.puts.map((option) => (
                        <TableRow
                          key={`put-${option.strike}`}
                          className={`transition-colors ${option.strike > stockPrice ? 'bg-red-500/10' : ''} hover:bg-red-700/10 cursor-pointer`}
                        >
                          <TableCell className="font-medium">{option.strike}</TableCell>
                          <TableCell>{formatCurrency(option.last)}</TableCell>
                          <TableCell className={option.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {option.change >= 0 ? '+' : ''}{option.change.toFixed(2)}
                          </TableCell>
                          <TableCell>{formatCurrency(option.bid)}</TableCell>
                          <TableCell>{formatCurrency(option.ask)}</TableCell>
                          <TableCell>{(option.iv * 100).toFixed(1)}%</TableCell>
                          <TableCell>{option.delta.toFixed(2)}</TableCell>
                          <TableCell>{option.gamma.toFixed(3)}</TableCell>
                          <TableCell>{option.theta.toFixed(3)}</TableCell>
                          <TableCell>{option.vega.toFixed(3)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleTrade(option, 'Buy')}>
                                Buy
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleTrade(option, 'Sell')}>
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
    </TooltipProvider>
  );
};

export default OptionChain;
