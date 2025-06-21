
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3X3, RefreshCw } from 'lucide-react';

interface SectorData {
  sector: string;
  symbol: string;
  price: number;
  dailyChange: number;
  dailyChangePercent: number;
  monthlyReturn: number;
  quarterlyReturn: number;
  yearlyReturn: number;
}

interface Sector {
  name: string;
  performance: number;
  size: string;
}

const SectorHeatmapCard: React.FC = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getSectorDisplayName = (sectorName: string): string => {
    const nameMap: { [key: string]: string } = {
      'Financial Services': 'Finance',
      'Consumer Discretionary': 'Consumer Disc.',
      'Consumer Staples': 'Staples',
      'Communication Services': 'Comms',
      'Real Estate': 'Real Estate'
    };
    return nameMap[sectorName] || sectorName;
  };

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/yahoo/sectors');
      if (!response.ok) {
        throw new Error('Failed to fetch sector data');
      }
      const sectorData: SectorData[] = await response.json();
      
      // Convert API data to component format - show all sectors
      const formattedSectors = sectorData.map(sector => ({
        name: getSectorDisplayName(sector.sector),
        performance: sector.dailyChangePercent,
        size: 'col-span-1 row-span-1' // Uniform sizing for better layout
      }));
      
      setSectors(formattedSectors);
      setError(null);
    } catch (err) {
      console.error('Error fetching sector data:', err);
      setError('Failed to load sector data');
      // Fallback to mock data with more sectors
       setSectors([
         { name: 'Technology', performance: 2.78, size: 'col-span-1 row-span-1' },
         { name: 'Healthcare', performance: 1.16, size: 'col-span-1 row-span-1' },
         { name: 'Finance', performance: -1.12, size: 'col-span-1 row-span-1' },
         { name: 'Consumer Disc.', performance: -0.78, size: 'col-span-1 row-span-1' },
         { name: 'Energy', performance: -0.97, size: 'col-span-1 row-span-1' },
         { name: 'Staples', performance: 0.45, size: 'col-span-1 row-span-1' },
         { name: 'Industrials', performance: 1.23, size: 'col-span-1 row-span-1' },
         { name: 'Materials', performance: -0.34, size: 'col-span-1 row-span-1' },
         { name: 'Utilities', performance: 0.12, size: 'col-span-1 row-span-1' },
         { name: 'Comms', performance: -0.56, size: 'col-span-1 row-span-1' },
         { name: 'Real Estate', performance: 0.89, size: 'col-span-1 row-span-1' }
       ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchSectorData, 5 * 60 * 1000);
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Sector Heatmap
          </div>
          <button
            onClick={fetchSectorData}
            disabled={loading}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            title="Refresh sector data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Visual representation of sector performance</p>
      </CardHeader>
      <CardContent>
        {loading && sectors.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading sector data...</span>
            </div>
          </div>
        ) : error && sectors.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center text-muted-foreground">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchSectorData}
                className="mt-2 text-xl text-blue-600 hover:text-blue-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 auto-rows-fr">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className="rounded-xl p-4 flex flex-col justify-center items-center text-center transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg min-h-[80px] shadow-md border border-white/10"
                style={{ backgroundColor: getColorIntensity(sector.performance) }}
              >
                <div className="font-semibold text-sm text-white drop-shadow-lg mb-2 leading-tight break-words">
                  {sector.name}
                </div>
                <div className="text-base text-white font-bold drop-shadow-lg">
                  {sector.performance > 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorHeatmapCard;
