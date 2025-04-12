
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  ChartPie, 
  BarChart2, 
  Shield, 
  TrendingUp, 
  FileBarChart, 
  Sparkles, 
  Check,
  X,
  AlertTriangle,
  RefreshCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  usePortfolio 
} from '@/context/PortfolioContext';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';

interface PortfolioOptimizerProps {
  className?: string;
}

interface OptimizationRecommendation {
  score: number;
  diversificationScore: number;
  riskScore: number;
  returnScore: number;
  suggestions: {
    type: 'buy' | 'sell' | 'hold' | 'rebalance';
    symbol: string;
    name?: string;
    reasoning: string;
    severity: 'high' | 'medium' | 'low';
    actionAmount?: number | string;
  }[];
  sectorAllocation: {
    current: Record<string, number>;
    recommended: Record<string, number>;
  };
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
}

const PortfolioOptimizer: React.FC<PortfolioOptimizerProps> = ({ className }) => {
  const { portfolio } = usePortfolio();
  const [recommendation, setRecommendation] = useState<OptimizationRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState<number>(50); // 0-100
  const [openSections, setOpenSections] = useState({
    recommendations: true,
    allocation: false,
    risk: false
  });
  
  // Generate mock optimization recommendation based on portfolio and risk tolerance
  const generateRecommendation = () => {
    setIsLoading(true);
    
    // In a real app, this would call an API with ML models
    setTimeout(() => {
      const stockPositions = portfolio.positions || [];
      const optionPositions = portfolio.optionPositions || [];
      const cash = portfolio.cash || 0;
      
      // Calculate total value
      const stockValue = stockPositions.reduce(
        (sum, position) => sum + (position.quantity * position.currentPrice),
        0
      );
      
      const optionsValue = optionPositions.reduce(
        (sum, option) => sum + ((option.quantity || 0) * option.premium * 100),
        0
      );
      
      const totalValue = cash + stockValue + optionsValue;
      
      // Determine current sector allocation
      const sectorAllocation: Record<string, number> = {};
      
      stockPositions.forEach(position => {
        const sector = position.sector || 'Other';
        const value = position.quantity * position.currentPrice;
        sectorAllocation[sector] = (sectorAllocation[sector] || 0) + value;
      });
      
      // Convert to percentages
      Object.keys(sectorAllocation).forEach(sector => {
        sectorAllocation[sector] = sectorAllocation[sector] / totalValue;
      });
      
      // Add cash
      sectorAllocation['Cash'] = cash / totalValue;
      
      // Generate recommended sector allocation based on risk tolerance
      const recommendedAllocation: Record<string, number> = { ...sectorAllocation };
      
      // Higher risk tolerance = more tech, less cash/utilities
      if (riskTolerance > 70) {
        recommendedAllocation['Technology'] = (recommendedAllocation['Technology'] || 0) + 0.1;
        recommendedAllocation['Cash'] = Math.max(0.05, (recommendedAllocation['Cash'] || 0) - 0.05);
        recommendedAllocation['Utilities'] = Math.max(0.02, (recommendedAllocation['Utilities'] || 0) - 0.03);
      } else if (riskTolerance < 30) {
        recommendedAllocation['Technology'] = Math.max(0.05, (recommendedAllocation['Technology'] || 0) - 0.05);
        recommendedAllocation['Cash'] = (recommendedAllocation['Cash'] || 0) + 0.08;
        recommendedAllocation['Utilities'] = (recommendedAllocation['Utilities'] || 0) + 0.02;
      }
      
      // Normalize percentages
      let total = Object.values(recommendedAllocation).reduce((sum, value) => sum + value, 0);
      Object.keys(recommendedAllocation).forEach(key => {
        recommendedAllocation[key] = recommendedAllocation[key] / total;
      });
      
      // Generate suggestions
      const suggestions: OptimizationRecommendation['suggestions'] = [];
      
      // Check for concentration risk
      const highestPosition = [...stockPositions].sort(
        (a, b) => (b.quantity * b.currentPrice) - (a.quantity * a.currentPrice)
      )[0];
      
      if (highestPosition && (highestPosition.quantity * highestPosition.currentPrice) / stockValue > 0.25) {
        suggestions.push({
          type: 'sell',
          symbol: highestPosition.symbol,
          name: highestPosition.name,
          reasoning: 'Position exceeds 25% of your stock portfolio, creating concentration risk.',
          severity: 'high',
          actionAmount: Math.floor(highestPosition.quantity * 0.2) // Sell 20%
        });
      }
      
      // Check for cash allocation
      if (cash / totalValue < 0.05) {
        suggestions.push({
          type: 'hold',
          symbol: 'CASH',
          reasoning: 'Low cash reserves may limit ability to take advantage of market opportunities.',
          severity: 'medium'
        });
      } else if (cash / totalValue > 0.30 && riskTolerance > 50) {
        suggestions.push({
          type: 'buy',
          symbol: 'SPY',
          name: 'S&P 500 ETF',
          reasoning: 'Higher cash allocation than optimal for your risk profile. Consider investing in a market index.',
          severity: 'medium',
          actionAmount: formatCurrency(cash * 0.4) // 40% of cash
        });
      }
      
      // Add option-based suggestions if there are options positions
      if (optionPositions.length > 0 && optionsValue / totalValue > 0.2) {
        suggestions.push({
          type: 'rebalance',
          symbol: 'OPTIONS',
          reasoning: 'Options exposure exceeds 20% of portfolio, which may increase overall risk.',
          severity: 'medium'
        });
      }
      
      // Add a buy recommendation
      if (suggestions.length < 3) {
        suggestions.push({
          type: 'buy',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          reasoning: 'Would improve sector balance and growth potential of portfolio.',
          severity: 'low',
          actionAmount: formatCurrency(Math.min(cash * 0.15, 2000)) // 15% of cash or $2000, whichever is less
        });
      }
      
      // Calculate scores
      const diversificationScore = calculateDiversificationScore(sectorAllocation);
      const riskScore = calculateRiskScore(portfolio, sectorAllocation);
      const returnScore = 65 + Math.floor(Math.random() * 25); // Placeholder
      const overallScore = Math.round((diversificationScore + riskScore + returnScore) / 3);
      
      const newRecommendation: OptimizationRecommendation = {
        score: overallScore,
        diversificationScore,
        riskScore,
        returnScore,
        suggestions,
        sectorAllocation: {
          current: sectorAllocation,
          recommended: recommendedAllocation
        },
        riskLevel: riskTolerance > 70 ? 'aggressive' : riskTolerance > 35 ? 'moderate' : 'conservative'
      };
      
      setRecommendation(newRecommendation);
      setIsLoading(false);
    }, 1500);
  };
  
  // Helper functions for scores
  const calculateDiversificationScore = (sectorAllocation: Record<string, number>): number => {
    const sectorCount = Object.keys(sectorAllocation).length;
    const maxSectorWeight = Math.max(...Object.values(sectorAllocation));
    
    // Better diversity = more sectors, lower max weight
    let score = 50;
    
    if (sectorCount >= 8) score += 20;
    else if (sectorCount >= 6) score += 15;
    else if (sectorCount >= 4) score += 10;
    
    if (maxSectorWeight < 0.2) score += 30;
    else if (maxSectorWeight < 0.3) score += 20;
    else if (maxSectorWeight < 0.4) score += 10;
    
    return Math.min(100, score);
  };
  
  const calculateRiskScore = (portfolio: any, sectorAllocation: Record<string, number>): number => {
    // Higher score = better risk management
    let score = 60;
    
    const cashRatio = portfolio.cash / (portfolio.totalValue || 1);
    const optionsValue = portfolio.optionPositions?.reduce(
      (sum: number, option: any) => sum + ((option.quantity || 0) * option.premium * 100),
      0
    ) || 0;
    const optionsRatio = optionsValue / (portfolio.totalValue || 1);
    
    // Cash allocation
    if (cashRatio >= 0.1) score += 15;
    else if (cashRatio >= 0.05) score += 10;
    
    // Options exposure (higher is riskier)
    if (optionsRatio > 0.2) score -= 20;
    else if (optionsRatio > 0.1) score -= 10;
    
    // Sector risk
    const techWeight = sectorAllocation['Technology'] || 0;
    if (techWeight > 0.4) score -= 15;
    
    return Math.max(0, Math.min(100, score));
  };
  
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  useEffect(() => {
    generateRecommendation();
  }, [riskTolerance, portfolio]);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Portfolio Optimizer
        </CardTitle>
        <CardDescription>
          AI-powered suggestions to optimize your portfolio
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Analyzing your portfolio...</p>
          </div>
        ) : recommendation ? (
          <div className="space-y-6">
            {/* Portfolio Health Score */}
            <div className="text-center py-3">
              <div className="text-3xl font-bold mb-1">
                {recommendation.score}/100
              </div>
              <p className="text-muted-foreground text-sm">Portfolio Health Score</p>
              
              <div className="mt-4 flex gap-4 justify-center">
                <div className="text-center">
                  <div className="text-sm">{recommendation.diversificationScore}</div>
                  <p className="text-xs text-muted-foreground">Diversity</p>
                </div>
                <div className="text-center">
                  <div className="text-sm">{recommendation.riskScore}</div>
                  <p className="text-xs text-muted-foreground">Risk</p>
                </div>
                <div className="text-center">
                  <div className="text-sm">{recommendation.returnScore}</div>
                  <p className="text-xs text-muted-foreground">Return</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Risk Tolerance Setting */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Your Risk Tolerance</label>
                <Badge variant={
                  riskTolerance > 70 ? "destructive" : 
                  riskTolerance > 35 ? "outline" : "secondary"
                }>
                  {recommendation.riskLevel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs">Low</span>
                <Slider
                  value={[riskTolerance]}
                  min={0}
                  max={100}
                  step={5}
                  onValueChange={(value) => setRiskTolerance(value[0])}
                  className="flex-1"
                />
                <span className="text-xs">High</span>
              </div>
            </div>
            
            <Separator />
            
            {/* Recommendations */}
            <Collapsible 
              open={openSections.recommendations} 
              onOpenChange={() => toggleSection('recommendations')}
              className="space-y-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-md">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileBarChart className="h-4 w-4 text-primary" />
                    Optimization Recommendations
                  </h3>
                  {openSections.recommendations ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {recommendation.suggestions.map((suggestion, index) => (
                  <div 
                    key={`suggestion-${index}`}
                    className={cn(
                      "border rounded-md p-3",
                      suggestion.severity === 'high' ? "border-destructive/20 bg-destructive/5" :
                      suggestion.severity === 'medium' ? "border-yellow-500/20 bg-yellow-500/5" :
                      "border-primary/20 bg-primary/5"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1">
                        {suggestion.type === 'buy' && (
                          <Badge variant="outline" className="text-green-500">BUY</Badge>
                        )}
                        {suggestion.type === 'sell' && (
                          <Badge variant="outline" className="text-red-500">SELL</Badge>
                        )}
                        {suggestion.type === 'hold' && (
                          <Badge variant="outline" className="text-yellow-500">HOLD</Badge>
                        )}
                        {suggestion.type === 'rebalance' && (
                          <Badge variant="outline" className="text-blue-500">REBALANCE</Badge>
                        )}
                        <span className="font-medium">{suggestion.symbol}</span>
                        {suggestion.name && <span className="text-sm text-muted-foreground">({suggestion.name})</span>}
                      </div>
                      
                      {suggestion.actionAmount && (
                        <Badge variant="secondary">
                          {typeof suggestion.actionAmount === 'number' ? 
                            `${suggestion.actionAmount} shares` : suggestion.actionAmount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm mt-2">{suggestion.reasoning}</p>
                  </div>
                ))}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => generateRecommendation()}
                >
                  <RefreshCcw className="h-3 w-3 mr-2" />
                  Refresh Recommendations
                </Button>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Sector Allocation */}
            <Collapsible 
              open={openSections.allocation} 
              onOpenChange={() => toggleSection('allocation')}
              className="space-y-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-md">
                  <h3 className="font-medium flex items-center gap-2">
                    <ChartPie className="h-4 w-4 text-primary" />
                    Sector Allocation
                  </h3>
                  {openSections.allocation ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                {Object.keys(recommendation.sectorAllocation.current).map((sector) => {
                  const currentValue = recommendation.sectorAllocation.current[sector] || 0;
                  const recommendedValue = recommendation.sectorAllocation.recommended[sector] || 0;
                  const difference = recommendedValue - currentValue;
                  const needsChange = Math.abs(difference) > 0.03; // 3% threshold
                  
                  return (
                    <div key={sector} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <span>{sector}</span>
                          {needsChange && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {difference > 0 ? 'Increase' : 'Reduce'}
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium flex items-center gap-2">
                          <span>{formatPercentage(currentValue)}</span>
                          {needsChange && (
                            <span className={cn(
                              "text-xs",
                              difference > 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {difference > 0 ? '→ +' : '→ '}
                              {formatPercentage(Math.abs(difference))}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "absolute top-0 left-0 h-full",
                            needsChange ? (difference > 0 ? "bg-green-500" : "bg-red-500") : "bg-primary"
                          )}
                          style={{ width: `${currentValue * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
            
            {/* Risk Assessment */}
            <Collapsible 
              open={openSections.risk} 
              onOpenChange={() => toggleSection('risk')}
              className="space-y-2"
            >
              <CollapsibleTrigger asChild>
                <div className="flex justify-between items-center cursor-pointer hover:bg-muted/50 px-2 py-1 rounded-md">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Risk Assessment
                  </h3>
                  {openSections.risk ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 mt-2">
                <div className="space-y-3">
                  {[
                    {
                      title: 'Diversification',
                      check: recommendation.diversificationScore > 70,
                      description: recommendation.diversificationScore > 70 
                        ? 'Portfolio is well-diversified across sectors'
                        : 'Consider diversifying across more sectors to reduce risk'
                    },
                    {
                      title: 'Cash Reserves',
                      check: (portfolio.cash / (portfolio.totalValue || 1)) >= 0.05,
                      description: (portfolio.cash / (portfolio.totalValue || 1)) >= 0.05
                        ? 'Adequate cash reserves for opportunities'
                        : 'Low cash reserves may limit flexibility'
                    },
                    {
                      title: 'Options Exposure',
                      check: true, // Placeholder
                      description: 'Options positions within acceptable risk parameters'
                    },
                    {
                      title: 'Volatility Exposure',
                      check: recommendation.riskScore > 60,
                      description: recommendation.riskScore > 60
                        ? 'Portfolio volatility aligned with risk tolerance'
                        : 'Portfolio may be more volatile than desired'
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className={cn(
                        "mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0",
                        item.check ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        {item.check ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <div className="pt-4">
              <Button className="w-full bg-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Apply AI Recommendations
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                These recommendations are for informational purposes only and should not be considered financial advice.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p>Unable to generate portfolio recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioOptimizer;
