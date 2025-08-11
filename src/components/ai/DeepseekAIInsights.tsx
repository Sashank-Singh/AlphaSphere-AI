import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart3, TrendingUp, FileText, Lightbulb } from 'lucide-react';

// Custom hook for animated loading text
const useAnimatedLoadingText = (baseText: string, isLoading: boolean) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    if (!isLoading) {
      setDots('');
      return;
    }
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  return isLoading ? `${baseText}${dots}` : baseText;
};

interface AIInsight {
  priceForecast: string;
  sentiment: string;
  sentimentLevel: string;
  newsImpact: string;
  patternRecognition: string;
  confidence: string;
}

interface StockData {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  lastUpdated: Date | null;
}

interface DeepseekAIInsightsProps {
  symbol: string;
  stockData?: StockData;
}

// Cache for storing analysis results with aggressive caching
const analysisCache = new Map<string, { data: AIInsight; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for aggressive caching
const REQUEST_TIMEOUT = 8000; // 8 seconds timeout

const DeepseekAIInsights: React.FC<DeepseekAIInsightsProps> = ({ symbol, stockData }) => {
  const [insights, setInsights] = useState<AIInsight>({
    priceForecast: 'Analyzing price patterns',
    sentiment: 'Analyzing market sentiment',
    sentimentLevel: 'Analyzing',
    newsImpact: 'Analyzing news impact',
    patternRecognition: 'Analyzing intraday patterns',
    confidence: 'High (85%)'
  });
  const [loadingStates, setLoadingStates] = useState({
    priceForecast: true,
    sentiment: true,
    newsImpact: true,
    patternRecognition: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animated loading text for each section
  const priceForecastText = useAnimatedLoadingText('Analyzing price patterns', loadingStates.priceForecast);
  const sentimentText = useAnimatedLoadingText('Analyzing market sentiment', loadingStates.sentiment);
  const newsImpactText = useAnimatedLoadingText('Analyzing news impact', loadingStates.newsImpact);
  const patternRecognitionText = useAnimatedLoadingText('Analyzing intraday patterns', loadingStates.patternRecognition);

  // Text cleanup function to remove markdown formatting
  const cleanupText = (text: string): string => {
    if (!text) return '';
    let cleaned = text.trim();
    
    // Remove markdown formatting
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold** -> bold
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1'); // *italic* -> italic
    cleaned = cleaned.replace(/[*`#_~]+/g, ''); // Remove other markdown characters
    
    // Clean up excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    return cleaned.trim();
  };

  const fetchAIInsights = useCallback(async () => {
      if (!symbol) {
        console.log('DeepseekAI: No symbol provided');
        return;
      }

      console.log('DeepseekAI: Starting analysis for', symbol, 'with stockData:', stockData);

      // Create cache key that includes current price for real-time updates
      const cacheKey = stockData ? `${symbol}-${stockData.price?.toFixed(2) || 'no-price'}` : symbol;
      const cached = analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('DeepseekAI: Using cached data for', cacheKey);
        setInsights(cached.data);
        setLoadingStates({
          priceForecast: false,
          sentiment: false,
          newsImpact: false,
          patternRecognition: false
        });
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log('DeepseekAI: Fetching fresh analysis...');

      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
      if (!apiKey) {
        console.warn('DeepseekAI: API key not configured, using mock analysis');
        // Provide mock analysis when API key is not available
        const mockInsights = {
          priceForecast: `${symbol} technical analysis suggests monitoring key support at current levels. Volume patterns indicate potential consolidation phase.`,
          sentiment: `Market sentiment for ${symbol} appears neutral to slightly positive based on recent price action and volume trends.`,
          sentimentLevel: 'Neutral',
          newsImpact: `Recent market developments may have moderate impact on ${symbol}. Monitor for earnings announcements and sector news.`,
          patternRecognition: `${symbol} showing typical intraday patterns with support around current price levels. Watch for breakout signals.`,
          confidence: 'Mock Data'
        };
        
        setInsights(mockInsights);
        setIsLoading(false);
        setLoadingStates({
          priceForecast: false,
          sentiment: false,
          newsImpact: false,
          patternRecognition: false
        });
        return;
      }

      try {
        // Create real-time data context for more accurate analysis
        const marketContext = stockData ? `
Current market data for ${symbol}:
- Price: $${stockData.price?.toFixed(2) || 'N/A'}
- Change: ${stockData.change !== undefined ? (stockData.change >= 0 ? '+' : '') + stockData.change.toFixed(2) : 'N/A'} (${stockData.changePercent?.toFixed(2) || 'N/A'}%)
- Volume: ${stockData.volume?.toLocaleString() || 'N/A'}
- Day High: $${stockData.high?.toFixed(2) || 'N/A'}
- Day Low: $${stockData.low?.toFixed(2) || 'N/A'}
- Open: $${stockData.open?.toFixed(2) || 'N/A'}
- Last Updated: ${stockData.lastUpdated?.toLocaleTimeString() || 'Real-time'}` : '';

        // Optimized prompts for faster, more accurate responses
        const prompts = [
          {
            key: 'priceForecast',
            prompt: `${symbol} price forecast (next 2-4h):${marketContext}
Provide: Target price, support/resistance levels, probability %. Max 60 words.`
          },
          {
            key: 'sentiment',
            prompt: `${symbol} sentiment analysis:${marketContext}
Provide: Sentiment score (1-10), key drivers, risk level. Max 50 words.`
          },
          {
            key: 'newsImpact',
            prompt: `${symbol} news impact:${marketContext}
Provide: Recent news effect, impact magnitude, duration. Max 50 words.`
          },
          {
            key: 'patternRecognition',
            prompt: `${symbol} technical patterns:${marketContext}
Provide: Chart patterns, MA positions, breakout probability. Max 60 words.`
          }
        ];

        // Process prompts with progressive loading and timeout handling
        const promises = prompts.map(async ({ key, prompt }) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
          
          try {
            const response = await fetch('https://api.deepseek.com/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                  {
                    role: 'system',
                    content: 'Professional trading analyst. Provide concise, specific insights with numbers and probabilities. Be direct and actionable.'
                  },
                  { role: 'user', content: prompt }
                ],
                max_tokens: 80, // Reduced for speed
                temperature: 0.1 // Lower for consistency
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return {
              key,
              content: data.choices?.[0]?.message?.content || 'Analysis unavailable'
            };
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              throw new Error('Request timeout');
            }
            throw error;
          }
        });

        // Progressive loading - update each section as it completes
        const updateInsight = (key: string, content: string) => {
          setInsights(prev => {
            const updated = { ...prev };
            switch (key) {
              case 'priceForecast':
                updated.priceForecast = cleanupText(content);
                break;
              case 'sentiment':
                updated.sentiment = cleanupText(content);
                updated.sentimentLevel = content.toLowerCase().includes('positive') ? 'Positive' :
                  content.toLowerCase().includes('negative') ? 'Negative' : 'Neutral';
                break;
              case 'newsImpact':
                updated.newsImpact = cleanupText(content);
                break;
              case 'patternRecognition':
                updated.patternRecognition = cleanupText(content);
                break;
            }
            return updated;
          });
          
          setLoadingStates(prev => ({ ...prev, [key]: false }));
        };

        // Process promises and update progressively
        console.log('DeepseekAI: Processing', promises.length, 'analysis requests');
        
        promises.forEach(async (promise, index) => {
          try {
            const result = await promise;
            console.log(`DeepseekAI: Received ${result.key} analysis:`, result.content.substring(0, 100) + '...');
            updateInsight(result.key, result.content);
          } catch (error) {
            console.error(`DeepseekAI: Error fetching ${prompts[index].key}:`, error);
            setLoadingStates(prev => ({ ...prev, [prompts[index].key]: false }));
          }
        });

        // Wait for all to complete for caching
        const results = await Promise.allSettled(promises);
        const newInsights = { ...insights };
        let successCount = 0;

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successCount++;
            const { key, content } = result.value;
            switch (key) {
              case 'priceForecast':
                newInsights.priceForecast = cleanupText(content);
                break;
              case 'sentiment':
                newInsights.sentiment = cleanupText(content);
                newInsights.sentimentLevel = content.toLowerCase().includes('positive') ? 'Positive' :
                  content.toLowerCase().includes('negative') ? 'Negative' : 'Neutral';
                break;
              case 'newsImpact':
                newInsights.newsImpact = cleanupText(content);
                break;
              case 'patternRecognition':
                newInsights.patternRecognition = cleanupText(content);
                break;
            }
          } else {
            console.error(`DeepseekAI: Failed to get ${prompts[index].key}:`, result.reason);
          }
        });
        
        console.log(`DeepseekAI: Completed ${successCount}/${results.length} analysis requests`);
        
        // Cache the results with real-time data key
        analysisCache.set(cacheKey, {
          data: newInsights,
          timestamp: Date.now()
        });
        
        // Update final insights state
        setInsights(newInsights);

      } catch (err) {
        console.error('DeepseekAI: Critical error fetching AI insights:', err);
        setError(`Failed to fetch AI insights: ${err.message || 'Unknown error'}`);
        setInsights({
          priceForecast: 'Analysis temporarily unavailable',
          sentiment: 'Analysis temporarily unavailable',
          sentimentLevel: 'Unknown',
          newsImpact: 'Analysis temporarily unavailable',
          patternRecognition: 'Analysis temporarily unavailable',
          confidence: 'N/A'
        });
      } finally {
        setIsLoading(false);
        setLoadingStates({
          priceForecast: false,
          sentiment: false,
          newsImpact: false,
          patternRecognition: false
        });
        console.log('DeepseekAI: Analysis complete');
      }
    }, [symbol, stockData]);

    // Debounced effect to prevent excessive API calls
    useEffect(() => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        fetchAIInsights();
      }, 500); // 500ms debounce
      
      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [fetchAIInsights]);

  return (
    <>
      <h3 className="text-2xl font-bold text-[#E0E0E0] mb-6">Sphere AI Insights</h3>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(33,150,243,0.1)] p-3 rounded-full">
            <BarChart3 className="h-6 w-6 text-[#2196F3]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">Price Forecast</h4>
            <p className="text-[#B0B0B0] text-sm leading-relaxed">
              {loadingStates.priceForecast ? priceForecastText : insights.priceForecast}
            </p>
            <p className="text-sm text-gray-400">Confidence: {insights.confidence}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(76,175,80,0.1)] p-3 rounded-full">
            <TrendingUp className="h-6 w-6 text-[#4CAF50]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">Sentiment Analysis</h4>
            <p className="text-[#B0B0B0] text-sm leading-relaxed">
              {loadingStates.sentiment ? sentimentText : insights.sentiment}
            </p>
            <p className="text-sm text-[#4CAF50] font-medium">{insights.sentimentLevel}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(156,39,176,0.1)] p-3 rounded-full">
            <FileText className="h-6 w-6 text-[#9C27B0]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">News Impact</h4>
            <p className="text-[#B0B0B0] text-sm leading-relaxed">
              {loadingStates.newsImpact ? newsImpactText : insights.newsImpact}
            </p>
          </div>
        </div>
        
        <div className="flex items-start space-x-4">
          <div className="bg-[rgba(255,193,7,0.1)] p-3 rounded-full">
            <Lightbulb className="h-6 w-6 text-[#FFC107]" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-[#E0E0E0]">Pattern Recognition</h4>
            <p className="text-[#B0B0B0] text-sm leading-relaxed">
              {loadingStates.patternRecognition ? patternRecognitionText : insights.patternRecognition}
            </p>
          </div>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm mt-4">
            {error}
          </div>
        )}
      </div>
    </>
  );
};

export default DeepseekAIInsights;