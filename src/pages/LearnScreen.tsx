import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Layers, BarChart2, Shield, PlayCircle, ChevronRight } from 'lucide-react';

const learningModules = [
  {
    id: 'stock_basics',
    title: 'Stock Market 101',
    description: 'Grasp the fundamentals of stocks and markets.',
    icon: BookOpen,
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
  },
  {
    id: 'options_intro',
    title: 'Introduction to Options',
    description: 'Discover the world of call and put options.',
    icon: Layers,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },
  {
    id: 'chart_reading',
    title: 'Reading Stock Charts',
    description: 'Learn to analyze charts and spot trends.',
    icon: BarChart2,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
  },
  {
    id: 'risk_management',
    title: 'Managing Risk',
    description: 'Strategies to protect your investments.',
    icon: Shield,
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },
  {
    id: 'trading_sim',
    title: 'Paper Trading Simulator',
    description: 'Practice trading with virtual money, risk-free.',
    icon: PlayCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
];

interface LearningModuleCardProps {
  item: typeof learningModules[0];
  onPress: () => void;
}

const LearningModuleCard: React.FC<LearningModuleCardProps> = ({ item, onPress }) => {
  const Icon = item.icon;
  return (
    <div
      onClick={onPress}
      className="mb-4 overflow-hidden rounded-2xl border border-gray-800 bg-[#1C1C1E] transition-colors hover:bg-gray-800 cursor-pointer"
    >
      <div className="flex items-center p-5">
        <div className={`mr-4 flex h-12 w-12 items-center justify-center rounded-full ${item.bgColor}`}>
          <Icon className={`h-6 w-6 ${item.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="mb-1 text-lg font-bold text-white">{item.title}</h3>
          <p className="text-sm text-gray-400">{item.description}</p>
        </div>
        <ChevronRight className="h-6 w-6 text-gray-500" />
      </div>
    </div>
);
};

const LearnScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleModulePress = (moduleId: string) => {
    navigate(`/learn/${moduleId}`);
  };

  return (
    <div className="flex-1 bg-black">
      <div className="px-4 pb-8">
        <header className="mb-6 mt-4">
          <h1 className="text-[28px] font-bold text-white">Learning Hub</h1>
          <p className="mt-1 text-base text-gray-400">
            Interactive lessons to master stocks and options trading.
          </p>
        </header>

        <div>
          {learningModules.map((item) => (
          <LearningModuleCard
              key={item.id}
            item={item}
              onPress={() => handleModulePress(item.id)}
          />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnScreen; 