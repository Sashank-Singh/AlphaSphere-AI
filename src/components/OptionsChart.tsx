
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, Percent } from 'lucide-react';

interface OptionsPriceData {
  strike: number;
  callPrice: number;
  putPrice: number;
  callIV: number;
  putIV: number;
  callDelta: number;
  putDelta: number;
}

interface OptionsChartProps {
  symbol: string;
  underlyingPrice: number;
  expiryDate: string;
  chartType?: 'payoff' | 'iv' | 'greeks';
}

const OptionsChart: React.FC<OptionsChartProps> = ({
  symbol,
  underlyingPrice,
  expiryDate,
  chartType = 'payoff'
}) => {
  const [data, setData] = useState<OptionsPriceData[]>([]);
  const [selectedChart, setSelectedChart] = useState<'payoff' | 'iv' | 'greeks'>(chartType);

  useEffect(() => {
    // Generate mock options data around the current stock price
    const generateOptionsData = () => {
      const strikes: OptionsPriceData[] = [];
      const numStrikes = 11;
      const strikeRange = underlyingPrice * 0.2; // 20% range around current price
      
      for (let i = 0; i < numStrikes; i++) {
        const strike = underlyingPrice - strikeRange + (i * (2 * strikeRange) / (numStrikes - 1));
        const moneyness = strike / underlyingPrice;
        
        // Mock option pricing (simplified Black-Scholes-like)
        const timeToExpiry = 0.25; // ~3 months
        const riskFreeRate = 0.05;
        const volatility = 0.25;
        
        const d1 = (Math.log(underlyingPrice / strike) + (riskFreeRate + 0.5 * volatility ** 2) * timeToExpiry) / 
                   (volatility * Math.sqrt(timeToExpiry));
        const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
        
        // Simplified call price calculation
        const callIntrinsic = Math.max(underlyingPrice - strike, 0);
        const putIntrinsic = Math.max(strike - underlyingPrice, 0);
        
        const callPrice = callIntrinsic + Math.max(0, 5 - Math.abs(moneyness - 1) * 20);
        const putPrice = putIntrinsic + Math.max(0, 5 - Math.abs(moneyness - 1) * 20);
        
        // Mock IV smile
        const ivSkew = Math.abs(moneyness - 1) * 0.1;
        const callIV = (volatility + ivSkew) * 100;
        const putIV = (volatility + ivSkew + 0.02) * 100; // Put skew
        
        // Mock Greeks
        const callDelta = moneyness > 1 ? 0.7 : moneyness > 0.9 ? 0.5 : 0.2;
        const putDelta = -(1 - callDelta);
        
        strikes.push({
          strike: Number(strike.toFixed(0)),
          callPrice: Number(callPrice.toFixed(2)),
          putPrice: Number(putPrice.toFixed(2)),
          callIV: Number(callIV.toFixed(1)),
          putIV: Number(putIV.toFixed(1)),
          callDelta: Number(callDelta.toFixed(2)),
          putDelta: Number(putDelta.toFixed(2))
        });
      }
      
      setData(strikes);
    };

    generateOptionsData();
  }, [underlyingPrice, expiryDate]);

  const renderChart = () => {
    switch (selectedChart) {
      case 'payoff':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="putGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="strike" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toFixed(2)}`,
                  name === 'callPrice' ? 'Call Price' : 'Put Price'
                ]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="callPrice" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#callGradient)"
                name="Call Options"
              />
              <Area 
                type="monotone" 
                dataKey="putPrice" 
                stroke="#ef4444" 
                strokeWidth={2}
                fill="url(#putGradient)"
                name="Put Options"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'iv':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="strike" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name === 'callIV' ? 'Call IV' : 'Put IV'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="callIV" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Call IV"
              />
              <Line 
                type="monotone" 
                dataKey="putIV" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Put IV"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'greeks':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="strike" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
                formatter={(value: number, name: string) => [
                  value.toFixed(2),
                  name === 'callDelta' ? 'Call Delta' : 'Put Delta'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="callDelta" 
                stroke="#06b6d4" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Call Delta"
              />
              <Line 
                type="monotone" 
                dataKey="putDelta" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Put Delta"
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Percent className="h-5 w-5 mr-2 text-primary" />
            Options Analytics - {symbol}
          </CardTitle>
          <Badge variant="outline">
            Exp: {new Date(expiryDate).toLocaleDateString()}
          </Badge>
        </div>
        <div className="flex space-x-2 mt-2">
          <Button
            variant={selectedChart === 'payoff' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('payoff')}
          >
            Option Prices
          </Button>
          <Button
            variant={selectedChart === 'iv' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('iv')}
          >
            IV Smile
          </Button>
          <Button
            variant={selectedChart === 'greeks' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('greeks')}
          >
            Greeks
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {renderChart()}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionsChart;
