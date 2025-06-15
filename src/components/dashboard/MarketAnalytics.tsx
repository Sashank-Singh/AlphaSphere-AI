
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import SectorHeatmapCard from '@/components/SectorHeatmapCard';

const MarketAnalytics: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Market Analytics
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectorHeatmapCard />
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Market News</CardTitle>
            <p className="text-sm text-muted-foreground">Latest market updates</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <h4 className="font-semibold text-sm mb-2">Fed Maintains Interest Rates</h4>
                <p className="text-xs text-muted-foreground mb-2">Markets react positively to stable monetary policy...</p>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <h4 className="font-semibold text-sm mb-2">Tech Earnings Beat Expectations</h4>
                <p className="text-xs text-muted-foreground mb-2">Major tech companies report strong quarterly results...</p>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="p-4 border border-border rounded-lg hover:bg-muted/10 transition-colors">
                <h4 className="font-semibold text-sm mb-2">Oil Prices Surge on Supply Concerns</h4>
                <p className="text-xs text-muted-foreground mb-2">Energy sector sees significant gains amid geopolitical tensions...</p>
                <span className="text-xs text-muted-foreground">6 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketAnalytics;
