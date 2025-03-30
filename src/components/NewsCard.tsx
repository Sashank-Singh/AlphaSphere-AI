
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NewsItem } from '@/types';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}y ago`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}mo ago`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}d ago`;
    
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}h ago`;
    
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}m ago`;
    
    return `${Math.floor(seconds)}s ago`;
  };
  
  return (
    <Card className="overflow-hidden mb-4 hover:bg-accent/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-3">
          {news.imageUrl && (
            <div className="flex-shrink-0">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium text-sm mb-1 line-clamp-2">{news.title}</h3>
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{news.source}</span>
              <span>{timeAgo(news.timestamp)}</span>
            </div>
            
            {news.tickers && news.tickers.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {news.tickers.map(ticker => (
                  <span 
                    key={ticker} 
                    className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded"
                  >
                    {ticker}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
