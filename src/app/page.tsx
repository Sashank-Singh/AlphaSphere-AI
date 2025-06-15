
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Search, TrendingUp, TrendingDown, BarChart3, Activity, DollarSign, Users, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mock real-time market data
const marketIndices = [
  { symbol: 'S&P 500', value: 5234.18, change: 15.42, changePercent: 0.30 },
  { symbol: 'NASDAQ', value: 16441.83, change: -23.67, changePercent: -0.14 },
  { symbol: 'DOW', value: 39127.80, change: 89.33, changePercent: 0.23 },
  { symbol: 'VIX', value: 12.84, change: -0.67, changePercent: -4.96 }
];

const topMovers = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 892.45, change: 24.12, changePercent: 2.78, volume: '45.2M' },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 248.73, change: -8.94, changePercent: -3.47, volume: '89.1M' },
  { symbol: 'AAPL', name: 'Apple Inc', price: 192.53, change: 3.21, changePercent: 1.69, volume: '52.3M' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 421.08, change: 5.67, changePercent: 1.37, volume: '28.7M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 175.64, change: -2.34, changePercent: -1.31, volume: '31.4M' },
  { symbol: 'META', name: 'Meta Platforms', price: 518.27, change: 12.45, changePercent: 2.46, volume: '19.8M' }
];

const marketNews = [
  { id: 1, headline: 'Federal Reserve Signals Potential Rate Cut in December', time: '2 mins ago', impact: 'bullish' },
  { id: 2, headline: 'Tech Stocks Rally on AI Breakthrough Announcements', time: '8 mins ago', impact: 'bullish' },
  { id: 3, headline: 'Oil Prices Drop 3% on Oversupply Concerns', time: '15 mins ago', impact: 'bearish' },
  { id: 4, headline: 'Semiconductor Sector Shows Strong Q4 Guidance', time: '1 hour ago', impact: 'bullish' }
];

const sectorPerformance = [
  { name: 'Technology', change: 1.34, color: 'text-green-500' },
  { name: 'Healthcare', change: 0.87, color: 'text-green-500' },
  { name: 'Financials', change: 0.45, color: 'text-green-500' },
  { name: 'Energy', change: -1.23, color: 'text-red-500' },
  { name: 'Consumer Disc.', change: -0.56, color: 'text-red-500' },
  { name: 'Utilities', change: 0.12, color: 'text-green-500' }
];

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <BarChart3 className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AlphaSphere
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/market" className="text-gray-300 hover:text-white transition-colors">Markets</Link>
                <Link to="/trading" className="text-gray-300 hover:text-white transition-colors">Trading</Link>
                <Link to="/options" className="text-gray-300 hover:text-white transition-colors">Options</Link>
                <Link to="/portfolio" className="text-gray-300 hover:text-white transition-colors">Portfolio</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                Market: <span className="text-green-400 font-medium">OPEN</span> • {currentTime.toLocaleTimeString()}
              </div>
              <Link to="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Market Data */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Market Indices */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {marketIndices.map((index) => (
              <Card key={index.symbol} className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-400 mb-1">{index.symbol}</div>
                  <div className="text-lg font-bold text-white">{index.value.toLocaleString()}</div>
                  <div className="text-sm">
                    {formatChange(index.change, index.changePercent)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                AI-Powered Trading
              </span>
              <br />
              <span className="text-white">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Real-time market data, AI insights, and advanced analytics. 
              Trade smarter with institutional-grade tools.
            </p>
            
            {/* Search Box */}
            <div className="max-w-md mx-auto mb-8">
              <StockSearch />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">10M+</div>
                <div className="text-sm text-gray-400">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">50K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Dashboard */}
      <section className="py-12 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Movers */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-700 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Top Movers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topMovers.map((stock) => (
                      <Link 
                        key={stock.symbol} 
                        to={`/stocks/${stock.symbol}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-slate-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-bold text-white">{stock.symbol}</div>
                            <div className="text-sm text-gray-400">{stock.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">${stock.price}</div>
                          <div className="text-sm">
                            {formatChange(stock.change, stock.changePercent)}
                          </div>
                          <div className="text-xs text-gray-500">Vol: {stock.volume}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sector Performance & News */}
            <div className="space-y-6">
              {/* Sector Performance */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Sector Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectorPerformance.map((sector) => (
                      <div key={sector.name} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{sector.name}</span>
                        <span className={`text-sm font-medium ${sector.color}`}>
                          {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market News */}
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-400" />
                    Market News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {marketNews.map((news) => (
                      <div key={news.id} className="border-l-2 border-slate-600 pl-3">
                        <div className="text-sm text-white font-medium mb-1">
                          {news.headline}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">{news.time}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            news.impact === 'bullish' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {news.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose AlphaSphere?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="AI-Powered Analysis" 
              description="Advanced machine learning algorithms analyze market patterns and provide actionable insights in real-time"
              icon={<BarChart3 className="w-8 h-8 text-blue-400" />}
            />
            <FeatureCard 
              title="Real-Time Data" 
              description="Live market data from major exchanges with sub-second latency for lightning-fast trading decisions"
              icon={<Activity className="w-8 h-8 text-green-400" />}
            />
            <FeatureCard 
              title="Options Analytics" 
              description="Comprehensive options flow analysis, volatility tracking, and strategy optimization tools"
              icon={<TrendingUp className="w-8 h-8 text-purple-400" />}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p className="mb-2">© 2024 AlphaSphere AI. All rights reserved.</p>
          <p>Market data provided by leading financial exchanges. Trading involves risk.</p>
        </div>
      </footer>
    </div>
  );
}

// Stock Search Component
function StockSearch() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stocks/${search.trim().toUpperCase()}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search stocks, ETFs, options..."
          className="pl-9 bg-slate-800/50 border-slate-600 focus:border-blue-500 text-white placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}

// Feature Card Component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-slate-900/50 border-slate-700 h-full hover:bg-slate-900/70 transition-colors">
      <CardContent className="p-6 flex flex-col items-center text-center h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
