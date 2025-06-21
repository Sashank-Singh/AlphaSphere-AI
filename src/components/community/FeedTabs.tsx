import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Post {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  tags: string[];
  image?: string;
  link?: string;
  liked?: boolean;
  bookmarked?: boolean;
}

interface FeedTabsProps {
  posts: Post[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFilterChange?: (filter: string) => void;
  children: React.ReactNode;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ 
  posts, 
  activeTab, 
  onTabChange, 
  onFilterChange,
  children 
}) => {
  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'latest':
        return <Clock className="h-4 w-4" />;
      case 'following':
        return <Users className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPostCount = (tab: string) => {
    // In a real app, this would filter posts based on the tab
    switch (tab) {
      case 'trending':
        return posts.filter(post => post.likes > 10).length;
      case 'latest':
        return posts.length;
      case 'following':
        return Math.floor(posts.length * 0.6); // Simulate following posts
      default:
        return posts.length;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              {getTabIcon('trending')}
              <span>Trending</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getPostCount('trending')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="latest" className="flex items-center gap-2">
              {getTabIcon('latest')}
              <span>Latest</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getPostCount('latest')}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              {getTabIcon('following')}
              <span>Following</span>
              <Badge variant="secondary" className="ml-1 text-xs">
                {getPostCount('following')}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange?.('all')}>
              All Posts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange?.('stocks')}>
              Stocks Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange?.('crypto')}>
              Crypto Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange?.('options')}>
              Options Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange?.('analysis')}>
              Analysis
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default FeedTabs;