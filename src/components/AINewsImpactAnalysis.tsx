import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Newspaper, TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface NewsItem {
  title: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
}

const mockNews = (symbol: string): NewsItem[] => [
  { title: `${symbol} beats earnings expectations`, sentiment: 'positive', source: 'Reuters' },
  { title: `${symbol} faces regulatory scrutiny`, sentiment: 'negative', source: 'Bloomberg' },
  { title: `${symbol} launches new product line`, sentiment: 'positive', source: 'CNBC' },
  { title: `${symbol} stock stable amid market volatility`, sentiment: 'neutral', source: 'Yahoo Finance' },
];

const calcSentimentScore = (news: NewsItem[]) => {
  let score = 0;
  news.forEach(n => {
    if (n.sentiment === 'positive') score += 1;
    if (n.sentiment === 'negative') score -= 1;
  });
  return Math.max(0, Math.min(1, 0.5 + score * 0.15));
};

const AINewsImpactAnalysis: React.FC<Props> = ({ symbol, stock, className }) => {
  const [news, setNews] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setNews(mockNews(symbol));
    }, 900);
  }, [symbol]);

  if (!news) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-yellow-400" />
            AI News Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing news for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  const sentimentScore = calcSentimentScore(news);
  const sentimentLabel = sentimentScore > 0.6 ? 'Positive' : sentimentScore < 0.4 ? 'Negative' : 'Neutral';
  const sentimentColor = sentimentScore > 0.6 ? 'text-green-500' : sentimentScore < 0.4 ? 'text-red-500' : 'text-yellow-500';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-yellow-400" />
          AI News Impact Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">News Sentiment:</span> <span className={sentimentColor}>{sentimentLabel}</span>
        </div>
        <ul className="text-xs space-y-1">
          {news.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {item.sentiment === 'positive' ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                item.sentiment === 'negative' ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                <span className="h-3 w-3 rounded-full bg-yellow-400 inline-block" />}
              <span className="font-medium">{item.title}</span>
              <span className="text-muted-foreground ml-auto">({item.source})</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default AINewsImpactAnalysis; 