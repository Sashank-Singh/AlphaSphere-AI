import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Hash, DollarSign } from 'lucide-react';

interface TrendingTopic {
  id: string;
  tag: string;
  type: 'hashtag' | 'cashtag';
  posts: number;
  change: number; // percentage change
  trending: boolean;
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onTopicClick?: (topic: TrendingTopic) => void;
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ topics, onTopicClick }) => {
  const formatPostCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending
        </CardTitle>
        <CardDescription>Popular trading topics right now</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topics.map((topic, index) => (
            <div 
              key={topic.id} 
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
              onClick={() => onTopicClick?.(topic)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {topic.trending && (
                    <TrendingUp className="h-3 w-3 text-primary" />
                  )}
                  {topic.type === 'hashtag' ? (
                    <Hash className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <DollarSign className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm group-hover:text-primary transition-colors">
                      {topic.type === 'hashtag' ? '#' : '$'}{topic.tag}
                    </span>
                    {topic.trending && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        Hot
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatPostCount(topic.posts)} posts
                    </span>
                    {topic.change !== 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className={`text-xs font-medium ${
                          topic.change > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {topic.change > 0 ? '+' : ''}{topic.change}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          View All Topics
        </Button>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;