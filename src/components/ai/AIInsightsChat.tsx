import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  MessageCircle, 
  Send, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Zap,
  Target,
  Shield,
  Newspaper,
  Clock,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useUnifiedAI } from '@/hooks/useUnifiedAI';
import { StockData } from '@/lib/unifiedGroqService';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';

interface AIInsightsChatProps {
  symbol: string;
  stockData: StockData;
  onTradeWithAI: () => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  insightType?: 'sentiment' | 'technical' | 'forecast' | 'risk' | 'general';
}

const AIInsightsChat: React.FC<AIInsightsChatProps> = ({ 
  symbol, 
  stockData, 
  onTradeWithAI,
  className = "" 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    sentiment,
    technicalAnalysis,
    priceForecast,
    riskAssessment,
    newsImpact,
    tradeRecommendations,
    isLoading,
    lastUpdated
  } = useUnifiedAI({
    symbol,
    stockData,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  // Generate AI insights when data is available
  useEffect(() => {
    if (sentiment && technicalAnalysis && messages.length === 0) {
      generateInitialInsights();
    }
  }, [sentiment, technicalAnalysis, symbol]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const addMessage = (content: string, type: 'ai' | 'user', insightType?: ChatMessage['insightType']) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      insightType
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateInitialInsights = () => {
    // Welcome message
    addMessage(
      `👋 Hey! I'm analyzing ${symbol} for you. Here's what I'm seeing right now...`,
      'ai'
    );

    // Sentiment insight
    if (sentiment) {
      const sentimentEmoji = sentiment.overall > 20 ? '🚀' : sentiment.overall < -20 ? '📉' : '⚖️';
      const sentimentText = sentiment.overall > 20 ? 'bullish' : sentiment.overall < -20 ? 'bearish' : 'mixed';
      
      addMessage(
        `${sentimentEmoji} Market sentiment is ${sentimentText} (${sentiment.overall > 0 ? '+' : ''}${sentiment.overall}). ${sentiment.description}`,
        'ai',
        'sentiment'
      );
    }

    // Technical analysis
    if (technicalAnalysis) {
      const signalEmoji = technicalAnalysis.signal === 'BUY' ? '📈' : technicalAnalysis.signal === 'SELL' ? '📉' : '⏸️';
      
      addMessage(
        `${signalEmoji} Technical signals show ${technicalAnalysis.signal} with ${technicalAnalysis.confidence}% confidence. The ${technicalAnalysis.strength} strength suggests ${technicalAnalysis.signal === 'BUY' ? 'upward momentum' : technicalAnalysis.signal === 'SELL' ? 'downward pressure' : 'sideways movement'}.`,
        'ai',
        'technical'
      );
    }

    // Price forecast
    if (priceForecast) {
      const weekTarget = priceForecast.timeframes['1w'];
      const returnPct = ((weekTarget.price - stockData.price) / stockData.price) * 100;
      const direction = returnPct > 0 ? '⬆️' : '⬇️';
      
      addMessage(
        `${direction} I'm forecasting ${formatCurrency(weekTarget.price)} for next week (${formatPercentage(returnPct / 100)}) with ${weekTarget.confidence}% confidence. ${priceForecast.reasoning}`,
        'ai',
        'forecast'
      );
    }

    // Risk assessment
    if (riskAssessment) {
      const riskEmoji = riskAssessment.level === 'low' ? '🛡️' : riskAssessment.level === 'medium' ? '⚠️' : '🚨';
      
      addMessage(
        `${riskEmoji} Risk level: ${riskAssessment.level.toUpperCase()} (${riskAssessment.score}/100). Current volatility at ${riskAssessment.volatility.current.toFixed(1)}%. ${riskAssessment.warnings.length > 0 ? `⚠️ ${riskAssessment.warnings[0]}` : 'Risk factors are manageable.'}`,
        'ai',
        'risk'
      );
    }

    // Call to action
    setTimeout(() => {
      addMessage(
        `💡 Want me to dive deeper into any of these insights? Just ask! Or ready to explore AI-powered trading strategies?`,
        'ai'
      );
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    addMessage(userMessage, 'user');
    setUserInput('');

    // Simple AI response logic based on keywords
    setTimeout(() => {
      generateAIResponse(userMessage);
    }, 500);
  };

  const generateAIResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('sentiment') || message.includes('feeling') || message.includes('mood')) {
      if (sentiment) {
        addMessage(
          `📊 Market sentiment breakdown: News (${sentiment.news}%), Social (${sentiment.social}%), Technical (${sentiment.technical}%), Insider (${sentiment.insider}%). Key factors driving sentiment: ${sentiment.keyFactors.slice(0, 2).join(', ')}.`,
          'ai',
          'sentiment'
        );
      }
    } else if (message.includes('technical') || message.includes('chart') || message.includes('pattern')) {
      if (technicalAnalysis) {
        addMessage(
          `📈 Technical breakdown: RSI at ${technicalAnalysis.indicators.rsi.value} (${technicalAnalysis.indicators.rsi.signal}), MACD shows ${technicalAnalysis.indicators.macd.signal}. Support: ${formatCurrency(technicalAnalysis.indicators.supportLevel)}, Resistance: ${formatCurrency(technicalAnalysis.indicators.resistanceLevel)}.`,
          'ai',
          'technical'
        );
      }
    } else if (message.includes('price') || message.includes('target') || message.includes('forecast')) {
      if (priceForecast) {
        addMessage(
          `🎯 Price targets: 1D: ${formatCurrency(priceForecast.timeframes['1d'].price)}, 1W: ${formatCurrency(priceForecast.timeframes['1w'].price)}, 1M: ${formatCurrency(priceForecast.timeframes['1m'].price)}. Overall trend: ${priceForecast.trend}.`,
          'ai',
          'forecast'
        );
      }
    } else if (message.includes('risk') || message.includes('safe') || message.includes('volatile')) {
      if (riskAssessment) {
        addMessage(
          `🛡️ Risk analysis: ${riskAssessment.level} risk (${riskAssessment.score}/100). Volatility: ${riskAssessment.volatility.current.toFixed(1)}% vs historical ${riskAssessment.volatility.historical.toFixed(1)}%. Max drawdown potential: ${riskAssessment.maxDrawdown.toFixed(1)}%.`,
          'ai',
          'risk'
        );
      }
    } else if (message.includes('news') || message.includes('events')) {
      if (newsImpact) {
        addMessage(
          `📰 News impact: ${newsImpact.impact} (${newsImpact.magnitude} magnitude). ${newsImpact.description} Key events: ${newsImpact.keyEvents.slice(0, 2).map(e => e.event).join(', ')}.`,
          'ai',
          'general'
        );
      }
    } else if (message.includes('trade') || message.includes('buy') || message.includes('sell')) {
      if (tradeRecommendations) {
        addMessage(
          `🎯 AI recommendation: ${tradeRecommendations.stock.action} ${symbol} (${tradeRecommendations.stock.confidence}% confidence). Target: ${formatCurrency(tradeRecommendations.stock.targetPrice)}, Stop: ${formatCurrency(tradeRecommendations.stock.stopLoss)}. ${tradeRecommendations.stock.reasoning}`,
          'ai',
          'general'
        );
      }
    } else {
      // General response
      const responses = [
        `🤔 Great question! Based on my analysis of ${symbol}, here's what I think...`,
        `💭 Interesting point! Let me break that down for you...`,
        `🧠 Good thinking! From what I'm seeing in the data...`,
        `📊 That's a smart question to ask about ${symbol}...`
      ];
      
      addMessage(
        responses[Math.floor(Math.random() * responses.length)] + ` The current price of ${formatCurrency(stockData.price)} suggests ${stockData.changePercent > 0 ? 'positive momentum' : 'some pressure'} today. Would you like me to analyze any specific aspect?`,
        'ai',
        'general'
      );
    }
  };

  const quickInsights = [
    { label: 'Sentiment', icon: TrendingUp, type: 'sentiment' },
    { label: 'Technical', icon: BarChart3, type: 'technical' },
    { label: 'Price Target', icon: Target, type: 'forecast' },
    { label: 'Risk Level', icon: Shield, type: 'risk' }
  ];

  const handleQuickInsight = (type: string) => {
    generateAIResponse(type);
  };

  return (
    <Card className={cn("bg-[#1e222d] border-gray-700", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5 text-purple-500" />
            Sphere AI Insights
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Quick Insights */}
          <div className="grid grid-cols-2 gap-2">
            {quickInsights.map((insight) => (
              <Button
                key={insight.type}
                variant="outline"
                size="sm"
                onClick={() => handleQuickInsight(insight.type)}
                className="bg-[#2a2e39] border-gray-600 text-gray-300 hover:bg-[#3a3e49] hover:text-white"
              >
                <insight.icon className="h-3 w-3 mr-1" />
                {insight.label}
              </Button>
            ))}
          </div>

          <Separator className="bg-gray-700" />

          {/* Chat Messages */}
          <ScrollArea className="h-64 w-full" ref={scrollAreaRef}>
            <div className="space-y-3 pr-4">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is analyzing {symbol}...</span>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.type === 'ai' && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#2a2e39] text-gray-200 border border-gray-600'
                      )}
                    >
                      {message.content}
                      {message.insightType && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {message.insightType}
                        </Badge>
                      )}
                    </div>
                    {message.type === 'user' && (
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <MessageCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me about the stock..."
              className="bg-[#2a2e39] border-gray-600 text-white flex-1"
            />
            <Button type="submit" size="sm" disabled={!userInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          <Separator className="bg-gray-700" />

          {/* Trade with AI Button */}
          <Button
            onClick={onTradeWithAI}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Trade with AI
            <Zap className="h-4 w-4 ml-2" />
          </Button>

          {/* Attribution */}
          <div className="text-xs text-gray-500 text-center">
            Buying power will be charged at $3.99 per trade.
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AIInsightsChat;



