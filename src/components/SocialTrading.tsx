
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Share, TrendingUp, Users, Copy, Eye } from 'lucide-react';

interface Trade {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    followers: number;
    winRate: number;
  };
  action: 'buy' | 'sell';
  symbol: string;
  price: number;
  quantity: number;
  reasoning: string;
  timestamp: Date;
  likes: number;
  comments: number;
  performance: number;
}

interface Trader {
  id: string;
  name: string;
  avatar?: string;
  followers: number;
  following: number;
  winRate: number;
  totalReturn: number;
  specialties: string[];
  verified: boolean;
}

const SocialTrading: React.FC = () => {
  const [trades] = useState<Trade[]>([
    {
      id: '1',
      user: {
        name: 'Alex Chen',
        verified: true,
        followers: 12500,
        winRate: 78
      },
      action: 'buy',
      symbol: 'NVDA',
      price: 875.50,
      quantity: 50,
      reasoning: 'AI boom continues, strong Q4 guidance expected. Technical breakout above $870 resistance.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 234,
      comments: 45,
      performance: 12.5
    },
    {
      id: '2',
      user: {
        name: 'Sarah Kim',
        verified: false,
        followers: 3200,
        winRate: 65
      },
      action: 'sell',
      symbol: 'TSLA',
      price: 248.75,
      quantity: 25,
      reasoning: 'Taking profits after 15% run. RSI showing overbought conditions.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 89,
      comments: 12,
      performance: -2.3
    }
  ]);

  const [topTraders] = useState<Trader[]>([
    {
      id: '1',
      name: 'Warren Alpha',
      followers: 45000,
      following: 12,
      winRate: 85,
      totalReturn: 145.8,
      specialties: ['Value Investing', 'Blue Chips'],
      verified: true
    },
    {
      id: '2',
      name: 'TechGuru2024',
      followers: 23000,
      following: 89,
      winRate: 72,
      totalReturn: 89.2,
      specialties: ['Tech Stocks', 'Growth'],
      verified: true
    }
  ]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Social Trading
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Live Feed</TabsTrigger>
            <TabsTrigger value="traders">Top Traders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="feed" className="space-y-4 mt-4">
            {trades.map((trade) => (
              <div key={trade.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{trade.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trade.user.name}</span>
                      {trade.user.verified && (
                        <Badge variant="secondary" className="text-xs">✓</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trade.user.followers.toLocaleString()} followers • {trade.user.winRate}% win rate
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(trade.timestamp)}
                  </span>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={trade.action === 'buy' ? 'default' : 'destructive'}>
                      {trade.action.toUpperCase()}
                    </Badge>
                    <span className="font-bold">{trade.symbol}</span>
                    <span className="text-sm">
                      {trade.quantity} shares @ ${trade.price.toFixed(2)}
                    </span>
                    <div className="ml-auto flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className={`text-xs font-semibold ${trade.performance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {trade.performance >= 0 ? '+' : ''}{trade.performance.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{trade.reasoning}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Heart className="h-4 w-4" />
                      {trade.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {trade.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Copy className="h-3 w-3" />
                    Copy Trade
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="traders" className="space-y-3 mt-4">
            {topTraders.map((trader) => (
              <div key={trader.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{trader.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{trader.name}</span>
                      {trader.verified && (
                        <Badge variant="secondary" className="text-xs">✓</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {trader.followers.toLocaleString()} followers • {trader.following} following
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Follow
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center mb-3">
                  <div>
                    <div className="text-sm font-semibold text-green-500">
                      +{trader.totalReturn.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Total Return</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{trader.winRate}%</div>
                    <div className="text-xs text-muted-foreground">Win Rate</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{trader.followers.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Followers</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {trader.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SocialTrading;
