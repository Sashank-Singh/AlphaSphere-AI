declare module 'react-tradingview-widget' {
  export interface TradingViewWidgetProps {
    /**
     * Symbol to display (e.g. "NASDAQ:AAPL")
     */
    symbol: string;
    
    /**
     * Widget interval (e.g. "1" for 1 minute, "D" for daily)
     */
    interval?: string;
    
    /**
     * Height of the widget
     */
    height?: number | string;
    
    /**
     * Width of the widget
     */
    width?: number | string;
    
    /**
     * If true, the widget will resize with its container
     */
    autosize?: boolean;
    
    /**
     * Theme of the widget ("light" or "dark")
     */
    theme?: 'light' | 'dark';
    
    /**
     * Style of the widget
     * 1 - for full-featured chart
     * 2 - for small chart
     * 3 - for widgets without buttons
     */
    style?: string | number;
    
    /**
     * Locale for the widget
     */
    locale?: string;
    
    /**
     * Background color of the toolbar
     */
    toolbar_bg?: string;
    
    /**
     * If true, the user can publish their chart setup
     */
    enable_publishing?: boolean;
    
    /**
     * If true, the top toolbar is hidden
     */
    hide_top_toolbar?: boolean;
    
    /**
     * If true, the side toolbar is hidden
     */
    hide_side_toolbar?: boolean;
    
    /**
     * If true, users can change the symbol
     */
    allow_symbol_change?: boolean;
    
    /**
     * If true, the date ranges widget is displayed
     */
    withdateranges?: boolean;
    
    /**
     * Container ID for the widget
     */
    container_id?: string;
    
    /**
     * Timezone for the chart
     */
    timezone?: string;
    
    /**
     * Studies (indicators) to display on the chart
     */
    studies?: string[];
    
    /**
     * If true, show a popup button
     */
    show_popup_button?: boolean;
    
    /**
     * Save drawings on the chart
     */
    save_image?: boolean;
    
    /**
     * Any additional options to pass to the widget
     */
    [key: string]: any;
  }

  export default function TradingViewWidget(props: TradingViewWidgetProps): JSX.Element;
} 