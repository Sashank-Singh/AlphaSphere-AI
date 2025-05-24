import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, ThumbsUp, Share2, Users, TrendingUp, Image as ImageIcon, Link2, Bookmark, MoreHorizontal, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactPlayer from 'react-player';

interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
    handle: string;
    verified?: boolean;
  };
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  shares: number;
  bookmarks: number;
  time: Date;
  tags: string[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface Comment {
  id: number;
  user: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  likes: number;
  time: Date;
  isLiked?: boolean;
}

// Regex to detect URLs in post content
const urlRegex = /https?:\/\/[^\s]+/g;

// Component to preview links or embed playable content
const LinkPreview: React.FC<{ url: string }> = ({ url }) => {
  // Embed playable URLs (e.g., YouTube) using ReactPlayer
  if (ReactPlayer.canPlay(url)) {
    return (
      <div className="my-4">
        <ReactPlayer url={url} width="100%" height="200px" className="rounded-lg" />
      </div>
    );
  }
  // Fallback to simple link card with domain and URL
  let hostname = url;
  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    // ignore invalid URL, use raw link
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-3 mb-4 hover:shadow-lg transition">
      <div className="text-sm font-medium text-primary mb-1 truncate">{hostname}</div>
      <div className="text-xs text-muted-foreground break-all">{url}</div>
    </a>
  );
};

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      user: {
        name: 'Sarah Chen',
        avatar: '/avatars/sarah.jpg',
        handle: '@sarahtrader',
        verified: true
      },
      content: 'Just closed my $AAPL position with a 15% gain! The technical setup was perfect for a swing trade. Here\'s my analysis...',
      image: '/images/trading/apple-chart.png',
      likes: 24,
      comments: [
        {
          id: 1,
          user: {
            name: 'Alex Thompson',
            avatar: '/avatars/alex.jpg',
            handle: '@alexthompson'
          },
          content: 'Great analysis! What indicators did you use?',
          likes: 5,
          time: new Date(Date.now() - 3600000)
        }
      ],
      shares: 12,
      bookmarks: 8,
      time: new Date(Date.now() - 7200000),
      tags: ['AAPL', 'SwingTrading', 'TechnicalAnalysis'],
      isLiked: false,
      isBookmarked: false
    },
    {
      id: 2,
      user: {
        name: 'Mike Johnson',
        avatar: '/avatars/mike.jpg',
        handle: '@mikej',
        verified: true
      },
      content: 'Anyone watching the semiconductor sector? $NVDA and $AMD showing strong momentum. Here\'s my sector analysis and key levels to watch.',
      likes: 18,
      comments: [],
      shares: 8,
      bookmarks: 5,
      time: new Date(Date.now() - 14400000),
      tags: ['Semiconductors', 'NVDA', 'AMD'],
      isLiked: false,
      isBookmarked: false
    }
  ]);

  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('trending');
  const [showComments, setShowComments] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');

  const topTraders = [
    {
      name: 'Alex Thompson',
      handle: '@alexthompson',
      winRate: '78%',
      followers: '2.4k',
      performance: '+32.5%',
      verified: true
    },
    {
      name: 'Lisa Wang',
      handle: '@lisawang',
      winRate: '72%',
      followers: '1.8k',
      performance: '+28.7%',
      verified: true
    },
    {
      name: 'David Miller',
      handle: '@davidmiller',
      winRate: '70%',
      followers: '1.5k',
      performance: '+25.3%',
      verified: false
    }
  ];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const newPostObj: Post = {
      id: posts.length + 1,
      user: {
        name: 'Current User',
        avatar: '/avatars/default.jpg',
        handle: '@currentuser'
      },
      content: newPost,
      image: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
      likes: 0,
      comments: [],
      shares: 0,
      bookmarks: 0,
      time: new Date(),
      tags: extractTags(newPost),
      isLiked: false,
      isBookmarked: false
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
    setSelectedImage(null);
  };

  const extractTags = (content: string): string[] => {
    const hashTags = content.match(/#\w+/g) || [];
    const cashTags = content.match(/\$[A-Z]+/g) || [];
    return [...hashTags, ...cashTags].map(tag => tag.slice(1));
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleBookmark = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          bookmarks: post.isBookmarked ? post.bookmarks - 1 : post.bookmarks + 1,
          isBookmarked: !post.isBookmarked
        };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId: number) => {
    if (!newComment.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newCommentObj: Comment = {
          id: (post.comments.length + 1),
          user: {
            name: 'Current User',
            avatar: '/avatars/default.jpg',
            handle: '@currentuser'
          },
          content: newComment,
          likes: 0,
          time: new Date(),
          isLiked: false
        };
        return {
          ...post,
          comments: [...post.comments, newCommentObj]
        };
      }
      return post;
    }));
    setNewComment('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          <Badge variant="secondary" className="text-sm">
            Beta
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Find Traders
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Post Creation */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handlePostSubmit}>
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src="/avatars/default.jpg" />
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Textarea
                      placeholder="Share your trading insights..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-upload')?.click()}>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Add Image
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                        />
                        <Button type="button" variant="outline" size="sm">
                          <Link2 className="h-4 w-4 mr-2" />
                          Add Link
                        </Button>
                      </div>
                      <Button type="submit">Post</Button>
                    </div>
                    {selectedImage && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Selected"
                          className="rounded-lg max-h-48 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setSelectedImage(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Feed Tabs */}
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
              <TabsTrigger value="latest" className="flex-1">Latest</TabsTrigger>
              <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Feed */}
          <div className="space-y-6">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{post.user.name}</span>
                          {post.user.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">{post.user.handle}</span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(post.time, { addSuffix: true })}
                          </span>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                      {/* Embed first link if present */}
                      {(() => {
                        const links = post.content.match(urlRegex) || [];
                        return links.length > 0 ? <LinkPreview url={links[0]} /> : null;
                      })()}
                      {post.image && (
                        <img
                          src={post.image}
                          alt="Post content"
                          className="rounded-lg mb-4 max-h-96 object-cover w-full"
                        />
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                            {tag.startsWith('$') ? tag : '#' + tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <button
                          className={`flex items-center gap-1 hover:text-primary ${post.isLiked ? 'text-primary' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button
                          className="flex items-center gap-1 hover:text-primary"
                          onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {post.comments.length}
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary">
                          <Share2 className="h-4 w-4" />
                          {post.shares}
                        </button>
                        <button
                          className={`flex items-center gap-1 hover:text-primary ${post.isBookmarked ? 'text-primary' : ''}`}
                          onClick={() => handleBookmark(post.id)}
                        >
                          <Bookmark className="h-4 w-4" />
                          {post.bookmarks}
                        </button>
                      </div>

                      {/* Comments Section */}
                      {showComments === post.id && (
                        <div className="mt-4 space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Write a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="flex-1"
                            />
                            <Button onClick={() => handleCommentSubmit(post.id)}>Reply</Button>
                          </div>
                          <ScrollArea className="h-[300px]">
                            {post.comments.map(comment => (
                              <div key={comment.id} className="flex gap-3 py-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={comment.user.avatar} />
                                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">{comment.user.handle}</span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(comment.time, { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                  <button
                                    className={`flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary ${
                                      comment.isLiked ? 'text-primary' : ''
                                    }`}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                    {comment.likes}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{trader.name}</span>
                          {trader.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{trader.handle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-500">{trader.performance}</div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">#AITrading</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2.5k posts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">#MarketAnalysis</span>
                  </div>
                  <span className="text-sm text-muted-foreground">1.8k posts</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">#TradingTips</span>
                  </div>
                  <span className="text-sm text-muted-foreground">1.2k posts</span>
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