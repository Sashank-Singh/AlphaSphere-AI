
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, Target, MessageCircle } from 'lucide-react';

const CompactSphereAI: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const aiOptions = [
    { 
      label: 'AI Stock Ideas', 
      icon: TrendingUp, 
      action: () => console.log('AI Stock Ideas'),
      description: 'Get personalized stock recommendations'
    },
    { 
      label: 'AI Option Ideas', 
      icon: Target, 
      action: () => console.log('AI Option Ideas'),
      description: 'Discover option trading opportunities'
    },
    { 
      label: 'Market Analysis', 
      icon: Brain, 
      action: () => console.log('Market Analysis'),
      description: 'Deep market insights powered by AI'
    },
    { 
      label: 'Chat with AI', 
      icon: MessageCircle, 
      action: () => console.log('Chat with AI'),
      description: 'Ask questions about your portfolio'
    }
  ];

  return (
    <Card className="fixed bottom-20 right-4 w-80 bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg border-purple-500/20 z-40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="h-6 w-6 text-purple-400" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="font-semibold text-white">Sphere AI</span>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-300 hover:text-white"
          >
            {isExpanded ? '−' : '+'}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {aiOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 hover:bg-white/10 text-white"
                onClick={option.action}
              >
                <div className="flex items-center gap-3">
                  <option.icon className="h-4 w-4 text-purple-300" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-purple-200 opacity-80">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {!isExpanded && (
          <div className="text-center">
            <p className="text-sm text-purple-200 mb-2">
              Your AI trading assistant is ready
            </p>
            <Button
              onClick={() => setIsExpanded(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Get AI Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactSphereAI;
