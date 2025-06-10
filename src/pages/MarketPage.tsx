import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

// Mock data for demonstration
const mockIndices = [
  { symbol: 'S&P 500', name: 'S&P 500', value: 5200.12, change: 12.34 },
  { symbol: 'NASDAQ', name: 'NASDAQ', value: 16200.45, change: -45.67 },
  { symbol: 'DOW', name: 'Dow Jones', value: 39000.78, change: 89.12 },
];

const mockSectors = [
  { name: 'Technology', change: 1.2, price: 3200 },
  { name: 'Healthcare', change: -0.5, price: 2100 },
  { name: 'Semiconductors', change: 2.1, price: 1800 },
  { name: 'Financials', change: 0.8, price: 1800 },
  { name: 'Energy', change: -1.1, price: 900 },
  { name: 'Consumer Discretionary', change: 0.3, price: 1500 },
  { name: 'Industrials', change: 0.6, price: 1200 },
  { name: 'Utilities', change: -0.2, price: 800 },
  { name: 'Real Estate', change: 0.1, price: 700 },
  { name: 'Materials', change: -0.4, price: 600 },
  { name: 'Communication Services', change: 1.0, price: 1100 },
];

const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 190.12, change: 2.34, volume: 12000000 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 320.45, change: -1.67, volume: 9000000 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2800.78, change: 8.12, volume: 7000000 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3500.56, change: 12.45, volume: 8000000 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 700.23, change: -5.67, volume: 10000000 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 900.34, change: 15.89, volume: 6000000 },
  { symbol: 'META', name: 'Meta Platforms', price: 400.12, change: 3.21, volume: 5000000 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 160.45, change: 0.67, volume: 4000000 },
  { symbol: 'XOM', name: 'Exxon Mobil', price: 110.78, change: -2.12, volume: 3000000 },
  { symbol: 'UNH', name: 'UnitedHealth', price: 480.56, change: 4.45, volume: 2000000 },
];

const formatChange = (change: number) => (
  <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
    {change >= 0 ? '+' : ''}{change.toFixed(2)}
  </span>
);

const MarketPage: React.FC = () => {
  const [indices, setIndices] = useState(mockIndices);
  const [sectors, setSectors] = useState(mockSectors);
  const [stocks, setStocks] = useState(mockStocks);
  const [tab, setTab] = useState<'indices' | 'sectors' | 'stocks'>('indices');

  // Simulate data refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(indices => indices.map(idx => ({ ...idx, value: idx.value + (Math.random() - 0.5) * 20, change: (Math.random() - 0.5) * 20 })));
      setSectors(sectors => sectors.map(sec => ({ ...sec, change: (Math.random() - 0.5) * 2 })));
      setStocks(stocks => stocks.map(stock => ({ ...stock, price: stock.price + (Math.random() - 0.5) * 5, change: (Math.random() - 0.5) * 5 })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tab Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === 'indices' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setTab('indices')}
          >
            Indices
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === 'sectors' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setTab('sectors')}
          >
            Sectors
          </button>
          <button
            className={`px-4 py-2 rounded-full font-semibold transition-colors ${tab === 'stocks' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setTab('stocks')}
          >
            Stocks
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'indices' && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {indices.map(idx => (
              <Card key={idx.symbol} className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-blue-400" />
                    {idx.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{idx.value.toFixed(2)}</div>
                  <div className="text-sm mt-1">{formatChange(idx.change)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === 'sectors' && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  Sector Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {sectors.map(sec => (
                    <div key={sec.name} className="flex flex-col items-center">
                      <div className="font-semibold text-sm">{sec.name}</div>
                      <div className="text-lg font-bold">{formatChange(sec.change)}</div>
                      <div className="text-xs text-muted-foreground">${sec.price.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {tab === 'stocks' && (
          <div>
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Top Stocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {stocks.map(stock => (
                    <div
                      key={stock.symbol}
                      className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 flex flex-col items-center cursor-pointer"
                      onClick={() => window.location.href = `/stocks/${stock.symbol}`}
                      title={`Go to ${stock.symbol} details`}
                    >
                      <div className="font-bold text-lg">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground mb-1">{stock.name}</div>
                      <div className="text-xl font-semibold">${stock.price.toFixed(2)}</div>
                      <div className="text-sm">{formatChange(stock.change)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Vol: {(stock.volume / 1_000_000).toFixed(1)}M</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
