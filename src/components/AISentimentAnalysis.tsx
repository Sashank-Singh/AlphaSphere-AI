
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPercentage, cn } from '@/lib/utils';
import { BrainCircuit, Newspaper, MessageSquare, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { Stock } from '@/types';
import { stockDataService } from '@/lib/stockDataService';
import { StockQuote } from '@/lib/mockStockService';

interface AISentimentAnalysisProps {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface SentimentData {
  overall: number;
  news: number;
  social: number;
  insider: number;
  technical: number;
  sources: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  timestamp: Date;
}

const AISentimentAnalysis: React.FC<AISentimentAnalysisProps> = ({ symbol, stock, className }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStock, setCurrentStock] = useState<StockQuote | null>(null);

  useEffect(() => {
    const fetchSentimentData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch real-time stock data
        const stockData = await stockDataService.getStockQuote(symbol);
        setCurrentStock(stockData);
        
        // Generate sentiment based on real stock data
        const changeBasedBias = stockData.change ? (stockData.change > 0 ? 0.15 : -0.15) : 0;
        const baseValue = 0.5 + changeBasedBias;
        
        const sentimentData: SentimentData = {
          overall: clamp(baseValue + (Math.random() * 0.3 - 0.15), 0, 1),
          news: clamp(baseValue + (Math.random() * 0.4 - 0.2), 0, 1),
          social: clamp(baseValue + (Math.random() * 0.5 - 0.25), 0, 1),
          insider: clamp(baseValue + (Math.random() * 0.3 - 0.15), 0, 1),
          technical: clamp(baseValue + (Math.random() * 0.2 - 0.1), 0, 1),
          sources: {
            positive: [
              `${symbol} shows strong price momentum`,
              'Positive technical indicators detected',
              'Volume analysis suggests bullish sentiment'
            ],
            negative: [
              'Market volatility concerns',
              'Sector-wide pressure observed',
              'Technical resistance levels identified'
            ],
            neutral: [
              'Mixed signals from market indicators',
              'Awaiting key economic data releases',
              'Consolidation phase in progress'
            ]
          },
          timestamp: new Date()
        };
        
        setSentimentData(sentimentData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
        setIsLoading(false);
      }
    };

    fetchSentimentData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSentimentData, 300000);
    
    return () => clearInterval(interval);
  }, [symbol, stock]);

  // Helper function to clamp value between min and max
  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  // Helper function to determine sentiment label and color
  const getSentimentInfo = (score: number) => {
    if (score >= 0.65) return { label: 'Bullish', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (score >= 0.55) return { label: 'Somewhat Bullish', color: 'text-green-400', bgColor: 'bg-green-400' };
    if (score >= 0.45) return { label: 'Neutral', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    if (score >= 0.35) return { label: 'Somewhat Bearish', color: 'text-orange-500', bgColor: 'bg-orange-500' };
    return { label: 'Bearish', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Sentiment Analysis
          </CardTitle>
          {!isLoading && sentimentData && (
            <Badge 
              variant="outline" 
              className={cn(
                "ml-2",
                getSentimentInfo(sentimentData.overall).color
              )}
            >
              {getSentimentInfo(sentimentData.overall).label}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : sentimentData ? (
          <>
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="sources" className="flex-1">Sources</TabsTrigger>
                <TabsTrigger value="trends" className="flex-1">Trends</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Overall Sentiment</span>
                    <span className={getSentimentInfo(sentimentData.overall).color}>
                      {formatPercentage(sentimentData.overall)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full", getSentimentInfo(sentimentData.overall).bgColor)}
                      style={{ width: `${sentimentData.overall * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Newspaper className="h-3 w-3 mr-1" /> 
                        News
                      </span>
                      <span>{formatPercentage(sentimentData.news)}</span>
                    </div>
                    <Progress value={sentimentData.news * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" /> 
                        Social
                      </span>
                      <span>{formatPercentage(sentimentData.social)}</span>
                    </div>
                    <Progress value={sentimentData.social * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <BarChart2 className="h-3 w-3 mr-1" /> 
                        Insider
                      </span>
                      <span>{formatPercentage(sentimentData.insider)}</span>
                    </div>
                    <Progress value={sentimentData.insider * 100} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" /> 
                        Technical
                      </span>
                      <span>{formatPercentage(sentimentData.technical)}</span>
                    </div>
                    <Progress value={sentimentData.technical * 100} className="h-1" />
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Last updated: {sentimentData.timestamp.toLocaleTimeString()}
                </div>
              </TabsContent>
              
              <TabsContent value="sources" className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Positive Indicators</h4>
                  <ul className="space-y-1">
                    {sentimentData.sources.positive.map((source, index) => (
                      <li key={`pos-${index}`} className="text-sm flex items-center">
                        <TrendingUp className="h-3 w-3 text-green-500 mr-2" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Negative Indicators</h4>
                  <ul className="space-y-1">
                    {sentimentData.sources.negative.map((source, index) => (
                      <li key={`neg-${index}`} className="text-sm flex items-center">
                        <TrendingDown className="h-3 w-3 text-red-500 mr-2" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">Neutral Factors</h4>
                  <ul className="space-y-1">
                    {sentimentData.sources.neutral.map((source, index) => (
                      <li key={`neu-${index}`} className="text-sm flex items-center">
                        <div className="h-3 w-3 bg-yellow-500/30 rounded-full mr-2" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="pt-2">
                <div className="text-sm">
                  <p>Sentiment trend analysis shows a {sentimentData.overall >= 0.5 ? 'positive' : 'negative'} shift over the last trading week.</p>
                  <p className="mt-2">Key observations:</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    <li>• Social media sentiment has {sentimentData.social >= 0.6 ? 'strengthened' : 'weakened'} recently</li>
                    <li>• News coverage is primarily {sentimentData.news >= 0.6 ? 'positive' : sentimentData.news >= 0.4 ? 'neutral' : 'negative'}</li>
                    <li>• Technical indicators suggest {sentimentData.technical >= 0.5 ? 'bullish' : 'bearish'} momentum</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">Unable to load sentiment data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISentimentAnalysis;
