
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';
import { stockDataService } from '@/lib/stockDataService';

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
  isRealTime = true, // Default to true for real-time data
  chartType = 'area',
  height = 400
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M'>('1D');
  const [isLoading, setIsLoading] = useState(true);
  const [realTimePrice, setRealTimePrice] = useState(currentPrice);
  const [realTimeChange, setRealTimeChange] = useState(change);
  const [realTimeChangePercent, setRealTimeChangePercent] = useState(changePercent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use Polygon WebSocket for real-time data
  const { stockData, isConnected } = usePolygonWebSocketData([symbol]);
  const realTimeStockData = stockData[symbol];

  // Fetch historical chart data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        const days = timeframe === '1D' ? 1 : timeframe === '5D' ? 5 : timeframe === '1M' ? 30 : 90;
        const historicalData = await stockDataService.getHistoricalPrices(symbol, days);
        
        console.log('Historical data received:', historicalData);
        
        if (historicalData && historicalData.length > 0) {
          const formattedData: ChartDataPoint[] = historicalData.map((point, index) => {
            const date = new Date(point.date);
            return {
              time: timeframe === '1D' 
                ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: point.close,
              volume: point.volume,
              timestamp: date.getTime()
            };
          });
          
          console.log('Formatted chart data:', formattedData);
          setChartData(formattedData);
        } else {
          console.log('No historical data, using fallback');
          const fallbackData = generateFallbackData();
          setChartData(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        // Fallback to mock data if API fails
        const fallbackData = generateFallbackData();
        console.log('Using fallback data:', fallbackData);
        setChartData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    const generateFallbackData = () => {
      const now = new Date();
      const data: ChartDataPoint[] = [];
      let basePrice = currentPrice || 150;
      
      if (timeframe === '1D') {
        // Generate intraday data for current trading day (9:30 AM - 4:00 PM EST)
        const today = new Date();
        const marketOpen = new Date(today);
        marketOpen.setHours(9, 30, 0, 0); // 9:30 AM
        const marketClose = new Date(today);
        marketClose.setHours(16, 0, 0, 0); // 4:00 PM
        
        // Generate 5-minute intervals throughout trading day
        const intervalMs = 5 * 60 * 1000; // 5 minutes
        const currentTime = Math.min(now.getTime(), marketClose.getTime());
        
        for (let timestamp = marketOpen.getTime(); timestamp <= currentTime; timestamp += intervalMs) {
          const time = new Date(timestamp);
          
          const volatility = 0.015;
          const randomChange = (Math.random() - 0.5) * volatility;
          basePrice = basePrice * (1 + randomChange);
          
          data.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: Number(basePrice.toFixed(2)),
            volume: Math.floor(Math.random() * 500000) + 100000,
            timestamp
          });
        }
      } else {
        // Generate daily data for longer timeframes
        const points = timeframe === '5D' ? 5 : timeframe === '1M' ? 30 : 90;
        
        for (let i = points; i >= 0; i--) {
          const timestamp = now.getTime() - (i * 24 * 60 * 60 * 1000);
          const time = new Date(timestamp);
          
          const volatility = 0.02;
          const randomChange = (Math.random() - 0.5) * volatility;
          basePrice = basePrice * (1 + randomChange);
          
          data.push({
            time: time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: Number(basePrice.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000) + 500000,
            timestamp
          });
        }
      }
      
      return data;
    };

    fetchHistoricalData();
  }, [timeframe, symbol, currentPrice]);

  // Debug log for chart data
  useEffect(() => {
    console.log('Chart data updated:', chartData);
    console.log('Chart data length:', chartData.length);
  }, [chartData]);

  // Update real-time price data from WebSocket
  useEffect(() => {
    if (realTimeStockData && isConnected) {
      setRealTimePrice(realTimeStockData.price);
      setRealTimeChange(realTimeStockData.change);
      setRealTimeChangePercent(realTimeStockData.changePercent);
      
      // Add new data point to chart for 1D timeframe
      if (timeframe === '1D') {
        setChartData(prevData => {
          const now = new Date();
          const newPoint: ChartDataPoint = {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: realTimeStockData.price,
            volume: realTimeStockData.volume,
            timestamp: now.getTime()
          };

          // Keep last 78 points for 1D view (6.5 hours of 5-minute intervals)
          const updatedData = [...prevData.slice(-77), newPoint];
          return updatedData;
        });
      }
    }
  }, [realTimeStockData, isConnected, timeframe]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'price') {
      return [`$${value.toFixed(2)}`, 'Price'];
    }
    if (name === 'volume') {
      return [value.toLocaleString(), 'Volume'];
    }
    return [value, name];
  };

  // Use real-time data if available, otherwise fall back to props
  const displayPrice = realTimeStockData?.price ?? realTimePrice ?? currentPrice;
  const displayChange = realTimeStockData?.change ?? realTimeChange ?? change;
  const displayChangePercent = realTimeStockData?.changePercent ?? realTimeChangePercent ?? changePercent;
  
  const chartColor = displayChange >= 0 ? '#10b981' : '#ef4444';
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
              <span className={`ml-2 flex items-center text-xs ${
                isConnected ? 'text-green-500' : 'text-yellow-500'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  isConnected 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-yellow-500'
                }`} />
                {isConnected ? 'Live' : 'Connecting...'}
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
          <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
          <span className={`flex items-center ${displayChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {displayChange >= 0 ? '↗' : '↘'} ${Math.abs(displayChange).toFixed(2)} ({Math.abs(displayChangePercent).toFixed(2)}%)
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
