
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Search, TrendingUp, LineChart, BarChart4, Brain, Shield, Zap } from 'lucide-react';

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla, Inc.' },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/stocks/${search.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black text-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">AlphaSphere</div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/auth')} className="text-white border-white hover:bg-white hover:text-black">
            Log In
          </Button>
          <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Trade Smarter with AI
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Real-time market analysis, AI-powered insights, and advanced trading tools all in one platform
        </p>
        
        {/* Search Box */}
        <form onSubmit={handleSubmit} className="flex max-w-md mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search stocks (e.g. AAPL)"
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="ml-2">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/market')} className="text-white border-white hover:bg-white hover:text-black text-lg px-8 py-3">
            Explore Markets
          </Button>
        </div>

        {/* Popular Stocks */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold mb-6">Popular Stocks</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularStocks.map((stock) => (
              <Card key={stock.symbol} className="bg-gray-800/30 border-gray-700 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer" onClick={() => navigate(`/stocks/${stock.symbol}`)}>
                <CardContent className="p-4 text-center">
                  <div className="font-bold text-blue-400">{stock.symbol}</div>
                  <div className="text-xs text-gray-400 mt-1">{stock.name.split(' ')[0]}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose AlphaSphere?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              title="AI-Powered Analysis" 
              description="Get intelligent market insights and trading recommendations powered by advanced AI algorithms"
              icon={<Brain className="w-12 h-12 text-purple-400" />}
            />
            <FeatureCard 
              title="Real-Time Data" 
              description="Access live market data with instant updates and real-time price movements"
              icon={<Zap className="w-12 h-12 text-yellow-400" />}
            />
            <FeatureCard 
              title="Advanced Charts" 
              description="Professional-grade charting tools with technical indicators and analysis features"
              icon={<LineChart className="w-12 h-12 text-green-400" />}
            />
            <FeatureCard 
              title="Options Trading" 
              description="Comprehensive options analysis with profit/loss calculations and strategy builders"
              icon={<BarChart4 className="w-12 h-12 text-blue-400" />}
            />
            <FeatureCard 
              title="Portfolio Management" 
              description="Track your investments with detailed analytics and performance metrics"
              icon={<TrendingUp className="w-12 h-12 text-cyan-400" />}
            />
            <FeatureCard 
              title="Secure Trading" 
              description="Bank-level security with encrypted transactions and secure data protection"
              icon={<Shield className="w-12 h-12 text-red-400" />}
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Try Our Demo</h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience the power of AlphaSphere with our interactive demo
          </p>
          <Button size="lg" onClick={() => navigate('/dashboard')} className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
            Launch Demo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900/50 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center">
          <div className="text-2xl font-bold mb-4">AlphaSphere</div>
          <p className="text-gray-400 mb-4">Advanced AI-powered trading platform</p>
          <p className="text-sm text-gray-500">
            © 2024 AlphaSphere. All rights reserved. Market data provided for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-gray-800/30 border-gray-700 h-full hover:bg-gray-700/30 transition-all duration-200">
      <CardContent className="p-8 flex flex-col items-center text-center h-full">
        <div className="mb-6">{icon}</div>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

export default HomePage;
