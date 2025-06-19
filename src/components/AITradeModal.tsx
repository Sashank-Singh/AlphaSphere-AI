
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, BrainCircuit, Clock, Sparkles, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AIRecommendation, Stock, OptionContract } from '@/types';
import { usePortfolio } from '@/context/PortfolioContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { stockDataService } from '@/lib/stockDataService';

interface AITradeModalProps {
  stock: Stock;
  open: boolean;
  onClose: () => void;
  onTrade: (option: OptionContract, quantity: number, type: 'buy' | 'sell') => Promise<void>;
}

const AITradeModal: React.FC<AITradeModalProps> = ({ stock, open, onClose, onTrade }) => {
  const { user } = useAuth();
  const { portfolio } = usePortfolio();
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realTimeQuote, setRealTimeQuote] = useState<any>(null);
  const [marketSentiment, setMarketSentiment] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Generate AI recommendation based on real-time data
  const generateAIRecommendation = async (symbol: string, riskTolerance: string, quote: any): Promise<AIRecommendation> => {
    const optionsData = await stockDataService.getOptionsData(symbol);
    const historicalData = await stockDataService.getHistoricalPrices(symbol, 30);
    
    // Calculate volatility from historical data
    const volatility = historicalData.length > 1 ? 
      Math.abs(historicalData[historicalData.length - 1].close - historicalData[0].close) / historicalData[0].close * 100 : 5;
    
    // Determine market sentiment based on price action
    const sentiment = quote.changePercent > 2 ? 'bullish' : 
                     quote.changePercent < -2 ? 'bearish' : 'neutral';
    setMarketSentiment(sentiment);
    
    // Generate expiry date (next Friday)
    const nextFriday = new Date();
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
    
    // Calculate strike price based on current price and sentiment
    const currentPrice = quote.price;
    let strikePrice: number;
    let optionType: 'call' | 'put';
    let confidence: 'low' | 'medium' | 'high';
    let reasoning: string;
    
    if (sentiment === 'bullish' && quote.volume > quote.volume * 0.8) {
      optionType = 'call';
      strikePrice = currentPrice * (riskTolerance === 'high' ? 1.05 : riskTolerance === 'medium' ? 1.03 : 1.02);
      confidence = volatility > 10 ? 'high' : 'medium';
      reasoning = `Strong bullish momentum detected with ${quote.changePercent.toFixed(2)}% gain and high volume (${(quote.volume / 1000000).toFixed(1)}M). Recommending call option to capitalize on upward trend.`;
    } else if (sentiment === 'bearish' && quote.volume > quote.volume * 0.8) {
      optionType = 'put';
      strikePrice = currentPrice * (riskTolerance === 'high' ? 0.95 : riskTolerance === 'medium' ? 0.97 : 0.98);
      confidence = volatility > 10 ? 'high' : 'medium';
      reasoning = `Bearish pressure evident with ${Math.abs(quote.changePercent).toFixed(2)}% decline and elevated volume. Put option recommended to profit from potential further downside.`;
    } else {
      // Neutral/conservative approach
      optionType = currentPrice > quote.previousClose ? 'call' : 'put';
      strikePrice = currentPrice * (optionType === 'call' ? 1.02 : 0.98);
      confidence = 'low';
      reasoning = `Mixed signals in current market conditions. Conservative ${optionType} option suggested based on slight ${optionType === 'call' ? 'upward' : 'downward'} bias.`;
    }
    
    // Calculate premium based on volatility and time to expiry
    const timeValue = Math.max(1, daysUntilFriday / 7);
    const intrinsicValue = optionType === 'call' ? 
      Math.max(0, currentPrice - strikePrice) : 
      Math.max(0, strikePrice - currentPrice);
    const premium = intrinsicValue + (volatility / 100 * currentPrice * timeValue * 0.1);
    
    return {
      symbol,
      confidence,
      optionContract: {
        id: `${symbol}_${Date.now()}`,
        stockId: symbol,
        symbol: `${symbol} ${nextFriday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${strikePrice.toFixed(0)}${optionType.charAt(0).toUpperCase()}`,
        type: optionType,
        strikePrice,
        expiryDate: nextFriday,
        premium: Math.max(0.05, premium)
      },
      reasoning
    };
  };

  useEffect(() => {
    if (open && user) {
      setIsLoading(true);
      
      const fetchRealTimeData = async () => {
        try {
          // Get real-time quote
          const quote = await stockDataService.getStockQuote(stock.symbol);
          setRealTimeQuote(quote);
          setLastUpdated(new Date());
          
          // Generate AI recommendation based on real-time data
          const rec = await generateAIRecommendation(stock.symbol, user.riskTolerance, quote);
          setRecommendation(rec);
        } catch (error) {
          console.error('Error fetching real-time data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRealTimeData();
      
      // Set up real-time updates every 10 seconds
      const interval = setInterval(fetchRealTimeData, 10000);
      
      return () => clearInterval(interval);
    }
  }, [open, stock.symbol, user]);

  const handleTrade = async () => {
    if (!recommendation) return;
    
    setIsSubmitting(true);
    try {
      await onTrade(
        recommendation.optionContract,
        parseInt(quantity),
        'buy'
      );
      onClose();
    } catch (error) {
      console.error('Error executing AI trade:', error);
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
  
  // Calculate maximum contracts user can afford
  const contractCost = recommendation ? recommendation.optionContract.premium * 100 : 0;
  const maxContracts = Math.floor(portfolio.cash / contractCost);
  const estimatedCost = parseInt(quantity || '0') * contractCost;
  const canAfford = estimatedCost <= portfolio.cash;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Trade Recommendation
          </DialogTitle>
          <DialogDescription>
            {stock.name} ({stock.symbol})
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {/* Real-time market data header */}
          {realTimeQuote && (
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Live Market Data</span>
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </div>
                <span className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Current Price</div>
                  <div className="font-bold text-lg">{formatCurrency(realTimeQuote.price)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Change</div>
                  <div className={`font-medium flex items-center gap-1 ${
                    realTimeQuote.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {realTimeQuote.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {formatCurrency(realTimeQuote.change)} ({realTimeQuote.changePercent.toFixed(2)}%)
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-medium">{(realTimeQuote.volume / 1000000).toFixed(1)}M</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Market Sentiment:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  marketSentiment === 'bullish' ? 'bg-green-100 text-green-700' :
                  marketSentiment === 'bearish' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {marketSentiment.toUpperCase()}
                </span>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                AI analyzing real-time market conditions...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fetching live data for {stock.symbol}
              </p>
            </div>
          ) : recommendation ? (
            <div>
              <div className="bg-primary/5 rounded-lg p-4 mb-4">
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
                  
                  <div className="bg-primary/10 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>{recommendation.confidence.toUpperCase()} confidence</span>
                  </div>
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
              
              <div className="text-sm mb-4">
                <div className="font-medium mb-1">AI Reasoning:</div>
                <p className="text-muted-foreground">{recommendation.reasoning}</p>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="quantity">Quantity (contracts)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1"
                />
                <div className="text-xs text-muted-foreground mt-1">
                  You can afford up to {maxContracts} contracts
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>Estimated Cost:</span>
                <span className="font-bold">{formatCurrency(estimatedCost)}</span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span>Available Cash:</span>
                <span>{formatCurrency(portfolio.cash)}</span>
              </div>
              
              {!canAfford && (
                <div className="text-red-500 text-sm mt-2">
                  You don't have enough cash for this purchase.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              Unable to generate recommendation. Please try again.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isLoading && recommendation && (
            <Button 
              onClick={handleTrade} 
              disabled={
                isSubmitting || 
                !quantity || 
                parseInt(quantity) <= 0 || 
                !canAfford
              }
              className="flex gap-1 items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Execute AI Trade
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AITradeModal;
