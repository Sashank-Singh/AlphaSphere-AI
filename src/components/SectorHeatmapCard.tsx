
import React, { memo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Grid3X3 } from 'lucide-react';
import { stockDataService, StockQuote } from '@/lib/stockDataService';

interface SectorItem {
  id: string;
  name: string;
  performance: number;
  marketCap: string;
  volume: string;
  topStock: string;
  timeAgo: string;
  description: string;
}

const SectorHeatmapCard: React.FC = () => {
  const [sectorData, setSectorData] = useState<SectorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const sectorStocks = {
    'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
    'Finance': ['JPM', 'BAC', 'WFC', 'GS'],
    'Industrials': ['BA', 'CAT', 'GE', 'MMM'],
    'Utilities': ['NEE', 'DUK', 'SO', 'D'],
    'Consumer\nDisc.': ['AMZN', 'TSLA', 'HD', 'MCD'],
    'Comms': ['GOOGL', 'META', 'VZ', 'T'],
    'Energy': ['XOM', 'CVX', 'COP', 'EOG'],
    'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV'],
    'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX'],
    'Staples': ['PG', 'KO', 'PEP', 'WMT'],
    'Materials': ['LIN', 'APD', 'SHW', 'ECL']
  };

  const getSectorDescription = (sectorName: string, performance: number): string => {
    const descriptions: { [key: string]: { positive: string; negative: string } } = {
      'Technology': {
        positive: 'Strong earnings from major tech companies driving sector gains',
        negative: 'Tech selloff amid regulatory concerns and valuation worries'
      },
      'Finance': {
        positive: 'Rising interest rates benefiting banking sector performance',
        negative: 'Credit concerns and economic uncertainty impacting financials'
      },
      'Industrials': {
        positive: 'Infrastructure spending and manufacturing growth',
        negative: 'Supply chain disruptions and economic slowdown fears'
      },
      'Utilities': {
        positive: 'Stable dividend yields attracting defensive investors',
        negative: 'Interest rate sensitivity weighing on utility stocks'
      },
      'Consumer Disc.': {
        positive: 'Strong consumer spending and retail performance',
        negative: 'Inflation concerns and reduced consumer confidence'
      },
      'Comms': {
        positive: 'Digital transformation and 5G deployment driving growth',
        negative: 'Regulatory pressures and competition concerns'
      },
      'Energy': {
        positive: 'Oil price strength and energy demand supporting sector',
        negative: 'Commodity price weakness and environmental concerns'
      },
      'Healthcare': {
        positive: 'Positive drug trial results and healthcare innovation driving growth',
        negative: 'Regulatory concerns and drug approval delays weighing on sector'
      },
      'Real Estate': {
        positive: 'Strong property demand and REIT performance',
        negative: 'Interest rate concerns impacting real estate valuations'
      },
      'Staples': {
        positive: 'Defensive characteristics and stable demand patterns',
        negative: 'Margin pressure from inflation and supply costs'
      },
      'Materials': {
        positive: 'Commodity strength and industrial demand growth',
        negative: 'Economic slowdown fears and commodity price volatility'
      }
    };
    
    const desc = descriptions[sectorName];
    if (!desc) return 'Market activity driving sector movement';
    return performance >= 0 ? desc.positive : desc.negative;
  };

  const fetchSectorData = useCallback(async () => {
    try {
      setLoading(true);
      const sectorResults = await Promise.all(
        Object.entries(sectorStocks).map(async ([sectorName, symbols]) => {
          try {
            // Fetch quotes for all stocks in the sector
            const quotes = await Promise.all(
              symbols.map(async (symbol) => {
                try {
                  return await stockDataService.getStockQuote(symbol);
                } catch (error) {
                  console.error(`Error fetching ${symbol}:`, error);
                  return null;
                }
              })
            );

            const validQuotes = quotes.filter((quote): quote is StockQuote => quote !== null);
            
            if (validQuotes.length === 0) {
              return null;
            }

            // Calculate sector performance as average of stock performances
            const avgPerformance = validQuotes.reduce((sum, quote) => sum + quote.changePercent, 0) / validQuotes.length;
            
            // Find the best performing stock in the sector
            const topStock = validQuotes.reduce((best, current) => 
              current.changePercent > best.changePercent ? current : best
            );

            // Calculate total volume and estimated market cap
            const totalVolume = validQuotes.reduce((sum, quote) => sum + quote.volume, 0);
            const estimatedMarketCap = validQuotes.reduce((sum, quote) => sum + (quote.price * 1000000000), 0);

            return {
              sectorName,
              performance: avgPerformance,
              topStock: topStock.symbol,
              volume: totalVolume,
              marketCap: estimatedMarketCap
            };
          } catch (error) {
            console.error(`Error processing sector ${sectorName}:`, error);
            return null;
          }
        })
      );

      const validSectors = sectorResults.filter((sector): sector is NonNullable<typeof sector> => sector !== null);
      
      const formatVolume = (volume: number): string => {
        if (volume >= 1000000000) {
          return `${(volume / 1000000000).toFixed(1)}B`;
        } else if (volume >= 1000000) {
          return `${(volume / 1000000).toFixed(0)}M`;
        }
        return `${(volume / 1000).toFixed(0)}K`;
      };

      const formatMarketCap = (cap: number): string => {
        if (cap >= 1000000000000) {
          return `$${(cap / 1000000000000).toFixed(1)}T`;
        } else if (cap >= 1000000000) {
          return `$${(cap / 1000000000).toFixed(1)}B`;
        }
        return `$${(cap / 1000000).toFixed(0)}M`;
      };

      const sectorItems: SectorItem[] = validSectors.map((sector, index) => ({
        id: (index + 1).toString(),
        name: sector.sectorName,
        performance: sector.performance,
        marketCap: formatMarketCap(sector.marketCap),
        volume: formatVolume(sector.volume),
        topStock: sector.topStock,
        timeAgo: 'Live',
        description: getSectorDescription(sector.sectorName, sector.performance)
      }));

      // Sort by performance (best to worst)
      sectorItems.sort((a, b) => b.performance - a.performance);
      
      setSectorData(sectorItems);
    } catch (error) {
      console.error('Error fetching sector data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSectorData();
    
    // Set up refresh interval for real-time updates
    const interval = setInterval(() => {
      fetchSectorData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [fetchSectorData]);

  const getPerformanceIcon = (performance: number) => {
    if (performance > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (performance < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPerformanceBadgeVariant = (performance: number) => {
    if (performance > 0) return 'default';
    if (performance < 0) return 'destructive';
    return 'secondary';
  };

  const handleToggleShowAll = useCallback(() => {
    setShowAll(prev => !prev);
  }, []);

  const refreshData = useCallback(() => {
    fetchSectorData();
  }, [fetchSectorData]);

  const getPerformanceColor = (performance: number) => {
    return 'text-white';
  };

  const getPerformanceBackgroundStyle = (performance: number) => {
    if (performance >= 1.0) return { backgroundColor: '#1E7C3D' };
    if (performance >= 0.5) return { backgroundColor: '#1E7C3D' };
    if (performance >= 0.1) return { backgroundColor: '#1A592F' };
    if (performance >= 0.0) return { backgroundColor: '#1A592F' };
    if (performance >= -0.1) return { backgroundColor: '#521D1E' };
    if (performance >= -0.5) return { backgroundColor: '#521D1E' };
    return { backgroundColor: '#521D1E' };
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Grid3X3 className="h-6 w-6" />
          Sector Heatmap
        </CardTitle>
        <p className="text-base text-muted-foreground">
          Visual representation of sector performance
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <div key={i} className="aspect-square rounded-lg animate-pulse bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="h-3 bg-muted-foreground/20 rounded mb-1 w-12 mx-auto"></div>
                  <div className="h-2 bg-muted-foreground/20 rounded w-8 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {sectorData.map((item) => (
              <div 
                key={item.id} 
                className={`aspect-square rounded-lg p-2 flex flex-col justify-center items-center font-semibold transition-all duration-200 hover:scale-105 cursor-pointer ${getPerformanceColor(item.performance)}`}
                style={getPerformanceBackgroundStyle(item.performance)}
                title={`${item.name}: ${item.performance > 0 ? '+' : ''}${item.performance.toFixed(2)}% | Top Stock: ${item.topStock} | Market Cap: ${item.marketCap}`}
              >
                <div className="text-center">
                  <h3 className="text-sm font-bold mb-1 leading-tight whitespace-pre-line text-center">
                    {item.name}
                  </h3>
                  <p className="text-base font-bold">
                    {item.performance > 0 ? '+' : ''}{item.performance.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && sectorData.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={refreshData}
              className="w-full py-2 px-4 text-base font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Refresh Data
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectorHeatmapCard;
