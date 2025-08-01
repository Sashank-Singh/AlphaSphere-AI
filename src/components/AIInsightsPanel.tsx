import React from 'react';
import { BarChart2, TrendingUp, Play, BrainCircuit, TrendingDown, AlertTriangle, DollarSign, Percent } from 'lucide-react';

interface AIInsightsPanelProps {
  symbol: string;
  className?: string;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ symbol, className = "" }) => {
  // Mock AI insights data - in a real app, this would come from an AI service
  const insights = {
    priceForecast: {
      trend: 'upward',
      confidence: 54,
      prediction: 'slight upward trend in the next week',
      timeframe: '1 week'
    },
    sentiment: {
      overall: 'positive',
      score: 78,
      description: 'Overall sentiment is positive based on news and social media',
      sources: ['news', 'social media', 'analyst reports']
    },
    newsImpact: {
      impact: 'positive',
      description: 'Recent news about product launches positively impacting the stock',
      keyEvents: ['Product launch announcement', 'Earnings beat expectations', 'Market expansion']
    },
    fundamentalScore: {
      score: 78,
      maxScore: 100,
      description: 'Strong fundamentals',
      factors: ['Revenue growth', 'Profit margins', 'Market position', 'Innovation']
    },
    technicalAnalysis: {
      signal: 'buy',
      strength: 'medium',
      indicators: ['RSI oversold', 'MACD bullish crossover', 'Support level reached']
    },
    riskAssessment: {
      level: 'low',
      factors: ['Low volatility', 'Strong balance sheet', 'Market leader position'],
      warnings: []
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'text-[#4CAF50]';
      case 'negative':
        return 'text-[#f44336]';
      case 'neutral':
        return 'text-[#FFC107]';
      default:
        return 'text-[#E0E0E0]';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case 'buy':
        return 'text-[#4CAF50]';
      case 'sell':
        return 'text-[#f44336]';
      case 'hold':
        return 'text-[#FFC107]';
      default:
        return 'text-[#E0E0E0]';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-[#4CAF50]';
      case 'medium':
        return 'text-[#FFC107]';
      case 'high':
        return 'text-[#f44336]';
      default:
        return 'text-[#E0E0E0]';
    }
  };

  return (
    <div className={`bg-[#1E1E1E] p-6 rounded-2xl shadow-lg ${className}`}>
      <h3 className="text-2xl font-bold text-[#E0E0E0] mb-6">AI Insights</h3>
      
      <div className="space-y-6">
        {/* AI Price Forecast */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(33,150,243,0.1)] p-3 rounded-full">
            <BarChart2 className="h-6 w-6 text-[#2196F3]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">AI Price Forecast</h4>
            <p className="text-[#B0B0B0] text-sm">
              Predicts a {insights.priceForecast.prediction}.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-[#9CA3AF]">
                Confidence: <span className="font-medium">{insights.priceForecast.confidence}%</span>
              </p>
              <p className="text-sm text-[#9CA3AF]">
                Timeframe: <span className="font-medium">{insights.priceForecast.timeframe}</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI Sentiment Analysis */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(76,175,80,0.1)] p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-[#4CAF50]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">AI Sentiment Analysis</h4>
            <p className="text-[#B0B0B0] text-sm">{insights.sentiment.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <p className={`text-sm font-medium ${getSentimentColor(insights.sentiment.overall)}`}>
                {insights.sentiment.overall.charAt(0).toUpperCase() + insights.sentiment.overall.slice(1)}
              </p>
              <p className="text-sm text-[#9CA3AF]">
                Score: <span className="font-medium">{insights.sentiment.score}/100</span>
              </p>
            </div>
          </div>
        </div>

        {/* AI News Impact */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(156,39,176,0.1)] p-3 rounded-full">
            <Play className="h-6 w-6 text-[#9C27B0]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">AI News Impact</h4>
            <p className="text-[#B0B0B0] text-sm">{insights.newsImpact.description}</p>
            <div className="mt-2">
              <p className="text-xs text-[#9CA3AF]">Key Events:</p>
              <ul className="text-xs text-[#B0B0B0] mt-1 space-y-1">
                {insights.newsImpact.keyEvents.map((event, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#4CAF50] rounded-full"></div>
                    {event}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Fundamental Score */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(255,193,7,0.1)] p-3 rounded-full">
            <BrainCircuit className="h-6 w-6 text-[#FFC107]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">AI Fundamental Score</h4>
            <p className="text-[#B0B0B0] text-sm">
              Score: <span className="font-bold text-[#E0E0E0]">{insights.fundamentalScore.score}/{insights.fundamentalScore.maxScore}</span>. {insights.fundamentalScore.description}
            </p>
            <div className="mt-2">
              <p className="text-xs text-[#9CA3AF]">Key Factors:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {insights.fundamentalScore.factors.map((factor, index) => (
                  <span key={index} className="text-xs bg-[#333333] text-[#E0E0E0] px-2 py-1 rounded">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(255,152,0,0.1)] p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-[#FF9800]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">Technical Analysis</h4>
            <div className="flex items-center gap-4 mt-2">
              <p className={`text-sm font-medium ${getSignalColor(insights.technicalAnalysis.signal)}`}>
                Signal: {insights.technicalAnalysis.signal.toUpperCase()}
              </p>
              <p className="text-sm text-[#9CA3AF]">
                Strength: <span className="font-medium capitalize">{insights.technicalAnalysis.strength}</span>
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-[#9CA3AF]">Indicators:</p>
              <ul className="text-xs text-[#B0B0B0] mt-1 space-y-1">
                {insights.technicalAnalysis.indicators.map((indicator, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#FF9800] rounded-full"></div>
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(76,175,80,0.1)] p-3 rounded-full">
            <AlertTriangle className="h-6 w-6 text-[#4CAF50]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">Risk Assessment</h4>
            <div className="flex items-center gap-4 mt-2">
              <p className={`text-sm font-medium ${getRiskColor(insights.riskAssessment.level)}`}>
                Risk Level: {insights.riskAssessment.level.toUpperCase()}
              </p>
            </div>
            <div className="mt-2">
              <p className="text-xs text-[#9CA3AF]">Risk Factors:</p>
              <ul className="text-xs text-[#B0B0B0] mt-1 space-y-1">
                {insights.riskAssessment.factors.map((factor, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-[#4CAF50] rounded-full"></div>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Section */}
      <div className="mt-8 pt-6 border-t border-[#333333]">
        <h3 className="text-xl font-bold text-[#E0E0E0] mb-4">Financial Health</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">P/E Ratio</span>
            <span className="font-semibold text-[#E0E0E0]">28.75</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">EPS</span>
            <span className="font-semibold text-[#E0E0E0]">$5.89</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">Market Cap</span>
            <span className="font-semibold text-[#E0E0E0]">$3.1T</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">Dividend Yield</span>
            <span className="font-semibold text-[#E0E0E0]">0.47%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">Beta</span>
            <span className="font-semibold text-[#E0E0E0]">1.23</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">52W High</span>
            <span className="font-semibold text-[#E0E0E0]">$214.12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#B0B0B0]">52W Low</span>
            <span className="font-semibold text-[#E0E0E0]">$165.22</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel; 