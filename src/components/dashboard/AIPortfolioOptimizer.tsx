import React, { useEffect, useState } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { stockDataService } from '@/lib/stockDataService';

interface PortfolioMetrics {
  score: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  diversificationScore: number;
  assetAllocation: {
    technology: number;
    healthcare: number;
    finance: number;
    other: number;
  };
  recommendations: Array<{
    action: string;
    confidence: number;
    type: 'buy' | 'sell' | 'hold';
  }>;
}

const AIPortfolioOptimizer: React.FC = () => {
  const { portfolio } = usePortfolio();
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    score: 70,
    riskLevel: 'Medium',
    diversificationScore: 62,
    assetAllocation: { technology: 45, healthcare: 25, finance: 20, other: 10 },
    recommendations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const calculatePortfolioMetrics = async () => {
      try {
        setIsLoading(true);
        
        let totalValue = portfolio.cash;
        let techValue = 0;
        let healthcareValue = 0;
        let financeValue = 0;
        let otherValue = 0;
        
        // Calculate sector allocation based on current positions
        for (const position of portfolio.positions) {
          try {
            const quote = await stockDataService.getStockQuote(position.symbol);
            const positionValue = position.quantity * quote.price;
            totalValue += positionValue;
            
            // Simple sector classification (in real app, this would come from company data)
            if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'].includes(position.symbol)) {
              techValue += positionValue;
            } else if (['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO'].includes(position.symbol)) {
              healthcareValue += positionValue;
            } else if (['JPM', 'BAC', 'WFC', 'GS', 'MS'].includes(position.symbol)) {
              financeValue += positionValue;
            } else {
              otherValue += positionValue;
            }
          } catch (error) {
            console.error(`Error calculating metrics for ${position.symbol}:`, error);
          }
        }
        
        // Calculate percentages
        const totalInvested = totalValue - portfolio.cash;
        const assetAllocation = {
          technology: totalInvested > 0 ? (techValue / totalInvested) * 100 : 45,
          healthcare: totalInvested > 0 ? (healthcareValue / totalInvested) * 100 : 25,
          finance: totalInvested > 0 ? (financeValue / totalInvested) * 100 : 20,
          other: totalInvested > 0 ? (otherValue / totalInvested) * 100 : 10
        };
        
        // Calculate portfolio score based on diversification and risk
        const diversificationScore = Math.min(100, 
          (1 - Math.max(assetAllocation.technology, assetAllocation.healthcare, assetAllocation.finance) / 100) * 100
        );
        
        // Determine risk level
        let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
        if (assetAllocation.technology > 60 || assetAllocation.healthcare > 60) {
          riskLevel = 'High';
        } else if (assetAllocation.technology < 30 && assetAllocation.healthcare < 30) {
          riskLevel = 'Low';
        }
        
        // Calculate overall score
        const score = Math.round((diversificationScore * 0.4) + (portfolio.cash / totalValue * 100 * 0.3) + 30);
        
        // Generate AI recommendations
        const recommendations = [];
        
        if (assetAllocation.technology > 50) {
          recommendations.push({
            action: 'Reduce tech exposure',
            confidence: 85,
            type: 'sell'
          });
        }
        
        if (assetAllocation.healthcare < 30) {
          recommendations.push({
            action: 'Increase healthcare allocation',
            confidence: 76,
            type: 'buy'
          });
        }
        
        if (portfolio.cash / totalValue < 0.1) {
          recommendations.push({
            action: 'Maintain higher cash reserves',
            confidence: 68,
            type: 'hold'
          });
        }
        
        setMetrics({
          score: Math.min(100, Math.max(0, score)),
          riskLevel,
          diversificationScore: Math.round(diversificationScore),
          assetAllocation,
          recommendations
        });
      } catch (error) {
        console.error('Error calculating portfolio metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculatePortfolioMetrics();
    
    // Update every 5 minutes
    const interval = setInterval(calculatePortfolioMetrics, 300000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'High': return 'text-red-400 bg-red-500/20';
      default: return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400';
      case 'sell': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <div className="flex justify-between items-baseline mb-4">
        <h2 className="text-lg font-semibold text-main flex items-center">
          <span className="icon mr-2">psychology</span> 
          AI Portfolio Optimizer
        </h2>
        <span className="text-xs text-secondary flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Live
        </span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-2 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-baseline mb-4">
            <p className="text-sm text-secondary">Optimization Score</p>
            <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(metrics.riskLevel)}`}>
              Risk Level: {metrics.riskLevel}
            </span>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-main">Portfolio Score</span>
              <span className="font-semibold text-main">{metrics.score}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${metrics.score}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-main mb-2">Asset Allocation</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-secondary">Technology</span>
                <div className="w-2/4 bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${metrics.assetAllocation.technology}%` }}
                  ></div>
                </div>
                <span className="text-main">{Math.round(metrics.assetAllocation.technology)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Healthcare</span>
                <div className="w-2/4 bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-400 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${metrics.assetAllocation.healthcare}%` }}
                  ></div>
                </div>
                <span className="text-main">{Math.round(metrics.assetAllocation.healthcare)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Finance</span>
                <div className="w-2/4 bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-green-400 h-1.5 rounded-full transition-all duration-1000" 
                    style={{ width: `${metrics.assetAllocation.finance}%` }}
                  ></div>
                </div>
                <span className="text-main">{Math.round(metrics.assetAllocation.finance)}%</span>
              </div>
            </div>
          </div>
          
          {metrics.recommendations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-main mb-2">AI Recommendations</h3>
              <div className="space-y-2 text-sm">
                {metrics.recommendations.map((rec, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className={`flex items-center ${getRecommendationColor(rec.type)}`}>
                      <span className="icon text-base mr-1">
                        {rec.type === 'buy' ? 'arrow_upward' : rec.type === 'sell' ? 'arrow_downward' : 'remove'}
                      </span>
                      {rec.action}
                    </span>
                    <span className="text-main">{rec.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Diversification Score</span>
              <span className="font-semibold text-main">{metrics.diversificationScore}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIPortfolioOptimizer; 