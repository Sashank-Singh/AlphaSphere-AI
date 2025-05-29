
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, PieChart, TrendingUp, Activity } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

const AnalyticsPage: React.FC = () => {
  const { portfolio } = usePortfolio();
  
  // Safely calculate metrics with proper null checks and fallbacks
  const trades = portfolio?.trades || [];
  const positions = portfolio?.positions || [];
  
  const tradeCount = Array.isArray(trades) ? trades.length : 0;
  const positionsCount = Array.isArray(positions) ? positions.length : 0;
  
  // Calculate safe values with fallbacks
  const totalValue = (portfolio as any)?.totalValue || (portfolio as any)?.value || 0;
  const totalGain = (portfolio as any)?.totalGain || (portfolio as any)?.gain || 0;
  const totalGainPercent = totalValue > 0 ? ((totalGain / totalValue) * 100) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Trading Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Trades
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tradeCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {tradeCount === 0 ? 'No trades yet' : 'Completed trades'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Positions
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positionsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {positionsCount === 0 ? 'No positions' : 'Open positions'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total portfolio value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Return
            </CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalGainPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalGainPercent >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground">
              ${totalGain.toLocaleString()} total gain/loss
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/10">
                <div className="text-center">
                  <BarChart2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Performance Chart</h3>
                  <p className="text-muted-foreground">Interactive performance charts coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trade History</CardTitle>
            </CardHeader>
            <CardContent>
              {tradeCount > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {tradeCount} completed trades
                  </div>
                  <div className="h-[350px] flex items-center justify-center border rounded-lg bg-muted/10">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Trade Details</h3>
                      <p className="text-muted-foreground">Detailed trade history table coming soon</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/10">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Trades Yet</h3>
                    <p className="text-muted-foreground">Start trading to see your history here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center border rounded-lg bg-muted/10">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Risk Analysis</h3>
                  <p className="text-muted-foreground">Advanced risk metrics and analysis coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
