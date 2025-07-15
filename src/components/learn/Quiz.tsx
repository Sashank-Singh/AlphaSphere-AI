import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface QuizProps {
  quiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}

const Quiz: React.FC<QuizProps> = ({ quiz }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (index: number) => {
    if (!isSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setIsSubmitted(true);
    }
  };

  const isCorrect = selectedAnswer === quiz.correctAnswer;

  return (
    <div className="p-5 rounded-lg border border-purple-500/30 bg-purple-900/20">
      <h4 className="text-lg font-semibold text-purple-200 mb-4">{quiz.question}</h4>
      <div className="flex flex-col space-y-2 mb-4">
        {quiz.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = quiz.correctAnswer === index;

          return (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleSelectOption(index)}
              className={cn(
                "justify-start text-left h-auto whitespace-normal transition-all",
                isSubmitted
                  ? cn(
                      "cursor-not-allowed",
                      isCorrectAnswer && "bg-green-500/20 border-green-500 hover:bg-green-500/20",
                      isSelected && !isCorrectAnswer && "bg-red-500/20 border-red-500 hover:bg-red-500/20"
                    )
                  : isSelected ? "bg-blue-500/20 border-blue-500" : "hover:bg-gray-700"
              )}
              disabled={isSubmitted}
            >
              {option}
            </Button>
          );
        })}
      </div>

      {!isSubmitted && (
         <Button onClick={handleSubmit} disabled={selectedAnswer === null} className="w-full">
            Check Answer
         </Button>
      )}

      {isSubmitted && (
        <div className={cn(
          "mt-4 p-4 rounded-md flex items-start",
          isCorrect ? "bg-green-900/50 text-green-200" : "bg-red-900/50 text-red-200"
        )}>
           {isCorrect ? <CheckCircle2 className="h-5 w-5 mr-3 mt-1 flex-shrink-0" /> : <XCircle className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />}
          <div>
            <h5 className="font-bold">{isCorrect ? 'Correct!' : 'Not Quite!'}</h5>
            <p className="text-sm mt-1">{quiz.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz; 