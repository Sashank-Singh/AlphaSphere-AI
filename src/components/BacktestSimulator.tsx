import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface BacktestSimulatorProps {
  stock: Stock;
  onStrategySelect: (strategy: string) => void;
}

interface SimulationResult {
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Trade[];
}

interface Trade {
  date: Date;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  pnl: number;
}

const BacktestSimulator: React.FC<BacktestSimulatorProps> = ({
  stock,
  onStrategySelect,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [selectedStrategy, setSelectedStrategy] = useState('momentum');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  const [simulationResult, setSimulationResult] = useState<SimulationResult>({
    initialCapital: 100000,
    finalCapital: 115000,
    totalReturn: 0.15,
    maxDrawdown: -0.08,
    sharpeRatio: 1.5,
    trades: [
      {
        date: new Date(),
        type: 'buy',
        price: stock.price,
        quantity: 100,
        pnl: 1500,
      },
      {
        date: new Date(),
        type: 'sell',
        price: stock.price * 1.1,
        quantity: 50,
        pnl: 500,
      },
    ],
  });

  const strategies = [
    { id: 'momentum', name: 'Momentum' },
    { id: 'mean-reversion', name: 'Mean Reversion' },
    { id: 'machine-learning', name: 'Machine Learning' },
  ];

  const handleStrategySelect = (strategy: string) => {
    setSelectedStrategy(strategy);
    onStrategySelect(strategy);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentDate(new Date());
    // Reset simulation results
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      // TODO: Implement historical data fetching
      // This would replace the mock data
    };
    
    fetchHistoricalData();
  }, [dateRange]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium">Backtest Simulator</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Strategy Selection */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Strategy</h4>
          <div className="flex gap-2">
            {strategies.map(strategy => (
              <Button
                key={strategy.id}
                variant={selectedStrategy === strategy.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStrategySelect(strategy.id)}
              >
                {strategy.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Simulation Speed</h4>
          <Slider
            value={[simulationSpeed]}
            onValueChange={([value]) => setSimulationSpeed(value)}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground mt-1">
            {simulationSpeed}x
          </div>
        </div>

        {/* Simulation Results */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Initial Capital</div>
            <div className="font-medium">{formatCurrency(simulationResult.initialCapital)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Final Capital</div>
            <div className="font-medium">{formatCurrency(simulationResult.finalCapital)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Return</div>
            <div className={cn(
              "font-medium",
              simulationResult.totalReturn >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatPercentage(simulationResult.totalReturn)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Max Drawdown</div>
            <div className="font-medium text-red-500">
              {formatPercentage(simulationResult.maxDrawdown)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
            <div className="font-medium">{simulationResult.sharpeRatio.toFixed(2)}</div>
          </div>
        </div>

        {/* Trade History */}
        <div className="mt-4">
          <h4 className="text-xs font-medium text-muted-foreground mb-2">Trade History</h4>
          <div className="space-y-2">
            {simulationResult.trades.map((trade, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg border"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      trade.type === 'buy' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="text-sm">{trade.quantity} shares</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {trade.date.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(trade.price)}</div>
                  <div className={cn(
                    "text-xs",
                    trade.pnl >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {formatCurrency(trade.pnl)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BacktestSimulator; 