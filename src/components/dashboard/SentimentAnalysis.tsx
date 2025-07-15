import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react';

interface SentimentItem {
  id: string;
  symbol: string;
  name: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  confidence: number;
  newsCount: number;
  priceImpact: string;
  timeAgo: string;
  description: string;
}

const SentimentAnalysis: React.FC = memo(() => {
  const [sentimentData, setSentimentData] = useState<SentimentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const generateMockData = useCallback(() => {
    const mockSentimentData: SentimentItem[] = [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sentiment: 'bullish',
        sentimentScore: 0.75,
        confidence: 85,
        newsCount: 24,
        priceImpact: '+2.3%',
        timeAgo: '2 hours ago',
        description: 'Strong earnings report and positive analyst coverage driving bullish sentiment'
      },
      {
        id: '2',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        sentiment: 'bearish',
        sentimentScore: -0.45,
        confidence: 78,
        newsCount: 18,
        priceImpact: '-1.8%',
        timeAgo: '4 hours ago',
        description: 'Production concerns and delivery challenges creating negative market sentiment'
      },
      {
        id: '3',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        sentiment: 'bullish',
        sentimentScore: 0.62,
        confidence: 92,
        newsCount: 15,
        priceImpact: '+1.5%',
        timeAgo: '6 hours ago',
        description: 'Cloud growth and AI initiatives receiving positive market reception'
      },
      {
        id: '4',
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        sentiment: 'neutral',
        sentimentScore: 0.12,
        confidence: 67,
        newsCount: 12,
        priceImpact: '+0.3%',
        timeAgo: '8 hours ago',
        description: 'Mixed signals from AI announcements and regulatory concerns'
      }
    ];

    setSentimentData(mockSentimentData);
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 1000);
  }, [generateMockData]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'neutral': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'default';
      case 'bearish': return 'destructive';
      case 'neutral': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  const refreshData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 800);
  }, [generateMockData]);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Sentiment Analysis
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered market sentiment analysis from news and social media
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(showAll ? sentimentData : sentimentData.slice(0, 2)).map((item) => (
              <div 
                key={item.id} 
                className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSentimentIcon(item.sentiment)}
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {item.symbol} - {item.name}
                      </h4>
                      <Badge variant={getSentimentBadgeVariant(item.sentiment)} className="text-xs">
                        {item.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Impact: <span className={item.priceImpact.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{item.priceImpact}</span></span>
                      <span>Confidence: {item.confidence}%</span>
                      <span>{item.newsCount} sources</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {sentimentData.length > 2 && (
              <div className="pt-2">
                <button
                  onClick={handleToggleShowAll}
                  className="w-full py-2 px-4 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {showAll ? 'Show Less' : `View More (${sentimentData.length - 2} more)`}
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

SentimentAnalysis.displayName = 'SentimentAnalysis';

export default SentimentAnalysis;