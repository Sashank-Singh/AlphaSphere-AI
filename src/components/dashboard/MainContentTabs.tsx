
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PieChart, MessageSquare } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import ImprovedSphereAI from '@/components/ImprovedSphereAI';
import CommunityPage from '@/pages/CommunityPage';

const MainContentTabs: React.FC = memo(() => {
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();

  const handleNavigateToStock = useCallback((symbol: string) => {
    navigate(`/stocks/${symbol}`);
  }, [navigate]);

  const handleNavigateToTrading = useCallback(() => {
    navigate('/trading');
  }, [navigate]);

  const portfolioPositions = portfolio.positions.slice(0, 3);

  return (
    <div>
      <Tabs defaultValue="positions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-12">
          <TabsTrigger value="positions" className="text-sm">Positions</TabsTrigger>
          <TabsTrigger value="ai-insights" className="text-sm">AI Insights</TabsTrigger>
          <TabsTrigger value="community" className="text-sm">Community</TabsTrigger>
          <TabsTrigger value="alerts" className="text-sm">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="positions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolioPositions.map((position) => (
              <Card key={position.id} className="hover:shadow-lg transition-shadow border-border">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{position.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{position.name}</p>
                    </div>
                    <Badge variant={position.currentPrice > position.averagePrice ? "default" : "destructive"}>
                      {position.quantity} shares
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Current</span>
                      <span className="font-semibold">${position.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Avg Cost</span>
                      <span>${position.averagePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">P&L</span>
                      <span className={position.currentPrice > position.averagePrice ? 'text-green-500' : 'text-red-500'}>
                        ${((position.currentPrice - position.averagePrice) * position.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => handleNavigateToStock(position.symbol)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {portfolio.positions.length === 0 && (
            <Card className="border-border">
              <CardContent className="p-12 text-center">
                <PieChart className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-3">No positions yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your portfolio by making your first trade
                </p>
                <Button onClick={handleNavigateToTrading}>
                  Start Trading
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-insights" className="mt-6">
          <ImprovedSphereAI />
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              <h3 className="text-xl font-semibold">Trading Community</h3>
            </div>
            <CommunityPage />
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <ImprovedSphereAI />
        </TabsContent>
      </Tabs>
    </div>
  );
});

MainContentTabs.displayName = 'MainContentTabs';

export default MainContentTabs;
