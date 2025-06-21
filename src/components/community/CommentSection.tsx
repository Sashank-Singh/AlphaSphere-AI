import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface CommentSectionProps {
  comments: Comment[];
  onCommentSubmit: (content: string) => void;
  onCommentLike?: (commentId: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ 
  comments, 
  onCommentSubmit, 
  onCommentLike 
}) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onCommentSubmit(newComment);
    setNewComment('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSubmit} disabled={!newComment.trim()}>
          Reply
        </Button>
      </div>
      
      {comments.length > 0 && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3 py-2">
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
                  <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  <button
                    className={`flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-primary transition-colors ${
                      comment.isLiked ? 'text-primary' : ''
                    }`}
                    onClick={() => onCommentLike?.(comment.id)}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    {comment.likes}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default CommentSection;