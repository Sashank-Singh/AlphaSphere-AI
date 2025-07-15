import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="[perspective:1000px] w-full h-40"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <div className="absolute w-full h-full [backface-visibility:hidden] rounded-lg border border-gray-700 bg-gray-900 p-4 flex items-center justify-center text-center">
          <p className="text-lg font-semibold text-white">{front}</p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg border border-blue-500 bg-gray-800 p-4 flex items-center justify-center text-center">
          <p className="text-base text-blue-200">{back}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 