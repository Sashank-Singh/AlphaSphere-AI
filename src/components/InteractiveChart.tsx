import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Area, AreaChart, Brush, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Move, Crosshair, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stockDataService, StockQuote } from '@/lib/stockDataService';

interface ChartDataPoint {
  time: string;
  price: number;
  volume?: number;
  timestamp: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

interface InteractiveChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  chartType?: 'line' | 'area' | 'candlestick';
  height?: number;
  showVolume?: boolean;
  showCrosshair?: boolean;
  enableZoom?: boolean;
  enablePan?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  className?: string;
  enableRealTimeUpdates?: boolean;
  updateInterval?: number;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  data,
  symbol,
  currentPrice,
  change = 0,
  changePercent = 0,
  chartType = 'area',
  height = 400,
  showVolume = false,
  showCrosshair = true,
  enableZoom = true,
  enablePan = true,
  showGrid = true,
  showLegend = false,
  className,
  enableRealTimeUpdates = false,
  updateInterval = 5000
}) => {
  const [zoomDomain, setZoomDomain] = useState<{ left?: number; right?: number }>({});
  const [crosshairData, setCrosshairData] = useState<ChartDataPoint | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all');
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 0, height: 0 });
  
  // Real-time data state
  const [chartData, setChartData] = useState<ChartDataPoint[]>(data);
  const [realTimePrice, setRealTimePrice] = useState<number | undefined>(currentPrice);
  const [realTimeChange, setRealTimeChange] = useState<number>(change);
  const [realTimeChangePercent, setRealTimeChangePercent] = useState<number>(changePercent);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Update chart dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        const { width, height } = chartRef.current.getBoundingClientRect();
        setChartDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Initialize chart data from props
  useEffect(() => {
    setChartData(data);
  }, [data]);
  
  // Subscribe to real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !symbol) return;
    
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      try {
        // Subscribe to real-time updates
        unsubscribe = stockDataService.subscribe(symbol, (quote: StockQuote) => {
          setIsConnected(true);
          setRealTimePrice(quote.price);
          setRealTimeChange(quote.change);
          setRealTimeChangePercent(quote.changePercent);
          
          // Add new data point to chart
          setChartData(prevData => {
            const now = new Date();
            const newPoint: ChartDataPoint = {
              time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              price: quote.price,
              volume: quote.volume,
              timestamp: now.getTime(),
              high: quote.high,
              low: quote.low,
              open: quote.open,
              close: quote.price
            };
            
            // Keep a reasonable number of points (e.g., last 100)
            const updatedData = [...prevData, newPoint].slice(-100);
            return updatedData;
          });
        });
      } catch (error) {
        console.error(`Error setting up real-time updates for ${symbol}:`, error);
        setIsConnected(false);
      }
    };
    
    setupSubscription();
    
    // Cleanup subscription on unmount or when symbol changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [symbol, enableRealTimeUpdates]);

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (selectedTimeRange === 'all') return chartData;
    
    const now = Date.now();
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1m': 30 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - timeRanges[selectedTimeRange as keyof typeof timeRanges];
    return chartData.filter(point => point.timestamp >= cutoff);
  }, [chartData, selectedTimeRange]);

  // Calculate volatility function
  const calculateVolatility = (prices: number[]) => {
    if (prices.length < 2) return 0;
    const returns = prices.slice(1).map((price, i) => Math.log(price / prices[i]));
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized volatility
  };

  // Calculate price statistics
  const priceStats = React.useMemo(() => {
    if (!filteredData.length) return null;
    
    const prices = filteredData.map(d => d.price);
    const volumes = filteredData.map(d => d.volume || 0);
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      totalVolume: volumes.reduce((a, b) => a + b, 0),
      volatility: calculateVolatility(prices)
    };
  }, [filteredData]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string; payload: ChartDataPoint }>; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const priceChange = currentPrice && data.price ? ((data.price - currentPrice) / currentPrice * 100) : 0;

    return (
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
        <div className="text-sm font-medium text-gray-200 mb-2">{label}</div>
        <div className="space-y-1">
          <div className="flex justify-between items-center gap-4">
            <span className="text-gray-400">Price:</span>
            <span className="font-mono text-white">${data.price?.toFixed(2)}</span>
          </div>
          {data.volume && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400">Volume:</span>
              <span className="font-mono text-white">{data.volume.toLocaleString()}</span>
            </div>
          )}
          {data.high && data.low && (
            <>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400">High:</span>
                <span className="font-mono text-green-400">${data.high.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center gap-4">
                <span className="text-gray-400">Low:</span>
                <span className="font-mono text-red-400">${data.low.toFixed(2)}</span>
              </div>
            </>
          )}
          {Math.abs(priceChange) > 0.01 && (
            <div className="flex justify-between items-center gap-4">
              <span className="text-gray-400">Change:</span>
              <span className={`font-mono ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Custom crosshair cursor
  const CustomCursor = ({ points, width, height }: { points?: Array<{ x: number; y: number }>; width?: number; height?: number }) => {
    if (!showCrosshair || !points || !points.length) return null;
    
    const { x, y } = points[0];
    
    return (
      <g>
        <line
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#6b7280"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <line
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#6b7280"
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <circle
          cx={x}
          cy={y}
          r={4}
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth={2}
        />
      </g>
    );
  };

  // Handle zoom reset
  const handleZoomReset = () => {
    setZoomDomain({});
  };

  // Handle mouse events for crosshair
  const handleMouseMove = useCallback((e: { activePayload?: Array<{ payload: ChartDataPoint }> }) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      setCrosshairData(e.activePayload[0].payload);
      setIsHovering(true);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCrosshairData(null);
    setIsHovering(false);
  }, []);

  // Render the appropriate chart type
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const xAxisProps = {
      dataKey: 'time',
      axisLine: false,
      tickLine: false,
      tick: { fontSize: 12, fill: '#9ca3af' }
    };

    const yAxisProps = {
      axisLine: false,
      tickLine: false,
      tick: { fontSize: 12, fill: '#9ca3af' },
      tickFormatter: (value: number) => `$${value.toFixed(2)}`,
      domain: ['dataMin - 1', 'dataMax + 1']
    };

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={displayChange >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={displayChange >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />}
          <XAxis {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
          {showLegend && <Legend />}
          <Area
            type="monotone"
            dataKey="price"
            stroke={displayChange >= 0 ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#priceGradient)"
            name="Price"
            connectNulls
          />
          {displayPrice && (
            <ReferenceLine
              y={displayPrice}
              stroke="#6366f1"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{ value: `Current: $${displayPrice.toFixed(2)}`, position: 'right' }}
            />
          )}
          {enableZoom && (
            <Brush
              dataKey="time"
              height={30}
              stroke="#6366f1"
              fill="#1e40af"
              fillOpacity={0.1}
            />
          )}
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />}
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={<CustomTooltip />} cursor={<CustomCursor />} />
        {showLegend && <Legend />}
        <Line
          type="monotone"
          dataKey="price"
          stroke={displayChange >= 0 ? "#10b981" : "#ef4444"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, stroke: displayChange >= 0 ? "#10b981" : "#ef4444", strokeWidth: 2 }}
          name="Price"
          connectNulls
        />
        {displayPrice && (
          <ReferenceLine
            y={displayPrice}
            stroke="#6366f1"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{ value: `Current: $${displayPrice.toFixed(2)}`, position: 'right' }}
          />
        )}
        {enableZoom && (
          <Brush
            dataKey="time"
            height={30}
            stroke="#6366f1"
            fill="#1e40af"
            fillOpacity={0.1}
          />
        )}
      </LineChart>
    );
  };

  // Use real-time data if available, otherwise fall back to props
  const displayPrice = enableRealTimeUpdates ? realTimePrice : currentPrice;
  const displayChange = enableRealTimeUpdates ? realTimeChange : change;
  const displayChangePercent = enableRealTimeUpdates ? realTimeChangePercent : changePercent;
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg font-semibold">{symbol} Interactive Chart</CardTitle>
            {enableRealTimeUpdates && isConnected && (
              <div className="flex items-center text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                <div className="w-2 h-2 rounded-full mr-1 bg-green-500 animate-pulse"></div>
                Live
              </div>
            )}
            {displayPrice && (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
                <Badge variant={displayChange >= 0 ? "default" : "destructive"} className="flex items-center gap-1">
                  {displayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {displayChange >= 0 ? '+' : ''}{displayChangePercent.toFixed(2)}%
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Time range selector */}
            <div className="flex items-center gap-1 mr-4">
              {['1h', '4h', '1d', '1w', '1m', 'all'].map((range) => (
                <Button
                  key={range}
                  variant={selectedTimeRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeRange(range)}
                  className="h-7 px-2 text-xs"
                >
                  {range.toUpperCase()}
                </Button>
              ))}
            </div>
            
            {/* Chart controls */}
            {enableZoom && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomReset}
                className="h-8 w-8 p-0"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Price statistics */}
        {priceStats && (
          <div className="flex items-center gap-6 text-sm text-gray-500 mt-2">
            <div>High: <span className="text-green-400 font-mono">${priceStats.max.toFixed(2)}</span></div>
            <div>Low: <span className="text-red-400 font-mono">${priceStats.min.toFixed(2)}</span></div>
            <div>Avg: <span className="text-gray-300 font-mono">${priceStats.avg.toFixed(2)}</span></div>
            <div>Vol: <span className="text-blue-400 font-mono">{priceStats.totalVolume.toLocaleString()}</span></div>
            <div>Volatility: <span className="text-yellow-400 font-mono">{priceStats.volatility.toFixed(2)}%</span></div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: `${height}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        {/* Crosshair data display */}
        {isHovering && crosshairData && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-blue-400" />
                <span className="text-gray-400">Crosshair Data:</span>
              </div>
              <div className="text-white font-mono">{crosshairData.time}</div>
              <div className="text-white font-mono">${crosshairData.price.toFixed(2)}</div>
              {crosshairData.volume && (
                <div className="text-gray-300 font-mono">Vol: {crosshairData.volume.toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InteractiveChart;