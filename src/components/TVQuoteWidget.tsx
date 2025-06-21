import React, { useEffect, useRef } from 'react';

interface TVQuoteWidgetProps {
  symbol: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  isTransparent?: boolean;
}

const TVQuoteWidget: React.FC<TVQuoteWidgetProps> = ({
  symbol,
  width = "100%",
  height = "auto",
  className = "",
  isTransparent = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear previous widget if any
    containerRef.current.innerHTML = '';
    
    // Add widget container elements
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widgetContainer);
    
    // Create script element for widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js';
    
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

    // Format symbol correctly
    const formattedSymbol = getSymbolWithExchange(symbol);
    
    // Configure widget
    script.innerHTML = JSON.stringify({
      symbol: formattedSymbol,
      width: width,
      colorTheme: "dark",
      isTransparent: true, // Always transparent for better UI integration
      locale: "en",
      largeChartUrl: "", // Disable chart redirect
      layout: { attributionLogo: false } // Apply layout change to hide attribution logo
    });
    
    containerRef.current.appendChild(script);
    
    // Add much stronger CSS to hide ALL TradingView branding and enhance the price display
    const style = document.createElement('style');
    style.textContent = `
      /* Hide all TradingView branding */
      .tradingview-widget-copyright,
      a[href*="tradingview.com"],
      [class*="copyright"],
      [class*="trademark"],
      [class*="logo"],
      [class*="brand"],
      [class*="tv-widget-copyright"],
      .tv-widget-ticker__source,
      .tv-feed-widget__source,
      [href*="tradingview.com"],
      div[class*="title"] a,
      div[class*="watermark"],
      .tv-data-mode {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        z-index: -9999 !important;
      }
      
      /* Prevent all clicks */
      .tradingview-widget-container iframe {
        pointer-events: none !important;
      }
      
      /* Enhanced price display */
      .tv-widget-trading-ticker,
      .tv-ticker-item-last__last {
        font-size: 28px !important;
        font-weight: bold !important;
        padding: 8px 0 !important;
      }
      
      .tv-ticker-item-last__last-value {
        color: white !important;
      }
      
      /* Make positive change green and negative red */
      .tv-ticker-item-last__change-percent--up {
        color: #22c55e !important;
      }
      
      .tv-ticker-item-last__change-percent--down {
        color: #ef4444 !important;
      }
      
      /* Custom styling for cleaner interface */
      .tradingview-widget-container__widget {
        background-color: transparent !important;
        margin: 0 !important;
        padding: 8px 0 !important;
      }
      
      /* Remove extra padding and margins */
      .tv-ticker-item-last {
        padding: 0 !important;
        margin: 0 !important;
      }
      
      /* Enhance symbol display */
      .tv-ticker-item-last__symbol {
        display: none !important;
      }
    `;
    
    containerRef.current.appendChild(style);
    
    // Add event listener to prevent clicks
    const preventRedirect = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    containerRef.current.addEventListener('click', preventRedirect, true);
    
    // Additional measure: MutationObserver to catch and modify the iframe when it loads
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const iframes = containerRef.current?.querySelectorAll('iframe');
          if (iframes && iframes.length > 0) {
            iframes.forEach(iframe => {
              iframe.style.pointerEvents = 'none';
              try {
                if (iframe.contentDocument) {
                  const style = document.createElement('style');
                  style.textContent = `
                    * { pointer-events: none !important; }
                    [class*="copyright"], [class*="logo"], [class*="brand"], [href*="tradingview.com"] { 
                      display: none !important; 
                    }
                  `;
                  iframe.contentDocument.head.appendChild(style);
                }
              } catch (e) {
                // Ignore CORS errors
              }
            });
          }
        }
      });
    });
    
    observer.observe(containerRef.current, { childList: true, subtree: true });
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', preventRedirect, true);
        containerRef.current.innerHTML = '';
      }
      observer.disconnect();
    };
  }, [symbol, width, isTransparent]);

  return (
    <div 
      ref={containerRef}
      className={`tradingview-widget-container ${className}`}
      style={{ width, height }}
    ></div>
  );
};

export default TVQuoteWidget;