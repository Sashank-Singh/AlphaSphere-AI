import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningModulesData } from '@/data/learningData';
import Flashcard from '@/components/learn/Flashcard';
import Quiz from '@/components/learn/Quiz';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const LearnDetailPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: keyof typeof learningModulesData }>();
  const navigate = useNavigate();
  const moduleData = moduleId ? learningModulesData[moduleId] : null;

  if (!moduleData) {
    return (
      <div className="flex-1 bg-black p-6 text-white text-center">
        <h2 className="text-2xl font-bold">Module not found</h2>
        <Button onClick={() => navigate('/learn')} className="mt-4">
          Back to Learning Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black p-4 md:p-6 text-white">
       <Button 
        variant="ghost" 
        onClick={() => navigate('/learn')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Learning Hub
      </Button>

      <header className="mb-8">
        <h1 className="text-4xl font-bold">{moduleData.title}</h1>
        {moduleData.description && <p className="text-gray-400 mt-2">{moduleData.description}</p>}
      </header>

      <div className="space-y-12">
        {moduleData.lessons.map((lesson, index) => (
          <section key={index}>
            {lesson.title && <h2 className="text-2xl font-bold mb-4 text-gray-300">{lesson.title}</h2>}
            
            {lesson.type === 'text' && <p className="text-gray-300 leading-relaxed">{lesson.content}</p>}

            {lesson.type === 'flashcard_grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lesson.cards?.map((card, cardIndex) => (
                  <Flashcard key={cardIndex} front={card.front} back={card.back} />
                ))}
              </div>
            )}
            
            {lesson.type === 'quiz' && lesson.quiz && <Quiz quiz={lesson.quiz} />}

            {lesson.type === 'button' && lesson.path && (
              <Button onClick={() => navigate(lesson.path!)} size="lg" className="w-full">
                {lesson.title}
              </Button>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default LearnDetailPage; 