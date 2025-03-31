import React, { useEffect, useRef } from 'react';

interface TVTimelineWidgetProps {
  width?: string;
  height?: string;
  colorTheme?: 'light' | 'dark';
  symbol?: string;
  isMarketNews?: boolean;
}

const TVTimelineWidget: React.FC<TVTimelineWidgetProps> = ({
  width = '100%',
  height = '800',
  colorTheme = 'dark',
  symbol,
  isMarketNews = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: isMarketNews ? "market" : "symbol",
      ...(isMarketNews ? { market: "stock" } : { symbol }),
      isTransparent: true,
      displayMode: "regular",
      width,
      height,
      colorTheme,
      locale: "en",
      importanceFilter: "-1,0,1"
    });

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      const widgetDiv = document.createElement('div');
      widgetDiv.className = 'tradingview-widget-container__widget';
      containerRef.current.appendChild(widgetDiv);
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [width, height, colorTheme, symbol, isMarketNews]);

  return (
    <div className="tradingview-widget-container w-full" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default TVTimelineWidget; 