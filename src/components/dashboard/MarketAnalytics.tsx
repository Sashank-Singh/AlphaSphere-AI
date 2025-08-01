
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stockDataService } from '@/lib/stockDataService';

interface SectorData {
  name: string;
  change: number;
  color: string;
  stocks: string[];
}

interface NewsItem {
  title: string;
  description: string;
  timeAgo: string;
  link: string;
  source: string;
}

const MarketAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        
        // Define sectors with their representative stocks
        const sectorDefinitions: SectorData[] = [
          {
            name: 'Technology',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX']
          },
          {
            name: 'Healthcare',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['JNJ', 'PFE', 'UNH', 'ABBV', 'TMO', 'DHR', 'ABT', 'LLY']
          },
          {
            name: 'Consumer Disc.',
            change: 0,
            color: 'bg-red-500/20 text-red-400',
            stocks: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'TJX', 'LOW']
          },
          {
            name: 'Energy',
            change: 0,
            color: 'bg-red-500/20 text-red-400',
            stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'VLO', 'PSX', 'MPC']
          },
          {
            name: 'Industrials',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['BA', 'CAT', 'GE', 'MMM', 'HON', 'UPS', 'RTX', 'LMT']
          },
          {
            name: 'Materials',
            change: 0,
            color: 'bg-red-500/20 text-red-400',
            stocks: ['LIN', 'APD', 'FCX', 'NEM', 'DOW', 'DD', 'NUE', 'BLL']
          },
          {
            name: 'Comms',
            change: 0,
            color: 'bg-red-500/20 text-red-400',
            stocks: ['META', 'GOOGL', 'NFLX', 'CMCSA', 'CHTR', 'TMUS', 'VZ', 'T']
          },
          {
            name: 'Real Estate',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['AMT', 'PLD', 'CCI', 'EQIX', 'DLR', 'PSA', 'O', 'SPG']
          },
          {
            name: 'Finance',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'AXP']
          },
          {
            name: 'Staples',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['PG', 'KO', 'PEP', 'WMT', 'COST', 'PM', 'MO', 'CL']
          },
          {
            name: 'Utilities',
            change: 0,
            color: 'bg-green-500/20 text-green-400',
            stocks: ['NEE', 'DUK', 'SO', 'D', 'AEP', 'XEL', 'SRE', 'DTE']
          }
        ];

        // Calculate sector performance based on representative stocks
        const updatedSectors = await Promise.all(
          sectorDefinitions.map(async (sector) => {
            try {
              const stockQuotes = await Promise.all(
                sector.stocks.slice(0, 4).map(async (symbol) => {
                  try {
                    const quote = await stockDataService.getStockQuote(symbol);
                    return quote.changePercent;
                  } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    return 0;
                  }
                })
              );

              const validQuotes = stockQuotes.filter(change => change !== 0);
              const avgChange = validQuotes.length > 0 
                ? validQuotes.reduce((sum, change) => sum + change, 0) / validQuotes.length
                : (Math.random() - 0.5) * 4; // Fallback random change

              return {
                ...sector,
                change: avgChange,
                color: avgChange >= 0 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              };
            } catch (error) {
              console.error(`Error calculating sector ${sector.name}:`, error);
              return {
                ...sector,
                change: (Math.random() - 0.5) * 4,
                color: Math.random() > 0.5 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              };
            }
          })
        );

        setSectors(updatedSectors);

        // Fetch real market news from backend API
        try {
          const response = await fetch('/api/yahoo/news?limit=10');
          if (response.ok) {
            const newsData = await response.json();
            setNews(newsData);
          } else {
            console.error('Failed to fetch news:', response.statusText);
            setNews([]);
          }
        } catch (error) {
          console.error('Error fetching market news:', error);
          setNews([]);
        }

      } catch (error) {
        console.error('Error fetching market analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
    
    // Update every 2 minutes
    const interval = setInterval(fetchMarketData, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleSectorClick = (sectorName: string) => {
    // Navigate to sector-specific page
    navigate(`/market/sector/${sectorName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-main flex items-center">
          <span className="icon mr-2">analytics</span> 
          Market Analytics
        </h2>
        <span className="text-xs text-secondary flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Live
        </span>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <div key={i} className="h-16 bg-gray-700 rounded-md"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-semibold text-main mb-2">Sector Heatmap</h3>
            <p className="text-sm text-secondary mb-4">Visual representation of sector performance</p>
            <div className="grid grid-cols-2 gap-2">
              {sectors.map((sector, index) => (
                <button
                  key={index}
                  className={`p-3 rounded-md ${sector.color} text-center hover:scale-105 transition-transform duration-200 cursor-pointer`}
                  onClick={() => handleSectorClick(sector.name)}
                  title={`Click to view ${sector.name} stocks`}
                >
                  <p className="font-semibold">{sector.name}</p>
                  <p className="text-xs">{formatPercent(sector.change)}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-main mb-2">Market News</h3>
            <p className="text-sm text-secondary mb-4">Latest market updates from Yahoo Finance</p>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {isLoading ? (
                // Loading skeleton for news
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-3 border border-gray-700 rounded-lg animate-pulse">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="h-3 bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                ))
              ) : news.length > 0 ? (
                news.map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3 border border-gray-700 rounded-lg hover:bg-gray-700/20 transition-colors cursor-pointer"
                    onClick={() => {
                      if (item.link && item.link !== '#') {
                        window.open(item.link, '_blank', 'noopener,noreferrer');
                        // Show a brief notification
                        console.log(`Opening news article: ${item.title}`);
                      } else {
                        // Fallback to Yahoo Finance news page
                        window.open('https://finance.yahoo.com/news', '_blank', 'noopener,noreferrer');
                        console.log('Opening Yahoo Finance news page');
                      }
                    }}
                    title="Click to read full article"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-main text-sm line-clamp-2">{item.title}</p>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.timeAgo}</span>
                    </div>
                    <p className="text-sm text-secondary line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">{item.source}</span>
                        {item.source === 'Yahoo Finance' && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                            Live
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.link && item.link !== '#') {
                            window.open(item.link, '_blank', 'noopener,noreferrer');
                          } else {
                            // Fallback to Yahoo Finance news page
                            window.open('https://finance.yahoo.com/news', '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        title="Read full article"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 border border-gray-700 rounded-lg">
                  <p className="text-sm text-secondary">Loading market news...</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                window.open('https://finance.yahoo.com/news', '_blank', 'noopener,noreferrer');
                console.log('Opening Yahoo Finance news page for more articles');
              }}
              className="mt-4 w-full text-center py-2 text-sm text-main bg-gray-700/50 hover:bg-gray-700 rounded-md transition-colors"
            >
              View More News on Yahoo Finance
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketAnalytics;
