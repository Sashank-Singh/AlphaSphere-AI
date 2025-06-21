import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import PostCreator from '@/components/community/PostCreator';
import PostCard from '@/components/community/PostCard';
import CommentSection from '@/components/community/CommentSection';
import TopTraders from '@/components/community/TopTraders';
import TrendingTopics from '@/components/community/TrendingTopics';
import FeedTabs from '@/components/community/FeedTabs';

interface Post {
  id: string;
  user: {
    name?: string;
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

interface Comment {
  id: string;
  user: {
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
}

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

interface TrendingTopic {
  id: string;
  tag: string;
  type: 'hashtag' | 'cashtag';
  posts: number;
  change: number;
  trending: boolean;
}



// Sample data
const samplePosts: Post[] = [
  {
    id: '1',
    user: {
      name: 'Alex Chen',
      handle: '@alextrader',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    content: 'Just closed a massive position on $TSLA. The technical analysis was spot on! 📈 Here\'s my breakdown of why I think we\'re heading for a major breakout. #TechnicalAnalysis #TSLA',
    timestamp: '2h',
    likes: 24,
    comments: 8,
    shares: 3,
    bookmarks: 12,
    tags: ['TechnicalAnalysis', 'TSLA'],
    image: '/api/placeholder/500/300',
    liked: false,
    bookmarked: true
  },
  {
    id: '2',
    user: {
      name: 'Sarah Williams',
      handle: '@sarahwins',
      avatar: '/api/placeholder/40/40'
    },
    content: 'Market volatility is creating some incredible opportunities right now. My watchlist is full of potential plays. What are you all watching? 👀',
    timestamp: '4h',
    likes: 15,
    comments: 12,
    shares: 2,
    bookmarks: 8,
    tags: ['MarketWatch', 'Opportunities'],
    liked: true,
    bookmarked: false
  },
  {
    id: '3',
    user: {
      name: 'Mike Rodriguez',
      handle: '@miketrading',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    content: 'New video analysis on $SPY trends. Link below 👇 https://youtube.com/watch?v=example',
    timestamp: '6h',
    likes: 31,
    comments: 5,
    shares: 7,
    bookmarks: 18,
    tags: ['SPY', 'Analysis'],
    link: 'https://youtube.com/watch?v=example',
    liked: false,
    bookmarked: false
  }
];

const topTraders: Trader[] = [
  { 
    id: '1', 
    name: 'Jordan Smith', 
    handle: '@jordanwins', 
    avatar: '/api/placeholder/32/32', 
    winRate: '87%', 
    followers: '12.5k',
    performance: '+24.5%',
    verified: true,
    isFollowing: false
  },
  { 
    id: '2', 
    name: 'Emma Davis', 
    handle: '@emmadavis', 
    avatar: '/api/placeholder/32/32', 
    winRate: '82%', 
    followers: '8.9k',
    performance: '+18.2%',
    verified: true,
    isFollowing: true
  },
  { 
    id: '3', 
    name: 'Ryan Park', 
    handle: '@ryanpark', 
    avatar: '/api/placeholder/32/32', 
    winRate: '79%', 
    followers: '15.2k',
    performance: '+15.7%',
    verified: false,
    isFollowing: false
  },
  { 
    id: '4', 
    name: 'Lisa Wong', 
    handle: '@lisawong', 
    avatar: '/api/placeholder/32/32', 
    winRate: '76%', 
    followers: '6.7k',
    performance: '+12.3%',
    verified: true,
    isFollowing: false
  }
];

const trendingTopics: TrendingTopic[] = [
  { id: '1', tag: 'TechnicalAnalysis', posts: 1247, type: 'hashtag', change: 15, trending: true },
  { id: '2', tag: 'TSLA', posts: 892, type: 'cashtag', change: 8, trending: true },
  { id: '3', tag: 'MarketWatch', posts: 634, type: 'hashtag', change: -3, trending: false },
  { id: '4', tag: 'SPY', posts: 521, type: 'cashtag', change: 12, trending: true },
  { id: '5', tag: 'Options', posts: 387, type: 'hashtag', change: 22, trending: true }
];

const CommunityPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [activeTab, setActiveTab] = useState('trending');
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState('all');

  // Handle post submission
  const handlePostSubmit = (content: string, image?: File) => {
    if (!content.trim()) return;
    
    const newPost: Post = {
      id: Date.now().toString(),
      user: {
        name: 'You',
        handle: '@you',
        avatar: '/api/placeholder/40/40'
      },
      content,
      timestamp: 'now',
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      tags: extractTags(content),
      image: image ? URL.createObjectURL(image) : undefined,
      liked: false,
      bookmarked: false
    };
    
    setPosts([newPost, ...posts]);
  };

  const extractTags = (content: string): string[] => {
    const hashTags = content.match(/#\w+/g) || [];
    const cashTags = content.match(/\$[A-Z]+/g) || [];
    return [...hashTags, ...cashTags].map(tag => tag.slice(1));
  };

  // Handle like toggle
  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    ));
  };

  // Handle bookmark toggle
  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, bookmarks: post.bookmarked ? post.bookmarks - 1 : post.bookmarks + 1, bookmarked: !post.bookmarked }
        : post
    ));
  };

  // Handle comment submission
  const handleCommentSubmit = (postId: string, content: string) => {
    if (!content.trim()) return;

    // In a real app, this would add the comment to the post
    // For now, we'll just increment the comment count
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  // Handle follow toggle for traders
  const handleFollowToggle = (traderId: string) => {
    // In a real app, this would update the follow status
    console.log('Toggle follow for trader:', traderId);
  };

  // Handle topic click
  const handleTopicClick = (topic: TrendingTopic) => {
    // In a real app, this would filter posts by the topic
    console.log('Clicked topic:', topic.tag);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // Filter posts based on current filter
  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    if (filter === 'stocks') return post.tags.some(tag => /^[A-Z]{1,5}$/.test(tag));
    if (filter === 'crypto') return post.tags.some(tag => ['BTC', 'ETH', 'DOGE'].includes(tag));
    if (filter === 'options') return post.tags.includes('Options');
    if (filter === 'analysis') return post.tags.includes('Analysis') || post.tags.includes('TechnicalAnalysis');
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post Creation */}
            <PostCreator onSubmit={handlePostSubmit} />

            {/* Feed Tabs */}
            <FeedTabs
              posts={filteredPosts}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onFilterChange={handleFilterChange}
            >
              {/* Posts Feed */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post.id}>
                    <PostCard
                      post={post}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                      onComment={() => setShowComments(prev => ({
                        ...prev,
                        [post.id]: !prev[post.id]
                      }))}
                      onShare={(postId) => console.log('Share post:', postId)}
                    />
                    
                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <CommentSection
                        postId={post.id}
                        comments={[]} // In a real app, this would come from the post data
                        newComment={newComment[post.id] || ''}
                        onCommentChange={(content) => setNewComment(prev => ({
                          ...prev,
                          [post.id]: content
                        }))}
                        onCommentSubmit={(content) => {
                          handleCommentSubmit(post.id, content);
                          setNewComment(prev => ({ ...prev, [post.id]: '' }));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </FeedTabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Traders */}
            <TopTraders
              traders={topTraders}
              onFollowToggle={handleFollowToggle}
            />

            {/* Trending Topics */}
            <TrendingTopics
              topics={trendingTopics}
              onTopicClick={handleTopicClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;