
import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Quick Trade',
      icon: 'speed',
      color: 'bg-blue-500/20 text-blue-400',
      action: () => navigate('/trading')
    },
    {
      name: 'Sphere AI Insights',
      icon: 'insights',
      color: 'bg-green-500/20 text-green-400',
      action: () => navigate('/analytics')
    },
    {
      name: 'Options',
      icon: 'attach_money',
      color: 'bg-purple-500/20 text-purple-400',
      action: () => navigate('/options')
    },
    {
      name: 'Analytics',
      icon: 'analytics',
      color: 'bg-yellow-500/20 text-yellow-400',
      action: () => navigate('/analytics')
    }
  ];

  return (
    <div className="flex items-center justify-center space-x-8 mb-6">
      {actions.map((action) => (
        <button 
          key={action.name} 
          className="flex flex-col items-center text-main hover:scale-105 transition-transform duration-200"
          onClick={action.action}
        >
          <span className={`icon p-3 ${action.color} rounded-full mb-2 hover:scale-110 transition-transform duration-200`}>
            {action.icon}
          </span>
          {action.name}
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
