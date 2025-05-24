
// Mock Polygon API implementation
export interface PolygonQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface PolygonNewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  published_utc: string;
  author: string;
  tickers: string[];
}

class PolygonApi {
  private apiKey: string;

  constructor(apiKey: string = 'demo') {
    this.apiKey = apiKey;
  }

  async getQuote(symbol: string): Promise<PolygonQuote> {
    // Mock implementation
    const basePrice = 100 + Math.random() * 400;
    const change = (Math.random() - 0.5) * 10;
    
    return {
      symbol,
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      volume: Math.floor(Math.random() * 1000000)
    };
  }

  async getNews(symbol?: string): Promise<PolygonNewsItem[]> {
    // Mock implementation
    return [
      {
        id: '1',
        title: `${symbol || 'Market'} Shows Strong Performance`,
        description: 'Market analysis shows positive trends...',
        url: '#',
        published_utc: new Date().toISOString(),
        author: 'Market Analyst',
        tickers: symbol ? [symbol] : ['SPY', 'QQQ']
      }
    ];
  }
}

export default PolygonApi;
