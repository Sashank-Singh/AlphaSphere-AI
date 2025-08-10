import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPercentage, cn } from '@/lib/utils';
import { BrainCircuit, Newspaper, MessageSquare, TrendingUp, TrendingDown, BarChart2, Loader2, AlertCircle, Zap } from 'lucide-react';
import { useAISentiment } from '@/hooks/useUnifiedAI';
import { StockData } from '@/lib/unifiedGroqService';

interface AISentimentAnalysisProps {
  symbol: string;
  stockData: StockData;
  className?: string;
}

const AISentimentAnalysis: React.FC<AISentimentAnalysisProps> = ({ 
  symbol, 
  stockData, 
  className = "" 
}) => {
  const { sentiment, isLoading, error } = useAISentiment(symbol, stockData);

  // Helper function to convert -100 to 100 range to 0-1 range for display
  const normalizeScore = (score: number) => (score + 100) / 200;

  // Helper function to get sentiment color
  const getSentimentColor = (score: number) => {
    if (score > 20) return 'text-green-500';
    if (score < -20) return 'text-red-500';
    return 'text-yellow-500';
  };

  // Helper function to get sentiment label
  const getSentimentLabel = (score: number) => {
    if (score > 50) return 'Very Bullish';
    if (score > 20) return 'Bullish';
    if (score > -20) return 'Neutral';
    if (score > -50) return 'Bearish';
    return 'Very Bearish';
  };

  // Helper function to get trend icon
  const getTrendIcon = (score: number) => {
    if (score > 20) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (score < -20) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <BarChart2 className="h-4 w-4 text-yellow-500" />;
  };

  if (error) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-500" />
            AI Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Error loading sentiment data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-purple-500" />
          AI Sentiment Analysis
          <Zap className="h-4 w-4 text-yellow-500" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Analyzing market sentiment with AI...
              </span>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : sentiment ? (
          <>
            {/* Overall Sentiment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Overall Sentiment</span>
                  {getTrendIcon(sentiment.overall)}
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("font-medium", getSentimentColor(sentiment.overall))}
                >
                  {getSentimentLabel(sentiment.overall)}
                </Badge>
              </div>
              <Progress 
                value={normalizeScore(sentiment.overall) * 100} 
                className="h-2"
              />
              <div className="text-sm text-muted-foreground">
                {sentiment.description}
              </div>
            </div>

            {/* Individual Sentiment Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {/* News Sentiment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">News</span>
                </div>
                <Progress 
                  value={normalizeScore(sentiment.news) * 100} 
                  className="h-1.5"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(sentiment.news)}% sentiment
                </div>
              </div>

              {/* Social Sentiment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Social</span>
                </div>
                <Progress 
                  value={normalizeScore(sentiment.social) * 100} 
                  className="h-1.5"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(sentiment.social)}% sentiment
                </div>
              </div>

              {/* Technical Sentiment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Technical</span>
                </div>
                <Progress 
                  value={normalizeScore(sentiment.technical) * 100} 
                  className="h-1.5"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(sentiment.technical)}% sentiment
                </div>
              </div>

              {/* Insider Sentiment */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Insider</span>
                </div>
                <Progress 
                  value={normalizeScore(sentiment.insider) * 100} 
                  className="h-1.5"
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round(sentiment.insider)}% sentiment
                </div>
              </div>
            </div>

            {/* Key Factors */}
            {sentiment.keyFactors && sentiment.keyFactors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Factors</h4>
                <div className="flex flex-wrap gap-1">
                  {sentiment.keyFactors.slice(0, 4).map((factor, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* AI Powered Badge */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Powered by Meta Llama via Groq</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live AI Analysis</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No sentiment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISentimentAnalysis;