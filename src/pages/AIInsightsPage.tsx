import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIMarketSentiment from '@/components/AIMarketSentiment';
import AIMarketInsights from '@/components/AIMarketInsights';
import { SphereAI } from '@/components/SphereAI';
import AIEarningsPrediction from '@/components/AIEarningsPrediction';
import AIFundamentalScore from '@/components/AIFundamentalScore';
import AIInsiderTradingAnalysis from '@/components/AIInsiderTradingAnalysis';
import AINewsImpactAnalysis from '@/components/AINewsImpactAnalysis';
import AIOptionsFlowAnalysis from '@/components/AIOptionsFlowAnalysis';
import AIPatternRecognition from '@/components/AIPatternRecognition';
import AITradeAdvisor from '@/components/AITradeAdvisor';
import PredictivePriceForecasting from '@/components/PredictivePriceForecasting';

const AIInsightsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AI Insights Dashboard</h1>
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
            <CardTitle>Sphere AI</CardTitle>
          </CardHeader>
          <CardContent>
            <SphereAI />
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