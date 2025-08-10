import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import RealTimeStockChart from '@/components/RealTimeStockChart';
import SkeletonLoader from '@/components/ui/skeleton-loader';

interface ChartSectionProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isRealTime: boolean;
  isLoading?: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  symbol,
  price,
  change,
  changePercent,
  isRealTime,
  isLoading = false
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1H');
  
  const timeframes = [
    { value: '1H', label: '1 Hour' },
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '1Y', label: '1 Year' },
    { value: 'ALL', label: 'All Time' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#0E1117' }}>
        <div className="flex justify-between items-center mb-4">
          <SkeletonLoader variant="text" className="h-6 w-32" />
          <div className="flex space-x-1">
            {timeframes.map((_, index) => (
              <SkeletonLoader key={index} variant="text" className="h-6 w-16" />
            ))}
          </div>
        </div>
        <SkeletonLoader variant="chart" className="h-80" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg border border-slate-700" style={{ backgroundColor: '#0E1117' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-white">{symbol} Price Chart</h2>
        <div className="flex space-x-1">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              className={cn(
                "px-3 py-1 text-xs rounded transition-colors",
                selectedTimeframe === timeframe.value
                  ? "bg-slate-600 text-white"
                  : "hover:bg-slate-700 text-gray-400"
              )}
              onClick={() => setSelectedTimeframe(timeframe.value)}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-80 bg-slate-900 rounded border border-slate-700 relative">
        {price > 0 ? (
          <RealTimeStockChart
            symbol={symbol}
            currentPrice={price}
            change={change}
            changePercent={changePercent}
            isRealTime={isRealTime}
            chartType="area"
            height={320}
            timeRange={selectedTimeframe as '1H' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SkeletonLoader variant="chart" className="h-80" />
          </div>
        )}
      </div>
      
      {/* Chart Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Data: {isRealTime ? 'Live' : 'Delayed'}</span>
          <span>Interval: {selectedTimeframe}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="hover:text-white transition-colors">Full Screen</button>
          <button className="hover:text-white transition-colors">Export</button>
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
