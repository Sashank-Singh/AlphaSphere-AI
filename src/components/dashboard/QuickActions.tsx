
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Brain, Target, BarChart3 } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { label: 'Quick Trade', icon: Zap, action: () => navigate('/trading'), color: 'bg-blue-500' },
    { label: 'AI Insights', icon: Brain, action: () => {}, color: 'bg-green-500' },
    { label: 'Options', icon: Target, action: () => navigate('/options'), color: 'bg-amber-500' },
    { label: 'Analytics', icon: BarChart3, action: () => navigate('/analytics'), color: 'bg-cyan-500' }
  ];

  return (
    <div className="w-full text-left flex flex-col items-start">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 justify-start">
        <Zap className="h-5 w-5" />
        Quick Actions
      </h2>
      <div className="flex flex-row gap-4 w-full justify-start items-start">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-20 flex-col gap-3 hover:scale-105 transition-transform border-none min-w-[250px]"
            onClick={action.action}
          >
            <div className={`p-3 rounded-full ${action.color}`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
