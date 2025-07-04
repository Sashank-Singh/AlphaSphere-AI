import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Target
} from 'lucide-react';

interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: 'buy' | 'sell' | 'rebalance';
  expectedReturn: string;
  riskLevel: string;
  timeAgo: string;
}

const AIMarketSentiment: React.FC = memo(() => {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const generateMockData = useCallback(() => {
    const mockRecommendations: OptimizationRecommendation[] = [
      {
        id: '1',
        title: 'Reduce Tech Concentration Risk',
        description: 'Your portfolio is overweight in technology. Consider rebalancing to reduce sector concentration risk.',
        impact: 'high',
        action: 'sell',
        expectedReturn: '+2.3%',
        riskLevel: 'Medium',
        timeAgo: '2 hours ago'
      },
      {
        id: '2',
        title: 'Increase Bond Allocation',
        description: 'Add defensive assets to improve risk-adjusted returns and portfolio stability.',
        impact: 'medium',
        action: 'buy',
        expectedReturn: '+1.8%',
        riskLevel: 'Low',
        timeAgo: '4 hours ago'
      },
      {
        id: '3',
        title: 'Rebalance International Exposure',
        description: 'Optimize geographic diversification by adjusting international equity allocation.',
        impact: 'medium',
        action: 'rebalance',
        expectedReturn: '+1.2%',
        riskLevel: 'Medium',
        timeAgo: '6 hours ago'
      },
      {
        id: '4',
        title: 'Add ESG-Focused Holdings',
        description: 'Consider sustainable investment options to align with ESG criteria while maintaining returns.',
        impact: 'low',
        action: 'buy',
        expectedReturn: '+0.8%',
        riskLevel: 'Low',
        timeAgo: '8 hours ago'
      }
    ];

    setRecommendations(mockRecommendations);
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 1000);
  }, [generateMockData]);

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'rebalance': return <Target className="h-4 w-4 text-blue-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <PieChart className="h-6 w-6" />
          Portfolio Optimization
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          AI-powered recommendations to optimize your portfolio performance
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-border rounded-lg animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {(showAll ? recommendations : recommendations.slice(0, 2)).map((recommendation) => (
              <div 
                key={recommendation.id} 
                className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionIcon(recommendation.action)}
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {recommendation.title}
                      </h4>
                      <Badge variant={getImpactBadgeVariant(recommendation.impact)} className="text-xs">
                        {recommendation.impact}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Expected: <span className="text-green-500">{recommendation.expectedReturn}</span></span>
                      <span>Risk: {recommendation.riskLevel}</span>
                      <span>{recommendation.timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {recommendations.length > 2 && (
              <div className="pt-2">
                <button
                  onClick={handleToggleShowAll}
                  className="w-full py-2 px-4 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {showAll ? 'Show Less' : `View More (${recommendations.length - 2} more)`}
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AIMarketSentiment.displayName = 'AIMarketSentiment';

export default AIMarketSentiment;
