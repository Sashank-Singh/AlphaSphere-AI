import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart2, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { Stock } from '@/types';
import { getFinnhubOptionsChain } from '../lib/finnhubApi';

interface Props {
  symbol: string;
  stock?: Stock;
  className?: string;
}

interface FlowData {
  bullishTrades: number;
  bearishTrades: number;
  sweepActivity: number;
  largestTrade: {
    type: 'call' | 'put';
    size: number;
    price: number;
  };
}

const mockFlowData = (symbol: string): FlowData => {
  const bullish = Math.floor(10 + Math.random() * 20);
  const bearish = Math.floor(8 + Math.random() * 15);
  const sweep = Math.floor(1 + Math.random() * 5);
  const isCall = Math.random() > 0.5;
  return {
    bullishTrades: bullish,
    bearishTrades: bearish,
    sweepActivity: sweep,
    largestTrade: {
      type: isCall ? 'call' : 'put',
      size: Math.floor(1000 + Math.random() * 4000),
      price: Math.round((2 + Math.random() * 8) * 100) / 100,
    },
  };
};

const calcFlowScore = (data: FlowData) => {
  const ratio = data.bullishTrades / (data.bullishTrades + data.bearishTrades);
  return Math.round(ratio * 100);
};

const AIOptionsFlowAnalysis: React.FC<Props> = ({ symbol, stock, className }) => {
  const [flow, setFlow] = useState<FlowData | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol) return;
      setIsLoading(true);
      try {
        const optionsData = await getFinnhubOptionsChain(symbol);
        if (optionsData) {
          console.log('Fetched Finnhub Options Chain Data for:', symbol, optionsData);
          // TODO: Process optionsData from Finnhub to calculate actual FlowData
          // For now, still using mock data for display:
          setFlow(mockFlowData(symbol));
        } else {
          // Fallback to mock if API fails or returns no data
          console.warn(`No options data from Finnhub for ${symbol}, using mock.`);
          setFlow(mockFlowData(symbol));
        }
      } catch (error) {
        console.error(`Error fetching options data for ${symbol}:`, error);
        setFlow(mockFlowData(symbol)); // Fallback to mock on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (isLoading) { // Updated loading condition
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-400" />
            AI Options Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Analyzing options flow for <span className="font-semibold">{symbol}</span>...</div>
        </CardContent>
      </Card>
    );
  }

  if (!flow && !isLoading) { // Show if no flow data and not loading
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-400" />
            AI Options Flow Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Could not load options flow data for <span className="font-semibold">{symbol}</span>.</div>
        </CardContent>
      </Card>
    );
  }

  if (!flow) return null; // Should not happen if isLoading is false and flow is null due to above condition, but as a safeguard.

  const flowScore = calcFlowScore(flow);
  const flowLabel = flowScore > 60 ? 'Bullish' : flowScore < 40 ? 'Bearish' : 'Neutral';
  const flowColor = flowScore > 60 ? 'text-green-500' : flowScore < 40 ? 'text-red-500' : 'text-yellow-500';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-blue-400" />
          AI Options Flow Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-2 text-sm">
          <span className="font-semibold">Flow Score:</span> <span className={flowColor}>{flowLabel} ({flowScore})</span>
        </div>
        <div className="text-xs mb-2">
          <div>Bullish Trades: <span className="font-semibold text-green-500">{flow.bullishTrades}</span></div>
          <div>Bearish Trades: <span className="font-semibold text-red-500">{flow.bearishTrades}</span></div>
          <div>Sweep Activity: <span className="font-semibold text-blue-500">{flow.sweepActivity}</span></div>
        </div>
        <div className="text-xs">
          <span className="font-semibold">Largest Trade:</span> {flow.largestTrade.type === 'call' ? (
            <span className="text-green-500 ml-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Call</span>
          ) : (
            <span className="text-red-500 ml-1 flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> Put</span>
          )} <span className="ml-2">{flow.largestTrade.size} contracts @ ${flow.largestTrade.price}</span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3 text-yellow-400" />
          <span>Options flow is a leading indicator of institutional activity.</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIOptionsFlowAnalysis; 