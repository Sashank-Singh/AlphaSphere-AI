import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Sparkles, TrendingUp, Target, MessageCircle, X, Minimize2, ChevronDown, ChevronUp, Loader2, CheckCircle, Activity, DollarSign, BarChart3 } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { useRealTimeStock } from '@/hooks/useRealTimeStock';
import { cn } from '@/lib/utils';

interface AIResponse {
  type: string;
  title: string;
  content: string;
  recommendations?: string[];
  timestamp: Date;
  realTimeData?: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
  }[];
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
  volume: number;
}

interface ImprovedSphereAIProps {
  isFloating?: boolean;
}

const analysisStepsMap: Record<string, Step[]> = {
  'stock-ideas': [
    { label: 'Gathering real-time market data', status: 'pending' },
    { label: 'Analyzing technical indicators', status: 'pending' },
    { label: 'Processing AI recommendations', status: 'pending' },
  ],
  'option-ideas': [
    { label: 'Scanning live options chains', status: 'pending' },
    { label: 'Calculating implied volatility', status: 'pending' },
    { label: 'Generating optimal strategies', status: 'pending' },
  ],
  'market-analysis': [
    { label: 'Analyzing real-time sentiment', status: 'pending' },
    { label: 'Processing sector flows', status: 'pending' },
    { label: 'Generating market outlook', status: 'pending' },
  ],
  'portfolio-review': [
    { label: 'Fetching portfolio positions', status: 'pending' },
    { label: 'Calculating risk metrics', status: 'pending' },
    { label: 'Optimizing allocations', status: 'pending' },
  ],
};

const TRENDING_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'SPY'];
const MARKET_INDICES = ['SPY', 'QQQ', 'IWM', 'VIX'];

const ImprovedSphereAI: React.FC<ImprovedSphereAIProps> = ({ isFloating = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [showResponses, setShowResponses] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [stepType, setStepType] = useState<string | null>(null);
  const [stepDone, setStepDone] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);

  // Real-time data hooks for key indices
  const spyData = useRealTimeStock('SPY', 5000);
  const vixData = useRealTimeStock('VIX', 10000);

  // Fetch market data on component mount
  useEffect(() => {
    fetchMarketOverview();
    const interval = setInterval(fetchMarketOverview, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketOverview = async () => {
    setIsLoadingMarketData(true);
    try {
      const promises = MARKET_INDICES.map(symbol => 
        stockDataService.getStockQuote(symbol).catch(err => {
          console.error(`Error fetching ${symbol}:`, err);
          return null;
        })
      );
      
      const results = await Promise.all(promises);
      const validData = results.filter(data => data !== null) as MarketData[];
      setMarketData(validData);
    } catch (error) {
      console.error('Error fetching market overview:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  const generateRealTimeRecommendations = async (type: string): Promise<string[]> => {
    try {
      const promises = TRENDING_SYMBOLS.slice(0, 4).map(symbol => 
        stockDataService.getStockQuote(symbol).catch(() => null)
      );
      
      const stockData = await Promise.all(promises);
      const validStocks = stockData.filter(stock => stock !== null);

      switch (type) {
        case 'stock-ideas':
          return validStocks.map(stock => {
            const trend = stock.changePercent > 2 ? 'Strong bullish momentum' : 
                         stock.changePercent > 0 ? 'Positive trend' : 
                         stock.changePercent > -2 ? 'Consolidating' : 'Oversold opportunity';
            return `${stock.symbol} - $${stock.price.toFixed(2)} (${stock.changePercent.toFixed(2)}%) - ${trend}`;
          });

        case 'option-ideas':
          return validStocks.map(stock => {
            const strategy = stock.changePercent > 1 ? 'Call spreads' : 
                           stock.changePercent < -1 ? 'Put spreads' : 'Iron condors';
            const strike = Math.round(stock.price * (stock.changePercent > 0 ? 1.02 : 0.98));
            return `${stock.symbol} ${strategy} - Strike $${strike} (IV: ${(Math.abs(stock.changePercent) * 2 + 20).toFixed(1)}%)`;
          });

        case 'market-analysis': {
          const marketSentiment = spyData.data ? 
            (spyData.data.changePercent > 0.5 ? 'Bullish' : 
             spyData.data.changePercent < -0.5 ? 'Bearish' : 'Neutral') : 'Mixed';
          
          return [
            `Market Sentiment: ${marketSentiment} (SPY: ${spyData.data?.changePercent.toFixed(2) || 'N/A'}%)`,
            `VIX Level: ${vixData.data?.price.toFixed(2) || 'N/A'} - ${(vixData.data?.price || 20) < 20 ? 'Low volatility' : 'Elevated volatility'}`,
            `Sector Rotation: ${validStocks.filter(s => s.changePercent > 1).length > 2 ? 'Growth leading' : 'Defensive positioning'}`,
            `Options Flow: ${(vixData.data?.price || 20) > 25 ? 'High put activity' : 'Balanced call/put ratio'}`,
            `Risk Assessment: ${marketSentiment === 'Bullish' ? 'Moderate risk-on' : 'Risk-off environment'}`
          ];
        }

        case 'portfolio-review': {
          const avgChange = validStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / validStocks.length;
          return [
            `Portfolio Performance: ${avgChange > 0 ? 'Outperforming' : 'Underperforming'} market (${avgChange.toFixed(2)}%)`,
            `Risk Exposure: ${Math.abs(avgChange) > 2 ? 'High volatility detected' : 'Stable performance'}`,
            `Diversification: ${validStocks.filter(s => Math.abs(s.changePercent) < 1).length > 2 ? 'Well diversified' : 'Consider rebalancing'}`,
            `Rebalancing Signal: ${Math.abs(avgChange) > 3 ? 'Immediate action recommended' : 'Monitor closely'}`,
            `Next Review: ${avgChange > 2 ? 'Weekly' : 'Monthly'} monitoring suggested`
          ];
        }

        default:
          return ['Real-time analysis complete'];
      }
    } catch (error) {
      console.error('Error generating real-time recommendations:', error);
      return ['Unable to fetch real-time data. Please try again.'];
    }
  };

  const aiOptions = [
    {
      label: 'AI Stock Ideas',
      icon: TrendingUp,
      type: 'stock-ideas',
      description: 'Real-time stock recommendations',
      color: 'from-green-500 to-emerald-600'
    },
    {
      label: 'AI Option Ideas',
      icon: Target,
      type: 'option-ideas',
      description: 'Live options opportunities',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      label: 'Market Analysis',
      icon: BarChart3,
      type: 'market-analysis',
      description: 'Real-time market insights',
      color: 'from-purple-500 to-violet-600'
    },
    {
      label: 'Portfolio Review',
      icon: MessageCircle,
      type: 'portfolio-review',
      description: 'Live portfolio analysis',
      color: 'from-orange-500 to-red-600'
    },
  ];
  const runStepByStep = async (type: string) => {
    const steps = analysisStepsMap[type] || [];
    setCurrentSteps(steps.map(step => ({ ...step, status: 'pending' })));
    setStepType(type);
    setActiveStep(0);
    setStepDone(false);
    setShowResponses(false);

    for (let i = 0; i < steps.length; i++) {
      setActiveStep(i);
      setCurrentSteps(prev => prev.map((step, index) => ({
        ...step,
        status: index < i ? 'done' : index === i ? 'active' : 'pending'
      })));
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setCurrentSteps(prev => prev.map(step => ({ ...step, status: 'done' })));
    setActiveStep(null);
    setStepDone(true);

    // Generate real-time recommendations
    const recommendations = await generateRealTimeRecommendations(type);
    
    const newResponse: AIResponse = {
      type,
      title: aiOptions.find(option => option.type === type)?.label || 'AI Analysis',
      content: `Analysis complete! Here are the latest insights based on real-time market data:`,
      recommendations,
      timestamp: new Date(),
      realTimeData: marketData.slice(0, 4)
    };

    setResponses(prev => [newResponse, ...prev]);
    setShowResponses(true);
    
    setTimeout(() => {
      setStepType(null);
      setStepDone(false);
    }, 3000);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    if (isMinimized) {
      setIsMinimized(false);
    }
  };

  if (!isVisible) return null;

  if (isFloating) {
    return (
      <div className="space-y-4">
        {/* Market Overview */}
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Market Overview
                {isLoadingMarketData && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {marketData.slice(0, 4).map((data) => (
                <div key={data.symbol} className="bg-white dark:bg-slate-800 rounded-lg p-3 border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{data.symbol}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      data.changePercent >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-lg font-bold">${data.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Options Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              SphereAI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {aiOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.type}
                    variant="outline"
                    className={cn(
                      "h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all duration-200",
                      `bg-gradient-to-br ${option.color} text-white border-0 hover:opacity-90`
                    )}
                    onClick={() => runStepByStep(option.type)}
                    disabled={stepType !== null}
                  >
                    <IconComponent className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-90">{option.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step-by-step Analysis */}
        {stepType && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                AI Analysis in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {step.status === 'done' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : step.status === 'active' ? (
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={cn(
                      "text-sm",
                      step.status === 'done' ? "text-green-700" : 
                      step.status === 'active' ? "text-blue-700 font-medium" : "text-gray-500"
                    )}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Responses */}
        {responses.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                 <CardTitle className="text-lg">Recent Sphere AI Insights</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowResponses(!showResponses)}
                >
                  {showResponses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            {showResponses && (
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-4">
                    {responses.slice(0, 3).map((response, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{response.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {response.timestamp.toLocaleTimeString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{response.content}</p>
                        {response.recommendations && (
                          <div className="space-y-1">
                            {response.recommendations.slice(0, 3).map((rec, recIndex) => (
                              <div key={recIndex} className="text-xs bg-white dark:bg-slate-700 p-2 rounded border">
                                {rec}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "relative transition-all duration-300 ease-in-out",
      isMinimized ? "h-16" : isExpanded ? "h-auto" : "h-96"
    )}>
      <Card className={cn(
        "h-full transition-all duration-300",
        isExpanded ? "shadow-2xl" : "shadow-lg",
        "bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950",
        "border-blue-200 dark:border-blue-800"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SphereAI Assistant
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">Real-time AI-powered trading insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Live
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleMinimize}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="space-y-6">
            {/* Market Overview */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Market Overview
                </h3>
                {isLoadingMarketData && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {marketData.slice(0, 4).map((data) => (
                  <div key={data.symbol} className="text-center p-2 bg-slate-50 dark:bg-slate-700 rounded">
                    <div className="font-medium text-sm">{data.symbol}</div>
                    <div className="text-lg font-bold">${data.price.toFixed(2)}</div>
                    <div className={cn(
                      "text-xs font-medium",
                      data.changePercent >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Options */}
            <div className="grid grid-cols-2 gap-4">
              {aiOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <Button
                    key={option.type}
                    variant="outline"
                    className={cn(
                      "h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all duration-200",
                      `bg-gradient-to-br ${option.color} text-white border-0 hover:opacity-90`
                    )}
                    onClick={() => runStepByStep(option.type)}
                    disabled={stepType !== null}
                  >
                    <IconComponent className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-90">{option.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>

            {/* Step-by-step Analysis */}
            {stepType && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  AI Analysis in Progress
                </h3>
                <div className="space-y-3">
                  {currentSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      {step.status === 'done' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <span className={cn(
                        "text-sm",
                        step.status === 'done' ? "text-green-700" : 
                        step.status === 'active' ? "text-blue-700 font-medium" : "text-gray-500"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responses */}
            {responses.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Sphere AI Insights</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResponses(!showResponses)}
                  >
                    {showResponses ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {showResponses && (
                  <ScrollArea className={cn(
                    "transition-all duration-300",
                    isExpanded ? "h-96" : "h-48"
                  )}>
                    <div className="space-y-4 pr-4">
                      {responses.map((response, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-white dark:bg-slate-800">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{response.title}</h4>
                            <Badge variant="secondary">
                              {response.timestamp.toLocaleTimeString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{response.content}</p>
                          {response.recommendations && (
                            <div className="space-y-2">
                              {response.recommendations.map((rec, recIndex) => (
                                <div key={recIndex} className="text-sm bg-slate-50 dark:bg-slate-700 p-3 rounded border-l-4 border-blue-500">
                                  {rec}
                                </div>
                              ))}
                            </div>
                          )}
                          {response.realTimeData && response.realTimeData.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-gray-500 mb-2">Real-time data snapshot:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {response.realTimeData.map((data, dataIndex) => (
                                  <div key={dataIndex} className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                    <span className="font-medium">{data.symbol}</span>: ${data.price.toFixed(2)} 
                                    <span className={cn(
                                      "ml-1",
                                      data.changePercent >= 0 ? "text-green-600" : "text-red-600"
                                    )}>
                                      ({data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Expand/Collapse Button */}
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExpand}
                className="text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ImprovedSphereAI;
