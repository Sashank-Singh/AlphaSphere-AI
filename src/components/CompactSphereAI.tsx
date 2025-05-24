
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, Target, MessageCircle, X, Minimize2 } from 'lucide-react';

const CompactSphereAI: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const aiOptions = [
    { 
      label: 'AI Stock Ideas', 
      icon: TrendingUp, 
      action: () => {
        console.log('AI Stock Ideas clicked');
        // Mock AI response
        alert('🤖 AI Analysis: Based on current market conditions, consider looking at NVDA, MSFT, and AAPL for growth potential. These stocks show strong technical indicators and positive sentiment.');
      },
      description: 'Get personalized stock recommendations'
    },
    { 
      label: 'AI Option Ideas', 
      icon: Target, 
      action: () => {
        console.log('AI Option Ideas clicked');
        // Mock AI response
        alert('🤖 Options Strategy: Consider AAPL $180 calls expiring next month, or a protective put strategy on TSLA. Current volatility suggests good option premium opportunities.');
      },
      description: 'Discover option trading opportunities'
    },
    { 
      label: 'Market Analysis', 
      icon: Brain, 
      action: () => {
        console.log('Market Analysis clicked');
        // Mock AI response
        alert('🤖 Market Outlook: Current market shows bullish sentiment with 65% confidence. Tech sector leading gains. VIX at moderate levels. Consider defensive positioning for next 2 weeks.');
      },
      description: 'Deep market insights powered by AI'
    },
    { 
      label: 'Chat with AI', 
      icon: MessageCircle, 
      action: () => {
        console.log('Chat with AI clicked');
        // Mock AI response
        const response = prompt('💬 Ask me anything about your portfolio or the market:');
        if (response) {
          alert(`🤖 AI Response: That's a great question about "${response}". Based on your portfolio, I'd recommend diversifying more into healthcare and reducing tech exposure by 10%. Your current allocation shows good growth potential but could benefit from better risk management.`);
        }
      },
      description: 'Ask questions about your portfolio'
    }
  ];

  if (!isVisible) {
    return (
      <Button
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg p-0 bg-purple-600 hover:bg-purple-700 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Brain className="h-5 w-5 text-white" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          className="rounded-full h-14 w-14 shadow-lg p-0 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={() => setIsMinimized(false)}
        >
          <div className="relative">
            <Brain className="h-6 w-6 text-white" />
            <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-lg border-purple-500/30 z-50 shadow-2xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Brain className="h-6 w-6 text-purple-400" />
              <Sparkles className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <span className="font-semibold text-white">Sphere AI</span>
            <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
              Beta
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="text-purple-300 hover:text-white h-7 w-7 p-0"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-purple-300 hover:text-white h-7 w-7 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-purple-300 hover:text-white h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-2">
            {aiOptions.map((option, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 hover:bg-white/10 text-white transition-all duration-200"
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
            <p className="text-sm text-purple-200 mb-3">
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
