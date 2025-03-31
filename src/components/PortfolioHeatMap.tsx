import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPercentage } from '@/lib/utils';
import { Portfolio, Position } from '@/types';
import { cn } from '@/lib/utils';

interface PortfolioHeatMapProps {
  portfolio: Portfolio;
}

interface CorrelationMatrix {
  [key: string]: {
    [key: string]: number;
  };
}

const PortfolioHeatMap: React.FC<PortfolioHeatMapProps> = ({ portfolio }) => {
  // Calculate daily returns for each position
  const calculateDailyReturns = (positions: any[]) => {
    return positions.map(pos => ({
      ticker: pos.ticker,
      return: (pos.currentPrice - pos.averagePrice) / pos.averagePrice
    }));
  };

  const calculateCorrelationMatrix = (positions: Position[]): CorrelationMatrix => {
    const matrix: CorrelationMatrix = {};
    
    positions.forEach(pos1 => {
      matrix[pos1.symbol] = {};
      positions.forEach(pos2 => {
        // Simulate correlation calculation
        const correlation = Math.random() * 2 - 1;
        matrix[pos1.symbol][pos2.symbol] = correlation;
      });
    });
    
    return matrix;
  };

  const correlationMatrix = calculateCorrelationMatrix(portfolio.positions);
  const symbols = Object.keys(correlationMatrix);

  // Function to get background color based on value
  const getBackgroundColor = (value: number) => {
    const intensity = Math.abs(value);
    if (value > 0) {
      return `rgba(0, 200, 5, ${intensity * 0.5})`; // Green with opacity
    } else {
      return `rgba(255, 80, 0, ${intensity * 0.5})`; // Red with opacity
    }
  };

  // Function to get text color based on background intensity
  const getTextColor = (value: number) => {
    const intensity = Math.abs(value);
    return intensity > 0.5 ? 'text-white' : 'text-foreground';
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-4 flex items-center">Portfolio Heat Map</h3>
        
        {/* Correlation Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs text-muted-foreground p-2 sticky left-0 bg-background/80 backdrop-blur-sm z-10"></th>
                {symbols.map(symbol => (
                  <th key={symbol} className="text-xs text-muted-foreground p-2 font-medium">
                    {symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {symbols.map(symbol1 => (
                <tr key={symbol1}>
                  <td className="text-xs font-medium p-2 sticky left-0 bg-background/80 backdrop-blur-sm z-10">
                    {symbol1}
                  </td>
                  {symbols.map(symbol2 => {
                    const correlation = correlationMatrix[symbol1][symbol2];
                    const bgColor = getBackgroundColor(correlation);
                    const textColor = getTextColor(correlation);
                    
                    return (
                      <td 
                        key={`${symbol1}-${symbol2}`}
                        className={cn(
                          "text-xs p-2 text-center",
                          correlation > 0.7 ? "bg-green-500/20" :
                          correlation > 0.3 ? "bg-green-500/10" :
                          correlation < -0.7 ? "bg-red-500/20" :
                          correlation < -0.3 ? "bg-red-500/10" :
                          "bg-muted/50"
                        )}
                      >
                        {correlation.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[rgba(255,80,0,0.5)]"></div>
            <span>Negative Correlation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[rgba(0,200,5,0.5)]"></div>
            <span>Positive Correlation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioHeatMap; 