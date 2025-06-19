import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain, X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImprovedSphereAI from './ImprovedSphereAI';

interface FloatingSphereAIProps {
  className?: string;
}

const FloatingSphereAI: React.FC<FloatingSphereAIProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(true);
    setIsExpanded(false);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <>
      {/* Floating Button */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        className
      )}>
        {!isExpanded && (
          <Button
            onClick={handleToggle}
            className={cn(
              "rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "border-2 border-white/20 backdrop-blur-sm",
              isMinimized ? "h-12 w-12" : "h-14 w-14"
            )}
            size="icon"
          >
            <Brain className={cn(
              "text-white transition-all duration-300",
              isMinimized ? "h-5 w-5" : "h-6 w-6"
            )} />
          </Button>
        )}
      </div>

      {/* Expanded AI Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsExpanded(false)}
          />
          
          {/* AI Panel */}
          <div className="relative bg-background border border-border rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimize}
                  className="h-8 w-8 p-0"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            <div className="overflow-auto max-h-[calc(80vh-80px)]">
              <ImprovedSphereAI isFloating={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSphereAI;