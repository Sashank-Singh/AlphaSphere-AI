import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, BarChart2, Brain, ArrowRight, Wifi, Search, ShieldCheck, Users } from 'lucide-react';
import AIMarketSentiment from '@/components/AIMarketSentiment';
import AISentimentAnalysis from '@/components/AISentimentAnalysis';
import AITradeAdvisor from '@/components/AITradeAdvisor';

const features = [
  {
    title: 'AI-Powered Analysis',
    description: 'Get instant, actionable insights with advanced AI models trained on market data.',
    icon: <Brain className="h-7 w-7 text-purple-400" />,
  },
  {
    title: 'Real-Time Data',
    description: 'Track stocks, options, and forex with blazing fast live updates and beautiful charts.',
    icon: <Wifi className="h-7 w-7 text-blue-400" />,
  },
  {
    title: 'Smart Trading Tools',
    description: 'Simulate, backtest, and execute trades with confidence using modern, intuitive tools.',
    icon: <BarChart2 className="h-7 w-7 text-green-400" />,
  },
  {
    title: 'Options & Strategies',
    description: 'Advanced options chain, strategy builder, and AI options flow analysis.',
    icon: <TrendingUp className="h-7 w-7 text-green-400" />,
  },
  {
    title: 'Risk Management',
    description: 'Portfolio optimizer, risk dashboard, and smart alerts to protect your capital.',
    icon: <ShieldCheck className="h-7 w-7 text-cyan-400" />,
  },
  {
    title: 'Social & Community',
    description: 'Join a community of traders, share ideas, and follow top performers.',
    icon: <Users className="h-7 w-7 text-pink-400" />,
  },
];

const testimonials = [
  {
    name: 'KimmyG',
    handle: '@Kim_EE4',
    quote: "I've been taking the bullseyes with 70% confidence or higher, with confluence and TA with great success. The last CRM call went 1500%, RIVN went 2500%."
  },
  {
    name: 'Pseudonym',
    handle: '@Pseudo_nym75',
    quote: 'Convergence + MNF + 0dte gex + dealer diary = best day trading day I\'ve ever had. Got the big moves up and down. Great great day.'
  },
  {
    name: 'Mike b',
    handle: '@mikeisBACK2023',
    quote: 'Platform is great, unless you WANT to pay more for the same exact service! Worth every penny.'
  },
  {
    name: 'Holan',
    handle: '@holantei',
    quote: 'About to hit target $500 a day, great MNF and 0DTE tool!'
  },
  {
    name: 'Fenix',
    handle: '@Ultimatefenixx',
    quote: 'Just know I freaking love you all!!!!! GEX for the win!!!! 0DTE are my flavor.'
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
    icon: <Sparkles className="h-8 w-8 text-yellow-400" />, 
    title: 'Sign Up Instantly',
    description: 'Create your free account in seconds and access the full power of AlphaSphere AI.'
  },
  {
    icon: <Brain className="h-8 w-8 text-purple-400" />,
    title: 'Connect & Analyze',
    description: 'Analyze stocks, options, and markets with real-time AI-driven insights and tools.'
  },
  {
    icon: <BarChart2 className="h-8 w-8 text-blue-400" />,
    title: 'Trade & Optimize',
    description: 'Simulate, backtest, and execute trades with confidence using our smart trading suite.'
  },
  {
    icon: <Users className="h-8 w-8 text-pink-400" />,
    title: 'Join the Community',
    description: 'Share ideas, follow top traders, and grow with a vibrant trading community.'
  },
];

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-x-hidden">
      {/* Animated background glow */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-purple-700/30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-2xl animate-pulse z-0" />
      <div className="absolute bottom-0 left-1/2 w-[200px] h-[200px] bg-green-500/10 rounded-full blur-2xl animate-pulse z-0" />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center pt-20 pb-10 px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-gradient-to-br from-purple-600 via-blue-500 to-green-400 p-2 rounded-full shadow-lg animate-pulse">
            <Sparkles className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg mb-2">
            We bridge the gap between Wall Street and Retail Traders
          </h1>
          <p className="text-base sm:text-xl text-gray-300 max-w-xl mx-auto mb-4">
            AI-powered analytics, real-time data, and actionable insights for every trader.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg shadow-lg transition-all duration-200"
            >
              Explore AlphaSphere
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-purple-600 text-purple-300 font-bold text-lg shadow-lg transition-all duration-200 hover:bg-purple-900/20"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
            Features you will love
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg">
                {feature.icon}
                <h3 className="font-semibold text-lg text-white mb-1 mt-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
            How it Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="bg-white/5 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center shadow-xl hover:scale-105 transition-transform duration-200">
                <div className="mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg text-white mb-2">{step.title}</h3>
                <p className="text-gray-300 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live AI Widgets Section */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
            Live AI Market Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <AIMarketSentiment />
            <AISentimentAnalysis symbol="AAPL" />
            <AITradeAdvisor symbol="AAPL" price={192.32} change={1.23} accountId="demo" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
            What people are saying
          </h2>
          <div className="flex gap-6 overflow-x-auto scrollbar-none pb-2">
            {testimonials.map((t, idx) => (
              <div key={idx} className="min-w-[320px] max-w-[340px] bg-white/5 border border-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-3">
                <div className="text-gray-200 text-base italic">"{t.quote}"</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-purple-300">{t.handle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-2 sm:px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-white">
            Pricing
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            {pricing.map((plan, idx) => (
              <div key={idx} className={`flex-1 max-w-sm bg-white/5 border ${plan.highlight ? 'border-purple-500 shadow-purple-500/20' : 'border-gray-800'} rounded-2xl shadow-lg p-8 flex flex-col items-center text-center ${plan.highlight ? 'scale-105' : ''}`}>
                <h3 className="font-bold text-xl text-white mb-2">{plan.title}</h3>
                <div className="text-3xl font-extrabold mb-4 text-purple-400">{plan.price}</div>
                <ul className="mb-6 space-y-2 text-gray-300 text-sm text-left">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`px-6 py-2 rounded-full font-bold text-white transition ${plan.highlight ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : 'bg-gray-700 hover:bg-gray-800'}`}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Community Section */}
      <section className="py-12 bg-gradient-to-b from-black via-gray-900 to-black text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Join the Community</h2>
        <p className="text-lg text-gray-300 mb-6">Connect with traders, get daily insights, and never miss an opportunity.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold shadow hover:bg-blue-700 transition">Join Discord</a>
          <a href="/newsletter" className="px-6 py-3 rounded-full bg-purple-600 text-white font-bold shadow hover:bg-purple-700 transition">Subscribe to Newsletter</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-gradient-to-t from-black via-gray-900 to-transparent border-t border-gray-800 py-8 mt-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-xs">
          <div>
            &copy; {new Date().getFullYear()} AlphaSphere AI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.254a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 19.54a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/></svg></a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.304-.535-1.527.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.649.242 2.872.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"/></svg></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
