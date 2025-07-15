
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp } from 'lucide-react';
import { stockDataService, StockQuote } from '@/lib/stockDataService';

interface SentimentData {
  bullish: number;
  neutral: number;
  bearish: number;
  overall: 'bullish' | 'neutral' | 'bearish';
}

const MarketSentimentCard: React.FC = memo(() => {
  const [sentimentData, setSentimentData] = useState<SentimentData>({
    bullish: 72,
    neutral: 22,
    bearish: 6,
    overall: 'bullish'
  });
  const [loading, setLoading] = useState(true);

  const marketIndicators = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'XLF'];

  const calculateSentiment = (changePercent: number): 'bullish' | 'bearish' | 'neutral' => {
    if (changePercent > 0.5) return 'bullish';
    if (changePercent < -0.5) return 'bearish';
    return 'neutral';
  };

  const calculateOverallSentiment = (bullish: number, neutral: number, bearish: number): 'bullish' | 'neutral' | 'bearish' => {
    if (bullish > 50) return 'bullish';
    if (bearish > 30) return 'bearish';
    return 'neutral';
  };

  const fetchSentimentData = useCallback(async () => {
    try {
      setLoading(true);
      const quotes = await Promise.all(
        marketIndicators.map(async (symbol) => {
          try {
            return await stockDataService.getStockQuote(symbol);
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
          }
        })
      );

      const validQuotes = quotes.filter((quote): quote is StockQuote => quote !== null);
      
      if (validQuotes.length === 0) {
        return;
      }

      // Calculate sentiment distribution based on market indicators
      const sentiments = validQuotes.map(quote => calculateSentiment(quote.changePercent));
      const bullishCount = sentiments.filter(s => s === 'bullish').length;
      const neutralCount = sentiments.filter(s => s === 'neutral').length;
      const bearishCount = sentiments.filter(s => s === 'bearish').length;
      
      const total = sentiments.length;
      const bullishPercent = Math.round((bullishCount / total) * 100);
      const neutralPercent = Math.round((neutralCount / total) * 100);
      const bearishPercent = Math.round((bearishCount / total) * 100);
      
      // Ensure percentages add up to 100
      const totalPercent = bullishPercent + neutralPercent + bearishPercent;
      let adjustedBullish = bullishPercent;
      let adjustedNeutral = neutralPercent;
      let adjustedBearish = bearishPercent;
      
      if (totalPercent !== 100) {
        const diff = 100 - totalPercent;
        adjustedBullish += diff;
      }
      
      const newSentimentData: SentimentData = {
        bullish: Math.max(0, adjustedBullish),
        neutral: Math.max(0, adjustedNeutral),
        bearish: Math.max(0, adjustedBearish),
        overall: calculateOverallSentiment(adjustedBullish, adjustedNeutral, adjustedBearish)
      };
      
      setSentimentData(newSentimentData);
    } catch (error) {
      console.error('Error fetching sentiment data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSentimentData();
    
    // Set up refresh interval for real-time updates
    const interval = setInterval(() => {
      fetchSentimentData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchSentimentData]);

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-black border-gray-800 text-white">
      <CardHeader className="pb-1">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Market Sentiment
        </CardTitle>
        <p className="text-xs text-gray-400">
          Overall market mood and positioning
        </p>
      </CardHeader>
      <CardContent className="space-y-3 py-3">
        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-6 bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header with overall sentiment */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Market Sentiment</h3>
              <Badge variant={getSentimentBadgeVariant(sentimentData.overall)} className="flex items-center gap-1 text-xs py-0.5 px-2">
                <TrendingUp className="h-2.5 w-2.5" />
                {sentimentData.overall.charAt(0).toUpperCase() + sentimentData.overall.slice(1)}
              </Badge>
            </div>
            
            {/* Sentiment breakdown */}
            <div className="space-y-2">
              {/* Bullish */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-medium text-xs">Bullish</span>
                  <span className="text-green-400 font-bold text-sm">{sentimentData.bullish}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className="bg-green-500 h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${sentimentData.bullish}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Neutral */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium text-xs">Neutral</span>
                  <span className="text-gray-400 font-bold text-sm">{sentimentData.neutral}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className="bg-gray-500 h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${sentimentData.neutral}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Bearish */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-red-400 font-medium text-xs">Bearish</span>
                  <span className="text-red-400 font-bold text-sm">{sentimentData.bearish}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div 
                    className="bg-red-500 h-1 rounded-full transition-all duration-500" 
                    style={{ width: `${sentimentData.bearish}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});

MarketSentimentCard.displayName = 'MarketSentimentCard';

export default MarketSentimentCard;
