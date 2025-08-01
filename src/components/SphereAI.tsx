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

const MARKET_INDICES = ['SPY', 'QQQ', 'IWM', 'VIX'];

interface SphereAIProps {
  onClose: () => void;
}

export const SphereAI: React.FC<SphereAIProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

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
    setActiveAnalysis(type);
    const steps = analysisStepsMap[type] || [];
    setCurrentSteps(steps.map(step => ({ ...step, status: 'pending' })))

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      setCurrentSteps(prev => prev.map((step, index) => (index === i ? { ...step, status: 'active' } : step)));
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      setCurrentSteps(prev => prev.map((step, index) => (index === i ? { ...step, status: 'done' } : step)));
    }

    const newResponse: AIResponse = {
      type,
      title: aiOptions.find(o => o.type === type)?.label || 'AI Analysis',
      content: 'Analysis complete. Here are your insights.',
      recommendations: [
        'Recommendation 1 for ' + type,
        'Recommendation 2 for ' + type,
        'Recommendation 3 for ' + type,
      ],
      timestamp: new Date(),
    };

    setResponses(prev => [newResponse, ...prev]);
    setActiveAnalysis(null);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      const aiResponse = { sender: 'ai' as const, text: `This is a mock AI response to: "${chatInput}"` };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (!isVisible) return null;

  const aiOptions = [
    { label: 'AI Stock Ideas', icon: TrendingUp, type: 'stock-ideas' },
    { label: 'AI Option Ideas', icon: Target, type: 'option-ideas' },
    { label: 'Market Analysis', icon: Activity, type: 'market-analysis' },
    { label: 'News Sentiment', icon: Newspaper, type: 'news-sentiment' },
  ];

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
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
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
                <h3 class="text-sm font-semibold mb-2 text-neutral-400">AI Toolkit</h3>
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
                <div className="p-3 bg-neutral-900 rounded-lg space-y-2 border border-neutral-800">
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
                {responses.length > 0 && <h3 class="text-sm font-semibold text-neutral-400">Recent Insights</h3>}
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