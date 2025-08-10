
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart3 } from 'lucide-react';
import { useYahooFinanceData } from '@/hooks/useYahooFinanceData';
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
  // External control for the time range; when provided, internal controls are hidden
  timeRange?: '1H' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
}

const RealTimeStockChart: React.FC<RealTimeStockChartProps> = ({
  symbol,
  currentPrice,
  change,
  changePercent,
  isRealTime = true,
  chartType = 'area',
  height = 400,
  timeRange,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  // Keep internal timeframe for backward compatibility when timeRange prop is not provided
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M'>('1D');
  const [isLoading, setIsLoading] = useState(true);
  const [realTimePrice, setRealTimePrice] = useState(currentPrice);
  const [realTimeChange, setRealTimeChange] = useState(change);
  const [realTimeChangePercent, setRealTimeChangePercent] = useState(changePercent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use Yahoo Finance for real-time data
  const { stockData, isConnected, error } = useYahooFinanceData([symbol]);
  const realTimeStockData = stockData[symbol];

  // Fetch historical chart data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        // Determine effective range
        const effectiveRange = (timeRange ?? timeframe);
        const days = effectiveRange === '1H' ? 1
          : effectiveRange === '1D' ? 1
          : effectiveRange === '1W' ? 7
          : effectiveRange === '1M' ? 30
          : effectiveRange === '3M' ? 90
          : effectiveRange === '1Y' ? 365
          : 365 * 3; // ALL

        // Choose interval per range
        const intervalOverride = effectiveRange === '1H' ? '5m'
          : effectiveRange === '1D' ? '5m'
          : effectiveRange === '1W' ? '1h'
          : effectiveRange === '1M' ? '1d'
          : effectiveRange === '3M' ? '1d'
          : effectiveRange === '1Y' ? '1wk'
          : '1mo';

        const historicalData = await stockDataService.getHistoricalPrices(symbol, days, intervalOverride);
        
        console.log('Historical data received:', historicalData);
        
        if (historicalData && historicalData.length > 0) {
          let formattedData: ChartDataPoint[] = historicalData.map((point) => {
            const date = new Date(point.date);
            return {
              time: '', // we will format on axis via timestamp
              price: Number(point.close.toFixed(2)),
              volume: point.volume || 0,
              timestamp: date.getTime()
            };
          });
          // If 1H range, keep only the last ~12 points (5-min intervals ≈ 1 hour)
          if (effectiveRange === '1H') {
            formattedData = formattedData.slice(-12);
          }
          // Detect bad intraday data (all timestamps align to same hour/minute)
          if ((effectiveRange === '1H' || effectiveRange === '1D') && formattedData.length > 2) {
            const first = new Date(formattedData[0].timestamp);
            const anyDifferent = formattedData.some(d => {
              const t = new Date(d.timestamp);
              return t.getHours() !== first.getHours() || t.getMinutes() !== first.getMinutes();
            });
            if (!anyDifferent) {
              console.warn('Historical API returned date-only points for intraday. Falling back to synthetic intraday data.');
              formattedData = generateFallbackData(effectiveRange);
            }
          }
          
          // Ensure the last data point reflects the current price
          if (formattedData.length > 0 && currentPrice > 0) {
            const lastPoint = formattedData[formattedData.length - 1];
            const priceDiff = Math.abs(lastPoint.price - currentPrice) / lastPoint.price;
            // Update if price difference is significant (> 0.1%)
            if (priceDiff > 0.001) {
              lastPoint.price = currentPrice;
              console.log(`Updated last price from ${lastPoint.price} to ${currentPrice}`);
            }
          }
          
          console.log('Formatted chart data with current price:', formattedData.slice(-3));
          setChartData(formattedData);
        } else {
          console.log('No historical data, using fallback');
          const fallbackData = generateFallbackData(timeRange ?? timeframe);
          setChartData(fallbackData);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        // Fallback to mock data if API fails
        const fallbackData = generateFallbackData(timeRange ?? timeframe);
        console.log('Using fallback data:', fallbackData);
        setChartData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    const generateFallbackData = (range: '1H' | '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL') => {
      const now = new Date();
      const data: ChartDataPoint[] = [];
              const targetPrice = currentPrice || 150; // Target end price
        const basePrice = targetPrice * 0.98; // Start slightly below target
      
      if (range === '1H' || range === '1D') {
        // Generate intraday data for current trading day (9:30 AM - 4:00 PM EST/EDT)
        const today = new Date();
        
        // Create market times for Eastern Time (9:30 AM - 4:00 PM ET)
        const marketOpen = new Date(today);
        const marketClose = new Date(today);
        
        // Set market hours (these will be displayed in user's local time but represent ET market hours)
        marketOpen.setHours(9, 30, 0, 0); // 9:30 AM
        marketClose.setHours(16, 0, 0, 0); // 4:00 PM
        
        // Generate 5-minute intervals throughout trading day
        const intervalMs = 5 * 60 * 1000; // 5 minutes
        
        // Determine the actual time range for chart data
        let startTime, endTime;
        
        if (range === '1H') {
          // Last hour of data at 5-minute intervals
          const totalPoints = 12;
          for (let i = totalPoints; i >= 0; i--) {
            const timestamp = now.getTime() - i * intervalMs;
            const time = new Date(timestamp);
            const progress = (totalPoints - i) / totalPoints;
            const targetForPoint = basePrice + (targetPrice - basePrice) * progress;
            const volatility = 0.006;
            const randomChange = (Math.random() - 0.5) * volatility;
            const price = targetForPoint * (1 + randomChange);
            data.push({
              time: '',
              price: Number(price.toFixed(2)),
              volume: Math.floor(Math.random() * 300000) + 50000,
              timestamp
            });
          }
        } else if (now.getTime() < marketOpen.getTime()) {
          // Before market open - show previous day's full session
          const prevDay = new Date(today);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevMarketOpen = new Date(prevDay);
          const prevMarketClose = new Date(prevDay);
          prevMarketOpen.setHours(9, 30, 0, 0);
          prevMarketClose.setHours(16, 0, 0, 0);
          startTime = prevMarketOpen.getTime();
          endTime = prevMarketClose.getTime();
        } else if (now.getTime() > marketClose.getTime()) {
          // After market close - show full session
          startTime = marketOpen.getTime();
          endTime = marketClose.getTime();
        } else {
          // During market hours - show from open to current time
          startTime = marketOpen.getTime();
          endTime = now.getTime();
        }
        
        const totalPoints = Math.max(1, Math.floor((endTime - startTime) / intervalMs));
        
        for (let i = 0; i <= totalPoints; i++) {
          const timestamp = startTime + (i * intervalMs);
          const time = new Date(timestamp);
          
          // Progress from 0 to 1 over the trading day
          const progress = i / Math.max(totalPoints, 1);
          
          // Calculate target price for this point (trending toward current price)
          const targetForPoint = basePrice + (targetPrice - basePrice) * progress;
          
          // Add small random variation
          const volatility = 0.008; // Reduced volatility
          const randomChange = (Math.random() - 0.5) * volatility;
          const price = targetForPoint * (1 + randomChange);
          
          // Format time for display (24-hour format for trading)
          data.push({
            time: '',
            price: Number(price.toFixed(2)),
            volume: Math.floor(Math.random() * 500000) + 100000,
            timestamp
          });
        }
        
        // Ensure the last point exactly matches the current price
        if (data.length > 0) {
          data[data.length - 1].price = targetPrice;
        }
      } else {
        // Generate daily data for longer timeframes
        const points = range === '1W' ? 7 : range === '1M' ? 30 : range === '3M' ? 90 : range === '1Y' ? 365 : 365 * 2;
        
        for (let i = points; i >= 0; i--) {
          const timestamp = now.getTime() - (i * 24 * 60 * 60 * 1000);
          const time = new Date(timestamp);
          
          // Progress from 0 to 1 over the time period
          const progress = (points - i) / points;
          
          // Calculate target price for this point
          const targetForPoint = basePrice + (targetPrice - basePrice) * progress;
          
          const volatility = 0.015; // Reduced volatility
          const randomChange = (Math.random() - 0.5) * volatility;
          const price = targetForPoint * (1 + randomChange);
          
          // Format date properly
          data.push({
            time: '',
            price: Number(price.toFixed(2)),
            volume: Math.floor(Math.random() * 1000000) + 500000,
            timestamp
          });
        }
        
        // Ensure the last point exactly matches the current price
        if (data.length > 0) {
          data[data.length - 1].price = targetPrice;
        }
      }
      
      return data;
    };

    fetchHistoricalData();
  }, [timeRange, timeframe, symbol, currentPrice]);
  
  // Update chart when current price changes significantly (ensures chart reflects latest price)
  useEffect(() => {
    if (currentPrice > 0) {
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastPoint = prevData[prevData.length - 1];
        const priceDiff = Math.abs(lastPoint.price - currentPrice) / lastPoint.price;
        
        // If price difference is significant, update the chart
        if (priceDiff > 0.01) { // 1% threshold
          const updatedData = [...prevData];
          const newLastPoint = updatedData[updatedData.length - 1];
          newLastPoint.price = currentPrice;
          console.log(`Chart updated: price changed to ${currentPrice}`);
          return updatedData;
        }
        
        return prevData;
      });
    }
  }, [currentPrice]);

  // Debug log for chart data
  useEffect(() => {
    console.log('Chart data updated:', chartData);
    console.log('Chart data length:', chartData.length);
  }, [chartData]);

  // Update real-time price data from WebSocket or props
  useEffect(() => {
    if (realTimeStockData && isConnected) {
      const newPrice = realTimeStockData.price || currentPrice;
      const newChange = realTimeStockData.change || change;
      const newChangePercent = realTimeStockData.changePercent || changePercent;
      
      setRealTimePrice(newPrice);
      setRealTimeChange(newChange);
      setRealTimeChangePercent(newChangePercent);
      
      // Update chart with real-time data
      const effectiveRange = (timeRange ?? timeframe);
      if ((effectiveRange === '1D' || effectiveRange === '1H') && newPrice > 0) {
        setChartData(prevData => {
          if (prevData.length === 0) return prevData;
          
          const now = new Date();
          const updatedData = [...prevData];
          const lastPoint = updatedData[updatedData.length - 1];
          
          // Check if we should add a new point or update the existing one
          const timeDiff = now.getTime() - lastPoint.timestamp;
          const shouldAddNewPoint = timeDiff > 5 * 60 * 1000; // 5 minutes
          
          if (shouldAddNewPoint) {
            // Add new data point
            const newPoint: ChartDataPoint = {
              time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
              price: Number(newPrice.toFixed(2)),
              volume: realTimeStockData.volume || lastPoint.volume || 0,
              timestamp: now.getTime()
            };
            
            // Keep reasonable number of points (1 trading day = ~78 points at 5min intervals)
            const maxPoints = 78;
            return [...updatedData.slice(-(maxPoints-1)), newPoint];
          } else {
            // Update the last point with current price
            lastPoint.price = Number(newPrice.toFixed(2));
            lastPoint.timestamp = now.getTime(); // Update timestamp to current
            return updatedData;
          }
        });
      }
    } else {
      // Fallback to props when no WebSocket data
      setRealTimePrice(currentPrice);
      setRealTimeChange(change);
      setRealTimeChangePercent(changePercent);
    }
  }, [realTimeStockData, isConnected, timeRange, timeframe, currentPrice, change, changePercent]);

  // Cleanup intervals on unmount
  useEffect(() => {
    const currentInterval = intervalRef.current;
    return () => {
      if (currentInterval) {
        clearInterval(currentInterval);
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
  
  // Fix color logic - use green for positive, red for negative
  const chartColor = displayChange >= 0 ? '#10b981' : '#ef4444';
  const gradientId = `gradient-${symbol}`;

  // Calculate Y-axis domain with proper padding
  const calculateYDomain = () => {
    if (chartData.length === 0) return ['dataMin - 1', 'dataMax + 1'];
    
    const prices = chartData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const padding = range * 0.1; // 10% padding
    
    return [minPrice - padding, maxPrice + padding];
  };

  const formatXAxisTick = (ts: number) => {
    const d = new Date(ts);
    const effectiveRange = (timeRange ?? timeframe);
    if (effectiveRange === '1D' || effectiveRange === '1H') {
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipLabel = (ts: number) => {
    const d = new Date(ts);
    const effectiveRange = (timeRange ?? timeframe);
    if (effectiveRange === '1D' || effectiveRange === '1H') {
      return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
      });
    }
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

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

          {/* Time controls removed; external ChartSection controls timeframe */}
        </div>
        {/* Price info is displayed in parent component to avoid duplication */}
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
                  dataKey="timestamp" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(ts) => formatXAxisTick(Number(ts))}
                />
                <YAxis 
                  domain={calculateYDomain()}
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
                  labelFormatter={(label) => formatTooltipLabel(Number(label))}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor} 
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  fillOpacity={0.6}
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
                  dataKey="timestamp" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(ts) => formatXAxisTick(Number(ts))}
                />
                <YAxis 
                  domain={calculateYDomain()}
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
                  labelFormatter={(label) => formatTooltipLabel(Number(label))}
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
