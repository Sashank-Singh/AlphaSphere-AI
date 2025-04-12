
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BrainCircuit, 
  TrendingUp,
  BarChart2,
  ChevronRight,
  Shield,
  ChartPie,
  Rocket,
  Lightbulb,
  Sparkles,
  Star,
  Check,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePortfolio } from '@/context/PortfolioContext';

interface EnhancedSphereAIProps {
  className?: string;
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'insight' | 'alert';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'portfolio' | 'market' | 'stock';
  relatedSymbols?: string[];
  actionable: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EnhancedSphereAI: React.FC<EnhancedSphereAIProps> = ({ className }) => {
  const { portfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState('insights');
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  
  useEffect(() => {
    loadInsights();
  }, [portfolio]);
  
  const loadInsights = () => {
    setIsLoading(true);
    
    // In a real application, this would be an API call to your AI service
    setTimeout(() => {
      const mockInsights: AIInsight[] = [
        {
          id: 'insight-1',
          type: 'recommendation',
          title: 'Portfolio Diversification Opportunity',
          description: 'Your portfolio is heavily concentrated in the technology sector, accounting for 68% of your holdings. Consider diversifying into healthcare and financial sectors to reduce risk.',
          priority: 'high',
          category: 'portfolio',
          actionable: true,
          action: {
            label: 'View Recommendations',
            onClick: () => handleAction('insight-1', 'Opened diversification recommendations')
          }
        },
        {
          id: 'insight-2',
          type: 'insight',
          title: 'Market Volatility Expected',
          description: 'Economic indicators suggest increased market volatility in the coming weeks. Consider implementing hedging strategies to protect your portfolio.',
          priority: 'medium',
          category: 'market',
          actionable: true,
          action: {
            label: 'Hedging Strategies',
            onClick: () => handleAction('insight-2', 'Viewed hedging strategies')
          }
        },
        {
          id: 'insight-3',
          type: 'alert',
          title: 'AAPL Technical Pattern Detected',
          description: 'A bullish cup and handle pattern has formed for Apple Inc., suggesting potential upward price movement in the near term.',
          priority: 'medium',
          category: 'stock',
          relatedSymbols: ['AAPL'],
          actionable: true,
          action: {
            label: 'Analyze AAPL',
            onClick: () => handleAction('insight-3', 'Analyzed AAPL technical patterns')
          }
        },
        {
          id: 'insight-4',
          type: 'recommendation',
          title: 'Optimize Cash Allocation',
          description: 'You currently have a significant cash position (23% of portfolio). With current market conditions, consider dollar-cost averaging into quality positions.',
          priority: 'medium',
          category: 'portfolio',
          actionable: true,
          action: {
            label: 'Allocation Plan',
            onClick: () => handleAction('insight-4', 'Viewed cash allocation plan')
          }
        },
        {
          id: 'insight-5',
          type: 'insight',
          title: 'Sector Rotation Opportunity',
          description: 'Economic indicators suggest a potential sector rotation from growth to value stocks in the next quarter. Consider rebalancing your portfolio accordingly.',
          priority: 'low',
          category: 'market',
          actionable: false
        },
        {
          id: 'insight-6',
          type: 'recommendation',
          title: 'Options Strategy Enhancement',
          description: 'Based on your current options positions and market volatility, consider adjusting your strategy to capture more premium while reducing downside risk.',
          priority: 'high',
          category: 'portfolio',
          actionable: true,
          action: {
            label: 'Options Strategies',
            onClick: () => handleAction('insight-6', 'Viewed options strategy enhancements')
          }
        },
        {
          id: 'insight-7',
          type: 'alert',
          title: 'Earnings Season Impact Analysis',
          description: 'Multiple stocks in your portfolio have upcoming earnings reports. AI analysis predicts potential volatility for MSFT and AMZN.',
          priority: 'medium',
          category: 'stock',
          relatedSymbols: ['MSFT', 'AMZN'],
          actionable: true,
          action: {
            label: 'Earnings Calendar',
            onClick: () => handleAction('insight-7', 'Viewed earnings calendar')
          }
        }
      ];
      
      setInsights(mockInsights);
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAction = (insightId: string, actionDescription: string) => {
    console.log(`Action taken: ${actionDescription} for insight ${insightId}`);
    setCompletedActions(prev => [...prev, insightId]);
  };
  
  const getPriorityStyles = (priority: AIInsight['priority']) => {
    switch (priority) {
      case 'high':
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case 'medium':
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case 'low':
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };
  
  const getTypeIcon = (insight: AIInsight) => {
    switch (insight.type) {
      case 'recommendation':
        return <Lightbulb className="h-4 w-4" />;
      case 'insight':
        return <BrainCircuit className="h-4 w-4" />;
      case 'alert':
        return <TrendingUp className="h-4 w-4" />;
    }
  };
  
  const getCategoryIcon = (category: AIInsight['category']) => {
    switch (category) {
      case 'portfolio':
        return <ChartPie className="h-4 w-4 text-blue-500" />;
      case 'market':
        return <BarChart2 className="h-4 w-4 text-purple-500" />;
      case 'stock':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
  };
  
  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'insights') return true;
    if (activeTab === 'portfolio') return insight.category === 'portfolio';
    if (activeTab === 'market') return insight.category === 'market';
    if (activeTab === 'stocks') return insight.category === 'stock';
    return false;
  });
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Sphere AI</h2>
              <p className="text-sm text-muted-foreground">Advanced market intelligence</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={loadInsights}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="insights" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
            <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
            <TabsTrigger value="stocks" className="flex-1">Stocks</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredInsights.length > 0 ? (
              <div className="space-y-3">
                {filteredInsights.map(insight => (
                  <div 
                    key={insight.id} 
                    className={cn(
                      "border rounded-lg p-4 space-y-3 transition-all hover:bg-muted/20",
                      completedActions.includes(insight.id) ? "border-green-500/20 bg-green-500/5" : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded",
                          insight.category === 'portfolio' ? "bg-blue-500/10" :
                          insight.category === 'market' ? "bg-purple-500/10" :
                          "bg-green-500/10"
                        )}>
                          {getCategoryIcon(insight.category)}
                        </div>
                        
                        <div>
                          <h3 className="font-medium">{insight.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            {getTypeIcon(insight)}
                            <span>{insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}</span>
                            
                            {insight.relatedSymbols && (
                              <div className="flex items-center gap-1">
                                <span>•</span>
                                {insight.relatedSymbols.map(symbol => (
                                  <Badge key={symbol} variant="outline" className="text-xs py-0 h-4">
                                    {symbol}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "ml-2",
                          getPriorityStyles(insight.priority)
                        )}
                      >
                        {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    
                    {insight.actionable && insight.action && (
                      <div className="flex justify-end">
                        {completedActions.includes(insight.id) ? (
                          <div className="flex items-center text-sm text-green-500">
                            <Check className="h-4 w-4 mr-1" />
                            Applied
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={insight.action.onClick}
                            className="text-primary hover:text-primary/80"
                          >
                            {insight.action.label}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <BrainCircuit className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No {activeTab} available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-3 gap-3">
          <Button className="bg-green-500 hover:bg-green-600 flex items-center justify-center gap-1 h-12">
            <Rocket className="h-4 w-4" />
            <span>Trade Now</span>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-center gap-1 h-12">
            <Shield className="h-4 w-4" />
            <span>Risk Analysis</span>
          </Button>
          
          <Button variant="outline" className="flex items-center justify-center gap-1 h-12">
            <Star className="h-4 w-4" />
            <span>Watchlist</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSphereAI;
