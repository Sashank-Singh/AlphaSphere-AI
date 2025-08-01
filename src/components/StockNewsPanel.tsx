import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
}

interface StockNewsPanelProps {
  symbol: string;
  className?: string;
}

const StockNewsPanel: React.FC<StockNewsPanelProps> = ({ symbol, className = "" }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock news data - in a real app, this would come from a news API
    const mockNews: NewsItem[] = [
      {
        id: '1',
        title: 'Tech Giant Unveils New AI Features for Its Flagship Phone',
        summary: 'The company announced a suite of new AI-powered capabilities coming to its ecosystem, aiming to enhance user experience and productivity.',
        source: 'Reuters',
        publishedAt: '2 hours ago',
        url: '#',
        sentiment: 'positive',
        impact: 'high'
      },
      {
        id: '2',
        title: `Analysts Bullish on ${symbol} Ahead of Quarterly Earnings Report`,
        summary: 'Wall Street sentiment remains high as the tech leader is expected to post strong results, driven by robust sales in its services division.',
        source: 'Bloomberg',
        publishedAt: '5 hours ago',
        url: '#',
        sentiment: 'positive',
        impact: 'medium'
      },
      {
        id: '3',
        title: 'Inside the Company\'s Push into Augmented Reality',
        summary: 'A deep dive into the long-term strategy and development of the company\'s much-anticipated AR headset and its potential market impact.',
        source: 'The Wall Street Journal',
        publishedAt: '1 day ago',
        url: '#',
        sentiment: 'neutral',
        impact: 'medium'
      },
      {
        id: '4',
        title: 'Market Analysts Predict Strong Q4 Performance',
        summary: 'Leading financial analysts are forecasting above-average performance for the upcoming quarter based on recent market trends and company fundamentals.',
        source: 'CNBC',
        publishedAt: '1 day ago',
        url: '#',
        sentiment: 'positive',
        impact: 'high'
      },
      {
        id: '5',
        title: 'Regulatory Concerns Surface Over Data Privacy Practices',
        summary: 'Recent regulatory scrutiny has raised questions about the company\'s data handling practices, potentially impacting future growth prospects.',
        source: 'Financial Times',
        publishedAt: '2 days ago',
        url: '#',
        sentiment: 'negative',
        impact: 'medium'
      },
      {
        id: '6',
        title: 'Partnership Announcement Expected to Boost Revenue',
        summary: 'A strategic partnership with a major technology firm is expected to significantly enhance the company\'s market position and revenue streams.',
        source: 'MarketWatch',
        publishedAt: '3 days ago',
        url: '#',
        sentiment: 'positive',
        impact: 'high'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);
  }, [symbol]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-[#4CAF50]" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-[#f44336]" />;
      default:
        return <div className="h-4 w-4 bg-[#FFC107] rounded-full"></div>;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-[#f44336] text-white';
      case 'medium':
        return 'bg-[#FFC107] text-black';
      case 'low':
        return 'bg-[#4CAF50] text-white';
      default:
        return 'bg-[#9CA3AF] text-white';
    }
  };

  const formatTimeAgo = (timeAgo: string) => {
    return timeAgo;
  };

  if (loading) {
    return (
      <div className={`bg-[#1E1E1E] p-6 rounded-2xl shadow-lg ${className}`}>
        <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4">{symbol} News</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-[#333333] rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-[#333333] rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-[#333333] rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1E1E1E] p-6 rounded-2xl shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#E0E0E0]">{symbol} News</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#B0B0B0]">Last updated:</span>
          <span className="text-sm text-[#E0E0E0] font-medium">Just now</span>
        </div>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="p-4 rounded-lg hover:bg-[#0a0a0a]/50 transition duration-300 group">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#B0B0B0]">{item.source}</span>
                  <span className="text-xs text-[#9CA3AF]">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#9CA3AF]" />
                    <span className="text-xs text-[#9CA3AF]">{formatTimeAgo(item.publishedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getSentimentIcon(item.sentiment)}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(item.impact)}`}>
                    {item.impact.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <h4 className="font-semibold text-[#E0E0E0] mt-1 group-hover:text-[#2196F3] transition-colors">
                {item.title}
              </h4>
              
              <p className="text-sm text-[#B0B0B0] mt-1 line-clamp-2">
                {item.summary}
              </p>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#9CA3AF]">Read more</span>
                  <ExternalLink className="h-3 w-3 text-[#9CA3AF] group-hover:text-[#2196F3] transition-colors" />
                </div>
              </div>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#333333]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#4CAF50]" />
              <span className="text-sm text-[#B0B0B0]">Positive: {news.filter(n => n.sentiment === 'positive').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-[#f44336]" />
              <span className="text-sm text-[#B0B0B0]">Negative: {news.filter(n => n.sentiment === 'negative').length}</span>
            </div>
          </div>
          
          <button className="text-[#2196F3] hover:text-[#1976D2] font-semibold transition flex items-center gap-2">
            <span>View More News</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockNewsPanel; 