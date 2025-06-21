import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import ReactPlayer from 'react-player';

interface LinkPreviewProps {
  url: string;
}

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const isVideo = ReactPlayer.canPlay(url);
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  
  if (isVideo) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden border">
        <ReactPlayer
          url={url}
          width="100%"
          height="200px"
          controls
          light
        />
      </div>
    );
  }
  
  if (isImage) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden border">
        <img 
          src={url} 
          alt="Shared content" 
          className="w-full h-48 object-cover"
        />
      </div>
    );
  }
  
  return (
    <div className="mt-3 p-3 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LinkIcon className="h-4 w-4" />
        <span className="truncate">{url}</span>
      </div>
    </div>
  );
};

export default LinkPreview;