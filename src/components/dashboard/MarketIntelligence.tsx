
import React from 'react';
import { LineChart } from 'lucide-react';
import MarketSentimentCard from '@/components/MarketSentimentCard';
import SectorPerformanceCard from '@/components/SectorPerformanceCard';
import TopMoversCard from '@/components/TopMoversCard';

const MarketIntelligence: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <LineChart className="h-6 w-6" />
        Market Intelligence
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg">
          <MarketSentimentCard />
        </div>
        <div className="bg-card border border-border rounded-lg">
          <SectorPerformanceCard />
        </div>
        <div className="bg-card border border-border rounded-lg">
          <TopMoversCard />
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
