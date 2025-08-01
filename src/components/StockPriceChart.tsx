import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePortfolio } from '@/context/PortfolioContext';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { CandlestickChart, ChevronsDown, ChevronsUp, Volume2, VolumeX, BarChart2, Sparkles, LineChart } from 'lucide-react';
import StockInfoCard from './StockInfoCard';
import StockAnalysisPanel from './StockAnalysisPanel';
import AITradeModal from './AITradeModal';
import TradeModal from './TradeModal';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { stockDataService } from '@/lib/stockDataService';
import type { CompanyInfo } from '@/lib/stockDataService';
import { usePolygonWebSocketData } from '@/hooks/usePolygonWebSocket';

// Price data structure from TradingView
interface TVPriceData {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
}

// TradingView widget interface
interface TVChartObject {
  symbol: () => string;
  interval: () => string;
  // Add other chart methods we might need in the future
}

// Define the TradingView widget return type
interface TVWidget {
  chart: () => TVChartObject;
  remove?: () => void;
}

// Define the TradingView widget configuration type
interface TVWidgetConfig {
  autosize: boolean;
  symbol: string;
  interval: string;
  timezone: string;
  theme: string;
  style: string;
  locale: string;
  toolbar_bg: string;
  enable_publishing: boolean;
  allow_symbol_change: boolean;
  container_id: string;
  hide_side_toolbar: boolean;
  show_popup_button: boolean;
  popup_width: string;
  popup_height: string;
  hide_volume: boolean;
  backgroundColor: string;
  gridColor: string;
  studies?: string[];
  save_image?: boolean;
}

interface StockPriceChartProps {
  symbol: string;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({ symbol }) => {
  const [interval, setInterval] = useState('D');
  const [showVolume, setShowVolume] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<{[key: string]: boolean}>({
    // Trend Indicators
    SMA: false,
    EMA: false,
    BB: false,
    Ichimoku: false,
    ParabolicSAR: false,
    ZigZag: false,

    // Momentum Indicators
    RSI: false,
    MACD: false,
    Stochastic: false,
    CCI: false,
    MFI: false,
    ROC: false,

    // Volume Indicators
    OBV: false,
    AccDist: false,
    CMF: false,

    // Volatility Indicators
    ATR: false,
    StdDev: false,

    // Oscillators
    WilliamsR: false,
    Momentum: false,
  });
  const [showOptions, setShowOptions] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change?: number;
    changePercent?: number;
  }>>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAITradeModalOpen, setIsAITradeModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Get portfolio context for executing trades
  const { executeOptionTrade } = usePortfolio();

  // Update refs to use number type which is what browser APIs return
  const timerRef = useRef<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const tvWidgetRef = useRef<TVWidget | null>(null);
  const priceUpdateIntervalRef = useRef<number | null>(null);

  const { stockData } = usePolygonWebSocketData([symbol]);
  const real = stockData[symbol];

  // Effect to load the TradingView script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Safety check to prevent null parentNode error
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Fetch company info
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [company, prices] = await Promise.all([
        stockDataService.getCompanyInfo(symbol),
        stockDataService.getHistoricalPrices(symbol, 30)
      ]);
      if (company) {
        setCompanyInfo(company);
      }
      setPriceData(prices);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch price data for currentPrice state (used by StockAnalysisPanel)
  const fetchCurrentPrice = async () => {
    try {
      const data = await stockDataService.getStockQuote(symbol);
      if (data) {
        setCurrentPrice(data.price);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  };

  // Initialize chart and fetch company data
  useEffect(() => {
    if (!symbol) return;

    fetchCompanyData();
    fetchCurrentPrice();
  }, [symbol]);

  // Function to determine the correct exchange for a symbol
  const getSymbolWithExchange = (symbol: string) => {
    // If symbol already includes exchange, return as is
    if (symbol.includes(':')) {
      return symbol;
    }

    // Common ETFs and their exchanges
    const etfExchanges: { [key: string]: string } = {
      // SPDR ETFs - try different exchange formats
      'SPY': 'AMEX',
      'XLF': 'NYSEARCA', 
      'XLK': 'NYSEARCA',
      'XLE': 'NYSEARCA',
      'XLI': 'NYSEARCA',
      'XLV': 'NYSEARCA',
      'XLY': 'NYSEARCA',
      'XLP': 'NYSEARCA',
      'XLU': 'NYSEARCA',
      'XLB': 'NYSEARCA',
      'XLRE': 'NYSEARCA',
      'XLC': 'NYSEARCA',
      
      // Vanguard ETFs
      'VTI': 'NYSEARCA',
      'VOO': 'NYSEARCA',
      'VEA': 'NYSEARCA',
      'VWO': 'NYSEARCA',
      'VIG': 'NYSEARCA',
      'VYM': 'NYSEARCA',
      'VB': 'NYSEARCA',
      'VO': 'NYSEARCA',
      'VV': 'NYSEARCA',
      
      // iShares ETFs
      'IWM': 'NYSEARCA',
      'EFA': 'NYSEARCA',
      'EEM': 'NYSEARCA',
      'AGG': 'NYSEARCA',
      'TLT': 'NYSEARCA',
      'IYR': 'NYSEARCA',
      'GLD': 'NYSEARCA',
      'SLV': 'NYSEARCA',
      
      // Other popular ETFs
      'QQQ': 'NASDAQ',
      'DIA': 'NYSEARCA',
      'IVV': 'NYSEARCA',
      'VNQ': 'NYSEARCA',
      'BND': 'NASDAQ',
      'VTEB': 'NASDAQ',
      'VXUS': 'NASDAQ'
    };

    // Check if it's a known ETF
    if (etfExchanges[symbol]) {
      return `${etfExchanges[symbol]}:${symbol}`;
    }

    // Default to NASDAQ for stocks and unknown symbols
    return `NASDAQ:${symbol}`;
  };

  // Create/recreate the TradingView widget when all conditions are met
  useEffect(() => {
    if (!loading && scriptLoaded && chartContainerRef.current && symbol) {
      if (tvWidgetRef.current) {
        tvWidgetRef.current.remove?.();
        tvWidgetRef.current = null;
      }
      
      const getActiveStudies = () => {
        const studies = [];
        if (showVolume) studies.push("Volume@tv-basicstudies");

        // Trend Indicators
        if (activeIndicators.SMA) studies.push("MASimple@tv-basicstudies");
        if (activeIndicators.EMA) studies.push("MAExp@tv-basicstudies");
        if (activeIndicators.BB) studies.push("BB@tv-basicstudies");
        if (activeIndicators.Ichimoku) studies.push("IchimokuCloud@tv-basicstudies");
        if (activeIndicators.ParabolicSAR) studies.push("PSAR@tv-basicstudies");
        if (activeIndicators.ZigZag) studies.push("ZigZag@tv-basicstudies");

        // Momentum Indicators
        if (activeIndicators.RSI) studies.push("RSI@tv-basicstudies");
        if (activeIndicators.MACD) studies.push("MACD@tv-basicstudies");
        if (activeIndicators.Stochastic) studies.push("Stochastic@tv-basicstudies");
        if (activeIndicators.CCI) studies.push("CCI@tv-basicstudies");
        if (activeIndicators.MFI) studies.push("MF@tv-basicstudies");
        if (activeIndicators.ROC) studies.push("ROC@tv-basicstudies");

        // Volume Indicators
        if (activeIndicators.OBV) studies.push("OBV@tv-basicstudies");
        if (activeIndicators.AccDist) studies.push("AccDist@tv-basicstudies");
        if (activeIndicators.CMF) studies.push("CMF@tv-basicstudies");

        // Volatility Indicators
        if (activeIndicators.ATR) studies.push("ATR@tv-basicstudies");
        if (activeIndicators.StdDev) studies.push("StdDev@tv-basicstudies");

        // Oscillators
        if (activeIndicators.WilliamsR) studies.push("WilliamsR@tv-basicstudies");
        if (activeIndicators.Momentum) studies.push("Momentum@tv-basicstudies");

        return studies;
      };

      const config: TVWidgetConfig = {
        autosize: true,
        symbol: getSymbolWithExchange(symbol),
        interval: interval || "D",
        timezone: "exchange",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#161a1e",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: "tradingview_chart",
        hide_side_toolbar: false,
        show_popup_button: true,
        popup_width: "1000",
        popup_height: "650",
        hide_volume: !showVolume,
        backgroundColor: "rgba(0, 0, 0, 1)",
        gridColor: "rgba(42, 46, 57, 0.3)",
        studies: getActiveStudies(),
        save_image: false
      };
      
      if (typeof (window as any).TradingView !== 'undefined' && chartContainerRef.current) {
        // Ensure the container element exists and is in the DOM
        const container = document.getElementById('tradingview_chart');
        if (container && container.parentNode) {
          const TradingViewWidget = ((window as any).TradingView as any).widget as new (config: TVWidgetConfig) => TVWidget;
          const widget = new TradingViewWidget(config);
          tvWidgetRef.current = widget;
        }
      }
    }

    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove?.();
        } catch (error) {
          console.warn('Error removing TradingView widget:', error);
        } finally {
          tvWidgetRef.current = null;
        }
      }
    };
  }, [loading, scriptLoaded, symbol, interval, showVolume, activeIndicators]);

  const handleIntervalChange = (value: string) => {
    if (value) setInterval(value);
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  const toggleIndicator = (indicator: string) => {
    setActiveIndicators(prev => ({
      ...prev,
      [indicator]: !prev[indicator]
    }));
  };

  // For trade modals, create a simple stock object
  const getStockObject = () => {
    return {
      id: symbol,
      symbol: symbol,
      name: companyInfo?.name || symbol,
      price: currentPrice || 0,
      change: priceData[priceData.length - 1]?.change || 0,
      changePercent: priceData[priceData.length - 1]?.changePercent || 0,
      volume: priceData[priceData.length - 1]?.volume || 0,
      sector: companyInfo?.sector || 'Unknown'
    };
  };

  // Handle option trade execution
  const handleOptionTrade = useCallback(async (option, quantity, type) => {
    try {
      if (!option || !option.symbol) {
        console.error('Invalid option contract:', option);
        return;
      }

      setIsSubmitting(true);

      const success = await executeOptionTrade(
        option,
        quantity,
        type
      );

      if (success) {
        setIsAITradeModalOpen(false);
      }
    } catch (error) {
      console.error('Error executing option trade:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [executeOptionTrade]);

  // Format for display
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] rounded-xl">
        <div className="text-[#E0E0E0]">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] rounded-xl overflow-hidden">
      {/* Chart header and controls */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center p-3 sm:p-4 border-b border-[#333333]">
        <ToggleGroup type="single" value={interval} onValueChange={handleIntervalChange} className="flex-wrap">
          <ToggleGroupItem value="5" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">5m</ToggleGroupItem>
          <ToggleGroupItem value="15" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">15m</ToggleGroupItem>
          <ToggleGroupItem value="60" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">1H</ToggleGroupItem>
          <ToggleGroupItem value="D" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">1D</ToggleGroupItem>
          <ToggleGroupItem value="W" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">1W</ToggleGroupItem>
          <ToggleGroupItem value="M" size="sm" className="text-[#E0E0E0] bg-[#1E1E1E] border-[#333333] hover:bg-[#333333] text-xs sm:text-sm">1M</ToggleGroupItem>
        </ToggleGroup>

        <div className="flex gap-2 ml-auto flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center bg-[#1E1E1E] border-[#333333] text-[#E0E0E0] hover:bg-[#333333]"
              >
                <LineChart className="mr-1 h-4 w-4" />
                Indicators
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-[#1E1E1E] border-[#333333] text-[#E0E0E0]">
              <div className="space-y-4">
                {/* Trend Indicators */}
                <div>
                  <h4 className="font-medium mb-2 text-sm text-[#E0E0E0]">Trend</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sma" checked={activeIndicators.SMA} onCheckedChange={() => toggleIndicator('SMA')} />
                      <Label htmlFor="sma" className="text-[#E0E0E0]">Simple MA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ema" checked={activeIndicators.EMA} onCheckedChange={() => toggleIndicator('EMA')} />
                      <Label htmlFor="ema" className="text-[#E0E0E0]">Exp. MA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bb" checked={activeIndicators.BB} onCheckedChange={() => toggleIndicator('BB')} />
                      <Label htmlFor="bb" className="text-[#E0E0E0]">Bollinger Bands</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="ichimoku" checked={activeIndicators.Ichimoku} onCheckedChange={() => toggleIndicator('Ichimoku')} />
                      <Label htmlFor="ichimoku" className="text-[#E0E0E0]">Ichimoku Cloud</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="psar" checked={activeIndicators.ParabolicSAR} onCheckedChange={() => toggleIndicator('ParabolicSAR')} />
                      <Label htmlFor="psar" className="text-[#E0E0E0]">Parabolic SAR</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="zigzag" checked={activeIndicators.ZigZag} onCheckedChange={() => toggleIndicator('ZigZag')} />
                      <Label htmlFor="zigzag" className="text-[#E0E0E0]">ZigZag</Label>
                    </div>
                  </div>
                </div>

                {/* Momentum Indicators */}
                <div>
                  <h4 className="font-medium mb-2 text-sm text-[#E0E0E0]">Momentum</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="rsi" checked={activeIndicators.RSI} onCheckedChange={() => toggleIndicator('RSI')} />
                      <Label htmlFor="rsi" className="text-[#E0E0E0]">RSI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="macd" checked={activeIndicators.MACD} onCheckedChange={() => toggleIndicator('MACD')} />
                      <Label htmlFor="macd" className="text-[#E0E0E0]">MACD</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="stoch" checked={activeIndicators.Stochastic} onCheckedChange={() => toggleIndicator('Stochastic')} />
                      <Label htmlFor="stoch" className="text-[#E0E0E0]">Stochastic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cci" checked={activeIndicators.CCI} onCheckedChange={() => toggleIndicator('CCI')} />
                      <Label htmlFor="cci" className="text-[#E0E0E0]">CCI</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="mfi" checked={activeIndicators.MFI} onCheckedChange={() => toggleIndicator('MFI')} />
                      <Label htmlFor="mfi" className="text-[#E0E0E0]">Money Flow Index</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="roc" checked={activeIndicators.ROC} onCheckedChange={() => toggleIndicator('ROC')} />
                      <Label htmlFor="roc" className="text-[#E0E0E0]">Rate of Change</Label>
                    </div>
                  </div>
                </div>

                {/* Volume Indicators */}
                <div>
                  <h4 className="font-medium mb-2 text-sm text-[#E0E0E0]">Volume</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="obv" checked={activeIndicators.OBV} onCheckedChange={() => toggleIndicator('OBV')} />
                      <Label htmlFor="obv" className="text-[#E0E0E0]">On-Balance Volume</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="accdist" checked={activeIndicators.AccDist} onCheckedChange={() => toggleIndicator('AccDist')} />
                      <Label htmlFor="accdist" className="text-[#E0E0E0]">Acc/Dist Line</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="cmf" checked={activeIndicators.CMF} onCheckedChange={() => toggleIndicator('CMF')} />
                      <Label htmlFor="cmf" className="text-[#E0E0E0]">Chaikin Money Flow</Label>
                    </div>
                  </div>
                </div>

                {/* Volatility Indicators */}
                <div>
                  <h4 className="font-medium mb-2 text-sm text-[#E0E0E0]">Volatility</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="atr" checked={activeIndicators.ATR} onCheckedChange={() => toggleIndicator('ATR')} />
                      <Label htmlFor="atr" className="text-[#E0E0E0]">Average True Range</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="stddev" checked={activeIndicators.StdDev} onCheckedChange={() => toggleIndicator('StdDev')} />
                      <Label htmlFor="stddev" className="text-[#E0E0E0]">Standard Deviation</Label>
                    </div>
                  </div>
                </div>

                {/* Oscillators */}
                <div>
                  <h4 className="font-medium mb-2 text-sm text-[#E0E0E0]">Oscillators</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="williamsr" checked={activeIndicators.WilliamsR} onCheckedChange={() => toggleIndicator('WilliamsR')} />
                      <Label htmlFor="williamsr" className="text-[#E0E0E0]">Williams %R</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="momentum" checked={activeIndicators.Momentum} onCheckedChange={() => toggleIndicator('Momentum')} />
                      <Label htmlFor="momentum" className="text-[#E0E0E0]">Momentum</Label>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVolume(!showVolume)}
            className="flex items-center bg-[#1E1E1E] border-[#333333] text-[#E0E0E0] hover:bg-[#333333]"
          >
            {showVolume ? <Volume2 className="mr-1 h-4 w-4" /> : <VolumeX className="mr-1 h-4 w-4" />}
            {showVolume ? 'Hide Volume' : 'Show Volume'}
          </Button>
        </div>
      </div>

      {/* TradingView Chart - main content */}
      <div className="w-full h-full" style={{ height: 'calc(100% - 70px)' }}>
        <div
          id="tradingview_chart"
          ref={chartContainerRef}
          className="bg-[#0a0a0a] w-full h-full"
          style={{ height: '100%', width: '100%' }}
        />
      </div>

      {/* Modals */}
      {isTradeModalOpen && currentPrice && (
        <TradeModal
          stock={getStockObject()}
          open={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          onTrade={async (quantity, price, type) => {
            console.log(`Trade executed: ${type} ${quantity} shares at ${price}`);
            setIsTradeModalOpen(false);
          }}
        />
      )}

      {isAITradeModalOpen && currentPrice && (
        <AITradeModal
          stock={getStockObject()}
          open={isAITradeModalOpen}
          onClose={() => setIsAITradeModalOpen(false)}
          onTrade={handleOptionTrade}
        />
      )}
    </div>
  );
};

// This is for the TypeScript global namespace
declare global {
  interface Window {
    TradingView: new (config: TVWidgetConfig) => TVWidget;
  }
}

export default StockPriceChart;