import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  BrainCircuit, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Send,
  Sparkles,
  User
} from 'lucide-react';
import { stockDataService, type StockQuote } from '@/lib/stockDataService';
import { fetchStockSentiment, type SentimentData } from '@/lib/sentimentService';

interface AIInsightsPanelProps {
  symbol: string;
  isConnected: boolean;
  onAITrade: () => void;
}

interface AIMessage {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
  tags?: string[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ symbol, isConnected, onAITrade }) => {
  const [selectedTab, setSelectedTab] = useState<string>('sentiment');
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const unsubscribeRef = useRef<null | (() => void)>(null);
  const [aiMetrics, setAiMetrics] = useState<{
    overallLabel: string;
    overallScore: number;
    confidence: number;
    signal: string;
    risk: string;
    newsSentiment?: number;
    socialSentiment?: number;
    insiderSentiment?: number;
    technicalSentiment?: number;
    updatedAt: number;
  } | null>(null);
  const lastAnalyzeRef = useRef<number>(0);

  // Confidence gating
  const CONFIDENCE_TARGET = 90;
  const MAX_RETRIES_FOR_CONFIDENCE = 2;

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

  const computeBaseline = (s: SentimentData | null): { overall: number; confidence: number; label: string } => {
    if (!s) return { overall: 0.5, confidence: 50, label: 'Neutral' };
    const overall = clamp(0.35 * (s.news ?? 0.5) + 0.25 * (s.social ?? 0.5) + 0.2 * (s.insider ?? 0.5) + 0.2 * (s.technical ?? 0.5), 0, 1);
    const confidence = clamp(Math.round(20 + 160 * Math.abs(overall - 0.5)), 20, 100);
    const label = overall >= 0.6 ? 'Bullish' : overall <= 0.4 ? 'Bearish' : 'Neutral';
    return { overall, confidence, label };
  };

  const generateAIAnalysisRef = useRef<(sym: string, q: StockQuote | null, s: SentimentData | null) => Promise<string>>();
  generateAIAnalysisRef.current = async (sym, q, s) => {
    const question = `Provide a concise trading analysis for ${sym}. Include: signal (BUY/HOLD/SELL), 3 key reasons, nearest support & resistance, short-term risk level, 1 actionable idea. Avoid hype.`;
    return callDeepSeekChat(sym, q, s, question, []);
  };

  // Subscribe to real-time quotes via stockDataService
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }
    try {
      unsubscribeRef.current = stockDataService.subscribe(symbol, (q) => {
        setQuote(q);
      });
    } catch (e) {
      console.error('Failed to subscribe to real-time quotes:', e);
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [symbol]);

  const tabs = [
    { id: 'sentiment', label: 'Sentiment', icon: TrendingUp },
    { id: 'technical', label: 'Technical', icon: TrendingDown },
    { id: 'price-target', label: 'Price Target', icon: TrendingUp },
    { id: 'risk-level', label: 'Risk Level', icon: AlertTriangle }
  ];

  const quickPrompts = [
    'Should I buy, hold, or sell?',
    'What are key risks right now?',
    'Support and resistance levels?',
    'Short-term vs long-term outlook?',
  ];

  // Parse optional metrics JSON if the model includes a metrics block
  type AIMetrics = {
    overall_label?: string;
    overallLabel?: string;
    overall_score?: number;
    overallScore?: number;
    confidence?: number;
    signal?: string;
    risk_level?: string;
    riskLevel?: string;
    news_sentiment?: number;
    newsSentiment?: number;
    social_sentiment?: number;
    socialSentiment?: number;
    insider_sentiment?: number;
    insiderSentiment?: number;
    technical_sentiment?: number;
    technicalSentiment?: number;
  };
  const extractMetricsAndText = useCallback((raw: string): { metrics?: AIMetrics; text: string } => {
    if (!raw) return { text: '' };
    let text = raw.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as AIMetrics;
        text = text.replace(jsonMatch[0], '').trim();
        return { metrics: parsed, text };
      } catch { /* ignore */ }
    }
    return { text };
  }, []);

  // Load basic data without AI analysis
  const loadBasicData = useCallback(async () => {
    setLoading(true);
    try {
      const [q, s] = await Promise.all([
        stockDataService.getStockQuote(symbol),
        fetchStockSentiment(symbol),
      ]);
      setQuote(q);
      setSentiment(s);
    } catch (e) {
      console.error('AIInsightsPanel loadBasicData error:', e);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // AI analysis - only called manually
  const runAIAnalysis = useCallback(async () => {
    if (!quote || !sentiment) {
      await loadBasicData();
    }
    
    setAiLoading(true);
    try {
      const currentQuote = quote || await stockDataService.getStockQuote(symbol);
      const currentSentiment = sentiment || await fetchStockSentiment(symbol);
      
      const analysis = generateAIAnalysisRef.current ? 
        await generateAIAnalysisRef.current(symbol, currentQuote, currentSentiment) : 
        'Analysis unavailable.';
      
      const summary: AIMessage = {
        id: 'ai-analysis-' + Date.now().toString(),
        type: 'ai',
        content: prettify(extractMetricsAndText(analysis).text),
        timestamp: new Date(),
        tags: ['AI Analysis'],
      };
      
      const parsed = extractMetricsAndText(analysis).metrics;
      if (parsed) {
        setAiMetrics({
          overallLabel: String(parsed.overall_label || parsed.overallLabel || ''),
          overallScore: Number(parsed.overall_score ?? parsed.overallScore ?? 0),
          confidence: Number(parsed.confidence ?? 0),
          signal: String(parsed.signal || ''),
          risk: String(parsed.risk_level || parsed.riskLevel || ''),
          newsSentiment: Number(parsed.news_sentiment ?? parsed.newsSentiment ?? undefined),
          socialSentiment: Number(parsed.social_sentiment ?? parsed.socialSentiment ?? undefined),
          insiderSentiment: Number(parsed.insider_sentiment ?? parsed.insiderSentiment ?? undefined),
          technicalSentiment: Number(parsed.technical_sentiment ?? parsed.technicalSentiment ?? undefined),
          updatedAt: Date.now(),
        });
      }
      
      lastAnalyzeRef.current = Date.now();
      setMessages((prev) => [summary, ...prev.filter(m => !m.id.startsWith('ai-analysis-'))]);
    } catch (e) {
      console.error('AIInsightsPanel runAIAnalysis error:', e);
    } finally {
      setAiLoading(false);
    }
  }, [symbol, quote, sentiment, extractMetricsAndText, loadBasicData]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        await loadBasicData();
      } catch (e) {
        console.error('AIInsightsPanel init error:', e);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [loadBasicData]);



  const overallLabel = useMemo(() => {
    if (!sentiment) return 'Neutral';
    if (sentiment.overall >= 0.6) return 'Bullish';
    if (sentiment.overall <= 0.4) return 'Bearish';
    return 'Neutral';
  }, [sentiment]);

  const riskLevel = useMemo(() => {
    const change = Math.abs(quote?.changePercent ?? 0);
    if (change >= 2.5) return 'High';
    if (change >= 1.0) return 'Medium';
    return 'Low';
  }, [quote]);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // Call DeepSeek with context to answer user's question
    try {
      setAiLoading(true);
      
      // Ensure we have current data
      const currentQuote = quote || await stockDataService.getStockQuote(symbol);
      const currentSentiment = sentiment || await fetchStockSentiment(symbol);
      
      const responseText = await callDeepSeekChat(
        symbol,
        currentQuote,
        currentSentiment,
        userMessage.content,
        messages.slice(-6)
      );
      
      const parsed = extractMetricsAndText(responseText);
      if (parsed.metrics) {
        setAiMetrics({
          overallLabel: String(parsed.metrics.overall_label || parsed.metrics.overallLabel || ''),
          overallScore: Number(parsed.metrics.overall_score ?? parsed.metrics.overallScore ?? 0),
          confidence: Number(parsed.metrics.confidence ?? 0),
          signal: String(parsed.metrics.signal || ''),
          risk: String(parsed.metrics.risk_level || parsed.metrics.riskLevel || ''),
          newsSentiment: Number(parsed.metrics.news_sentiment ?? parsed.metrics.newsSentiment ?? undefined),
          socialSentiment: Number(parsed.metrics.social_sentiment ?? parsed.metrics.socialSentiment ?? undefined),
          insiderSentiment: Number(parsed.metrics.insider_sentiment ?? parsed.metrics.insiderSentiment ?? undefined),
          technicalSentiment: Number(parsed.metrics.technical_sentiment ?? parsed.metrics.technicalSentiment ?? undefined),
          updatedAt: Date.now(),
        });
      }
      
      const aiResponse: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: prettify(parsed.text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (e) {
      console.error('DeepSeek chat error:', e);
      const fallback: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I could not reach the AI service right now. Please try again shortly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setAiLoading(false);
    }
  };

  

  // High-confidence AI metrics call (JSON only)
  const getAIMetrics = async (
    sym: string,
    q: StockQuote | null,
    s: SentimentData | null,
    retryCount: number = 0
  ): Promise<{ metrics: AIMetrics; confidence: number } | null> => {
    if (retryCount >= MAX_RETRIES_FOR_CONFIDENCE) {
      console.warn('Max retries reached for AI metrics');
      return null;
    }

    const baseline = computeBaseline(s);
    const system = `You are a professional quantitative analyst. You MUST provide ONLY a JSON object with high-confidence metrics.

REQUIRED JSON FORMAT (no other text):
{
  "overall_label": "Bullish|Bearish|Neutral",
  "overall_score": 0.XX,
  "confidence": XX,
  "signal": "BUY|HOLD|SELL",
  "risk_level": "Low|Medium|High",
  "news_sentiment": 0.XX,
  "social_sentiment": 0.XX,
  "insider_sentiment": 0.XX,
  "technical_sentiment": 0.XX
}

CRITICAL REQUIREMENTS:
- confidence MUST be 90 or higher (based on data quality and signal strength)
- All sentiment scores between 0.0-1.0 where:
  * 1.0 = 100% = Fully Bullish
  * 0.5 = 50% = Neutral 
  * 0.0 = 0% = Fully Bearish
- news_sentiment: analyze recent news impact (earnings, announcements, etc.) - be realistic based on actual news
- social_sentiment: social media/retail investor sentiment - reflect current market mood
- insider_sentiment: insider trading patterns and institutional activity - based on recent activity
- technical_sentiment: price action, volume, momentum indicators - current technical picture
- Each sentiment should reflect the SPECIFIC stock situation, not generic scores
- Scores should vary meaningfully between different stocks based on their individual circumstances
- If you cannot achieve 90% confidence, return confidence as your actual level
- Use all available data sources for accuracy
- No explanations, just valid JSON`;

    const context = {
      symbol: sym,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePercent: q?.changePercent ?? null,
      sentiment: s,
      baseline_overall: baseline.overall,
      baseline_confidence: baseline.confidence,
      timestamp: new Date().toISOString()
    };

    try {
      const resp = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Data: ${JSON.stringify(context)}` }
          ],
          temperature: 0.1,
          max_tokens: 200
        })
      });

      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      
      if (!content) throw new Error('Empty response');
      
      // Extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      
      const metrics = JSON.parse(jsonMatch[0]);
      const confidence = Number(metrics.confidence || 0);
      
      // Validate structure
      if (!metrics.overall_label || !metrics.signal || confidence === undefined ||
          metrics.news_sentiment === undefined || metrics.social_sentiment === undefined ||
          metrics.insider_sentiment === undefined || metrics.technical_sentiment === undefined) {
        throw new Error('Invalid metrics structure - missing required sentiment scores');
      }
      
      // Retry if confidence too low
      if (confidence < CONFIDENCE_TARGET) {
        console.log(`AI confidence ${confidence}% < ${CONFIDENCE_TARGET}%, retrying...`);
        return getAIMetrics(sym, q, s, retryCount + 1);
      }
      
      return { metrics, confidence };
    } catch (error) {
      console.error('AI metrics error:', error);
      if (retryCount < MAX_RETRIES_FOR_CONFIDENCE) {
        return getAIMetrics(sym, q, s, retryCount + 1);
      }
      return null;
    }
  };

  // Detailed analysis call (plain text only)
  const getAIAnalysis = async (
    sym: string,
    q: StockQuote | null,
    s: SentimentData | null,
    metrics: AIMetrics
  ): Promise<string> => {
    const system = `You are a professional trading analyst. Provide a detailed analysis in PLAIN TEXT format.

REQUIRED FORMAT (NO MARKDOWN, NO **, NO SPECIAL CHARACTERS):
${sym} Trading Analysis
SIGNAL: ${metrics.signal}
REASONS:
1) [detailed reason with specific data]
2) [detailed reason with specific data] 
3) [detailed reason with specific data]
LEVELS: Support [price]; Resistance [price]
RISK: ${metrics.risk_level.toLowerCase()} - [brief explanation]
IDEA: [specific actionable trading idea]

CRITICAL FORMATTING:
- Use decimal points correctly (0.73 not 0) 73)
- Use percentages correctly (61% not 61 percent)
- No parentheses around numbers except list markers
- Each section on new line
- Keep under 10 lines total`;

    const context = {
      symbol: sym,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePercent: q?.changePercent ?? null,
      sentiment: s,
      predetermined_signal: metrics.signal,
      predetermined_risk: metrics.risk_level,
      timestamp: new Date().toISOString()
    };

    try {
      const resp = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `Context: ${JSON.stringify(context)}` }
          ],
          temperature: 0.3,
          max_tokens: 400
        })
      });

      if (!resp.ok) throw new Error(`API error: ${resp.status}`);
      
      const data = await resp.json();
      return data?.choices?.[0]?.message?.content?.trim() || 'Analysis unavailable.';
    } catch (error) {
      console.error('AI analysis error:', error);
      return `${sym} Trading Analysis\nSIGNAL: ${metrics.signal}\nREASONS:\n1) Technical analysis shows mixed signals\n2) Market sentiment requires further analysis\n3) Current price action suggests caution\nLEVELS: Support ${q?.price ? (q.price * 0.95).toFixed(2) : 'N/A'}; Resistance ${q?.price ? (q.price * 1.05).toFixed(2) : 'N/A'}\nRISK: ${metrics.risk_level.toLowerCase()} - based on current volatility\nIDEA: Monitor for clearer signals before taking position`;
    }
  };

  const callDeepSeekChat = async (
    sym: string,
    q: StockQuote | null,
    s: SentimentData | null,
    userPrompt: string,
    history: AIMessage[]
  ): Promise<string> => {
    // For initial analysis, use the robust two-call system
    if (userPrompt.includes('trading analysis') || userPrompt.includes('analysis') || history.length === 0) {
      try {
        // Step 1: Get high-confidence metrics
        const metricsResult = await getAIMetrics(sym, q, s);
        
        if (!metricsResult || metricsResult.confidence < CONFIDENCE_TARGET) {
          const baseline = computeBaseline(s);
          return `${sym} Trading Analysis\nSIGNAL: HOLD\nREASONS:\n1) Insufficient data confidence for reliable analysis\n2) Current market conditions require more observation\n3) Recommended waiting for clearer signals\nLEVELS: Support ${q?.price ? (q.price * 0.95).toFixed(2) : 'N/A'}; Resistance ${q?.price ? (q.price * 1.05).toFixed(2) : 'N/A'}\nRISK: medium - low confidence in current analysis\nIDEA: Wait for better data before making trading decisions\n\n[Note: AI confidence below ${CONFIDENCE_TARGET}% threshold]`;
        }

        // Step 2: Get detailed analysis using the metrics
        const analysis = await getAIAnalysis(sym, q, s, metricsResult.metrics);
        
        // Store metrics for UI display
        setAiMetrics({
          overallLabel: metricsResult.metrics.overall_label,
          overallScore: metricsResult.metrics.overall_score,
          confidence: metricsResult.confidence,
          signal: metricsResult.metrics.signal,
          risk: metricsResult.metrics.risk_level,
          newsSentiment: metricsResult.metrics.news_sentiment,
          socialSentiment: metricsResult.metrics.social_sentiment,
          insiderSentiment: metricsResult.metrics.insider_sentiment,
          technicalSentiment: metricsResult.metrics.technical_sentiment,
          updatedAt: Date.now()
        });

        return analysis;
      } catch (error) {
        console.error('Robust AI analysis failed:', error);
        // Fallback to simple chat
      }
    }

    // For chat questions, use simpler system
    const system = `You are a professional trading assistant. Provide clear, factual responses about ${sym}. Use plain text, no markdown. Keep responses under 5 lines.`;
    
    const context = {
      symbol: sym,
      price: q?.price ?? null,
      change: q?.change ?? null,
      changePercent: q?.changePercent ?? null,
      sentiment: s,
      timestamp: new Date().toISOString()
    };

    const messagesPayload = [
      { role: 'system', content: system },
      { role: 'user', content: `Context: ${JSON.stringify(context)}` },
      ...history.slice(-4).map((m) => ({ 
        role: m.type === 'user' ? 'user' : 'assistant', 
        content: m.content 
      })),
      { role: 'user', content: userPrompt },
    ];

    try {
      const resp = await fetch('/api/deepseek/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: 'deepseek-chat', 
          messages: messagesPayload, 
          temperature: 0.2, 
          max_tokens: 300 
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`DeepSeek error ${resp.status}: ${text}`);
      }

      const data = await resp.json();
      return (data?.choices?.[0]?.message?.content || 'No response.').trim();
    } catch (error) {
      console.error('DeepSeek chat error:', error);
      throw error;
    }
  };

  // --- Advanced text cleanup for AI output ---
  const prettify = (text: string): string => {
    if (!text) return '';
    let t = text.trim();
    
    // Strip ALL markdown-like characters 
    t = t.replace(/[*`#_~]+/g, '');
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1'); // **bold** -> bold
    t = t.replace(/\*([^*]+)\*/g, '$1'); // *italic* -> italic
    
    // Fix common decimal/number artifacts from AI models
    // Pattern: "0) 73" -> "0.73", "225) 00" -> "225.00", "4) 24%" -> "4.24%", "(0) 53)" -> "0.53"
    t = t.replace(/\(?(\d{1,4})\)\s*(\d{1,3})(%|\))?/g, (match, a, b, suffix) => {
      // Only convert if it looks like a decimal (not list numbering)
      if (a.length <= 3 && b.length <= 3) {
        return `${a}.${b}${suffix === ')' ? '' : (suffix || '')}`;
      }
      return match;
    });
    
    // Fix specific patterns like "( 0) 53)" 
    t = t.replace(/\(\s*(\d{1,3})\)\s*(\d{1,3})\)/g, '$1.$2');
    
    // Remove orphaned parentheses and list artifacts
    t = t.replace(/\b0\)\s*/g, ''); // Remove stray "0) "
    t = t.replace(/\(\s*\)/g, ''); // Remove empty ()
    
    // Normalize labels to CAPS format
    t = t.replace(/\b(signal|signals?)\s*:/gi, 'SIGNAL:');
    t = t.replace(/\b(reason|reasons?)\s*:?/gi, 'REASONS:');
    t = t.replace(/\b(level|levels?)\s*:?/gi, 'LEVELS:');
    t = t.replace(/\b(risk|short[- ]?term\s+risk)\s*:?/gi, 'RISK:');
    t = t.replace(/\b(idea|actionable\s+idea)\s*:?/gi, 'IDEA:');
    
    // Fix title format
    t = t.replace(/^([A-Z]{2,6})\s+(trading\s+)?analysis\s*-?\s*/i, (_, sym) => 
      `${sym.toUpperCase()} Trading Analysis\n`);
    
    // Ensure proper line breaks for numbered items
    t = t.replace(/(\d+)\)\s*([A-Z])/g, '\n$1) $2');
    
    // Fix spacing after colons
    t = t.replace(/:([A-Z])/g, ': $1');
    
    // Ensure REASONS: is followed by a newline
    t = t.replace(/REASONS:\s*(?=\d)/g, 'REASONS:\n');
    
    // Clean up excessive whitespace
    t = t.replace(/\n{3,}/g, '\n\n');
    t = t.replace(/[ \t]{2,}/g, ' ');
    
    return t.trim();
  };

  

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'text-green-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="p-6 rounded-xl border border-slate-700 shadow-sm" style={{ backgroundColor: '#0E1117' }}>
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-2">

          <div>
            <h2 className="text-base font-semibold text-white leading-tight">AI Insights</h2>
            <p className="text-xs text-slate-400">Context-aware recommendations for {symbol}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-400" : "bg-red-400"
          )} />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Tabs in two rows + Analyze below */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
            const active = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
                aria-pressed={active}
              className={cn(
                  'px-3 py-2 text-xs rounded-md inline-flex items-center justify-center gap-1.5 transition-colors border',
                  active
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700'
              )}
              onClick={() => setSelectedTab(tab.id)}
            >
              <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
        </div>
        <button
          className="mt-2 w-full px-3 py-2 text-xs rounded-md bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={runAIAnalysis}
          disabled={aiLoading}
        >
          {aiLoading ? 'Running AI Analysis...' : 'Run AI Analysis'}
        </button>
      </div>

            {/* AI Analysis Summary */}
      <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700 mb-4">
        {loading ? (
          <div className="space-y-2 text-sm text-gray-400">Loading data…</div>
        ) : aiMetrics ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Overall:</span>
              <span className={cn("ml-2 font-medium", getSentimentColor(aiMetrics.overallLabel))}>
                {aiMetrics.overallLabel} ({Math.round(aiMetrics.overallScore * 100)}%)
              </span>
            </div>
            <div>
              <span className="text-gray-300">Confidence:</span>
              <span className={cn(
                "ml-2 font-medium",
                aiMetrics.confidence >= CONFIDENCE_TARGET ? "text-green-400" : "text-yellow-400"
              )}>
                {Math.round(aiMetrics.confidence)}%
                {aiMetrics.confidence < CONFIDENCE_TARGET && " (Low)"}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Signal:</span>
              <span className="ml-2 font-medium text-white">
                {aiMetrics.signal}
              </span>
            </div>
            <div>
              <span className="text-gray-300">Risk Level:</span>
              <span className={cn("ml-2 font-medium", getRiskColor(aiMetrics.risk))}>
                {aiMetrics.risk}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-400 py-2">
            <p>Click "Run AI Analysis" to get AI-powered insights</p>
          </div>
        )}
      </div>

      {/* Sentiment Breakdown */}
      {!loading && (aiMetrics || sentiment) && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          {([
            { 
              label: 'News', 
              value: aiMetrics?.newsSentiment ?? sentiment?.news ?? 0.5,
              isAI: aiMetrics?.newsSentiment !== undefined
            },
            { 
              label: 'Social', 
              value: aiMetrics?.socialSentiment ?? sentiment?.social ?? 0.5,
              isAI: aiMetrics?.socialSentiment !== undefined
            },
            { 
              label: 'Insider', 
              value: aiMetrics?.insiderSentiment ?? sentiment?.insider ?? 0.5,
              isAI: aiMetrics?.insiderSentiment !== undefined
            },
            { 
              label: 'Technical', 
              value: aiMetrics?.technicalSentiment ?? sentiment?.technical ?? 0.5,
              isAI: aiMetrics?.technicalSentiment !== undefined
            },
          ] as const).map((item) => (
            <div key={item.label} className="bg-slate-900/40 p-3 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-300 flex items-center gap-1">
                  {item.label}
                  {item.isAI && (
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border">AI</span>
                  )}
                </span>
                <span className={cn(
                  "font-medium",
                  item.value >= 0.6 ? "text-green-400" : 
                  item.value <= 0.4 ? "text-red-400" : 
                  "text-yellow-400"
                )}>
                  {Math.round(item.value * 100)}%
                </span>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-700">
                <div 
                  className="h-full transition-all rounded-full"
                  style={{ 
                    width: `${Math.round(item.value * 100)}%`,
                    backgroundColor: item.value >= 0.6 ? '#10b981' : 
                                   item.value <= 0.4 ? '#ef4444' : 
                                   '#eab308'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            className="px-2.5 py-1.5 text-xs bg-slate-900/40 hover:bg-slate-800 text-slate-200 rounded-md border border-slate-700"
            onClick={() => {
              setChatInput(prompt);
              setTimeout(() => handleSendMessage(), 0);
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* AI Chat Messages */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex gap-2', message.type === 'ai' ? 'flex-row' : 'flex-row-reverse')}> 
            <div className={cn('h-7 w-7 rounded-full flex items-center justify-center', message.type === 'ai' ? 'bg-blue-500/10' : 'bg-blue-600')}> 
              {message.type === 'ai' ? <BrainCircuit className="h-3.5 w-3.5 text-blue-400" /> : <User className="h-3.5 w-3.5 text-white" />} 
            </div>
            <div className={cn('max-w-[75%] p-3 rounded-lg text-sm shadow-sm', message.type === 'ai' ? 'bg-slate-900/40 text-slate-200 border border-slate-700' : 'bg-blue-600 text-white')}> 
              <p className="mb-1.5 leading-relaxed">{message.content}</p>
            {message.tags && message.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                {message.tags.map((tag) => (
                    <span key={tag} className="text-[10px] bg-slate-800/60 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{tag}</span>
                ))}
              </div>
            )}
              <div className="text-[10px] opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="relative mb-4">
        <Input 
          className="w-full bg-slate-900/40 rounded-md py-2.5 pl-3 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700" 
          placeholder="Ask me about the stock..." 
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button 
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-1.5 rounded-md hover:bg-blue-500 transition-colors shadow-sm"
          onClick={handleSendMessage}
        >
          <Send className="h-3 w-3 text-white" />
        </button>
      </div>

      {/* AI Trade Button */}
      <button 
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-500 transition-colors shadow-sm"
        onClick={onAITrade}
      >
        <Sparkles className="h-4 w-4" />
        <span>Trade with AI</span>
        <span className="bg-green-700 text-xs px-2 py-1 rounded">$3.99</span>
      </button>
      
      <p className="text-center text-xs text-gray-500 mt-2">
        Buying power will be charged at $3.99 per trade.
      </p>
    </div>
  );
};

export default AIInsightsPanel;
