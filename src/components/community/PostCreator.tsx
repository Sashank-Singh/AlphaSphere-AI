import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Image as ImageIcon, Link2, X } from 'lucide-react';

interface PostCreatorProps {
  onPostSubmit: (content: string, image?: File) => void;
  currentUser?: {
    name: string;
    avatar: string;
    handle: string;
  };
}

const PostCreator: React.FC<PostCreatorProps> = ({ 
  onPostSubmit, 
  currentUser = {
    name: 'Current User',
    avatar: '/avatars/default.jpg',
    handle: '@currentuser'
  }
}) => {
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onPostSubmit(newPost, selectedImage || undefined);
      setNewPost('');
      setSelectedImage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      setSelectedImage(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    // Reset the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const characterCount = newPost.length;
  const maxCharacters = 280;
  const isOverLimit = characterCount > maxCharacters;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Share your trading insights..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className={`min-h-[100px] resize-none ${
                    isOverLimit ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  disabled={isSubmitting}
                />
                <div className={`absolute bottom-2 right-2 text-xs ${
                  isOverLimit ? 'text-red-500' : 'text-muted-foreground'
                }`}>
                  {characterCount}/{maxCharacters}
                </div>
              </div>
              
              {selectedImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Selected"
                    className="rounded-lg max-h-48 object-cover w-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={isSubmitting}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Add Link
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newPost.trim() || isOverLimit || isSubmitting}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostCreator;