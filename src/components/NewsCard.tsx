import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NewsItem } from '@/types';
import { ExternalLink } from 'lucide-react';

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
    <Card className="group overflow-hidden transition-all duration-300 cursor-pointer border-transparent hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:translate-y-[-2px]">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {news.imageUrl && (
            <div className="relative flex-shrink-0 overflow-hidden">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-24 h-24 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-base line-clamp-2 group-hover:text-primary transition-colors duration-300">
                {news.title}
              </h3>
              <ExternalLink className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-1" />
            </div>
            
            <div className="mt-2 flex items-center flex-wrap gap-2 text-xs">
              <span className="font-medium px-2 py-0.5 bg-primary/5 rounded-full">
                {news.source}
              </span>
              <span className="text-muted-foreground">
                {timeAgo(news.timestamp)}
              </span>
            </div>
            
            {news.symbols && news.symbols.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {news.symbols.map(symbol => (
                  <span
                    key={symbol}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                  >
                    {symbol}
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
