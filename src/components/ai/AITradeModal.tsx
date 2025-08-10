
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
    const historicalData = await stockDataService.getHistoricalPrices(symbol, 30);

    // Compute average volume and simple volatility from historical data
    let avgVolume = 0;
    let volPercent = 5; // fallback percent
    if (Array.isArray(historicalData) && historicalData.length > 1) {
      avgVolume = historicalData.reduce((sum, d) => sum + (Number(d.volume) || 0), 0) / historicalData.length;
      const returns: number[] = [];
      for (let i = 1; i < historicalData.length; i++) {
        const prev = Number(historicalData[i - 1].close) || 0;
        const curr = Number(historicalData[i].close) || 0;
        if (prev > 0 && curr > 0) {
          const r = Math.log(curr / prev);
          if (Number.isFinite(r)) returns.push(r);
        }
      }
      if (returns.length > 1) {
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (returns.length - 1);
        const stdev = Math.sqrt(variance);
        volPercent = Math.max(2, Math.min(100, stdev * Math.sqrt(252) * 100)); // annualized %
      }
    }

    // Determine market sentiment based on price action and volume spike
    const changePct = Number(quote?.changePercent ?? 0);
    const isVolumeSpike = avgVolume > 0 ? Number(quote?.volume || 0) > avgVolume * 1.2 : false;
    const sentiment = changePct > 1.5 ? 'bullish' : changePct < -1.5 ? 'bearish' : 'neutral';
    setMarketSentiment(sentiment);

    // Generate expiry date (next Friday)
    const nextFriday = new Date();
    const daysUntilFriday = ((5 - nextFriday.getDay() + 7) % 7) || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

    // Calculate strike price based on current price and sentiment
    const currentPrice = Number(quote?.price ?? 0);
    let strikePrice: number;
    let optionType: 'call' | 'put';
    let confidence: 'low' | 'medium' | 'high';
    let reasoning: string;

    if (sentiment === 'bullish' && isVolumeSpike) {
      optionType = 'call';
      strikePrice = currentPrice * (riskTolerance === 'high' ? 1.06 : riskTolerance === 'medium' ? 1.03 : 1.01);
      confidence = volPercent > 25 ? 'high' : 'medium';
      reasoning = `Bullish momentum ${changePct.toFixed(2)}% with volume spike ${(quote.volume / 1_000_000).toFixed(1)}M vs avg ${(avgVolume / 1_000_000).toFixed(1)}M.`;
    } else if (sentiment === 'bearish' && isVolumeSpike) {
      optionType = 'put';
      strikePrice = currentPrice * (riskTolerance === 'high' ? 0.94 : riskTolerance === 'medium' ? 0.97 : 0.99);
      confidence = volPercent > 25 ? 'high' : 'medium';
      reasoning = `Bearish pressure ${Math.abs(changePct).toFixed(2)}% with elevated volume ${(quote.volume / 1_000_000).toFixed(1)}M vs avg ${(avgVolume / 1_000_000).toFixed(1)}M.`;
    } else {
      // Neutral/conservative approach using previous close as bias
      optionType = currentPrice >= Number(quote?.previousClose ?? currentPrice) ? 'call' : 'put';
      strikePrice = currentPrice * (optionType === 'call' ? 1.01 : 0.99);
      confidence = 'low';
      reasoning = `Mixed signals, leaning ${optionType} with modest moneyness given ${changePct.toFixed(2)}% move.`;
    }

    // Round strike to whole dollar
    strikePrice = Math.max(1, Math.round(strikePrice));

    // Helper: basic ETF detector (common liquid ETFs)
    const isEtfSymbol = (s: string): boolean => {
      const upper = s.toUpperCase();
      const known = new Set(['SPY','QQQ','DIA','IWM','VTI','VOO','GLD','SLV','XLF','XLK','XLE','XLY','XLI','XLP','XLU','XLV','XLB','XLC','SMH','SOXL','TQQQ','SQQQ','UVXY','VXX']);
      return stock?.isEtf === true || known.has(upper);
    };

    // Try to fetch real option prices for nearest strike/type with correct expiry policy
    let selectedPremium = 0;
    let selectedStrike = strikePrice;
    let selectedExpiry = nextFriday;
    let selectedSymbolLabel = `${symbol} ${nextFriday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${strikePrice}${optionType.charAt(0).toUpperCase()}`;
    try {
      const expirations = await stockDataService.getOptionsExpirations(symbol);
      let targetExpiry: string | undefined = undefined;
      if (Array.isArray(expirations) && expirations.length > 0) {
        if (isEtfSymbol(symbol)) {
          // ETFs: pick earliest available (daily expiries preferred)
          targetExpiry = expirations[0].date;
        } else {
          // Stocks: pick nearest Friday; fallback to earliest
          const friday = expirations.find(e => new Date(e.date).getDay() === 5);
          targetExpiry = (friday?.date) || expirations[0].date;
        }
      }

      if (targetExpiry) {
        const chain = await stockDataService.getOptionsChain(symbol, targetExpiry, 60);
        const list = optionType === 'call' ? (chain?.calls || []) : (chain?.puts || []);
        if (Array.isArray(list) && list.length > 0) {
          // Pick contract nearest to desired strike; break ties by higher volume
          const sorted = [...list].sort((a: any, b: any) => {
            const da = Math.abs(Number(a.strike) - strikePrice);
            const db = Math.abs(Number(b.strike) - strikePrice);
            if (da === db) return (Number(b.volume) || 0) - (Number(a.volume) || 0);
            return da - db;
          });
          const best = sorted[0];
          if (best) {
            const bid = Number(best.bid ?? 0);
            const ask = Number(best.ask ?? 0);
            const mid = (bid > 0 && ask > 0) ? (bid + ask) / 2 : Math.max(bid, ask);
            if (mid > 0) selectedPremium = Number(mid.toFixed(2));
            selectedStrike = Number(best.strike ?? strikePrice) || strikePrice;
            // Parse YYYY-MM-DD as local noon to avoid timezone shifting to previous day
            const expStr = String(best.expiration || targetExpiry);
            const [yy, mm, dd] = expStr.split('-').map((v) => Number(v));
            selectedExpiry = new Date(yy, (mm || 1) - 1, dd || 1, 12, 0, 0, 0);
            selectedSymbolLabel = String(best.contractSymbol || selectedSymbolLabel);
          }
        }
      }
    } catch (e) {
      // Fallback to model-based premium if live chain lookup fails
    }

    if (selectedPremium <= 0) {
      // Calculate premium based on volatility and time to expiry as fallback
      const timeValue = Math.max(0.2, daysUntilFriday / 7);
      const intrinsicValue = optionType === 'call' ?
        Math.max(0, currentPrice - strikePrice) :
        Math.max(0, strikePrice - currentPrice);
      selectedPremium = Number((intrinsicValue + (volPercent / 100) * currentPrice * timeValue * 0.08).toFixed(2));
    }

    return {
      symbol,
      confidence,
      optionContract: {
        id: `${symbol}_${Date.now()}`,
        stockId: symbol,
        symbol: selectedSymbolLabel,
        type: optionType,
        strikePrice: selectedStrike,
        expiryDate: selectedExpiry,
        premium: Math.max(0.05, selectedPremium)
      },
      reasoning
    };
  };

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);

    let unsub: null | (() => void) = null;
    let cancelled = false;

    const init = async () => {
      try {
        // Initial fetch to warm state
        const quote = await stockDataService.getStockQuote(stock.symbol);
        if (cancelled) return;
        setRealTimeQuote(quote);
        setLastUpdated(new Date());
        const risk = user?.riskTolerance ?? 'medium';
        const rec = await generateAIRecommendation(stock.symbol, risk, quote);
        if (cancelled) return;
        setRecommendation(rec);
      } catch (error) {
        console.error('Error initializing AI trade modal data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    // Subscribe to real-time quotes
    try {
      unsub = stockDataService.subscribe(stock.symbol, async (q) => {
        setRealTimeQuote(q);
        setLastUpdated(new Date());
        try {
          const risk = user?.riskTolerance ?? 'medium';
          const rec = await generateAIRecommendation(stock.symbol, risk, q);
          setRecommendation(rec);
        } catch (e) {
          console.error('Error updating AI recommendation from live quote:', e);
        }
      });
    } catch (e) {
      console.error('Failed to subscribe to live quotes for AITradeModal:', e);
    }

    return () => {
      cancelled = true;
      if (unsub) {
        try { unsub(); } catch {}
      }
    };
  }, [open, stock.symbol, user?.riskTolerance]);

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
  const maxContracts = contractCost > 0 ? Math.floor(portfolio.cash / contractCost) : 0;
  const estimatedCost = parseInt(quantity || '0') * contractCost;
  const canAfford = estimatedCost <= portfolio.cash;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xs p-2 max-h-[80vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            AI Trade Recommendation
          </DialogTitle>
          <DialogDescription>
            {stock.name} ({stock.symbol})
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
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
