import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIMarketSentiment from '@/components/ai/AIMarketSentiment';
import AIMarketInsights from '@/components/ai/AIMarketInsights';
import AIEarningsPrediction from '@/components/ai/AIEarningsPrediction';
import AIFundamentalScore from '@/components/ai/AIFundamentalScore';
import AIInsiderTradingAnalysis from '@/components/ai/AIInsiderTradingAnalysis';
import AINewsImpactAnalysis from '@/components/ai/AINewsImpactAnalysis';
import AIOptionsFlowAnalysis from '@/components/ai/AIOptionsFlowAnalysis';
import AIPatternRecognition from '@/components/ai/AIPatternRecognition';
import AITradeAdvisor from '@/components/ai/AITradeAdvisor';
import PredictivePriceForecasting from '@/components/ai/PredictivePriceForecasting';

const AIInsightsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sphere AI Insights Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Market Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <AIMarketSentiment />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <AIMarketInsights stock={{}} watchlist={[]} onAlertCreate={() => {}} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Prediction</CardTitle>
          </CardHeader>
          <CardContent>
            <AIEarningsPrediction />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fundamental Score</CardTitle>
          </CardHeader>
          <CardContent>
            <AIFundamentalScore />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insider Trading Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsiderTradingAnalysis />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>News Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AINewsImpactAnalysis />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Options Flow Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <AIOptionsFlowAnalysis />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pattern Recognition</CardTitle>
          </CardHeader>
          <CardContent>
            <AIPatternRecognition />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trade Advisor</CardTitle>
          </CardHeader>
          <CardContent>
            <AITradeAdvisor />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price Forecasting</CardTitle>
          </CardHeader>
          <CardContent>
            <PredictivePriceForecasting />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIInsightsPage;