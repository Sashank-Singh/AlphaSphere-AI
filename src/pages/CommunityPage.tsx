import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, ThumbsUp, Share2, Users, TrendingUp } from 'lucide-react';

const CommunityPage: React.FC = () => {
  const posts = [
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        handle: '@sarahtrader'
      },
      content: 'Just closed my $AAPL position with a 15% gain! The technical setup was perfect for a swing trade.',
      likes: 24,
      comments: 8,
      time: '2h ago'
    },
    {
      id: 2,
      user: {
        name: 'Mike Johnson',
        avatar: '/avatars/mike.jpg',
        handle: '@mikej'
      },
      content: 'Anyone watching the semiconductor sector? $NVDA and $AMD showing strong momentum.',
      likes: 18,
      comments: 12,
      time: '4h ago'
    }
  ];

  const topTraders = [
    {
      name: 'Alex Thompson',
      handle: '@alexthompson',
      winRate: '78%',
      followers: '2.4k'
    },
    {
      name: 'Lisa Wang',
      handle: '@lisawang',
      winRate: '72%',
      followers: '1.8k'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Community</h1>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Find Traders
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Creation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Input
                    placeholder="Share your trading insights..."
                    className="mb-4"
                  />
                  <Button>Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feed */}
          {posts.map(post => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{post.user.name}</span>
                      <span className="text-sm text-muted-foreground">{post.user.handle}</span>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground">{post.time}</span>
                    </div>
                    <p className="mb-4">{post.content}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {/* Top Traders */}
          <Card>
            <CardHeader>
              <CardTitle>Top Traders</CardTitle>
              <CardDescription>Traders with the best performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTraders.map(trader => (
                  <div key={trader.handle} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{trader.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{trader.name}</div>
                        <div className="text-sm text-muted-foreground">{trader.handle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{trader.winRate}</div>
                      <div className="text-xs text-muted-foreground">{trader.followers} followers</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle>Trending</CardTitle>
              <CardDescription>Popular trading topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">#AITrading</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">#MarketAnalysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="font-medium">#TradingTips</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 