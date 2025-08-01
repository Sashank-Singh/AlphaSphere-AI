import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AIInsights: React.FC = memo(() => {
  const insights = [
    { title: 'Buy Recommendation', description: 'AAPL shows strong growth potential', sentiment: 'positive' },
    { title: 'Market Warning', description: 'Tech sector may face correction', sentiment: 'negative' },
    { title: 'Diversification Tip', description: 'Consider adding green energy stocks', sentiment: 'neutral' },
    { title: 'Opportunity Alert', description: 'Crypto market rebound expected', sentiment: 'positive' },
  ];

  return (
    <Card className="bg-card border rounded-2xl p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Brain className="h-5 w-5 text-primary" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-muted/50 border border-border/30 rounded-xl p-4 hover:bg-accent transition-all duration-300 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-accent`}>
              {insight.sentiment === 'positive' ? <ArrowUpRight className="w-5 h-5 text-success" /> : insight.sentiment === 'negative' ? <ArrowDownRight className="w-5 h-5 text-destructive" /> : <Sparkles className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1">
              <h4 className="text-primary font-medium mb-1">{insight.title}</h4>
              <p className="text-muted-foreground text-sm">{insight.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

export default AIInsights;