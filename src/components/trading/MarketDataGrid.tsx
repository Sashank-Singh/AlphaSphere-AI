import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import SkeletonLoader from '@/components/ui/skeleton-loader';
import { stockDataService, type CompanyInfo, type StockQuote } from '@/lib/stockDataService';

interface MarketDataGridProps {
  symbol: string;
}

const formatMarketCap = (marketCap?: number) => {
  if (!marketCap || marketCap <= 0) return 'N/A';
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
  return `$${marketCap.toLocaleString()}`;
};

const formatMillions = (value?: number) => {
  if (!value || value <= 0) return 'N/A';
  return `${(value / 1e6).toFixed(1)}M`;
};

const MarketDataGrid: React.FC<MarketDataGridProps> = ({ symbol }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const [quote, info] = await Promise.all([
          stockDataService.getStockQuote(symbol),
          stockDataService.getCompanyInfo(symbol)
        ]);
        if (cancelled) return;
        setStockQuote(quote);
        setCompanyInfo(info);
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  const metrics = [
    {
      label: 'Market Cap',
      value: formatMarketCap(companyInfo?.marketCap),
      loading: isLoading,
      trend: 'up' as const,
    },
    {
      label: 'P/E Ratio',
      value: companyInfo?.peRatio != null ? companyInfo.peRatio.toFixed(2) : 'N/A',
      loading: isLoading,
      trend: 'neutral' as const,
    },
    {
      label: '52-Week Range',
      value:
        companyInfo?.low52Week != null && companyInfo?.high52Week != null
          ? `$${companyInfo.low52Week.toFixed(2)} - $${companyInfo.high52Week.toFixed(2)}`
          : 'N/A',
      loading: isLoading,
      trend: 'neutral' as const,
    },
    {
      label: 'Volume',
      value: formatMillions(stockQuote?.volume),
      loading: isLoading,
      trend: 'up' as const,
    },
    {
      label: 'Avg. Volume',
      value: formatMillions(companyInfo?.avgVolume),
      loading: isLoading,
      trend: 'neutral' as const,
    },
    {
      label: 'Previous Close',
      value: stockQuote?.previousClose != null ? `$${stockQuote.previousClose.toFixed(2)}` : 'N/A',
      loading: isLoading,
      trend: 'neutral' as const,
    },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-400" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: '#0E1117' }}>
        <h2 className="text-xl font-bold text-white mb-4">Market Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-4 rounded border border-slate-700" style={{ backgroundColor: '#0E1117' }}>
              <SkeletonLoader variant="text" className="h-4 w-20 mb-2" />
              <SkeletonLoader variant="text" className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0E1117' }}>
      <h2 className="text-xl font-bold text-white mb-4">Market Data</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-4 rounded border border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer group"
            style={{ backgroundColor: '#0E1117' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">{metric.label}</p>
              <div
                className={cn('opacity-0 group-hover:opacity-100 transition-opacity', getTrendColor(metric.trend))}
              >
                {getTrendIcon(metric.trend)}
              </div>
            </div>

            {metric.loading ? (
              <div className="h-6 bg-slate-700 rounded w-20 animate-pulse"></div>
            ) : (
              <p className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                {metric.value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketDataGrid;
