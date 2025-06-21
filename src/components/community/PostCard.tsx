import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import LinkPreview from './LinkPreview';


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

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onComment: () => void;
  onShare: (postId: string) => void;
}

// Regex to detect URLs in post content
const urlRegex = /https?:\/\/[^\s]+/g;



const PostCard: React.FC<PostCardProps> = ({ post, onLike, onBookmark, onComment, onShare }) => {
  return (
    <Card className="overflow-hidden">
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
                  {post.timestamp}
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
                className={`flex items-center gap-1 hover:text-primary transition-colors ${
                  post.liked ? 'text-primary' : ''
                }`}
                onClick={() => onLike(post.id)}
              >
                <ThumbsUp className="h-4 w-4" />
                {post.likes}
              </button>
              <button
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={onComment}
              >
                <MessageSquare className="h-4 w-4" />
                {post.comments}
              </button>
              <button 
                className="flex items-center gap-1 hover:text-primary transition-colors"
                onClick={() => onShare(post.id)}
              >
                <Share2 className="h-4 w-4" />
                {post.shares}
              </button>
              <button
                className={`flex items-center gap-1 hover:text-primary transition-colors ${
                  post.bookmarked ? 'text-primary' : ''
                }`}
                onClick={() => onBookmark(post.id)}
              >
                <Bookmark className="h-4 w-4" />
                {post.bookmarks}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;