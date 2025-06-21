import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  winRate: string;
  followers: string;
  performance: string;
  verified: boolean;
  isFollowing?: boolean;
}

interface TopTradersProps {
  traders: Trader[];
  onFollowToggle?: (traderId: string) => void;
}

const TopTraders: React.FC<TopTradersProps> = ({ traders, onFollowToggle }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Top Traders
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </CardTitle>
        <CardDescription>Traders with the best performance this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {traders.map((trader, index) => (
            <div key={trader.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={trader.avatar} />
                    <AvatarFallback>{trader.name[0]}</AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm truncate">{trader.name}</span>
                    {trader.verified && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{trader.handle}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">Win Rate: {trader.winRate}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{trader.followers}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    trader.performance.startsWith('+') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {trader.performance}
                  </div>
                </div>
                <Button
                  variant={trader.isFollowing ? "secondary" : "outline"}
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onFollowToggle?.(trader.id)}
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          View All Traders
        </Button>
      </CardContent>
    </Card>
  );
};

export default TopTraders;