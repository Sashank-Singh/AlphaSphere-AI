
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
  Bar,
  AreaChart,
  Area
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
import EnhancedSphereAI from '@/components/EnhancedSphereAI';
import PortfolioOptimizer from '@/components/PortfolioOptimizer';

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

  // Mock prediction data
  const predictionData = [
    { date: '2024-01', actual: totalValue, predicted: null },
    { date: '2024-02', actual: totalValue * 1.03, predicted: null },
    { date: '2024-03', actual: totalValue * 1.07, predicted: null },
    { date: '2024-04', actual: totalValue * 1.05, predicted: null },
    { date: '2024-05', actual: null, predicted: totalValue * 1.09 },
    { date: '2024-06', actual: null, predicted: totalValue * 1.12 },
    { date: '2024-07', actual: null, predicted: totalValue * 1.15 },
    { date: '2024-08', actual: null, predicted: totalValue * 1.17 },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your portfolio overview.</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button onClick={() => navigate('/search')} className="bg-primary">
            <Plus className="h-4 w-4 mr-2" />
            Trade Asset
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Stocks</p>
                  <p className="font-medium">{formatCurrency(stockValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Options</p>
                  <p className="font-medium">{formatCurrency(optionsValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cash</p>
                  <p className="font-medium">{formatCurrency(portfolio.cash)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Positions</p>
                  <p className="font-medium">{portfolio.positions.length}</p>
                </div>
              </div>
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

        {/* AI Portfolio Optimizer */}
        <Card className="col-span-full lg:col-span-2">
          <CardContent className="p-0">
            <PortfolioOptimizer />
          </CardContent>
        </Card>
        
        {/* Enhanced Sphere AI */}
        <Card className="col-span-full lg:col-span-1">
          <CardContent className="p-0">
            <EnhancedSphereAI />
          </CardContent>
        </Card>

        {/* AI Predictive Chart */}
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold flex items-center">
                  <Sparkles className="h-4 w-4 text-primary mr-2" />
                  AI Portfolio Projection
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on historical data and market forecasts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  1M
                </Button>
                <Button variant="outline" size="sm">
                  3M
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/10">
                  6M
                </Button>
                <Button variant="outline" size="sm">
                  1Y
                </Button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictionData}>
                  <defs>
                    <linearGradient id="gradientActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="gradientPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => value ? [`${formatCurrency(value)}`, ''] : ['N/A', '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual" 
                    stroke="#8884d8" 
                    fill="url(#gradientActual)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    name="AI Prediction" 
                    stroke="#82ca9d" 
                    fill="url(#gradientPredicted)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-2"></div>
                <span className="text-xs text-muted-foreground">Historical</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#82ca9d] mr-2"></div>
                <span className="text-xs text-muted-foreground">AI Prediction</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit/Loss Chart */}
        <Card className="col-span-full">
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
      </div>
    </div>
  );
};

export default DashboardPage;
