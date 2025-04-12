import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  RefreshCcw, 
  Calendar, 
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from 'lucide-react';
import { Stock } from '@/types';

interface PredictivePriceForecastingProps {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface ForecastData {
  timeframe: '1d' | '1w' | '1m';
  predictions: {
    timestamp: string;
    price: number;
    upperBound: number;
    lowerBound: number;
  }[];
  summary: {
    direction: 'up' | 'down' | 'sideways';
    confidenceScore: number;
    potentialUpside: number;
    potentialDownside: number;
    keyLevels: {
      support: number;
      resistance: number;
    };
  };
  lastUpdated: Date;
}

const PredictivePriceForecasting: React.FC<PredictivePriceForecastingProps> = ({ 
  symbol, 
  stock, 
  className 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'1d' | '1w' | '1m'>('1d');
  const [forecastData, setForecastData] = useState<Record<string, ForecastData>>({});
  
  const fetchForecastData = async () => {
    setIsLoading(true);
    
    // In a real app, this would fetch from an API
    setTimeout(() => {
      const mockData: Record<string, ForecastData> = {
        '1d': generateMockForecastData('1d', stock?.price || 150),
        '1w': generateMockForecastData('1w', stock?.price || 150),
        '1m': generateMockForecastData('1m', stock?.price || 150)
      };
      
      setForecastData(mockData);
      setIsLoading(false);
    }, 1200);
  };
  
  // Generate mock forecast data
  const generateMockForecastData = (timeframe: '1d' | '1w' | '1m', basePrice: number): ForecastData => {
    const baseDirection = Math.random() > 0.5 ? 'up' : 'down';
    const directionMultiplier = baseDirection === 'up' ? 1 : -1;
    const volatility = {
      '1d': 0.01, // 1%
      '1w': 0.03, // 3%
      '1m': 0.08, // 8%
    }[timeframe];
    
    const confidenceScore = Math.random() * 0.4 + 0.4; // 40-80%
    const dataPoints = {
      '1d': 12, // hourly
      '1w': 7,  // daily
      '1m': 30  // daily
    }[timeframe];
    
    const predictions = [];
    
    // Create prediction points
    for (let i = 0; i < dataPoints; i++) {
      const progress = i / dataPoints;
      // Price trends in the direction with some randomness
      const trendFactor = directionMultiplier * volatility * progress;
      const randomFactor = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + trendFactor + randomFactor);
      
      // Bounds widen over time
      const boundWidth = basePrice * volatility * (progress + 0.5) * (1 - confidenceScore);
      
      predictions.push({
        timestamp: getTimestampForPoint(timeframe, i),
        price,
        upperBound: price + boundWidth,
        lowerBound: price - boundWidth
      });
    }
    
    // Determine if it's sideways when the change is minimal
    const firstPrice = predictions[0].price;
    const lastPrice = predictions[predictions.length - 1].price;
    const priceChange = (lastPrice - firstPrice) / firstPrice;
    const direction = Math.abs(priceChange) < 0.01 ? 'sideways' : priceChange > 0 ? 'up' : 'down';
    
    return {
      timeframe,
      predictions,
      summary: {
        direction,
        confidenceScore,
        potentialUpside: predictions[predictions.length - 1].upperBound / basePrice - 1,
        potentialDownside: 1 - predictions[predictions.length - 1].lowerBound / basePrice,
        keyLevels: {
          support: basePrice * (1 - volatility * 1.2),
          resistance: basePrice * (1 + volatility * 1.2)
        }
      },
      lastUpdated: new Date()
    };
  };
  
  // Helper to generate realistic timestamps based on timeframe
  const getTimestampForPoint = (timeframe: string, index: number): string => {
    const date = new Date();
    
    if (timeframe === '1d') {
      // Hourly for 1d
      date.setHours(date.getHours() + index);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeframe === '1w') {
      // Daily for 1w
      date.setDate(date.getDate() + index);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
      // Daily for 1m
      date.setDate(date.getDate() + index);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  // Format the confidence level label
  const getConfidenceLabel = (score: number) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.5) return 'Medium';
    return 'Low';
  };
  
  useEffect(() => {
    if (symbol) {
      fetchForecastData();
    }
    
    const interval = setInterval(fetchForecastData, 900000); // refresh every 15 minutes
    return () => clearInterval(interval);
  }, [symbol, stock?.price]);
  
  const currentForecast = forecastData[timeframe];
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2" />
            AI Price Forecast
          </CardTitle>
          
          <div className="flex gap-1">
            <Button 
              variant={timeframe === '1d' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeframe('1d')} 
              className="h-7 px-2 text-xs"
            >
              1D
            </Button>
            <Button 
              variant={timeframe === '1w' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeframe('1w')} 
              className="h-7 px-2 text-xs"
            >
              1W
            </Button>
            <Button 
              variant={timeframe === '1m' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setTimeframe('1m')} 
              className="h-7 px-2 text-xs"
            >
              1M
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ) : currentForecast ? (
          <>
            <div className="h-[200px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentForecast.predictions}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLower" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10 }}
                    tickLine={{ stroke: '#555' }}
                    axisLine={{ stroke: '#555' }}
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    tickLine={{ stroke: '#555' }}
                    axisLine={{ stroke: '#555' }}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      borderColor: '#333',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="upperBound" 
                    stroke="none" 
                    fillOpacity={1}
                    fill="url(#colorUpper)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lowerBound" 
                    stroke="none" 
                    fillOpacity={1}
                    fill="url(#colorLower)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    dot={false} 
                    strokeWidth={2}
                  />
                  {stock?.price && (
                    <ReferenceLine 
                      y={stock.price} 
                      stroke="#666" 
                      strokeDasharray="3 3"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Direction:</span>
                <span className={cn(
                  "font-medium flex items-center",
                  currentForecast.summary.direction === 'up' ? "text-green-500" :
                  currentForecast.summary.direction === 'down' ? "text-red-500" :
                  "text-yellow-500"
                )}>
                  {currentForecast.summary.direction === 'up' && (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  )}
                  {currentForecast.summary.direction === 'down' && (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {currentForecast.summary.direction === 'sideways' && (
                    <span>⟷</span>
                  )}
                  {currentForecast.summary.direction.charAt(0).toUpperCase() + 
                    currentForecast.summary.direction.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confidence:</span>
                <span className="font-medium">
                  {getConfidenceLabel(currentForecast.summary.confidenceScore)} 
                  ({Math.round(currentForecast.summary.confidenceScore * 100)}%)
                </span>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Potential Upside</span>
                  <span className={cn(
                    "font-medium text-green-500",
                    currentForecast.summary.direction === 'down' && "text-muted-foreground"
                  )}>
                    +{(currentForecast.summary.potentialUpside * 100).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Potential Downside</span>
                  <span className={cn(
                    "font-medium text-red-500",
                    currentForecast.summary.direction === 'up' && "text-muted-foreground"
                  )}>
                    -{(currentForecast.summary.potentialDownside * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Support Level</span>
                  <span className="font-medium">{formatCurrency(currentForecast.summary.keyLevels.support)}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Resistance Level</span>
                  <span className="font-medium">{formatCurrency(currentForecast.summary.keyLevels.resistance)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs mt-3">
                <div className="text-muted-foreground">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  Last updated: {currentForecast.lastUpdated.toLocaleTimeString()}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={fetchForecastData}
                >
                  <RefreshCcw className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-sm flex items-start gap-2">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Forecasts are based on historical data and technical indicators. Past performance does not guarantee future results.</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">Unable to load forecast data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictivePriceForecasting;
