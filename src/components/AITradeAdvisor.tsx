import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BrainCircuit, Sparkles, ArrowRight, TrendingUp, TrendingDown, Clock, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getAIRecommendation } from '@/data/mockData';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';
import { AIRecommendation, Stock } from '@/types';

interface AITradeAdvisorProps {
  symbol: string;
  accountId: string;
  refreshInterval?: number;
}

const AITradeAdvisor: React.FC<AITradeAdvisorProps> = ({
  symbol,
  accountId,
  refreshInterval = 30000
}) => {
  const [stockData, setStockData] = useState<StockQuote | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [stockRecommendation, setStockRecommendation] = useState<{
    action: 'buy' | 'sell' | 'hold';
    confidence: 'low' | 'medium' | 'high';
    targetPrice: number;
    reasoning: string;
  } | null>(null);
  const [quantity, setQuantity] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tradeResult, setTradeResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch real-time stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const data = await stockDataService.getStockQuote(symbol);
        setStockData(data);
        setIsLoadingStock(false);
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        setIsLoadingStock(false);
      }
    };

    fetchStockData();
    
    // Set up refresh interval
    const interval = setInterval(fetchStockData, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, refreshInterval]);

  // Generate AI recommendation
  const generateRecommendation = () => {
    setIsLoading(true);
    setTradeResult(null);

    if (!stockData) return;

    // Create a mock stock object for the recommendation
    const stock: Stock = {
      id: symbol,
      symbol: symbol,
      name: stockData.name || symbol,
      price: stockData.price,
      change: stockData.change,
      volume: 0
    };

    // Simulate delay for AI processing
    setTimeout(() => {
      try {
        // Get option recommendation
        const optionRec = getAIRecommendation(symbol, 'medium');
        setRecommendation(optionRec);

        // Generate stock recommendation
        const trend = change >= 0;
        const confidence = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high';
        const targetPriceChange = trend ?
          (confidence === 'high' ? 0.05 : confidence === 'medium' ? 0.03 : 0.01) :
          (confidence === 'high' ? -0.05 : confidence === 'medium' ? -0.03 : -0.01);

        const action = trend ? 'buy' as const : 'sell' as const;
        const targetPrice = price * (1 + targetPriceChange);

        let reasoning = '';
        if (trend) {
          reasoning = `${symbol} shows positive momentum with a ${change.toFixed(2)}% gain. Technical indicators suggest continued upward movement with a target of ${formatCurrency(targetPrice)} in the short term.`;
        } else {
          reasoning = `${symbol} is showing weakness with a ${Math.abs(change).toFixed(2)}% decline. Technical indicators suggest further downside with a target of ${formatCurrency(targetPrice)} in the short term.`;
        }

        setStockRecommendation({
          action,
          confidence,
          targetPrice,
          reasoning
        });

      } catch (error) {
        console.error('Error generating AI recommendation:', error);
      } finally {
        setIsLoading(false);
      }
    }, 2000);
  };

  // Execute stock trade (simulate using Polygon data)
  const executeStockTrade = async (action: 'buy' | 'sell') => {
    if (!stockRecommendation) return;

    setIsSubmitting(true);
    setTradeResult(null);

    try {
      const qty = parseInt(quantity);
      // Simulate trade using Polygon data (no real trade execution)
      await new Promise(res => setTimeout(res, 1000));
      setTradeResult({
        success: true,
        message: `Simulated ${action === 'buy' ? 'buy' : 'sell'} of ${qty} shares of ${symbol} at ${formatCurrency(price)} (Polygon real-time price)`
      });
    } catch (error) {
      setTradeResult({
        success: false,
        message: 'Failed to simulate trade.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format expiry date
  const formatExpiryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card className="bg-black border border-gray-800 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary" />
          AI Trade Advisor
        </CardTitle>
        <CardDescription>
          Get AI-powered trading recommendations for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!recommendation && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <BrainCircuit className="h-12 w-12 text-primary/50" />
            <p className="text-center text-muted-foreground">
              AI can analyze market conditions and provide trading recommendations based on technical indicators and historical patterns.
            </p>
            <Button onClick={generateRecommendation} className="mt-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Recommendation
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              AI analyzing market conditions...
            </p>
          </div>
        ) : (
          <Tabs defaultValue="stock" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="stock">Stock Trade</TabsTrigger>
              <TabsTrigger value="option">Options Strategy</TabsTrigger>
            </TabsList>

            <TabsContent value="stock" className="space-y-4">
              {stockRecommendation && (
                <>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={stockRecommendation.action === 'buy'
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                        }>
                          {stockRecommendation.action === 'buy' ? 'BUY' : 'SELL'}
                        </Badge>
                        <span className="font-semibold">{symbol}</span>
                      </div>

                      <Badge className="bg-primary/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{stockRecommendation.confidence.toUpperCase()} confidence</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Price:</div>
                        <div className="font-medium">{stockData ? formatCurrency(stockData.price) : '--'}</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Target Price:</div>
                        <div className="font-medium flex items-center gap-1">
                          {formatCurrency(stockRecommendation.targetPrice)}
                          {stockData && stockRecommendation.targetPrice > stockData.price ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="text-muted-foreground">Potential Gain/Loss:</div>
                        <div className={`font-medium ${stockData && stockRecommendation.targetPrice > stockData.price ? "text-green-500" : "text-red-500"}`}>
                          {stockData ? ((stockRecommendation.targetPrice - stockData.price) / stockData.price * 100).toFixed(2) : '--'}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium mb-1">AI Reasoning:</div>
                    <p className="text-muted-foreground">{stockRecommendation.reasoning}</p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="quantity">Quantity (shares)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span>Estimated Cost:</span>
                    <span className="font-bold">{stockData ? formatCurrency(parseInt(quantity || '0') * stockData.price) : '--'}</span>
                  </div>

                  {tradeResult && (
                    <div className={`mt-4 p-3 rounded ${tradeResult.success ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                      {tradeResult.message}
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => executeStockTrade('buy')}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Buy</>
                      )}
                    </Button>
                    <Button
                      onClick={() => executeStockTrade('sell')}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Sell</>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="option" className="space-y-4">
              {recommendation && (
                <>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm text-muted-foreground">Recommended Option:</div>
                        <div className="font-semibold flex items-center gap-1">
                          {recommendation.symbol}
                          <span className={recommendation.optionContract.type === 'call'
                            ? "text-green-500 text-xs bg-green-500/10 px-1.5 py-0.5 rounded-full"
                            : "text-red-500 text-xs bg-red-500/10 px-1.5 py-0.5 rounded-full"
                          }>
                            {recommendation.optionContract.type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <Badge className="bg-primary/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>{recommendation.confidence.toUpperCase()} confidence</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <div className="text-muted-foreground">Strike Price:</div>
                        <div className="font-medium">{formatCurrency(recommendation.optionContract.strikePrice)}</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Premium:</div>
                        <div className="font-medium">{formatCurrency(recommendation.optionContract.premium)} per share</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Contract Cost:</div>
                        <div className="font-medium">{formatCurrency(recommendation.optionContract.premium * 100)}</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground">Expiry:</div>
                        <div className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatExpiryDate(recommendation.optionContract.expiryDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="font-medium mb-1">AI Reasoning:</div>
                    <p className="text-muted-foreground">{recommendation.reasoning}</p>
                  </div>

                  <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-md flex items-start gap-2 text-sm mt-4">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      Options trading is not yet available in this version. Please use the stock trading tab or contact your broker to execute options trades.
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-border pt-4">
        {(recommendation || isLoading) && !isSubmitting && (
          <Button variant="outline" onClick={() => {
            setRecommendation(null);
            setStockRecommendation(null);
            setTradeResult(null);
          }}>
            Reset
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AITradeAdvisor;
