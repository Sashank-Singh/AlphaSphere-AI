
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChartData {
  date: string;
  price: number;
}

// Generate mock chart data
const generateChartData = (days: number, startPrice: number, volatility: number): ChartData[] => {
  let currentPrice = startPrice;
  const data: ChartData[] = [];
  
  // Generate date for past days
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Random price movement
    const change = (Math.random() - 0.5) * volatility;
    currentPrice = Math.max(0.01, currentPrice * (1 + change));
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  return data;
}

interface StockPriceChartProps {
  ticker: string;
  currentPrice: number;
  className?: string;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({ ticker, currentPrice, className }) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');
  
  // Generate different datasets based on time range
  let chartData: ChartData[] = [];
  let volatility = 0.01;
  
  switch (timeRange) {
    case '1D':
      // 1-day is hourly data
      chartData = Array.from({ length: 7 }, (_, i) => {
        const hour = 9 + i;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hourDisplay = hour > 12 ? hour - 12 : hour;
        return {
          date: `${hourDisplay}${ampm}`,
          price: parseFloat((currentPrice * (0.98 + Math.random() * 0.04)).toFixed(2))
        };
      });
      break;
    case '1W':
      chartData = generateChartData(7, currentPrice * 0.95, 0.02);
      break;
    case '1M':
      chartData = generateChartData(30, currentPrice * 0.9, 0.03);
      break;
    case '3M':
      chartData = generateChartData(90, currentPrice * 0.8, 0.04);
      break;
    case '1Y':
      chartData = generateChartData(365, currentPrice * 0.7, 0.05);
      break;
  }
  
  // Determine if price went up or down for color
  const startPrice = chartData[0]?.price || 0;
  const endPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = endPrice - startPrice;
  const priceChangeColor = priceChange >= 0 ? '#00C805' : '#FF5000';
  
  return (
    <div className={cn("flex flex-col w-full h-72", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            minTickGap={10}
          />
          <YAxis 
            domain={['dataMin', 'dataMax']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10 }}
            width={40}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value.toFixed(2)}`, ticker]}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ 
              backgroundColor: '#171717', 
              borderColor: '#333',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            itemStyle={{ color: priceChangeColor }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={priceChangeColor} 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="flex justify-between mt-4 gap-2">
        {(['1D', '1W', '1M', '3M', '1Y'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
            className={cn(
              "flex-1 text-xs py-1 h-8",
              timeRange === range && "bg-primary text-primary-foreground"
            )}
          >
            {range}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StockPriceChart;
