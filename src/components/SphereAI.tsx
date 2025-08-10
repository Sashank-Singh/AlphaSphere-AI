import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Sparkles, TrendingUp, Target, MessageCircle, X, Minimize2, ChevronDown, ChevronUp, Loader2, CheckCircle, Activity, Newspaper } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { cn } from '@/lib/utils';

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

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

const analysisStepsMap: Record<string, Step[]> = {
  'stock-ideas': [
    { label: 'Scanning market for opportunities', status: 'pending' },
    { label: 'Applying proprietary algorithms', status: 'pending' },
    { label: 'Finalizing stock recommendations', status: 'pending' },
  ],
  'option-ideas': [
    { label: 'Analyzing options chain data', status: 'pending' },
    { label: 'Calculating volatility & greeks', status: 'pending' },
    { label: 'Generating actionable strategies', status: 'pending' },
  ],
  'market-analysis': [
    { label: 'Aggregating market-wide data', status: 'pending' },
    { label: 'Analyzing sentiment and trends', status: 'pending' },
    { label: 'Formulating market outlook', status: 'pending' },
  ],
  'news-sentiment': [
    { label: 'Fetching latest news headlines', status: 'pending' },
    { label: 'Analyzing sentiment scores', status: 'pending' },
    { label: 'Identifying market-moving stories', status: 'pending' },
  ],
};

const MARKET_INDICES = ['SPY', 'QQQ', 'IWM', '^VIX'];

interface SphereAIProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export const SphereAI: React.FC<SphereAIProps> = ({ onClose, isFloating = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Mock AI responses since Groq removed - using Yahoo Finance + Alpaca only
  const generateMockAIResponse = (query: string) => {
    return `Based on Yahoo Finance data analysis: ${query}. Market indicators suggest monitoring key support levels and volume patterns.`;
  };

  // Mock AI state to replace Groq functionality
  const isGroqLoading = false;
  const groqError = null;
  const groqData = 'Market analysis complete. Using Yahoo Finance + Alpaca data for insights.';
  
  const analyzeStock = async (params: any) => {
    console.log('Mock analyzeStock called:', params);
  };
  
  const generateMarketInsights = async (symbols: string[]) => {
    console.log('Mock generateMarketInsights called:', symbols);
  };
  
  const clearError = () => {
    console.log('Mock clearError called');
  };

  useEffect(() => {
    fetchMarketOverview();
    const interval = setInterval(fetchMarketOverview, 60000); // 1 minute update
    return () => clearInterval(interval);
  }, []);

  const fetchMarketOverview = async () => {
    setIsLoadingMarketData(true);
    try {
      const promises = MARKET_INDICES.map(symbol => stockDataService.getStockQuote(symbol).catch(() => null));
      const results = await Promise.all(promises);
      const validData = results.filter((data): data is MarketData => data !== null);
      setMarketData(validData);
    } catch (error) {
      console.error('Error fetching market overview:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  const handleAnalysis = async (type: string) => {
    // Auto-expand and scroll to analysis if in floating mode
    if (isFloating && isMinimized) {
      setIsMinimized(false);
      // Wait for the component to expand, then scroll
      setTimeout(() => {
        const element = document.querySelector('[data-sphere-ai-analysis]');
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100);
    }

    setActiveAnalysis(type);
    const steps = analysisStepsMap[type] || [];
    setCurrentSteps(steps.map(step => ({ ...step, status: 'pending' })))

    try {
      // Use Groq AI for real analysis
      if (type === 'stock-ideas' && marketData.length > 0) {
        await analyzeStock({
          symbol: marketData[0].symbol,
          price: marketData[0].price,
          change: marketData[0].change,
          changePercent: marketData[0].changePercent,
          volume: marketData[0].volume
        });
      } else if (type === 'market-analysis') {
        await generateMarketInsights(['SPY', 'QQQ', 'VIX', 'IWM']);
      }

      // Simulate step-by-step process
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        setCurrentSteps(prev => prev.map((step, index) => (index === i ? { ...step, status: 'active' } : step)));
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        setCurrentSteps(prev => prev.map((step, index) => (index === i ? { ...step, status: 'done' } : step)));
      }

      const newResponse: AIResponse = {
        type,
        title: aiOptions.find(o => o.type === type)?.label || 'AI Analysis',
        content: groqData || 'Analysis complete. Here are your insights.',
        recommendations: groqData ? [groqData.substring(0, 100) + '...'] : [
          'Recommendation 1 for ' + type,
          'Recommendation 2 for ' + type,
          'Recommendation 3 for ' + type,
        ],
        timestamp: new Date(),
      };

      setResponses(prev => [newResponse, ...prev]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setActiveAnalysis(null);
    }

    // Auto-scroll to Recent Insights when analysis is complete
    setTimeout(() => {
      const insightsElement = document.querySelector('[data-sphere-ai-insights]');
      if (insightsElement) {
        insightsElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // Add a brief highlight effect
        insightsElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          insightsElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
        }, 2000);
      }
    }, 500); // Small delay to ensure the response is rendered
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Use Groq AI for chat responses
      if (chatInput.toLowerCase().includes('stock') || chatInput.toLowerCase().includes('market')) {
        await generateMarketInsights(['SPY', 'QQQ', 'VIX']);
      } else if (marketData.length > 0) {
        await analyzeStock({
          symbol: marketData[0].symbol,
          price: marketData[0].price,
          change: marketData[0].change,
          changePercent: marketData[0].changePercent,
          volume: marketData[0].volume
        });
      }

      const aiResponse = { 
        sender: 'ai' as const, 
        text: groqData || `AI analysis for: "${chatInput}"` 
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat analysis failed:', error);
      const aiResponse = { sender: 'ai' as const, text: `I'm analyzing your request: "${chatInput}"` };
      setChatMessages(prev => [...prev, aiResponse]);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  const aiOptions = [
    { label: 'AI Stock Ideas', icon: TrendingUp, type: 'stock-ideas' },
    { label: 'AI Option Ideas', icon: Target, type: 'option-ideas' },
    { label: 'Market Analysis', icon: Activity, type: 'market-analysis' },
    { label: 'News Sentiment', icon: Newspaper, type: 'news-sentiment' },
  ];

  // Floating button mode
  if (isFloating) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {isMinimized ? (
          <Button
            onClick={() => setIsMinimized(false)}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
              activeAnalysis 
                ? "bg-orange-600 hover:bg-orange-700 animate-pulse" 
                : "bg-white hover:bg-gray-100"
            )}
            size="icon"
          >
            <Brain className="w-6 h-6 text-gray-700" />
            {activeAnalysis && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
            )}
          </Button>
        ) : (
          <Card className="w-80 bg-black border-neutral-800 shadow-2xl rounded-2xl flex flex-col h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-black" />
                </div>
                <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
              </div>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsMinimized(true)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <div className="flex-1 flex flex-col min-h-0">
              <ScrollArea className="flex-1">
                <CardContent className="p-3 space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold mb-2 text-neutral-400">Market Pulse</h3>
                    <div className="grid grid-cols-4 gap-2">
                    {marketData.map(item => (
                      <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                        <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                        <p className={cn(
                          'text-xs font-medium',
                          item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-sm font-semibold mb-2 text-neutral-400">AI Toolkit</h3>
                    {aiOptions.map(option => (
                      <Button
                        key={option.type}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 hover:bg-neutral-900 rounded-lg text-white"
                        onClick={() => handleAnalysis(option.type)}
                        disabled={!!activeAnalysis}
                      >
                        <option.icon className="w-5 h-5 mr-3" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {activeAnalysis === option.type && <Loader2 className="w-4 h-4 animate-spin" />}
                      </Button>
                    ))}
                  </div>

                  {activeAnalysis && (
                    <div 
                      data-sphere-ai-analysis
                      className="p-3 bg-neutral-900 rounded-lg space-y-2 border border-neutral-800"
                    >
                      {currentSteps.map((step, index) => (
                        <div key={index} className="flex items-center text-sm">
                          {step.status === 'done' ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : 
                           step.status === 'active' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                           <div className="w-4 h-4 mr-2"/>}
                          <span className={cn(step.status === 'done' ? 'line-through text-neutral-500' : 'text-white')}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    {responses.length > 0 && <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>}
                    <div data-sphere-ai-insights>
                      {responses.map((res, i) => (
                        <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                          <p className="font-semibold text-sm text-white">{res.title}</p>
                          <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                          <div className="text-sm space-y-1">
                            {res.recommendations?.map((rec, j) => <p key={j}>{rec}</p>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </ScrollArea>

              <div className="p-3 border-t border-neutral-800 flex-shrink-0">
                <ScrollArea className="h-24 mb-2">
                  <div className="space-y-2 pr-2">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={cn(
                        "text-sm p-2 rounded-lg",
                        msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                      )}>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Ask SphereAI..."
                    className="flex-1 bg-black border-neutral-700 text-white focus:ring-1 focus:ring-blue-500"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-neutral-200">Send</Button>
                </form>
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Regular mode (for pages that use it directly)
  return (
    <Card className="w-full max-w-md bg-black border-neutral-800 shadow-2xl rounded-2xl flex flex-col h-[700px]">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-black" />
          </div>
          <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsMinimized(!isMinimized)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <CardContent className="p-3 space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-2 text-neutral-400">Market Pulse</h3>
                <div className="grid grid-cols-4 gap-2">
                {marketData.map(item => (
                  <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                    <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    <p className={cn(
                      'text-xs font-medium',
                      item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-semibold mb-2 text-neutral-400">AI Toolkit</h3>
                {aiOptions.map(option => (
                  <Button
                    key={option.type}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-neutral-900 rounded-lg text-white"
                    onClick={() => handleAnalysis(option.type)}
                    disabled={!!activeAnalysis}
                  >
                    <option.icon className="w-5 h-5 mr-3" />
                    <span className="flex-1 text-left">{option.label}</span>
                    {activeAnalysis === option.type && <Loader2 className="w-4 h-4 animate-spin" />}
                  </Button>
                ))}
              </div>

              {activeAnalysis && (
                <div 
                  data-sphere-ai-analysis
                  className="p-3 bg-neutral-900 rounded-lg space-y-2 border border-neutral-800"
                >
                  {currentSteps.map((step, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {step.status === 'done' ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : 
                       step.status === 'active' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
                       <div className="w-4 h-4 mr-2"/>}
                      <span className={cn(step.status === 'done' ? 'line-through text-neutral-500' : 'text-white')}>{step.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2">
                {responses.length > 0 && <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>}
                <div data-sphere-ai-insights>
                  {responses.map((res, i) => (
                    <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                      <p className="font-semibold text-sm text-white">{res.title}</p>
                      <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                      <div className="text-sm space-y-1">
                        {res.recommendations?.map((rec, j) => <p key={j}>{rec}</p>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </ScrollArea>

          <div className="p-3 border-t border-neutral-800 flex-shrink-0">
            <ScrollArea className="h-24 mb-2">
              <div className="space-y-2 pr-2">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "text-sm p-2 rounded-lg",
                    msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                  )}>
                    {msg.text}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input 
                placeholder="Ask SphereAI..."
                className="flex-1 bg-black border-neutral-700 text-white focus:ring-1 focus:ring-blue-500"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-neutral-200">Send</Button>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};