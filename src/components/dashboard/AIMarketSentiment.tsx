
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Brain, BarChart3, Zap, PieChart } from 'lucide-react';

interface OptimizationData {
  overallScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  diversificationScore: number;
  allocations: Array<{
    sector: string;
    current: number;
    recommended: number;
    status: 'optimal' | 'overweight' | 'underweight';
  }>;
  recommendations: Array<{
    type: 'rebalance' | 'add' | 'reduce';
    action: string;
    impact: number;
  }>;
}

const AIMarketSentiment: React.FC = () => {
  const [optimization, setOptimization] = useState<OptimizationData>({
    overallScore: 78,
    riskLevel: 'medium',
    diversificationScore: 85,
    allocations: [
      { sector: 'Technology', current: 45, recommended: 35, status: 'overweight' },
      { sector: 'Healthcare', current: 15, recommended: 20, status: 'underweight' },
      { sector: 'Finance', current: 25, recommended: 25, status: 'optimal' },
      { sector: 'Energy', current: 15, recommended: 20, status: 'underweight' }
    ],
    recommendations: [
      { type: 'reduce', action: 'Reduce tech exposure', impact: 85 },
      { type: 'add', action: 'Increase healthcare allocation', impact: 70 }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setOptimization(prev => ({
        ...prev,
        overallScore: Math.max(60, Math.min(95, prev.overallScore + (Math.random() - 0.5) * 8)),
        diversificationScore: Math.max(70, Math.min(100, prev.diversificationScore + (Math.random() - 0.5) * 6)),
        allocations: prev.allocations.map(allocation => ({
          ...allocation,
          current: Math.max(5, Math.min(50, allocation.current + (Math.random() - 0.5) * 3))
        }))
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-500';
      case 'high': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'overweight': return 'text-red-500';
      case 'underweight': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'add': return <TrendingUp className="h-3 w-3" />;
      case 'reduce': return <BarChart3 className="h-3 w-3" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-blue-400" />
          AI Portfolio Optimizer
          <Badge variant="secondary" className="ml-auto">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-400" />
            <span className="font-semibold">Optimization Score</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Risk Level</div>
            <div className={`font-bold capitalize ${getRiskColor(optimization.riskLevel)}`}>
              {optimization.riskLevel}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Portfolio Score</span>
            <span className="font-semibold">{optimization.overallScore.toFixed(0)}%</span>
          </div>
          <Progress value={optimization.overallScore} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Target className="h-3 w-3" />
            Asset Allocation
          </h4>
          {optimization.allocations.map((allocation) => (
            <div key={allocation.sector} className="flex items-center justify-between text-xs">
              <span>{allocation.sector}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{allocation.current.toFixed(0)}%</span>
                <div className="w-8 h-1 bg-muted rounded">
                  <div 
                    className="h-full bg-blue-400 rounded" 
                    style={{ width: `${(allocation.current / 50) * 100}%` }}
                  />
                </div>
                <span className={`font-semibold ${getStatusColor(allocation.status)}`}>
                  {allocation.status === 'optimal' ? '✓' : allocation.status === 'overweight' ? '↑' : '↓'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">AI Recommendations</h4>
          {optimization.recommendations.map((rec, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded bg-muted/50">
              <Badge variant={rec.type === 'add' ? 'default' : rec.type === 'reduce' ? 'destructive' : 'secondary'}>
                <div className="flex items-center gap-1">
                  {getRecommendationIcon(rec.type)}
                  {rec.type.toUpperCase()}
                </div>
              </Badge>
              <span className="text-xs flex-1">{rec.action}</span>
              <span className="text-xs font-semibold">{rec.impact}%</span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-muted/20">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Diversification Score</span>
            <span className="font-semibold">{optimization.diversificationScore.toFixed(0)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMarketSentiment;
