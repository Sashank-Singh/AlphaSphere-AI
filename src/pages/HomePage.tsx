import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, CheckCircle, Menu, X, TrendingUp, Shield, Users, Zap } from 'lucide-react';
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
      'Limited AI insights',
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
  const [isInToolsSection, setIsInToolsSection] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);
  const [scrollAccumulator, setScrollAccumulator] = useState(0);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

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

  useEffect(() => {
    const handleScroll = (e: Event) => {
      // Only apply scroll logic on larger screens (desktop)
      if (window.innerWidth < 1024) return;
      
      const toolsSection = document.getElementById('tools');
      if (!toolsSection) return;

      const rect = toolsSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if tools section is in viewport
      const isInView = rect.top <= 100 && rect.bottom >= viewportHeight - 100;
      
      if (isInView && !isInToolsSection) {
        setIsInToolsSection(true);
        setScrollLocked(true);
        setScrollAccumulator(0);
        // Prevent default scrolling when in tools section
        e.preventDefault();
      } else if (!isInView && isInToolsSection && selectedTool === 5) {
        // Allow normal scrolling after viewing all tools
        setIsInToolsSection(false);
        setScrollLocked(false);
        setScrollAccumulator(0);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // Only apply wheel logic on larger screens (desktop)
      if (window.innerWidth < 1024) return;
      if (!isInToolsSection || !scrollLocked) return;
      
      e.preventDefault();
      
      const now = Date.now();
      const timeDiff = now - lastScrollTime;
      
      // Reset accumulator if too much time has passed (debounce)
      if (timeDiff > 150) {
        setScrollAccumulator(0);
      }
      
      setLastScrollTime(now);
      
      // Accumulate scroll delta
      const newAccumulator = scrollAccumulator + e.deltaY;
      setScrollAccumulator(newAccumulator);
      
      // Only change tool when accumulator reaches threshold
      const threshold = 120; // Increased threshold for slower switching
      
      if (Math.abs(newAccumulator) >= threshold) {
        if (newAccumulator > 0) {
          // Scrolling down - next tool
          if (selectedTool < 5) {
            setSelectedTool(prev => prev + 1);
            setScrollAccumulator(0);
          } else {
            // Reached last tool, unlock scrolling
            setScrollLocked(false);
            setIsInToolsSection(false);
            setScrollAccumulator(0);
          }
        } else {
          // Scrolling up - previous tool
          if (selectedTool > 0) {
            setSelectedTool(prev => prev - 1);
            setScrollAccumulator(0);
          } else {
            // At first tool, allow scrolling up to exit section
            setScrollLocked(false);
            setIsInToolsSection(false);
            setScrollAccumulator(0);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isInToolsSection, selectedTool, scrollLocked, scrollAccumulator, lastScrollTime]);

  const supportedMarkets = [
    'NYSE', 'NASDAQ', 'Options', 'Forex', 'Crypto', 'Futures'
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
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
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              AI-Powered Trading
              <Typewriter 
                text={typewriterTexts[currentTextIndex]}
                speed={50}
                className="block text-gray-600"
              />
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Advanced machine learning algorithms analyze market patterns and provide actionable insights to help you make better investment decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16">
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
                View Demo
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {realStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Supported Markets */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-6 font-medium">
                Supporting all major markets
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {supportedMarkets.map((market, index) => (
                  <div key={index} className="text-gray-400 font-medium text-sm">
                    {market}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
              <div key={index} className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow">
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
              {/* Desktop Scroll Indicator */}
              <div className="text-center mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">💡 Scroll through this section to explore tools automatically</p>
              </div>
              
              {actualTools.map((tool, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedTool === index 
                      ? 'border-black bg-gray-50 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
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
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {actualTools[selectedTool].title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {actualTools[selectedTool].description}
                </p>
              </div>
              
              {/* Desktop Interactive Demo Component */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
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
              <div key={index} className={plan.highlight ? 'bg-white rounded-lg p-8 ring-2 ring-black' : 'bg-white rounded-lg p-8 border border-gray-200'}>
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