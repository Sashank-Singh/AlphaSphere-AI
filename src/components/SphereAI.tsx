import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, X, Minimize2, Loader2, CheckCircle, Copy as CopyIcon, RefreshCw, Trash2 } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';
import { cn } from '@/lib/utils';

interface AIResponse {
  type: string;
  title: string;
  content: string;
  recommendations?: string[];
  timestamp: Date;
}

interface Step {
  label: string;
  status: 'pending' | 'active' | 'done';
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
interface AnalyzeStockParams {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}



const MARKET_INDICES = ['SPY', 'QQQ', 'IWM', '^VIX'];

interface SphereAIProps {
  onClose?: () => void;
  isFloating?: boolean;
}

export const SphereAI: React.FC<SphereAIProps> = ({ onClose, isFloating = false }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [expandedInsightIds, setExpandedInsightIds] = useState<Set<number>>(new Set());
  const [isQuickSummoned, setIsQuickSummoned] = useState(false);
  const [enableQuickSummon, setEnableQuickSummon] = useState(true);
  const [fastMode, setFastMode] = useState(true);

  // Helper: Fallback mock
  const generateMockAIResponse = (query: string) => {
    return `Based on Yahoo Finance data analysis: ${query}. Market indicators suggest monitoring key support levels and volume patterns.`;
  };

  // DeepSeek helper that uses VITE_DEEPSEEK_API_KEY in browser when present, else proxies to backend which may use DEEPSEEK_API_KEY
  const callDeepSeek = async (
    messages: ChatMessage[],
    options?: { temperature?: number; maxTokens?: number; model?: string }
  ): Promise<string> => {
    const temperature = options?.temperature ?? 0.2;
    const max_tokens = options?.maxTokens ?? 400;
    const model = options?.model ?? 'deepseek-chat';
    const viteEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
    const viteKey = viteEnv?.VITE_DEEPSEEK_API_KEY;
    const hasFrontendKey = Boolean(viteKey);
    const url = hasFrontendKey ? 'https://api.deepseek.com/v1/chat/completions' : '/api/deepseek/chat';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (hasFrontendKey) {
      headers['Authorization'] = `Bearer ${viteKey}`;
    }
    const body = JSON.stringify({ model, messages, temperature, max_tokens });
    const resp = await fetch(url, { method: 'POST', headers, body });
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`DeepSeek error ${resp.status}: ${text}`);
    }
    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('DeepSeek returned empty content');
    return content;
  };

  const analyzeStock = async (params: AnalyzeStockParams): Promise<string> => {
    const system: ChatMessage = {
      role: 'system',
      content: `You are a professional trading analyst. Provide concise, PLAIN TEXT ONLY insights in EXACTLY this format (no extra lines, no markdown):
SIGNAL: BUY|HOLD|SELL
REASONS:
1) reason one with specific data
2) reason two with specific data
3) reason three with specific data
LEVELS: Support [price]; Resistance [price]
RISK: Low|Medium|High
IDEA: one actionable idea

Keep under 8 lines total.`
    };
    const user: ChatMessage = {
      role: 'user',
      content: `Analyze ${params.symbol} with current price ${params.price.toFixed(2)}, change ${params.change.toFixed(2)} (${params.changePercent.toFixed(2)}%), volume ${params.volume ?? 'N/A'}.`,
    };
    try {
      return await callDeepSeek([system, user], { temperature: fastMode ? 0.15 : 0.2, maxTokens: fastMode ? 180 : 350 });
    } catch (e) {
      console.error('analyzeStock DeepSeek failed, using mock:', e);
      return generateMockAIResponse(`${params.symbol} quick analysis`);
    }
  };

  const generateMarketInsights = async (symbols: string[]): Promise<string> => {
    try {
      type MiniQuote = { symbol: string; price: number | null; change: number | null; changePercent: number | null };
      const quotes: MiniQuote[] = await Promise.all(symbols.map(async (s): Promise<MiniQuote> => {
        try {
          const q = await stockDataService.getStockQuote(s);
          return { symbol: s, price: q.price, change: q.change, changePercent: q.changePercent };
        } catch {
          return { symbol: s, price: null, change: null, changePercent: null };
        }
      }));
      const system: ChatMessage = {
        role: 'system',
        content: 'You are a market strategist. Provide a brief market outlook in under 6 lines. Plain text only.'
      };
      const user: ChatMessage = { role: 'user', content: `Market indices context: ${JSON.stringify(quotes)}` };
      return await callDeepSeek([system, user], { temperature: fastMode ? 0.2 : 0.3, maxTokens: fastMode ? 180 : 300 });
    } catch (e) {
      console.error('generateMarketInsights DeepSeek failed, using mock:', e);
      return generateMockAIResponse(`Market outlook for ${symbols.join(', ')}`);
    }
  };

  // General chat that responds to what the user asks, using DeepSeek with recent history
  const chatWithAI = async (
    userText: string,
    history: { sender: 'user' | 'ai'; text: string }[]
  ): Promise<string> => {
    try {
      const system: ChatMessage = {
        role: 'system',
        content:
          'You are SphereAI, a helpful trading and markets assistant. Answer the user\'s question directly. If the question is about markets or stocks, use plain text (no markdown) and keep it under 5 lines. If it is general or casual, reply briefly and politely in 1-2 sentences.'
      };

      // Lightweight context: include a couple of indices and first market item if present
      const context = {
        indices: await Promise.all(['SPY', 'QQQ', 'IWM', '^VIX'].slice(0, 3).map(async (s) => {
          try { const q = await stockDataService.getStockQuote(s.replace('^','')); return { s, p: q.price, c: q.changePercent }; } catch { return { s, p: null, c: null }; }
        })),
        focus: marketData[0] ? {
          symbol: marketData[0].symbol,
          price: marketData[0].price,
          changePercent: marketData[0].changePercent
        } : null,
        timestamp: new Date().toISOString()
      };

      const historyMessages: ChatMessage[] = history.slice(-(fastMode ? 2 : 6)).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const messagesPayload: ChatMessage[] = [
        system,
        { role: 'user', content: `Context: ${JSON.stringify(context)}` },
        ...historyMessages,
        { role: 'user', content: userText }
      ];

      const reply = await callDeepSeek(messagesPayload, { temperature: fastMode ? 0.15 : 0.2, maxTokens: fastMode ? 200 : 320 });
      return reply;
    } catch (e) {
      console.error('chatWithAI error, using fallback:', e);
      return generateMockAIResponse(userText);
    }
  };

  useEffect(() => {
    fetchMarketOverview();
    const interval = setInterval(fetchMarketOverview, 60000); // 1 minute update
    return () => clearInterval(interval);
  }, []);

  // Quick Summon with Command key on macOS (toggle on press)
  useEffect(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent || navigator.platform || '');
    if (!isMac || !enableQuickSummon) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Meta' && !e.repeat) {
        setIsMinimized(false);
        setIsQuickSummoned((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsQuickSummoned(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [enableQuickSummon, setIsMinimized]);

  const fetchMarketOverview = async () => {
    setIsLoadingMarketData(true);
    try {
      const promises = MARKET_INDICES.map(symbol => stockDataService.getStockQuote(symbol).catch(() => null));
      const results = await Promise.all(promises);
      const validData = results.filter((data): data is MarketData => data !== null);
      setMarketData(validData);
    } catch (error) {
      console.error('Error fetching market overview:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };



  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    const currentChatInput = chatInput;
    setChatInput('');

    // V2: Intent detection
    const isFinancialQuery = /(price|details?|analyse|analysis|chart)/i.test(currentChatInput) && /[A-Z]{1,5}/.test(currentChatInput);
    const tickerMatch = currentChatInput.match(/[A-Z]{1,5}/);

    try {
      let reply: string;
      if (isFinancialQuery && tickerMatch) {
        const symbol = tickerMatch[0];
        try {
          const quote = await stockDataService.getStockQuote(symbol);
          reply = `${quote.symbol} is trading at $${quote.price.toFixed(2)} (${quote.change.toFixed(2)}, ${quote.changePercent.toFixed(2)}%).`;
        } catch (err) {
          reply = `Sorry, I couldn't fetch data for ${symbol}. Please check the ticker.`;
        }
      } else {
        reply = await chatWithAI(currentChatInput, [...chatMessages, userMessage]);
      }

      // Normalize/trim output for readability in compact cards
      const trimmed = reply.trim().replace(/\n{3,}/g, '\n\n');
      const aiResponse = { sender: 'ai' as const, text: trimmed };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat analysis failed:', error);
      const aiResponse = { sender: 'ai' as const, text: `I'm having trouble analyzing your request: "${currentChatInput}"` };
      setChatMessages(prev => [...prev, aiResponse]);
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    setResponses([]);
  };

  const handleClose = () => {
    // In floating mode, closing should minimize back to the white round button
    if (isFloating) {
      setIsQuickSummoned(false);
      setIsMinimized(true);
      return;
    }
    if (onClose) {
      onClose();
    } else {
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;



  // Floating button mode
  if (isFloating) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {isMinimized ? (
          <Button
            onClick={() => setIsMinimized(false)}
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all duration-300",
              "bg-white hover:bg-gray-100"
            )}
            size="icon"
          >
            <Brain className="w-6 h-6 text-gray-700" />

          </Button>
        ) : (
          <Card className="w-[90vw] max-w-sm bg-black border-neutral-800 shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                  <Brain className="w-4 h-4 text-black" />
                </div>
                <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Button aria-label="Minimize" variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsMinimized(true)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <button
                  onClick={() => setEnableQuickSummon(v => !v)}
                  title="Toggle Quick Summon (⌘)"
                  className="h-9 px-2 rounded-md text-xs text-neutral-300 border border-neutral-700 hover:text-white hover:bg-neutral-900 transition-colors"
                >
                  QS: {enableQuickSummon ? 'On' : 'Off'}
                </button>
                <button
                  onClick={() => setFastMode(v => !v)}
                  title="Toggle Fast Mode"
                  className="h-9 px-2 rounded-md text-xs text-neutral-300 border border-neutral-700 hover:text-white hover:bg-neutral-900 transition-colors"
                >
                  Speed: {fastMode ? 'Fast' : 'Normal'}
                </button>
                <Button
                  aria-label="Clear Chat"
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8"
                  onClick={handleClearChat}
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button aria-label="Close" variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <div className="flex flex-col flex-1 min-h-0">
              {/* Market Pulse - Fixed at top */}
              <div className="px-3 pt-3 pb-2 border-b border-neutral-800 flex-shrink-0">
                  <div>
                  <h3 className="text-sm font-semibold mb-3 text-neutral-400">Market Pulse</h3>
                    <div className="grid grid-cols-4 gap-2">
                    {marketData.map(item => (
                      <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                        <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                        <p className={cn(
                          'text-xs font-medium',
                          item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                        </p>
                      </div>
                    ))}
                    </div>
                  </div>
                  </div>

              {/* Chat messages - Scrollable area */}
              <ScrollArea className="flex-1 px-3 py-3 min-h-0">
                <div className="space-y-4">
                  {/* Chat messages display */}
                  {chatMessages.length > 0 && (
                    <div className="space-y-2">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={cn(
                          "text-sm p-2 rounded-lg",
                          msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                        )}>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  )}



                  {responses.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>
                      <div data-sphere-ai-insights className="space-y-3">
                      {responses.map((res, i) => (
                        <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                          <p className="font-semibold text-sm text-white">{res.title}</p>
                          <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                          <div className="text-sm space-y-1 whitespace-pre-line">
                            <p className={res.content.length > 320 && !expandedInsightIds.has(i) ? 'line-clamp-5' : ''}>{res.content}</p>
                            <div className="flex gap-3 items-center text-xs text-neutral-400">
                              <button
                                  className="hover:text-white transition-colors"
                                onClick={() => navigator.clipboard.writeText(res.content)}
                                aria-label="Copy insight"
                                title="Copy"
                              >
                                <span className="inline-flex items-center gap-1"><CopyIcon className="w-3.5 h-3.5" /> Copy</span>
                              </button>
                              <button
                                  className="hover:text-white transition-colors"
                                onClick={async () => {
                                  try {
                                    const symbol = marketData[0]?.symbol || 'SPY';
                                    const q = await stockDataService.getStockQuote(symbol);
                                    const refreshed = await analyzeStock({
                                      symbol,
                                      price: q.price,
                                      change: q.change,
                                      changePercent: q.changePercent,
                                      volume: q.volume,
                                    });
                                    setResponses(prev => prev.map((r, idx) => idx === i ? { ...r, content: refreshed } : r));
                                  } catch (e) {
                                    console.error('Refresh insight failed', e);
                                  }
                                }}
                                aria-label="Refresh insight"
                                title="Refresh"
                              >
                                <span className="inline-flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Refresh</span>
                              </button>
                            </div>
                            {res.content.length > 320 && (
                              <button
                                className="mt-1 text-xs text-blue-400 hover:underline"
                                onClick={() => {
                                  const next = new Set(expandedInsightIds);
                                  if (next.has(i)) next.delete(i); else next.add(i);
                                  setExpandedInsightIds(next);
                                }}
                              >
                                {expandedInsightIds.has(i) ? 'Show less' : 'Show more'}
                              </button>
                            )}
            {res.recommendations?.length ? (
              <div className="pt-1 space-y-1">
                {res.recommendations.map((rec, j) => <p key={j}>{rec}</p>)}
              </div>
            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  </div>
                </ScrollArea>

              {/* Chat input at bottom */}
              <div className="border-t border-neutral-800 p-3 flex-shrink-0">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Ask SphereAI..."
                    className="flex-1 bg-black border-neutral-700 text-white focus:ring-1 focus:ring-blue-500"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-neutral-200">Send</Button>
                </form>
              </div>
            </div>
          </Card>
        )}
        {/* Quick Summon Overlay (Floating mode) */}
        <SphereAIQuickOverlay
          visible={isQuickSummoned}
          onClose={() => setIsQuickSummoned(false)}
          onClear={handleClearChat}
          header={(
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-600/40">Quick Summon</span>
            </div>
          )}
          body={(
            <div className="flex flex-col h-full">
              {/* Market Pulse - Fixed at top */}
              <div className="px-3 pt-3 pb-2 border-b border-neutral-800">
                  <div>
                  <h3 className="text-sm font-semibold mb-3 text-neutral-400">Market Pulse</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {marketData.map(item => (
                        <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                          <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                          <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                          <p className={cn(
                            'text-xs font-medium',
                            item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                          )}>
                            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  </div>

              {/* Chat messages - Scrollable area */}
              <ScrollArea className="flex-1 px-3 py-3">
                <div className="space-y-4">
                  {/* Chat messages display */}
                  {chatMessages.length > 0 && (
                    <div className="space-y-2">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={cn(
                          "text-sm p-2 rounded-lg",
                          msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                        )}>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  )}



                  {responses.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>
                      <div data-sphere-ai-insights className="space-y-3">
                      {responses.map((res, i) => (
                        <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                          <p className="font-semibold text-sm text-white">{res.title}</p>
                          <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                          <div className="text-sm space-y-1 whitespace-pre-line">
                            <p className={res.content.length > 320 && !expandedInsightIds.has(i) ? 'line-clamp-5' : ''}>{res.content}</p>
                            <div className="flex gap-3 items-center text-xs text-neutral-400">
                                <button className="hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(res.content)} aria-label="Copy insight" title="Copy">
                                <span className="inline-flex items-center gap-1"><CopyIcon className="w-3.5 h-3.5" /> Copy</span>
                              </button>
                                <button className="hover:text-white transition-colors" onClick={async () => {
                                try {
                                  const symbol = marketData[0]?.symbol || 'SPY';
                                  const q = await stockDataService.getStockQuote(symbol);
                                  const refreshed = await analyzeStock({ symbol, price: q.price, change: q.change, changePercent: q.changePercent, volume: q.volume });
                                  setResponses(prev => prev.map((r, idx) => idx === i ? { ...r, content: refreshed } : r));
                                } catch (e) { console.error('Refresh insight failed', e); }
                              }} aria-label="Refresh insight" title="Refresh">
                                <span className="inline-flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Refresh</span>
                              </button>
                            </div>
                            {res.content.length > 320 && (
                              <button className="mt-1 text-xs text-blue-400 hover:underline" onClick={() => {
                                const next = new Set(expandedInsightIds);
                                if (next.has(i)) next.delete(i); else next.add(i);
                                setExpandedInsightIds(next);
                              }}>
                                {expandedInsightIds.has(i) ? 'Show less' : 'Show more'}
                              </button>
                            )}
                            {res.recommendations?.length ? (
                              <div className="pt-1 space-y-1">
                                {res.recommendations.map((rec, j) => <p key={j}>{rec}</p>)}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                  </div>
                </ScrollArea>
              
              {/* Chat input at bottom */}
              <div className="border-t border-neutral-800 p-3 flex-shrink-0">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <Input 
                    placeholder="Ask SphereAI..."
                    className="flex-1 bg-black border-neutral-700 text-white focus:ring-1 focus:ring-blue-500"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-neutral-200">Send</Button>
                </form>
              </div>
            </div>
          )}
        />
      </div>
    );
  }

  // Regular mode (for pages that use it directly)
  return (
    <>
    <Card className="w-80 bg-black border-neutral-800 shadow-2xl rounded-2xl flex flex-col h-96">
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-black" />
          </div>
          <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button aria-label="Minimize" variant="ghost" size="icon" className="w-8 h-8" onClick={() => setIsMinimized(!isMinimized)}>
            <Minimize2 className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setEnableQuickSummon(v => !v)}
            title="Toggle Quick Summon (⌘)"
            className="h-7 px-2 rounded-md text-xs text-neutral-300 border border-neutral-700 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            QS: {enableQuickSummon ? 'On' : 'Off'}
          </button>
          <button
            onClick={() => setFastMode(v => !v)}
            title="Toggle Fast Mode"
            className="h-7 px-2 rounded-md text-xs text-neutral-300 border border-neutral-700 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Speed: {fastMode ? 'Fast' : 'Normal'}
          </button>
          <Button
            aria-label="Clear Chat"
            variant="ghost"
            size="icon"
            className="w-8 h-8"
            onClick={handleClearChat}
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button aria-label="Close" variant="ghost" size="icon" className="w-8 h-8" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Market Pulse - Fixed at top */}
          <div className="px-3 pt-3 pb-2 border-b border-neutral-800 flex-shrink-0">
              <div>
              <h3 className="text-sm font-semibold mb-3 text-neutral-400">Market Pulse</h3>
              <div className="grid grid-cols-4 gap-2">
                {marketData.map(item => (
                  <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                    <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    <p className={cn(
                      'text-xs font-medium',
                      item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                ))}
                </div>
              </div>
              </div>

          {/* Chat messages - Scrollable area */}
          <ScrollArea className="flex-1 px-3 py-3 min-h-0">
            <div className="space-y-4">
              {/* Chat messages display */}
              {chatMessages.length > 0 && (
                <div className="space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "text-sm p-2 rounded-lg",
                      msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                    )}>
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}



              {responses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>
                  <div data-sphere-ai-insights className="space-y-3">
                  {responses.map((res, i) => (
                    <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                      <p className="font-semibold text-sm text-white">{res.title}</p>
                      <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                      <div className="text-sm space-y-1">
                            <p>{res.content}</p>
                            {res.recommendations?.length ? (
                              <div className="pt-1 space-y-1">
                                {res.recommendations.map((rec, j) => <p key={j}>{rec}</p>)}
                              </div>
                            ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
              </div>
            </ScrollArea>

          {/* Chat input at bottom */}
          <div className="border-t border-neutral-800 p-3 flex-shrink-0">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input 
                placeholder="Ask SphereAI..."
                className="flex-1 bg-black border-neutral-700 text-white focus:ring-1 focus:ring-blue-500"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <Button type="submit" variant="secondary" className="bg-white text-black hover:bg-neutral-200">Send</Button>
            </form>
          </div>
        </div>
      )}
    </Card>

    {/* Quick Summon Overlay (Regular mode) */}
    <SphereAIQuickOverlay
      visible={isQuickSummoned}
      onClose={() => setIsQuickSummoned(false)}
      onClear={handleClearChat}
      header={(
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-black" />
          </div>
          <CardTitle className="text-md font-bold text-white">SphereAI</CardTitle>
          <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-600/40">Quick Summon</span>
        </div>
      )}
      body={(
        <div className="flex flex-col h-full">
          {/* Market Pulse - Fixed at top */}
          <div className="px-3 pt-3 pb-2 border-b border-neutral-800">
              <div>
              <h3 className="text-sm font-semibold mb-3 text-neutral-400">Market Pulse</h3>
              <div className="grid grid-cols-4 gap-2">
                {marketData.map(item => (
                  <div key={item.symbol} className="bg-neutral-900 p-2 rounded-md text-center">
                    <p className="text-xs font-bold text-neutral-200">{item.symbol}</p>
                    <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                    <p className={cn(
                      'text-xs font-medium',
                      item.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                ))}
                </div>
              </div>
              </div>

          {/* Chat messages - Scrollable area */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-4">
              {/* Chat messages display */}
              {chatMessages.length > 0 && (
                <div className="space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "text-sm p-2 rounded-lg",
                      msg.sender === 'user' ? "bg-blue-500 text-white self-end" : "bg-neutral-800 text-white"
                    )}>
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}



              {responses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-neutral-400">Recent Insights</h3>
                  <div data-sphere-ai-insights className="space-y-3">
                  {responses.map((res, i) => (
                    <div key={i} className="p-3 bg-neutral-900 rounded-lg border border-neutral-800">
                      <p className="font-semibold text-sm text-white">{res.title}</p>
                      <p className="text-xs text-neutral-500 mb-2">{res.timestamp.toLocaleTimeString()}</p>
                      <div className="text-sm space-y-1 whitespace-pre-line">
                        <p className={res.content.length > 320 && !expandedInsightIds.has(i) ? 'line-clamp-5' : ''}>{res.content}</p>
                        {res.recommendations?.length ? (
                          <div className="pt-1 space-y-1">
                            {res.recommendations.map((rec, j) => <p key={j}>{rec}</p>)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </ScrollArea>

        </div>
      )}
    />
    </>
  );
};

// Overlay Quick Summon View
export const SphereAIQuickOverlay: React.FC<{
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
  header: React.ReactNode;
  body: React.ReactNode;
}> = ({ visible, onClose, onClear, header, body }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-150">
      <div className="relative w-[95vw] max-w-2xl h-[85vh] max-h-[700px] transform transition-all duration-150">
        <Card className="w-full h-full bg-black border-neutral-800 shadow-2xl rounded-2xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-neutral-800">
            {header}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8"
                onClick={onClear}
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <div className="flex-1 min-h-0">{body}</div>
        </Card>
      </div>
    </div>
  );
};