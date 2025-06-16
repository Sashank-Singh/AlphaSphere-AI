import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, BarChart2, Brain, ArrowRight, Wifi, ShieldCheck, Users, Menu, X, Star, ChevronDown, ChevronUp } from 'lucide-react';
import AIMarketSentiment from '@/components/AIMarketSentiment';
import AISentimentAnalysis from '@/components/AISentimentAnalysis';
import AITradeAdvisor from '@/components/AITradeAdvisor';
import Typewriter from '@/components/Typewriter';

const features = [
  {
    title: 'AI-Powered Analysis',
    description: 'Leverage cutting-edge AI to gain deep insights from complex market data instantly.',
    icon: <Brain className="h-7 w-7 text-cyan-400" />,
  },
  {
    title: 'Real-Time Data',
    description: 'Stay ahead with live updates on stocks, options, and forex through stunning visualizations.',
    icon: <Wifi className="h-7 w-7 text-purple-400" />,
  },
  {
    title: 'Smart Trading Tools',
    description: 'Simulate strategies, backtest ideas, and trade with precision using intuitive platforms.',
    icon: <BarChart2 className="h-7 w-7 text-pink-400" />,
  },
  {
    title: 'Options & Strategies',
    description: 'Master the market with advanced options analysis and AI-driven strategy builders.',
    icon: <TrendingUp className="h-7 w-7 text-cyan-400" />,
  },
  {
    title: 'Risk Management',
    description: 'Protect your investments with intelligent portfolio optimization and real-time alerts.',
    icon: <ShieldCheck className="h-7 w-7 text-purple-400" />,
  },
  {
    title: 'Social & Community',
    description: 'Engage with a network of traders, exchange strategies, and track market leaders.',
    icon: <Users className="h-7 w-7 text-pink-400" />,
  },
];

const testimonials = [
  {
    name: 'KimmyG',
    handle: '@Kim_EE4',
    quote: "I've been hitting high-confidence trades with incredible results. CRM calls soared 1500%, RIVN skyrocketed 2500%!"
  },
  {
    name: 'Pseudonym',
    handle: '@Pseudo_nym75',
    quote: 'Combining convergence, MNF, and 0dte gex led to my best trading day ever. Captured every major move!'
  },
  {
    name: 'Mike B',
    handle: '@mikeisBACK2023',
    quote: 'This platform is unmatched. Why pay more elsewhere for the same tools? Worth every cent.'
  },
  {
    name: 'Holan',
    handle: '@holantei',
    quote: 'Close to my $500 daily target thanks to exceptional MNF and 0DTE tools!'
  },
  {
    name: 'Fenix',
    handle: '@Ultimatefenixx',
    quote: "I'm obsessed! GEX is unbeatable, and 0DTE trades are my go-to. Amazing community!"
  },
];

const pricing = [
  {
    title: 'Free Basic Access',
    price: 'Free',
    features: [
      'Market overview',
      'AI news feed',
      'Delayed analytics',
      'Simple flow data',
      'Daily scanner',
      'Free discord channels',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    title: 'Full Pro Access',
    price: '$69/mo',
    features: [
      'Live summary',
      'Live options flow',
      'Advanced analytics',
      'AI trade ideas',
      'AI portfolios',
      'Premium scanners',
      'Algorithmic analysis',
      'Discord premium community',
    ],
    cta: 'Become Pro',
    highlight: true,
  },
];

// How it Works steps
const howItWorks = [
  {
    icon: <Sparkles className="h-8 w-8 text-cyan-400" />, 
    title: 'Instant Sign-Up',
    description: 'Join in moments and unlock the full potential of AlphaSphere AI with a free account.'
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-400" />,
    title: 'Analyze Markets',
    description: 'Dive into stocks, options, and trends with real-time AI insights and powerful tools.'
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-pink-400" />,
    title: 'Trade Smarter',
    description: 'Backtest, simulate, and execute trades confidently with our advanced trading suite.'
  },
  {
    icon: <Users className="h-8 w-8 text-cyan-400" />,
    title: 'Community Power',
    description: 'Connect with traders, share insights, and grow within a dynamic trading ecosystem.'
  },
];

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const features = [
    {
      title: 'AI-Powered Analysis',
      description: 'Leverage cutting-edge AI to gain deep insights from complex market data instantly.',
      icon: <Brain className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'Real-Time Data',
      description: 'Stay ahead with live updates on stocks, options, and forex through stunning visualizations.',
      icon: <Wifi className="h-8 w-8 text-purple-600" />,
    },
    {
      title: 'Smart Trading Tools',
      description: 'Simulate strategies, backtest ideas, and trade with precision using intuitive platforms.',
      icon: <BarChart2 className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'Options & Strategies',
      description: 'Master the market with advanced options analysis and AI-driven strategy builders.',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
    },
    {
      title: 'Risk Management',
      description: 'Protect your investments with intelligent portfolio optimization and real-time alerts.',
      icon: <ShieldCheck className="h-8 w-8 text-blue-600" />,
    },
    {
      title: 'Social & Community',
      description: 'Engage with a network of traders, exchange strategies, and track market leaders.',
      icon: <Users className="h-8 w-8 text-purple-600" />,
    },
  ];

  const solutions = [
    {
      title: 'AI Trading Advisors',
      description: 'Get help, advice and guidance from professional AI-powered trading consultants that analyze market trends 24/7.',
      cta: 'Follow our AI Advisors',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Options Trading',
      description: 'Latest updates, trends, and developments in options trading world with advanced strategies and real-time alerts.',
      cta: 'Learn Options Trading',
      image: '/api/placeholder/300/200'
    },
    {
      title: 'Market Insights',
      description: 'In-depth analysis and expert opinions on the stock market with AI-powered predictions and trend analysis.',
      cta: 'Read Market Analysis',
      image: '/api/placeholder/300/200'
    }
  ];

  const faqData = [
    {
      question: 'How does AlphaSphere AI work?',
      answer: 'AlphaSphere AI uses advanced machine learning algorithms to analyze market data, identify patterns, and provide real-time trading insights. Our platform processes millions of data points to give you accurate predictions and trading recommendations.'
    },
    {
      question: 'Is my trading data secure?',
      answer: 'Yes, we use bank-level encryption and security measures to protect your data. All trading information is encrypted and stored securely. We never share your personal trading strategies or account information with third parties.'
    },
    {
      question: 'Can I use AlphaSphere with my existing broker?',
      answer: 'Absolutely! AlphaSphere AI integrates with most major brokers and trading platforms. You can connect your existing accounts and start using our AI insights immediately without changing your current setup.'
    },
    {
      question: 'What markets does AlphaSphere support?',
      answer: 'We support stocks, options, forex, and cryptocurrency markets. Our AI analyzes data from multiple exchanges and provides insights across all major financial markets globally.'
    },
    {
      question: 'How accurate are the AI predictions?',
      answer: 'Our AI models have shown consistent accuracy rates above 75% in backtesting. However, all trading involves risk, and past performance doesn\'t guarantee future results. We recommend using our insights as part of a diversified trading strategy.'
    },
    {
      question: 'Can beginners use AlphaSphere AI?',
      answer: 'Yes! Our platform is designed for traders of all levels. We provide educational resources, guided tutorials, and clear explanations of all AI recommendations to help beginners learn while they trade.'
    }
  ];

  const trustedLogos = [
    'NASDAQ', 'NYSE', 'CME', 'CBOE', 'TD Ameritrade', 'E*TRADE', 'Interactive Brokers', 'Charles Schwab'
  ];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-gray-900 relative"
      style={{ backgroundImage: 'url(/croppedbackground.png)' }}
    >
      {/* Global overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-white/75 to-blue-50/80 backdrop-blur-[1px]"></div>
      <div className="relative z-10">
              {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
                  <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">AlphaSphere</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/90 hover:text-white font-medium transition drop-shadow-sm">Features</a>
              <a href="#solutions" className="text-white/90 hover:text-white font-medium transition drop-shadow-sm">Solutions</a>
              <a href="#faq" className="text-white/90 hover:text-white font-medium transition drop-shadow-sm">FAQ</a>
              <Link to="/dashboard" className="text-white/90 hover:text-white font-medium transition drop-shadow-sm">Dashboard</Link>
            </div>
            
            <div className="hidden md:block">
              <Link 
                to="/auth" 
                className="px-6 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow-lg"
              >
                Get Started
              </Link>
            </div>
            
            <button 
              className="md:hidden text-white drop-shadow-sm" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-black/20 backdrop-blur-md border-b border-white/20">
            <div className="flex flex-col px-6 py-4 space-y-4">
              <a href="#features" className="text-white/90 hover:text-white font-medium drop-shadow-sm">Features</a>
              <a href="#solutions" className="text-white/90 hover:text-white font-medium drop-shadow-sm">Solutions</a>
              <a href="#faq" className="text-white/90 hover:text-white font-medium drop-shadow-sm">FAQ</a>
              <Link to="/dashboard" className="text-white/90 hover:text-white font-medium drop-shadow-sm">Dashboard</Link>
              <Link to="/auth" className="px-6 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-50 transition text-center shadow-lg">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        className="pt-24 pb-32 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/herobackground.png)' }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Smooth transition curve at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Typewriter
              text="Revolutionize Your Trading with AI"
              className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-8 leading-tight drop-shadow-lg"
              speed={30}
            />
            
            <p className="text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Unleash the power of artificial intelligence to decode market patterns, forecast trends, and execute trades with unparalleled precision in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg hover:bg-gray-50 transition text-lg shadow-xl"
              >
                Launch Trading Platform
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                to="/about" 
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-700 transition text-lg shadow-lg"
              >
                Discover More
              </Link>
            </div>
          </div>
          
          {/* Trusted by section */}
          <div className="mt-20 text-center">
            <p className="text-sm text-gray-200 mb-8 font-semibold tracking-wider uppercase drop-shadow-md">
              2048+ TRADERS TRUST AlphaSphere
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-90">
              {trustedLogos.map((logo, index) => (
                <div key={index} className="text-gray-100 font-semibold text-lg drop-shadow-sm">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        className="py-20 -mt-16 pt-24 relative" 
        style={{ background: 'linear-gradient(135deg, #8A06F0 0%, #A009F8 50%, #A20AF3 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 to-white/90"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Unmatched Features for Modern Traders
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center hover:shadow-xl hover:bg-white/90 transition-all duration-300 border border-gray-100">
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(45deg, #6008E8 0%, #8A06F0 60%, #A009F8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/85"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Path to Trading Mastery
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="bg-white/85 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-xl hover:bg-white/95 transition-all duration-300 border border-gray-100">
                <div className="flex justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live AI Widgets Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(225deg, #A20AF3 0%, #6008E8 50%, #8A06F0 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 to-white/80"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Real-Time AI Market Intelligence
            </h2>
          </div>
          
          <div className="space-y-16 max-w-6xl mx-auto">
            {/* First Row: Component on Left, Text on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <AIMarketSentiment />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Market Sentiment</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Get a comprehensive overview of market sentiment with AI-driven insights. This tool analyzes vast amounts of data to provide real-time sentiment scores, helping you gauge the overall mood of the market.
                </p>
              </div>
            </div>
            
            {/* Second Row: Text on Left, Component on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Sentiment Analysis</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Dive deeper into individual stock sentiment with detailed analysis. Understand the emotional tone behind market movements for specific securities like AAPL, empowering you to make informed trading decisions.
                </p>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <AISentimentAnalysis symbol="AAPL" />
              </div>
            </div>
            
            {/* Third Row: Component on Left, Text on Right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="flex justify-center">
                <AITradeAdvisor symbol="AAPL" price={192.32} change={1.23} accountId="demo" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Trade Advisor</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Receive personalized trade recommendations based on AI analysis. This advisor provides actionable insights and strategies for trading specific stocks like AAPL, tailored to current market conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Management Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(90deg, #A009F8 0%, #A20AF3 40%, #6008E8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/75"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Manage all your investments all over the world
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our AI-powered platform gives you complete control over your global investment portfolio. Monitor, analyze, and optimize your trades across multiple markets with real-time insights and automated strategies.
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="h-64 flex items-center justify-center text-lg font-semibold">
                Portfolio Dashboard Preview
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(315deg, #6008E8 0%, #A009F8 30%, #A20AF3 70%, #8A06F0 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 to-white/70"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Voices of Our Trading Community
            </h2>
          </div>
          
          <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="min-w-[320px] max-w-[340px] bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-xl hover:bg-white/95 transition-all duration-300">
                <div className="text-gray-700 text-base italic leading-relaxed">"{testimonial.quote}"</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-blue-600">{testimonial.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(180deg, #A20AF3 0%, #8A06F0 50%, #A009F8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-white/65"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Trading Plan
            </h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
            {pricing.map((plan, index) => (
              <div key={index} className={`flex-1 max-w-sm bg-white/90 backdrop-blur-sm border rounded-2xl p-8 text-center transition-all duration-300 ${plan.highlight ? 'border-blue-500 shadow-xl scale-105 hover:shadow-2xl' : 'border-gray-200 shadow-lg hover:shadow-xl'}`}>
                <h3 className="font-bold text-2xl text-gray-900 mb-3">{plan.title}</h3>
                <div className="text-4xl font-bold mb-6 text-blue-600">{plan.price}</div>
                <ul className="mb-8 space-y-3 text-gray-600 text-left">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full px-6 py-3 rounded-lg font-semibold transition ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section 
        id="solutions" 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(60deg, #8A06F0 0%, #6008E8 40%, #A20AF3 80%, #A009F8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/65 to-white/60"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              One platform endless solutions
            </h2>
          </div>
          
          <div className="flex justify-center mb-12">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md font-semibold">Advisors</button>
              <button className="px-6 py-2 text-gray-600 hover:text-gray-900 font-semibold">Options</button>
              <button className="px-6 py-2 text-gray-600 hover:text-gray-900 font-semibold">Insights</button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white/85 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="bg-gray-200 rounded-xl h-48 mb-6 flex items-center justify-center text-gray-500">
                  Solution Image {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
                <a href="#" className="text-blue-600 font-semibold hover:text-blue-700 transition">
                  {solution.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(270deg, #A009F8 0%, #A20AF3 33%, #8A06F0 66%, #6008E8 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-white/55"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-100 shadow-xl max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Join Our Trading Network</h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Engage with fellow traders, access exclusive insights, and stay ahead of market opportunities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <a 
                href="https://discord.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
              >
                Join Discord
              </a>
              <a 
                href="/newsletter" 
                className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition shadow-lg"
              >
                Subscribe to Newsletter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="faq" 
        className="py-20 relative" 
        style={{ background: 'linear-gradient(135deg, #6008E8 0%, #A20AF3 25%, #A009F8 75%, #8A06F0 100%)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/55 to-white/50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Answers to all your questions
              </h2>
            </div>
            
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white/85 backdrop-blur-sm rounded-lg border border-gray-200 shadow-lg">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/95 transition"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Enter the New Era of Trading
          </h2>
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition text-lg"
          >
            Start Trading Today
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {/* <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">AlphaSphere</span>
              </div>
              <p className="text-gray-400 mb-4">
                2972 Westheimer Rd. Santa Ana, Illinois 85486
              </p>
              <p className="text-gray-400">
                +1 888 888 88 88<br />
                help@alphasphere.ai
              </p>
            </div> */}
            
            <div>
              <h4 className="font-semibold mb-4">Navigate</h4>
              <div className="space-y-2 text-gray-400">
                <a href="#features" className="block hover:text-white transition">Features</a>
                <a href="#solutions" className="block hover:text-white transition">Solutions</a>
                <a href="#faq" className="block hover:text-white transition">FAQ</a>
                <Link to="/privacy" className="block hover:text-white transition">Privacy Policy</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-gray-400">
                <Link to="/dashboard" className="block hover:text-white transition">Dashboard</Link>
                <Link to="/market" className="block hover:text-white transition">Market</Link>
                <Link to="/portfolio" className="block hover:text-white transition">Portfolio</Link>
                <Link to="/trading" className="block hover:text-white transition">Trading</Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">AlphaSphere</h4>
              <div className="space-y-2 text-gray-400">
                <p>Advanced AI-powered trading platform for modern investors.</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>Copyright © 2025 AlphaSphere AI. Designed with precision.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default HomePage;
