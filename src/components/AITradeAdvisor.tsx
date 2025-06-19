import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BrainCircuit, Sparkles, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface AITradeAdvisorProps {
  symbol: string;
  accountId: string;
}

interface StockRecommendation {
  signal: 'BUY' | 'SELL' | 'HOLD' | 'UNAVAILABLE';
  summary: string;
  confidence: number;
  currentPrice: number;
  sma50: number;
  sma200: number;
}

interface OptionContract {
    symbol: string;
    strikePrice: number;
    type: 'call' | 'put';
    expiryDate: string;
    premium: number;
}

interface OptionRecommendation {
  strategy: string;
  summary: string;
  contract: OptionContract | null;
  confidence: number;
}

const AITradeAdvisor: React.FC<AITradeAdvisorProps> = ({ symbol, accountId }) => {
  const [stockRecommendation, setStockRecommendation] = useState<StockRecommendation | null>(null);
  const [optionRecommendation, setOptionRecommendation] = useState<OptionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setStockRecommendation(null);
    setOptionRecommendation(null);

    try {
      const [stockRes, optionRes] = await Promise.all([
        fetch(`/api/yahoo/recommendation/${symbol}`),
        fetch(`/api/yahoo/options_recommendation/${symbol}`)
      ]);

      if (!stockRes.ok || !optionRes.ok) {
        const stockError = !stockRes.ok ? await stockRes.text() : '';
        const optionError = !optionRes.ok ? await optionRes.text() : '';
        throw new Error(`Failed to fetch AI recommendations. Stock: ${stockError}, Option: ${optionError}`);
      }

      const stockData: StockRecommendation = await stockRes.json();
      const optionData: OptionRecommendation = await optionRes.json();
      
      setStockRecommendation(stockData);
      setOptionRecommendation(optionData);

    } catch (err: any) {
      setError('Failed to generate recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'SELL': return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'SELL': return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
    }
  };

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      timeZone: 'UTC', // Dates from yfinance are UTC
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderInitialState = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <BrainCircuit className="h-12 w-12 text-primary/50" />
      <p className="text-center text-muted-foreground">
        Get AI-powered analysis for stock trades and options strategies based on real-time market data.
      </p>
      <Button onClick={handleGenerate} className="mt-4">
        <Sparkles className="h-4 w-4 mr-2" />
        Generate Analysis
      </Button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-center text-muted-foreground">
        AI is analyzing market data for {symbol}...
      </p>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
      <p className="text-red-500">{error}</p>
      <Button onClick={handleGenerate} variant="outline">Try Again</Button>
    </div>
  );

  const renderResults = () => (
    <Tabs defaultValue="stock" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="stock">Stock Trade</TabsTrigger>
        <TabsTrigger value="option">Options Strategy</TabsTrigger>
      </TabsList>

      <TabsContent value="stock" className="space-y-4">
        {stockRecommendation && stockRecommendation.signal !== 'UNAVAILABLE' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-card-alt">
                <div className="flex items-center space-x-3">
                    {getSignalIcon(stockRecommendation.signal)}
                    <span className={`text-xl font-bold ${getSignalColor(stockRecommendation.signal).split(' ')[1]}`}>
                        {stockRecommendation.signal}
                    </span>
                </div>
                <Badge className={`${getSignalColor(stockRecommendation.signal)}`}>
                    Confidence: {formatPercentage(stockRecommendation.confidence / 100)}
                </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{stockRecommendation.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                <div className="p-2 rounded-md bg-background-alt"><p className="text-muted-foreground text-xs">Price</p><p className="font-semibold">{formatCurrency(stockRecommendation.currentPrice)}</p></div>
                <div className="p-2 rounded-md bg-background-alt"><p className="text-muted-foreground text-xs">50-Day SMA</p><p className="font-semibold">{formatCurrency(stockRecommendation.sma50)}</p></div>
                <div className="p-2 rounded-md bg-background-alt"><p className="text-muted-foreground text-xs">200-Day SMA</p><p className="font-semibold">{formatCurrency(stockRecommendation.sma200)}</p></div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">{stockRecommendation?.summary || "No stock recommendation available."}</p>
        )}
      </TabsContent>

      <TabsContent value="option" className="space-y-4">
        {optionRecommendation && optionRecommendation.contract ? (
          <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card-alt">
                  <div className="flex items-center space-x-3">
                      <span className={`text-xl font-bold`}>
                          {optionRecommendation.strategy}
                      </span>
                  </div>
                  <Badge className={`${getSignalColor(optionRecommendation.strategy.includes('Call') ? 'BUY' : 'SELL')}`}>
                      Confidence: {formatPercentage(optionRecommendation.confidence / 100)}
                  </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{optionRecommendation.summary}</p>

              <div className="p-3 rounded-md bg-background-alt text-sm space-y-2">
                  <div className="font-semibold">Recommended Contract:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-muted-foreground">Symbol:</span> {optionRecommendation.contract.symbol}</div>
                    <div><span className="text-muted-foreground">Type:</span> <span className={`font-semibold ${optionRecommendation.contract.type === 'call' ? 'text-green-500' : 'text-red-500'}`}>{optionRecommendation.contract.type.toUpperCase()}</span></div>
                    <div><span className="text-muted-foreground">Strike:</span> {formatCurrency(optionRecommendation.contract.strikePrice)}</div>
                    <div><span className="text-muted-foreground">Premium:</span> {formatCurrency(optionRecommendation.contract.premium)}</div>
                    <div className="col-span-2"><span className="text-muted-foreground">Expires:</span> {formatExpiryDate(optionRecommendation.contract.expiryDate)}</div>
                  </div>
              </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-4">{optionRecommendation?.summary || "No options recommendation available."}</p>
        )}
      </TabsContent>
       <div className="pt-4 mt-4 border-t border-border">
          <Button onClick={handleGenerate} className="w-full" variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Re-analyze
          </Button>
        </div>
    </Tabs>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          AI Trade Advisor
        </CardTitle>
         <CardDescription>
           AI-powered analysis for {symbol}
         </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? renderLoadingState() : error ? renderErrorState() : (stockRecommendation ? renderResults() : renderInitialState())}
      </CardContent>
    </Card>
  );
};

export default AITradeAdvisor;
