import React from 'react';
import { AITradingDashboard } from '@/components/AITradingDashboard';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, AlertTriangle, Info } from 'lucide-react';

const AITradingPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access AI Trading features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Trading Platform</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Experience the future of trading with our AI-powered platform that combines 
          Reinforcement Learning models, LLM analysis, and Alpaca paper trading execution.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5" />
              RL Models
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Advanced reinforcement learning models analyze market patterns and generate 
              trading signals with high confidence levels.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              LLM Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Intelligent market analysis provides context, identifies opportunities, 
              and generates actionable trading recommendations.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Paper Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Risk-free paper trading through Alpaca API allows you to test strategies 
              and learn without financial risk.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* AI Trading Dashboard */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your AI Trading Session</h2>
        <AITradingDashboard 
          userId={user.id || user.email || 'default-user'} 
          initialCapital={10000}
        />
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>
            Discover what makes our AI Trading Platform unique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"> AI-Powered Analysis</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time market sentiment analysis</li>
                <li>• Pattern recognition and trend identification</li>
                <li>• Risk assessment and mitigation strategies</li>
                <li>• Personalized trading recommendations</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"> Advanced Analytics</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Performance tracking and optimization</li>
                <li>• Portfolio risk management</li>
                <li>• Backtesting and strategy validation</li>
                <li>• Real-time performance metrics</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"> Risk Management</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Automated stop-loss and take-profit orders</li>
                <li>• Position sizing based on Kelly Criterion</li>
                <li>• Portfolio diversification recommendations</li>
                <li>• Real-time risk monitoring</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg"> Paper Trading</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Risk-free strategy testing</li>
                <li>• Real market conditions simulation</li>
                <li>• Performance tracking and learning</li>
                <li>• Gradual transition to live trading</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Trading Works</CardTitle>
          <CardDescription>
            Understanding the AI trading process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Data Collection & Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Our system continuously collects market data, news, and technical indicators 
                  to build comprehensive market understanding.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold">RL Model Predictions</h4>
                <p className="text-sm text-muted-foreground">
                  Advanced reinforcement learning models analyze patterns and generate 
                  trading signals with confidence scores.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold">LLM Market Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Large language models provide context, identify opportunities, 
                  and generate human-readable trading recommendations.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h4 className="font-semibold">Paper Trading Execution</h4>
                <p className="text-sm text-muted-foreground">
                  Approved trades are executed through Alpaca's paper trading API, 
                  allowing risk-free strategy testing and learning.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                5
              </div>
              <div>
                <h4 className="font-semibold">Performance Monitoring</h4>
                <p className="text-sm text-muted-foreground">
                  Continuous monitoring of portfolio performance, risk metrics, 
                  and strategy effectiveness for ongoing optimization.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important Disclaimer:</strong> This AI trading platform is for educational and 
          research purposes. Paper trading involves no real money, but trading in general carries 
          significant risk. Past performance does not guarantee future results. Always do your own 
          research and consider consulting with a financial advisor before making investment decisions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AITradingPage; 