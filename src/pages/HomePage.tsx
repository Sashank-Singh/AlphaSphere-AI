import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, CheckCircle, Menu, X, Shield, Zap, Sparkles, Command } from 'lucide-react';
import Typewriter from '../components/Typewriter';

const features = [
  {
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze market patterns and provide actionable insights.',
    icon: <Brain className="h-6 w-6 text-gray-700" />
  },
  {
    title: 'Real-Time Data',
    description: 'Live market data and instant notifications keep you ahead of market movements.',
    icon: <Zap className="h-6 w-6 text-gray-700" />
  },
  {
    title: 'Smart Trading',
    description: 'Intelligent trading tools with backtesting and strategy optimization capabilities.',
    icon: <BarChart3 className="h-6 w-6 text-gray-700" />
  },
  {
    title: 'Risk Management',
    description: 'Comprehensive risk assessment and portfolio protection with automated alerts.',
    icon: <Shield className="h-6 w-6 text-gray-700" />
  }
];

const actualTools = [
  {
    title: 'AI Market Sentiment Analysis',
    description: 'Real-time sentiment analysis from news, social media, and market data to gauge market mood.',
    features: ['Social media sentiment tracking', 'News impact analysis', 'Market mood indicators']
  },
  {
    title: 'AI Trading Advisor',
    description: 'Intelligent trading recommendations based on technical analysis and market patterns.',
    features: ['Buy/sell signals', 'Risk assessment', 'Entry/exit points']
  },
  {
    title: 'Portfolio Optimizer',
    description: 'AI-powered portfolio optimization to maximize returns while minimizing risk.',
    features: ['Asset allocation', 'Risk diversification', 'Performance tracking']
  },
  {
    title: 'Predictive Price Forecasting',
    description: 'Advanced machine learning models predict future price movements and trends.',
    features: ['Price predictions', 'Trend analysis', 'Volatility forecasting']
  },
  {
    title: 'Options Flow Analysis',
    description: 'Track unusual options activity and institutional money flows.',
    features: ['Options flow tracking', 'Institutional activity', 'Volume analysis']
  },
  {
    title: 'Risk Management Dashboard',
    description: 'Comprehensive risk monitoring and management tools for your portfolio.',
    features: ['Risk metrics', 'Stop-loss automation', 'Position sizing']
  }
];

const pricing = [
  {
    title: 'Starter',
    price: 'Free',
    features: [
      'Basic market analysis',
      'Limited Sphere AI Insights',
      'Community access',
      'Email support'
    ],
    cta: 'Get Started',
    highlight: false
  },
  {
    title: 'Professional',
    price: '$49',
    features: [
      'Advanced AI analysis',
      'Real-time data feeds',
      'Portfolio optimization',
      'Priority support',
      'API access'
    ],
    cta: 'Start Free Trial',
    highlight: true
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    features: [
      'Custom AI models',
      'Dedicated support',
      'White-label solution',
      'Advanced integrations'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

const realStats = [
  { number: '15+', label: 'AI Trading Tools' },
  { number: '50+', label: 'Technical Indicators' },
  { number: 'Real-time', label: 'Market Data' },
  { number: '24/7', label: 'AI Analysis' }
];

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
  const headlineTexts = ["with AI assistance", "with AI Automation"];

  const typewriterTexts = [
    "for Modern Investors",
    "for Smart Traders",
    "for Financial Growth",
    "for Market Success",
    "for Investment Excellence"
  ];

  // Cycle through typewriter texts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex(prev => (prev + 1) % typewriterTexts.length);
    }, 4000); // Change text every 4 seconds
    
    return () => clearInterval(interval);
  }, [typewriterTexts.length]);

  // Alternate headline between assistance and automation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeadlineIndex(prev => (prev + 1) % headlineTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [headlineTexts.length]);

  const supportedMarkets = [
    'NYSE', 'NASDAQ', 'Options', 'Forex', 'Crypto', 'Futures'
  ];

  // Curated modules mapped to existing routes/pages
  const aiModules: {
    title: string;
    description: string;
    path: string;
    icon: React.ReactNode;
    tag?: string;
  }[] = [
    {
      title: 'Sphere AI Insights Chat',
      description: 'Ask anything about a symbol or market context. Get instant, cited answers.',
      path: '/ai-trading',
      icon: <Sparkles className="h-5 w-5" />, tag: 'AI'
    },
    {
      title: 'Options Flow Analysis',
      description: 'Track unusual flow, large sweeps, and institutional positioning.',
      path: '/options',
      icon: <BarChart3 className="h-5 w-5" />, tag: 'Options'
    },
    {
      title: 'Predictive Forecasting',
      description: 'Short-term price predictions and trend probabilities.',
      path: '/analytics',
      icon: <Zap className="h-5 w-5" />, tag: 'Alpha'
    },
    {
      title: 'Market Sentiment',
      description: 'News and social tone aggregated into actionable sentiment.',
      path: '/dashboard',
      icon: <Brain className="h-5 w-5" />, tag: 'Signal'
    },
    {
      title: 'Pattern Recognition',
      description: 'Spot breakouts, reversals, and momentum setups.',
      path: '/analytics',
      icon: <Brain className="h-5 w-5" />
    },
    {
      title: 'Portfolio Optimizer',
      description: 'Optimize allocations for risk-adjusted returns.',
      path: '/portfolio',
      icon: <Shield className="h-5 w-5" />
    },
  ];

  return (
    <div className="relative min-h-screen bg-white text-gray-900">
      {/* Background visual accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-blue-300/40 to-purple-300/40 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-300/30 to-cyan-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-gradient-to-r from-emerald-200/30 to-sky-200/30 blur-3xl" />
      </div>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">AlphaSphere</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition">Features</a>
            <a href="#tools" className="text-gray-600 hover:text-gray-900 font-medium transition">Tools</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition">Pricing</a>
            <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium transition">Dashboard</Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition">
              Sign In
            </Link>
            <Link 
              to="/auth" 
              className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
            >
              Get Started
            </Link>
          </div>
          
          <button 
            className="md:hidden text-gray-600" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#tools" className="text-gray-600 hover:text-gray-900 font-medium">Tools</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</Link>
              <Link to="/auth" className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Headline */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/60 px-3 py-1 text-xs text-gray-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                Real-time Sphere AI Insights for traders
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
                Trade smarter
                <Typewriter
                  text={headlineTexts[currentHeadlineIndex]}
                  speed={50}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500"
                />
              </h1>
              <div className="mt-3 text-xl text-gray-600">
                <Typewriter
                  text={typewriterTexts[currentTextIndex]}
                  speed={50}
                  className="block"
                />
              </div>
              <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Instantly understand market context, spot opportunities, and act with confidence.
                Your on-call research analyst—built into every screen.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white shadow-sm transition hover:bg-gray-800"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  View Demo
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
                {realStats.map((stat, index) => (
                  <div key={index} className="rounded-xl border border-gray-200 bg-white/60 p-4 backdrop-blur text-center">
                    <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual / Glass cards */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-indigo-200 via-sky-200 to-emerald-200 opacity-60 blur-2xl" />
                <div className="relative rounded-3xl border border-gray-200 bg-white/60 p-4 backdrop-blur shadow-xl">
                  {/* Top bar */}
                  <div className="flex items-center gap-2 border-b border-gray-200/70 pb-3">
                    <div className="flex -space-x-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400 inline-block" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400 inline-block" />
                    </div>
                    <div className="ml-auto inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white/60 px-2 py-1 text-[10px] text-gray-600">
                      <Command className="h-3 w-3" />
                      AI Assist
                    </div>
                  </div>
                  {/* Main card content */}
                  <div className="space-y-3 pt-4">
                    <div className="rounded-xl border border-gray-200 bg-white/60 p-3">
                      <div className="flex items-start gap-2">
                        <div className="rounded-md bg-black p-1.5">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold text-gray-900">Instant Answer</div>
                          <p className="mt-1 text-gray-600">AAPL options flow is net-bullish today. Consider a call spread near $190 with defined risk.</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Live Sentiment</div>
                          <div className="mt-1 text-xs text-gray-600">Bullish 72% • Neutral 18% • Bearish 10%</div>
                        </div>
                        <div className="flex items-end gap-1 self-end">
                          <div className="h-12 w-2 rounded bg-green-400" />
                          <div className="h-9 w-2 rounded bg-yellow-400" />
                          <div className="h-5 w-2 rounded bg-red-400" />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white/60 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next earnings insight ready</span>
                        <Link to="/dashboard" className="text-gray-900 font-medium hover:underline">Open</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Supported Markets */}
              <div className="mt-10 text-center lg:text-left">
                <p className="text-xs text-gray-500 mb-4 font-medium">Supporting all major markets</p>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 opacity-70">
                  {supportedMarkets.map((market, index) => (
                    <div key={index} className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-xs text-gray-600 backdrop-blur">
                      {market}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assistant Highlights (Cluely-like quick tags) */}


      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to trade smarter
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful tools and insights designed for modern investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="rounded-2xl border border-gray-200 bg-white/60 p-6 backdrop-blur hover:shadow-md transition-shadow">
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases (Cluely-like) */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Built for every kind of trader</h2>
            <p className="text-lg text-gray-600">Stocks. Options. Forex. Crypto. Futures. Really everything.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Day Traders', desc: 'Ultra-fast insights, real-time sentiment, and risk cues.' },
              { title: 'Swing Traders', desc: 'Pattern detection, earnings tone, and momentum signals.' },
              { title: 'Options Traders', desc: 'Unusual flow, IV shifts, and spread suggestions.' },
              { title: 'Long-term Investors', desc: 'Fundamentals, insider trends, and valuation context.' },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-200 bg-white/70 p-6 backdrop-blur">
                <div className="text-lg font-semibold text-gray-900">{c.title}</div>
                <p className="mt-2 text-sm text-gray-600">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section id="tools" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful AI Trading Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI-powered tools to enhance your trading decisions
            </p>
          </div>
          
          {/* Mobile View - Tab-based */}
          <div className="lg:hidden">
            {/* Mobile Tab Navigation */}
            <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide">
              <div className="flex space-x-2 min-w-max px-1">
                {actualTools.map((tool, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTool(index)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                      selectedTool === index
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tool.title.replace('AI ', '').replace(' Analysis', '').replace(' Dashboard', '')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile Tool Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {actualTools[selectedTool].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  {actualTools[selectedTool].description}
                </p>
              </div>
              
              {/* Mobile Interactive Demo */}
               <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                {selectedTool === 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Live Sentiment</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-green-100 rounded">
                        <div className="text-lg font-bold text-green-600">72%</div>
                        <div className="text-xs text-gray-600">Bullish</div>
                      </div>
                      <div className="p-2 bg-yellow-100 rounded">
                        <div className="text-lg font-bold text-yellow-600">18%</div>
                        <div className="text-xs text-gray-600">Neutral</div>
                      </div>
                      <div className="p-2 bg-red-100 rounded">
                        <div className="text-lg font-bold text-red-600">10%</div>
                        <div className="text-xs text-gray-600">Bearish</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 1 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">AI Recommendation</h4>
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900 text-sm">BUY - AAPL</span>
                      </div>
                      <div className="text-xs text-gray-600">Confidence: 87%</div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 2 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Portfolio Risk</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Risk Level</span>
                        <span className="text-xs font-medium">Moderate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 3 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Price Forecast</h4>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded">
                      <div>
                        <div className="text-lg font-bold text-gray-900">$187.25</div>
                        <div className="text-xs text-gray-600">7-day prediction</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium text-sm">+5.2%</div>
                        <div className="text-xs text-gray-500">89% accuracy</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 4 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Options Flow</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span className="text-xs">Call Sweep</span>
                        <span className="text-xs font-medium text-green-600">$2.1M</span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 rounded">
                        <span className="text-xs">Put Block</span>
                        <span className="text-xs font-medium text-red-600">$890K</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 5 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm">Risk Assessment</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-sm font-bold text-yellow-600">Medium</div>
                        <div className="text-xs text-gray-600">Risk</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-bold text-green-600">0.85</div>
                        <div className="text-xs text-gray-600">Beta</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mobile Features List */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {actualTools[selectedTool].features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Desktop View - Original Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Tool Cards - Left Side */}
            <div className="space-y-4">
              {actualTools.map((tool, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedTool === index 
                      ? 'border-black bg-white/70 shadow-md backdrop-blur' 
                      : 'border-gray-200 bg-white/60 hover:border-gray-300 hover:shadow-sm backdrop-blur'
                  }`}
                  onClick={() => setSelectedTool(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Tool Showcase - Right Side */}
            <div className="rounded-2xl border border-gray-200 bg-white/70 p-8 backdrop-blur">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {actualTools[selectedTool].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {actualTools[selectedTool].description}
                </p>
              </div>
              
              {/* Desktop Interactive Demo Component */}
              <div className="mb-8 p-6 bg-gray-50/70 rounded-xl border">
                {selectedTool === 0 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Live Sentiment Analysis</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">72%</div>
                        <div className="text-sm text-gray-600">Bullish</div>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">18%</div>
                        <div className="text-sm text-gray-600">Neutral</div>
                      </div>
                      <div className="p-3 bg-red-100 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">10%</div>
                        <div className="text-sm text-gray-600">Bearish</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">Real-time analysis from 10,000+ sources</div>
                  </div>
                )}
                
                {selectedTool === 1 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">AI Trading Recommendation</h4>
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-blue-900">BUY Signal - AAPL</span>
                      </div>
                      <div className="text-sm text-gray-600">Confidence: 87% | Target: $195.50</div>
                      <div className="text-xs text-gray-500 mt-1">Based on technical patterns and market sentiment</div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Portfolio Optimization</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <span className="text-sm font-medium">Moderate</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <div className="text-xs text-gray-500">Expected Return: 12.4% | Sharpe Ratio: 1.8</div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 3 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Price Forecast</h4>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div>
                        <div className="text-lg font-bold text-gray-900">$187.25</div>
                        <div className="text-sm text-gray-600">7-day prediction</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">+5.2%</div>
                        <div className="text-xs text-gray-500">Accuracy: 89%</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 4 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Options Flow Activity</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm">Large Call Sweep</span>
                        <span className="text-sm font-medium text-green-600">$2.1M</span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 rounded">
                        <span className="text-sm">Put Block</span>
                        <span className="text-sm font-medium text-red-600">$890K</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedTool === 5 && (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-600">Medium</div>
                        <div className="text-xs text-gray-600">Portfolio Risk</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">0.85</div>
                        <div className="text-xs text-gray-600">Beta Score</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                <ul className="space-y-3">
                  {actualTools[selectedTool].features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition">
                  Try Now
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                  Learn More
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ (Cluely-like) */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
              <p className="text-lg text-gray-600">Short answers to help you get started fast.</p>
            </div>
            <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur">
              {[
                {
                  q: 'Why AlphaSphere vs. a regular trading website?',
                  a: 'AlphaSphere delivers real-time, trade-ready insights as markets move by the second, so you can act while the opportunity still exists.'
                },
                {
                  q: 'Who is AlphaSphere for?',
                  a: 'Everyone from new investors to pro traders. Pick your style; day trade, swing, options, or long-term.'
                },
                {
                  q: 'Is there a free plan?',
                  a: 'Yes. Start on the Starter plan and upgrade when you need advanced features.'
                },
                {
                  q: 'Does it work on any device?',
                  a: 'Yes. Use it on web today. Mobile apps are planned.'
                },
              ].map((item, idx) => (
                <details key={item.q} className={`group p-5 ${idx === 0 ? 'rounded-t-2xl' : ''} ${idx === 3 ? 'rounded-b-2xl' : ''}`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <span className="text-base font-medium text-gray-900">{item.q}</span>
                    <span className="ml-4 text-gray-400 transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600">
              Choose the plan that's right for you
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={plan.highlight ? 'rounded-2xl p-8 ring-2 ring-black bg-white/80 backdrop-blur' : 'rounded-2xl p-8 border border-gray-200 bg-white/70 backdrop-blur'}>
                {plan.highlight && (
                  <div className="text-center mb-4">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
                  <div className="text-3xl font-bold text-gray-900">{plan.price}</div>
                  {plan.price !== 'Custom' && plan.price !== 'Free' && (
                    <div className="text-gray-500 text-sm">per month</div>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  className={plan.highlight 
                    ? 'w-full py-3 px-4 rounded-lg font-medium transition bg-black text-white hover:bg-gray-800' 
                    : 'w-full py-3 px-4 rounded-lg font-medium transition border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to start trading smarter?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the power of AI-driven trading tools and make smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                to="/demo" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-6 h-6 text-gray-900" />
                <span className="text-lg font-bold text-gray-900">AlphaSphere</span>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI-powered trading platform for modern investors.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-gray-900 text-sm transition">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm transition">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">API</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 AlphaSphere AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;