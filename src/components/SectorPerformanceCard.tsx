
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const SectorPerformanceCard: React.FC = () => {
  const [sectors, setSectors] = useState([
    { name: 'Technology', performance: 2.4, color: 'bg-blue-500' },
    { name: 'Healthcare', performance: 1.8, color: 'bg-green-500' },
    { name: 'Finance', performance: -0.5, color: 'bg-purple-500' },
    { name: 'Consumer', performance: 0.9, color: 'bg-orange-500' },
    { name: 'Energy', performance: -1.2, color: 'bg-yellow-500' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSectors(prev => prev.map(sector => ({
        ...sector,
        performance: sector.performance + (Math.random() - 0.5) * 0.3
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Sector Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">Today's sector movements</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sectors.map((sector, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${sector.color}`} />
                <span className="font-medium">{sector.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {sector.performance > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <Badge 
                  variant={sector.performance > 0 ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorPerformanceCard;
