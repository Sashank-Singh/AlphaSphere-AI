import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Sparkles, TrendingUp, Target, MessageCircle, X, Minimize2, ChevronDown, ChevronUp, Loader2, CheckCircle } from 'lucide-react';

interface AIResponse {
  type: string;
  title: string;
  content: string;
  recommendations?: string[];
  timestamp: Date;
}

interface Step {
  label: string;
  status: 'pending' | 'active' | 'done';
}

const analysisStepsMap: Record<string, Step[]> = {
  'stock-ideas': [
    { label: 'Gathering market data', status: 'pending' },
    { label: 'Analyzing technicals', status: 'pending' },
    { label: 'Generating stock ideas', status: 'pending' },
  ],
  'option-ideas': [
    { label: 'Scanning options chain', status: 'pending' },
    { label: 'Analyzing volatility', status: 'pending' },
    { label: 'Generating option strategies', status: 'pending' },
  ],
  'market-analysis': [
    { label: 'Reviewing market sentiment', status: 'pending' },
    { label: 'Analyzing sector flows', status: 'pending' },
    { label: 'Summarizing outlook', status: 'pending' },
  ],
  'portfolio-review': [
    { label: 'Reviewing portfolio allocation', status: 'pending' },
    { label: 'Analyzing risk & return', status: 'pending' },
    { label: 'Generating suggestions', status: 'pending' },
  ],
};

const aiOptions = [
  {
    label: 'AI Stock Ideas',
    icon: TrendingUp,
    type: 'stock-ideas',
    description: 'Get personalized stock recommendations',
    recommendations: [
      'NVDA - Strong AI/ML momentum, institutional buying',
      'MSFT - Cloud growth, solid fundamentals',
      'AAPL - Oversold condition, good entry point',
      'GOOGL - Undervalued, strong earnings potential',
    ],
    content: 'Based on current market conditions and technical analysis, here are my top recommendations:',
  },
  {
    label: 'AI Option Ideas',
    icon: Target,
    type: 'option-ideas',
    description: 'Discover option trading opportunities',
    recommendations: [
      'AAPL $180 calls expiring next month (IV: 28%)',
      'TSLA protective puts $240 strike (hedge position)',
      'SPY iron condor 450-460 range (neutral strategy)',
      'NVDA covered calls $500 strike (income generation)',
    ],
    content: 'Current market volatility presents these opportunities:',
  },
  {
    label: 'Market Analysis',
    icon: Brain,
    type: 'market-analysis',
    description: 'Deep market insights powered by AI',
    recommendations: [
      'VIX at 18.4 - moderate volatility environment',
      'S&P 500 showing bullish divergence on RSI',
      'Tech sector leading with 65% institutional flow',
      'Defensive positioning recommended for 2-week horizon',
      'Options premium elevated - good for sellers',
    ],
    content: 'Current market sentiment analysis shows mixed signals with bullish bias:',
  },
  {
    label: 'Portfolio Review',
    icon: MessageCircle,
    type: 'portfolio-review',
    description: 'Comprehensive portfolio analysis',
    recommendations: [
      'Current allocation: 60% tech, 25% growth, 15% value',
      'Recommendation: Reduce tech exposure by 10%',
      'Add healthcare exposure for diversification',
      'Consider defensive positions (utilities, consumer staples)',
      'Risk-adjusted return: 12.4% (above market average)',
      'Suggested rebalancing: Monthly',
    ],
    content: 'Your portfolio analysis reveals the following insights:',
  },
];

const ImprovedSphereAI: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [stepType, setStepType] = useState<string | null>(null);
  const [stepDone, setStepDone] = useState(false);

  const runStepByStep = (option: typeof aiOptions[0]) => {
    setIsExpanded(true);
    setShowResponses(false);
    setCurrentSteps(analysisStepsMap[option.type].map(s => ({ ...s })));
    setStepType(option.type);
    setActiveStep(0);
    setStepDone(false);
    // Step through each step with a delay
    let step = 0;
    const stepper = () => {
      setCurrentSteps(prev => prev.map((s, i) =>
        i < step ? { ...s, status: 'done' } :
        i === step ? { ...s, status: 'active' } :
        { ...s, status: 'pending' }
      ));
      setActiveStep(step);
      if (step < analysisStepsMap[option.type].length - 1) {
        setTimeout(() => {
          step++;
          stepper();
        }, 1200);
      } else {
        setTimeout(() => {
          setCurrentSteps(prev => prev.map((s, i) => i <= step ? { ...s, status: 'done' } : s));
          setActiveStep(null);
          setStepDone(true);
          setShowResponses(true);
          setResponses(prev => [
            {
              type: option.type,
              title: option.label,
              content: option.content,
              recommendations: option.recommendations,
              timestamp: new Date(),
            },
            ...prev,
          ]);
        }, 1200);
      }
    };
    stepper();
  };

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
    <Card className="fixed bottom-4 right-4 w-96 max-h-[600px] bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-lg border-purple-500/30 z-50 shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
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
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
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
      </CardHeader>
      <CardContent className="p-4 pt-0">
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
        {isExpanded && (
          <div className="space-y-4">
            {/* AI Options */}
            <div className="grid grid-cols-2 gap-2">
              {aiOptions.map((option, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-white/10 text-white transition-all duration-200"
                  onClick={() => runStepByStep(option)}
                  disabled={activeStep !== null && !stepDone}
                >
                  <option.icon className="h-5 w-5 text-purple-300" />
                  <div className="text-xs text-center">
                    <div className="font-medium">{option.label}</div>
                  </div>
                </Button>
              ))}
            </div>
            {/* Step-by-step progress */}
            {activeStep !== null && currentSteps.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-300" />
                  <span className="text-sm text-purple-200 font-medium">Analyzing...</span>
                </div>
                <div className="space-y-2">
                  {currentSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {step.status === 'done' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-purple-300" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-purple-300 rounded-full" />
                      )}
                      <span className={
                        step.status === 'done' ? 'text-green-300' :
                        step.status === 'active' ? 'text-purple-200' :
                        'text-purple-400 opacity-60'
                      }>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Responses Display */}
            {showResponses && responses.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-200">AI Insights</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResponses([])}
                    className="text-purple-300 hover:text-white h-6 text-xs"
                  >
                    Clear
                  </Button>
                </div>
                <ScrollArea className="h-64 w-full">
                  <div className="space-y-3">
                    {responses.map((response, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-3 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-semibold text-white">{response.title}</h4>
                          <Badge variant="outline" className="text-xs border-purple-400 text-purple-300">
                            {response.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-200 mb-2">{response.content}</p>
                        {response.recommendations && (
                          <div className="space-y-1">
                            {response.recommendations.map((rec, recIndex) => {
                              // Extract symbol (assume it's the first all-caps word, e.g., AAPL, TSLA, NVDA, SPY)
                              const match = rec.match(/([A-Z]{2,6})/);
                              const symbol = match ? match[1] : null;
                              let link = null;
                              if (symbol) {
                                if (response.type === 'option-ideas') {
                                  link = `/options/${symbol}`;
                                } else {
                                  link = `/stocks/${symbol}`;
                                }
                              }
                              return (
                                <div
                                  key={recIndex}
                                  className={`text-xs text-purple-100 bg-purple-500/10 rounded px-2 py-1 ${link ? 'cursor-pointer hover:bg-purple-500/20 transition-colors' : ''}`}
                                  onClick={() => link && (window.location.href = link)}
                                  title={link ? `Go to ${link}` : undefined}
                                >
                                  • {rec}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="text-xs text-purple-400 mt-2">
                          {response.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedSphereAI;
