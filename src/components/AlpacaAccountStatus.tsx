import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, DollarSign, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { logger } from '@/lib/logger';

interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  buying_power: string;
  regt_buying_power: string;
  daytrading_buying_power: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transfers_blocked: boolean;
  account_blocked: boolean;
  created_at: string;
}

const AlpacaAccountStatus: React.FC = () => {
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAccountInfo = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/api/alpaca/account');
      
      if (!response.ok) {
        if (response.status === 500) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Alpaca API configuration error');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const accountData: AlpacaAccount = await response.json();
      setAccount(accountData);
      setLastUpdated(new Date());
      
      logger.info('Alpaca account data fetched successfully', {
        accountId: accountData.id,
        status: accountData.status
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch account information';
      setError(errorMessage);
      logger.error('Failed to fetch Alpaca account info', { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountInfo();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAccountInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alpaca Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <Button 
            onClick={fetchAccountInfo} 
            className="mt-4" 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Alpaca Paper Trading
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAccountInfo}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {account ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {getStatusBadge(account.status)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Portfolio Value</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(account.portfolio_value)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Buying Power</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(account.buying_power)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cash</span>
                <span className="font-medium">{formatCurrency(account.cash)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Number</span>
                <span className="font-mono">{account.account_number}</span>
              </div>
            </div>

            {(account.pattern_day_trader || account.trading_blocked || account.transfers_blocked) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {account.pattern_day_trader && <p>• Pattern Day Trader restrictions apply</p>}
                  {account.trading_blocked && <p>• Trading is currently blocked</p>}
                  {account.transfers_blocked && <p>• Transfers are currently blocked</p>}
                </AlertDescription>
              </Alert>
            )}

            {lastUpdated && (
              <p className="text-xs text-muted-foreground text-center">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlpacaAccountStatus;

