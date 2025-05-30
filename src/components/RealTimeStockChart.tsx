
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';

interface ChartDataPoint {
  time: string;
  price: number;
  volume?: number;
  timestamp: number;
}

interface RealTimeStockChartProps {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  isRealTime?: boolean;
  chartType?: 'line' | 'area' | 'candlestick';
  height?: number;
}

const RealTimeStockChart: React.FC<RealTimeStockChartProps> = ({
  symbol,
  currentPrice,
  change,
  changePercent,
  isRealTime = false,
  chartType = 'area',
  height = 400
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M'>('1D');
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial chart data
  useEffect(() => {
    const generateInitialData = () => {
      const now = new Date();
      const points = timeframe === '1D' ? 78 : timeframe === '5D' ? 390 : 780; // Trading hours data points
      const intervalMinutes = timeframe === '1D' ? 5 : timeframe === '5D' ? 60 : 240;
      
      const data: ChartDataPoint[] = [];
      let basePrice = currentPrice || 150;
      
      for (let i = points; i >= 0; i--) {
        const timestamp = now.getTime() - (i * intervalMinutes * 60 * 1000);
        const time = new Date(timestamp);
        
        // Generate realistic price movement
        const volatility = 0.02;
        const randomChange = (Math.random() - 0.5) * volatility;
        basePrice = basePrice * (1 + randomChange);
        
        data.push({
          time: timeframe === '1D' 
            ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          price: Number(basePrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000),
          timestamp
        });
      }
      
      setChartData(data);
      setIsLoading(false);
    };

    generateInitialData();
  }, [timeframe, currentPrice, symbol]);

  // Real-time updates
  useEffect(() => {
    if (isRealTime && currentPrice > 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setChartData(prevData => {
          const now = new Date();
          const newPoint: ChartDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: currentPrice,
            volume: Math.floor(Math.random() * 1000000),
            timestamp: now.getTime()
          };

          const updatedData = [...prevData.slice(-77), newPoint]; // Keep last 78 points for 1D
          return updatedData;
        });
      }, 5000); // Update every 5 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTime, currentPrice]);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'price') {
      return [`$${value.toFixed(2)}`, 'Price'];
    }
    if (name === 'volume') {
      return [value.toLocaleString(), 'Volume'];
    }
    return [value, name];
  };

  const chartColor = change >= 0 ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${symbol}`;

  if (isLoading) {
    return (
      <Card className="bg-black border border-gray-800">
        <CardContent className="h-96 flex items-center justify-center">
          <Activity className="h-8 w-8 animate-pulse text-primary" />
          <span className="ml-2">Loading chart data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            {symbol} Price Chart
            {isRealTime && (
              <span className="ml-2 flex items-center text-xs text-green-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1" />
                Live
              </span>
            )}
          </CardTitle>
          <div className="flex space-x-2">
            {(['1D', '5D', '1M', '3M'] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
          <span className={`flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={formatTooltipValue}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                />
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="#6b7280" 
                  strokeDasharray="2 2" 
                  strokeOpacity={0.5}
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  domain={['dataMin - 1', 'dataMax + 1']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                  formatter={formatTooltipValue}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  strokeWidth={2}
                  dot={false}
                />
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="#6b7280" 
                  strokeDasharray="2 2" 
                  strokeOpacity={0.5}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeStockChart;
