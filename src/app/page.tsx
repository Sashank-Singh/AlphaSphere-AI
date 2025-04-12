import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Search, TrendingUp, LineChart, BarChart4 } from 'lucide-react';

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
  { symbol: 'META', name: 'Meta Platforms, Inc.' },
  { symbol: 'NFLX', name: 'Netflix, Inc.' }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/20 to-black/80"></div>
        <div className="absolute inset-0 z-0 bg-[url('/stock-bg.jpg')] bg-cover bg-center opacity-30"></div>
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Real-Time Stock Analysis with AI Insights
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Track stocks, analyze options, and get AI-powered trading recommendations
              all in one powerful platform.
            </p>
            
            {/* Search Box */}
            <div className="relative max-w-md mx-auto">
              <StockSearch />
            </div>
            
            {/* Popular Stocks */}
            <div className="mt-10">
              <h2 className="text-lg font-medium mb-4">Popular Stocks</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularStocks.map((stock) => (
                  <Link href={`/stocks/${stock.symbol}`} key={stock.symbol}>
                    <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 transition-colors duration-200">
                      <CardContent className="p-4">
                        <div className="font-bold">{stock.symbol}</div>
                        <div className="text-sm text-gray-400 truncate">{stock.name}</div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Powerful Trading Tools</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Real-Time Analysis" 
              description="Get up-to-the-second stock data with live refreshing charts and indicators"
              icon={<LineChart className="w-10 h-10 text-blue-400" />}
            />
            <FeatureCard 
              title="Options Trading" 
              description="Analyze options chains with profit/loss calculations and position tracking"
              icon={<BarChart4 className="w-10 h-10 text-green-400" />}
            />
            <FeatureCard 
              title="AI Insights" 
              description="Leverage artificial intelligence for predictive analysis and trading recommendations"
              icon={<TrendingUp className="w-10 h-10 text-purple-400" />}
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Powered by Yahoo Finance and TradingView</p>
          <p className="mt-2">All market data is provided for informational purposes only</p>
        </div>
      </footer>
    </div>
  );
}

// Stock Search Component
function StockSearch() {
  const [search, setSearch] = useState('');
  
  // Simple client-side form handling
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/stocks/${search.trim().toUpperCase()}`;
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Enter stock symbol (e.g. AAPL)"
          className="pl-9 bg-gray-900/70 border-gray-700 focus:border-blue-500 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Button type="submit">
        Analyze <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

// Feature Card Component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-gray-800/50 border-gray-700 h-full">
      <CardContent className="p-6 flex flex-col items-center text-center h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </CardContent>
    </Card>
  );
}
