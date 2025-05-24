
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3 } from 'lucide-react';

interface Sector {
  name: string;
  performance: number;
  size: string;
}

const SectorHeatmapCard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([
    { name: 'Technology', performance: 2.4, size: 'col-span-2 row-span-2' },
    { name: 'Healthcare', performance: 1.8, size: 'col-span-1 row-span-2' },
    { name: 'Finance', performance: -0.5, size: 'col-span-2 row-span-1' },
    { name: 'Consumer', performance: 0.9, size: 'col-span-1 row-span-1' },
    { name: 'Energy', performance: -1.2, size: 'col-span-1 row-span-1' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSectors(prev => prev.map(sector => ({
        ...sector,
        performance: sector.performance + (Math.random() - 0.5) * 0.4
      })));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const getColorIntensity = (performance: number) => {
    const absPerf = Math.abs(performance);
    const intensity = Math.min(absPerf / 3, 1); // Normalize to 0-1
    
    if (performance > 0) {
      return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`; // Green
    } else {
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`; // Red
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          Sector Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">Visual representation of sector performance</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 grid-rows-3 gap-2 h-48">
          {sectors.map((sector, index) => (
            <div
              key={index}
              className={`${sector.size} rounded-lg p-3 flex flex-col justify-center items-center text-center transition-all duration-1000 cursor-pointer hover:scale-105`}
              style={{ backgroundColor: getColorIntensity(sector.performance) }}
            >
              <div className="font-semibold text-sm text-white drop-shadow-md">
                {sector.name}
              </div>
              <div className="text-xs text-white font-medium drop-shadow-md">
                {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorHeatmapCard;
