import { stockDataService } from '../stockDataService';
import { StockQuote } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

// Helper function to create a proper Response mock
const createMockResponse = (data: any): Response => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
    clone: jest.fn(),
    json: jest.fn().mockResolvedValue(data),
    bytes: jest.fn()
  } as Response;
};

describe('StockDataService', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset the mock implementation
    jest.mocked(global.fetch).mockReset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance when getInstance is called multiple times', () => {
      const instance1 = stockDataService;
      const instance2 = stockDataService;
      expect(instance1).toBe(instance2);
    });
  });

  describe('getStockQuote', () => {
    const mockYahooResponse = {
      chart: {
        result: [{
          meta: {
            regularMarketPrice: 150.5,
            previousClose: 148.5,
            chartPreviousClose: 148.5
          },
          indicators: {
            quote: [{
              open: [148.5],
              high: [151.0],
              low: [148.0],
              close: [150.5],
              volume: [1000000]
            }]
          },
          timestamp: [1234567890]
        }]
      }
    };

    it('should fetch and return stock quote data', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(createMockResponse(mockYahooResponse));

      const quote = await stockDataService.getStockQuote('AAPL');
      
      expect(quote).toMatchObject({
        symbol: 'AAPL',
        price: 150.5,
        previousClose: 148.5,
        change: 2,
        changePercent: expect.any(Number)
      });
    });

    it('should use cache for subsequent requests within TTL', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(createMockResponse(mockYahooResponse));

      // First call should fetch
      await stockDataService.getStockQuote('AAPL');
      
      // Second call should use cache
      await stockDataService.getStockQuote('AAPL');
      
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should bypass cache after TTL expiration', async () => {
      jest.mocked(global.fetch).mockResolvedValue(createMockResponse(mockYahooResponse));
      
      // First call
      await stockDataService.getStockQuote('AAPL');
      
      // Fast-forward time beyond TTL
      jest.useFakeTimers();
      jest.advanceTimersByTime(1000 * 60 * 6); // 6 minutes (assuming TTL is 5 minutes)
      
      // Second call should fetch again
      await stockDataService.getStockQuote('AAPL');
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
    
    it('should handle concurrent requests correctly', async () => {
      jest.mocked(global.fetch).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return createMockResponse(mockYahooResponse);
      });
      
      // Make 5 concurrent requests
      const promises = Array(5).fill(0).map(() => 
        stockDataService.getStockQuote('AAPL')
      );
      
      const results = await Promise.all(promises);
      
      // Should only call fetch once
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // All results should be the same
      results.forEach(result => {
        expect(result).toEqual(results[0]);
      });
    });

    it('should return mock data when API fails', async () => {
      jest.mocked(global.fetch).mockRejectedValueOnce(new Error('API Error'));

      const quote = await stockDataService.getStockQuote('AAPL');
      
      expect(quote).toMatchObject({
        symbol: 'AAPL',
        price: expect.any(Number),
        open: expect.any(Number),
        high: expect.any(Number),
        low: expect.any(Number),
        volume: expect.any(Number),
        previousClose: expect.any(Number),
        change: expect.any(Number),
        changePercent: expect.any(Number),
        latestTradingDay: expect.any(String)
      });
    });
  });

  describe('getOptionsData', () => {
    it('should generate and return options data', async () => {
      // Mock the getStockQuote method to return a fixed price
      const mockQuote: StockQuote = {
        symbol: 'AAPL',
        price: 150,
        open: 149,
        high: 151,
        low: 148,
        volume: 1000000,
        previousClose: 149,
        change: 1,
        changePercent: 0.67,
        latestTradingDay: '2023-01-01'
      };

      jest.mocked(global.fetch).mockResolvedValueOnce(createMockResponse({
        chart: {
          result: [{
            meta: { regularMarketPrice: 150 },
            indicators: { quote: [{ close: [150] }] },
            timestamp: [1234567890]
          }]
        }
      }));

      const options = await stockDataService.getOptionsData('AAPL');
      
      expect(options).toMatchObject({
        options: expect.arrayContaining([
          expect.objectContaining({
            contractSymbol: expect.any(String),
            strike: expect.any(Number),
            type: expect.stringMatching(/^(call|put)$/),
            expiration: expect.any(String),
            bid: expect.any(Number),
            ask: expect.any(Number),
            volume: expect.any(Number),
            openInterest: expect.any(Number),
            delta: expect.any(Number),
            gamma: expect.any(Number),
            theta: expect.any(Number),
            vega: expect.any(Number),
            rho: expect.any(Number)
          })
        ]),
        underlying: { price: expect.any(Number) }
      });
    });

    it('should use cache for subsequent options requests within TTL', async () => {
      jest.mocked(global.fetch).mockResolvedValue(createMockResponse({
        chart: {
          result: [{
            meta: { regularMarketPrice: 150 },
            indicators: { quote: [{ close: [150] }] },
            timestamp: [1234567890]
          }]
        }
      }));

      // First call should fetch
      await stockDataService.getOptionsData('AAPL');
      
      // Second call should use cache
      await stockDataService.getOptionsData('AAPL');
      
      // Should only call fetch once for the underlying stock price
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    it('should handle concurrent options requests correctly', async () => {
      jest.mocked(global.fetch).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return createMockResponse({
          chart: {
            result: [{
              meta: { regularMarketPrice: 150 },
              indicators: { quote: [{ close: [150] }] },
              timestamp: [1234567890]
            }]
          }
        });
      });
      
      // Make 5 concurrent requests
      const promises = Array(5).fill(0).map(() => 
        stockDataService.getOptionsData('AAPL')
      );
      
      const results = await Promise.all(promises);
      
      // Should only call fetch once for the underlying price
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // All results should be the same
      results.forEach(result => {
        expect(result).toEqual(results[0]);
      });
    });

    it('should handle specific option contract requests', async () => {
      jest.mocked(global.fetch).mockResolvedValueOnce(createMockResponse({
        chart: {
          result: [{
            meta: { regularMarketPrice: 150 },
            indicators: { quote: [{ close: [150] }] },
            timestamp: [1234567890]
          }]
        }
      }));

      const specificContract = 'AAPL230101C150';
      const options = await stockDataService.getOptionsData('AAPL', false, specificContract);
      
      expect(options).toMatchObject({
        options: [
          expect.objectContaining({
            contractSymbol: specificContract,
            strike: expect.any(Number),
            type: expect.stringMatching(/^(call|put)$/)
          })
        ],
        underlying: { price: expect.any(Number) }
      });
    });
  });
});
