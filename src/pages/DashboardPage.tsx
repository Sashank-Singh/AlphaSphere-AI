import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart2,
  PieChart,
  RefreshCcw,
  Plus,
  Bell,
  Settings,
  ChevronDown,
  Maximize2,
  Sparkles
} from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [timeRange, setTimeRange] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate portfolio metrics
  const stockValue = portfolio.positions.reduce(
    (sum, position) => sum + (position.quantity * position.currentPrice),
    0
  );
  
  const optionsValue = portfolio.optionPositions.reduce(
    (sum, option) => sum + ((option.quantity || 0) * option.premium * 100),
    0
  );

  const totalValue = portfolio.cash + stockValue + optionsValue;
  
  // Calculate asset distribution
  const distribution = {
    stocks: (stockValue / totalValue) * 100,
    options: (optionsValue / totalValue) * 100,
    cash: (portfolio.cash / totalValue) * 100
  };

  // Mock historical data
  const historicalData = [
    { date: '2023-01', value: totalValue * 0.85 },
    { date: '2023-02', value: totalValue * 0.88 },
    { date: '2023-03', value: totalValue * 0.92 },
    { date: '2023-04', value: totalValue * 0.89 },
    { date: '2023-05', value: totalValue * 0.95 },
    { date: '2023-06', value: totalValue * 0.97 },
    { date: '2023-07', value: totalValue * 0.94 },
    { date: '2023-08', value: totalValue * 0.98 },
    { date: '2023-09', value: totalValue * 1.02 },
    { date: '2023-10', value: totalValue * 0.99 },
    { date: '2023-11', value: totalValue * 1.05 },
    { date: '2023-12', value: totalValue }
  ];

  // Mock profit data
  const profitData = [
    { month: 'Jan', stocks: 2500, options: 1200 },
    { month: 'Feb', stocks: 3200, options: 1800 },
    { month: 'Mar', stocks: 2800, options: 1500 },
    { month: 'Apr', stocks: 3800, options: 2200 },
    { month: 'May', stocks: 3100, options: 1900 },
    { month: 'Jun', stocks: 4200, options: 2500 }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigate('/search')} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Trade Asset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Value Card */}
        <Card className="col-span-full lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <h2 className="text-3xl font-bold">{formatCurrency(totalValue)}</h2>
              </div>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center text-green-500">
                <ArrowUpRight className="h-4 w-4" />
                +2.5%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Asset Distribution Card */}
        <Card className="col-span-full lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Asset Distribution</h3>
              <Button variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Stocks</span>
                  <span className="text-sm font-medium">{formatCurrency(stockValue)}</span>
                </div>
                <Progress value={distribution.stocks} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Options</span>
                  <span className="text-sm font-medium">{formatCurrency(optionsValue)}</span>
                </div>
                <Progress value={distribution.options} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Cash</span>
                  <span className="text-sm font-medium">{formatCurrency(portfolio.cash)}</span>
                </div>
                <Progress value={distribution.cash} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Chart */}
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Portfolio Performance</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  1D
                </Button>
                <Button variant="outline" size="sm">
                  1W
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/10">
                  1M
                </Button>
                <Button variant="outline" size="sm">
                  1Y
                </Button>
                <Button variant="outline" size="sm">
                  ALL
                </Button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit/Loss Chart */}
        <Card className="col-span-full lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold">Profit/Loss Analysis</h3>
              <Button variant="outline" size="sm">
                <BarChart2 className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="stocks" fill="#8884d8" />
                  <Bar dataKey="options" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Advisor Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Sphere Ai</h3>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm">Based on your portfolio performance, consider increasing your exposure to tech stocks.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm">Market volatility is high. Consider hedging with put options.</p>
              </div>
              <Button className="w-full bg-primary">
                Get Personalized Advice
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage; 