import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { stockDataService, StockQuote } from '@/lib/stockDataService';

interface MoverItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  timeAgo: string;
  description: string;
}

const TopMoversCard: React.FC = memo(() => {
  const [moverData, setMoverData] = useState<MoverItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  const popularSymbols = ['NVDA', 'TSLA', 'AAPL', 'META', 'GOOGL', 'AMZN', 'MSFT', 'JPM'];

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatMarketCap = (price: number): string => {
    // Estimate market cap based on price (this is a simplified calculation)
    const estimatedCap = price * 1000000000; // Rough estimation
    if (estimatedCap >= 1000000000000) {
      return `$${(estimatedCap / 1000000000000).toFixed(2)}T`;
    } else if (estimatedCap >= 1000000000) {
      return `$${(estimatedCap / 1000000000).toFixed(0)}B`;
    }
    return `$${(estimatedCap / 1000000).toFixed(0)}M`;
  };

  const getCompanyName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      'NVDA': 'NVIDIA Corporation',
      'TSLA': 'Tesla Inc.',
      'AAPL': 'Apple Inc.',
      'META': 'Meta Platforms Inc.',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'MSFT': 'Microsoft Corporation',
      'JPM': 'JPMorgan Chase & Co.'
    };
    return names[symbol] || symbol;
  };

  const getDescription = (symbol: string, changePercent: number): string => {
    const descriptions: { [key: string]: { positive: string; negative: string } } = {
      'NVDA': {
        positive: 'AI chip demand driving strong quarterly earnings beat',
        negative: 'Semiconductor sector concerns affecting investor sentiment'
      },
      'TSLA': {
        positive: 'Strong delivery numbers and production milestones',
        negative: 'Production concerns and delivery challenges weighing on stock'
      },
      'AAPL': {
        positive: 'Strong iPhone sales and services revenue growth',
        negative: 'Supply chain concerns and China market challenges'
      },
      'META': {
        positive: 'Strong user engagement and advertising revenue growth',
        negative: 'Metaverse investments and regulatory concerns impacting sentiment'
      },
      'GOOGL': {
        positive: 'Search revenue growth and cloud expansion driving gains',
        negative: 'Regulatory pressures and competition concerns'
      },
      'AMZN': {
        positive: 'AWS growth and e-commerce expansion driving performance',
        negative: 'Rising costs and competitive pressures affecting margins'
      },
      'MSFT': {
        positive: 'Cloud services and AI integration boosting revenue',
        negative: 'Enterprise spending concerns affecting growth outlook'
      },
      'JPM': {
        positive: 'Strong lending growth and interest rate environment',
        negative: 'Credit concerns and economic uncertainty weighing on outlook'
      }
    };
    
    const desc = descriptions[symbol];
    if (!desc) return 'Market activity driving price movement';
    return changePercent >= 0 ? desc.positive : desc.negative;
  };

  const fetchRealTimeData = useCallback(async () => {
    try {
      setLoading(true);
      const quotes = await Promise.all(
        popularSymbols.map(async (symbol) => {
          try {
            const quote = await stockDataService.getStockQuote(symbol);
            return { symbol, quote };
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
          }
        })
      );

      const validQuotes = quotes.filter((item): item is { symbol: string; quote: StockQuote } => item !== null);
      
      // Sort by absolute change percentage to get the biggest movers
      const sortedQuotes = validQuotes.sort((a, b) => 
        Math.abs(b.quote.changePercent) - Math.abs(a.quote.changePercent)
      );

      const moverItems: MoverItem[] = sortedQuotes.map((item, index) => ({
        id: (index + 1).toString(),
        symbol: item.symbol,
        name: getCompanyName(item.symbol),
        price: item.quote.price,
        change: item.quote.change,
        changePercent: item.quote.changePercent,
        volume: formatVolume(item.quote.volume),
        marketCap: formatMarketCap(item.quote.price),
        timeAgo: 'Live',
        description: getDescription(item.symbol, item.quote.changePercent)
      }));

      setMoverData(moverItems);
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRealTimeData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [fetchRealTimeData]);

  const getPerformanceIcon = (changePercent: number) => {
    if (changePercent > 0) return TrendingUp;
    if (changePercent < 0) return TrendingDown;
    return BarChart3;
  };

  const getPerformanceBadgeVariant = (changePercent: number) => {
    if (changePercent > 0) return 'default';
    if (changePercent < 0) return 'destructive';
    return 'secondary';
  };

  const getGainers = () => {
    return moverData.filter(item => item.changePercent > 0).slice(0, 5);
  };

  const getLosers = () => {
    return moverData.filter(item => item.changePercent < 0).slice(0, 5);
  };

  const refreshData = () => {
    fetchRealTimeData();
  };

  const displayedData = activeTab === 'gainers' ? getGainers() : getLosers();

  return (
    <Card className="bg-black border-gray-800 text-white h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-white mb-3">
          Top Movers
        </CardTitle>
        <div className="flex bg-gray-800 rounded-md p-0.5">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'gainers'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Gainers
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-medium transition-colors ${
              activeTab === 'losers'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Losers
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse py-1">
                <div className="w-12 h-3 bg-gray-700 rounded"></div>
                <div className="w-16 h-3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedData.map((item) => {
              const isPositive = item.changePercent > 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-1 hover:bg-gray-800/30 transition-colors rounded px-1"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white text-sm">{item.symbol}</h4>
                    <span className="text-gray-400 text-xs">${item.price.toFixed(2)}</span>
                  </div>
                  <div className={`text-xs font-medium ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
   );
});

TopMoversCard.displayName = 'TopMoversCard';

export default TopMoversCard;
