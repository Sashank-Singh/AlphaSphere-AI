
import React, { memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Zap, Brain, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

const QuickActions: React.FC = memo(() => {
  const navigate = useNavigate();

  const handleNavigation = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  const actions = [
    {
      icon: Zap,
      label: 'Quick Trade',
      description: 'Execute trades instantly',
      route: '/trading',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      hoverColor: 'hover:bg-blue-500/20',
    },
    {
      icon: Brain,
      label: 'AI Insights',
      description: 'Get AI-powered analysis',
      route: '/ai-insights',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      hoverColor: 'hover:bg-purple-500/20',
      isAI: true,
    },
    {
      icon: TrendingUp,
      label: 'Options',
      description: 'Options trading tools',
      route: '/options',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      hoverColor: 'hover:bg-green-500/20',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'Portfolio analytics',
      route: '/analytics',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      hoverColor: 'hover:bg-orange-500/20',
    },
  ];

  return (
    <Card className="h-full enhanced-card fade-in-delay-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                 key={action.label}
                 variant="outline"
                 className={`h-auto p-4 flex flex-col items-center gap-2 transition-all duration-300 interactive-element ${action.bgColor} ${action.hoverColor} border-0 fade-in-delay-${index + 3} ${action.isAI ? 'ai-highlight' : ''}`}
                 onClick={() => handleNavigation(action.route)}
               >
                <div className="relative">
                  <IconComponent className={`h-6 w-6 ${action.color} transition-transform duration-200`} />
                  {action.isAI && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium text-base">{action.label}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
     </Card>
   );
 });
 
 QuickActions.displayName = 'QuickActions';
 
 export default QuickActions;
