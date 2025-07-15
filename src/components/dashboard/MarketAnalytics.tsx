
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, ExternalLink } from 'lucide-react';
import SectorHeatmapCard from '@/components/SectorHeatmapCard';

interface NewsItem {
  title: string;
  description: string;
  timeAgo: string;
  link: string;
}

const MarketAnalytics: React.FC = memo(() => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/yahoo/news?limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const newsData = await response.json();
        setNews(newsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load market news');
        // Fallback to static content if API fails
        setNews([
          {
            title: 'Fed Maintains Interest Rates',
            description: 'Markets react positively to stable monetary policy...',
            timeAgo: '2 hours ago',
            link: ''
          },
          {
            title: 'Tech Earnings Beat Expectations',
            description: 'Major tech companies report strong quarterly results...',
            timeAgo: '4 hours ago',
            link: ''
          },
          {
            title: 'Oil Prices Surge on Supply Concerns',
            description: 'Energy sector sees significant gains amid geopolitical tensions...',
            timeAgo: '6 hours ago',
            link: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const truncateDescription = useCallback((description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Market Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectorHeatmapCard />
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Market News</CardTitle>
            <p className="text-sm text-muted-foreground">
              {error ? 'Latest market updates (fallback)' : 'Latest market updates from Yahoo Finance'}
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
                {(showAll ? news : news.slice(0, 3)).map((item, index) => (
                  <div 
                    key={index} 
                    className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {truncateDescription(item.description)}
                        </p>
                        <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                      </div>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                          title="Read full article"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {news.length > 3 && (
                  <div className="pt-2">
                    <button
                      onClick={handleToggleShowAll}
                      className="w-full py-2 px-4 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {showAll ? 'Show Less' : `View More (${news.length - 3} more)`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

MarketAnalytics.displayName = 'MarketAnalytics';

export default MarketAnalytics;
