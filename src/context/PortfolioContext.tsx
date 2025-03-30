import React, { createContext, useState, useContext, useEffect } from 'react';
import { Portfolio, Transaction, Position, OptionContract, Stock } from '@/types';
import { mockPortfolio, getStockByTicker } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface PortfolioContextType {
  portfolio: Portfolio;
  isLoading: boolean;
  executeStockTrade: (ticker: string, quantity: number, price: number, type: 'buy' | 'sell') => Promise<boolean>;
  executeOptionTrade: (option: OptionContract, quantity: number, type: 'buy' | 'sell') => Promise<boolean>;
  resetPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load portfolio from localStorage if available
    const loadPortfolio = async () => {
      try {
        const savedPortfolio = localStorage.getItem('tradingAppPortfolio');
        if (savedPortfolio) {
          const parsed = JSON.parse(savedPortfolio);
          
          // Convert string dates back to Date objects
          const portfolioWithDates = {
            ...parsed,
            optionPositions: parsed.optionPositions.map((pos: any) => ({
              ...pos,
              expiryDate: new Date(pos.expiryDate)
            })),
            transactions: parsed.transactions.map((tx: any) => ({
              ...tx,
              date: new Date(tx.date),
              optionDetails: tx.optionDetails ? {
                ...tx.optionDetails,
                expiryDate: new Date(tx.optionDetails.expiryDate)
              } : undefined
            }))
          };
          
          setPortfolio(portfolioWithDates);
        } else {
          setPortfolio(mockPortfolio);
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
        setPortfolio(mockPortfolio);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  // Save portfolio whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tradingAppPortfolio', JSON.stringify(portfolio));
    }
  }, [portfolio, isLoading]);

  const executeStockTrade = async (ticker: string, quantity: number, price: number, type: 'buy' | 'sell'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get stock details
      const stock = getStockByTicker(ticker);
      if (!stock) {
        toast({
          title: "Error",
          description: `Stock with ticker ${ticker} not found.`,
          variant: "destructive"
        });
        return false;
      }
      
      const total = quantity * price;
      
      // Check if user can afford the trade (for buys)
      if (type === 'buy' && total > portfolio.cash) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough cash for this trade.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user has enough shares (for sells)
      if (type === 'sell') {
        const position = portfolio.positions.find(p => p.ticker === ticker);
        if (!position || position.quantity < quantity) {
          toast({
            title: "Insufficient Shares",
            description: "You don't have enough shares to sell.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Create new transaction
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date(),
        type,
        assetType: 'stock',
        ticker,
        quantity,
        price,
        total: type === 'buy' ? total : -total,
      };
      
      // Update positions
      let updatedPositions: Position[] = [...portfolio.positions];
      const existingPosition = updatedPositions.find(p => p.ticker === ticker);
      
      if (type === 'buy') {
        if (existingPosition) {
          // Update existing position
          const newQuantity = existingPosition.quantity + quantity;
          const newAvgPrice = (existingPosition.quantity * existingPosition.averagePrice + quantity * price) / newQuantity;
          
          updatedPositions = updatedPositions.map(p => 
            p.ticker === ticker 
              ? { ...p, quantity: newQuantity, averagePrice: newAvgPrice, currentPrice: price } 
              : p
          );
        } else {
          // Create new position
          updatedPositions.push({
            id: `pos-${Date.now()}`,
            stockId: stock.id,
            ticker,
            name: stock.name,
            quantity,
            averagePrice: price,
            currentPrice: price,
          });
        }
      } else { // Sell
        if (existingPosition) {
          if (existingPosition.quantity === quantity) {
            // Remove position entirely
            updatedPositions = updatedPositions.filter(p => p.ticker !== ticker);
          } else {
            // Reduce position quantity (keep average price the same)
            updatedPositions = updatedPositions.map(p => 
              p.ticker === ticker 
                ? { ...p, quantity: p.quantity - quantity, currentPrice: price } 
                : p
            );
          }
        }
      }
      
      // Update cash
      const newCash = type === 'buy' 
        ? portfolio.cash - total 
        : portfolio.cash + total;
      
      // Calculate new total value (cash + positions value)
      const positionsValue = updatedPositions.reduce(
        (sum, position) => sum + (position.quantity * position.currentPrice), 
        0
      );
      
      const optionsValue = portfolio.optionPositions.reduce(
        (sum, option) => sum + ((option.quantity || 0) * option.premium * 100), 
        0
      );
      
      // Update portfolio
      setPortfolio({
        ...portfolio,
        cash: newCash,
        totalValue: newCash + positionsValue + optionsValue,
        positions: updatedPositions,
        transactions: [transaction, ...portfolio.transactions]
      });
      
      toast({
        title: "Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${ticker}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error executing stock trade:', error);
      toast({
        title: "Trade Failed",
        description: "An error occurred while executing the trade.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeOptionTrade = async (option: OptionContract, quantity: number, type: 'buy' | 'sell'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Calculate total cost (premium * 100 * quantity)
      const total = option.premium * 100 * quantity;
      
      // Check if user can afford the trade (for buys)
      if (type === 'buy' && total > portfolio.cash) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough cash for this option trade.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user has the option (for sells)
      if (type === 'sell') {
        const position = portfolio.optionPositions.find(p => 
          p.ticker === option.ticker && 
          p.type === option.type && 
          p.strikePrice === option.strikePrice &&
          p.expiryDate.getTime() === option.expiryDate.getTime()
        );
        
        if (!position || (position.quantity || 0) < quantity) {
          toast({
            title: "Insufficient Options",
            description: "You don't have enough option contracts to sell.",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Create new transaction
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date(),
        type,
        assetType: 'option',
        ticker: option.ticker,
        quantity,
        price: option.premium,
        total: type === 'buy' ? total : -total,
        optionDetails: {
          type: option.type,
          strikePrice: option.strikePrice,
          expiryDate: option.expiryDate,
          premium: option.premium,
        },
      };
      
      // Update option positions
      let updatedOptionPositions = [...portfolio.optionPositions];
      const existingPosition = updatedOptionPositions.find(p => 
        p.ticker === option.ticker && 
        p.type === option.type && 
        p.strikePrice === option.strikePrice &&
        p.expiryDate.getTime() === option.expiryDate.getTime()
      );
      
      if (type === 'buy') {
        if (existingPosition) {
          // Update existing position
          updatedOptionPositions = updatedOptionPositions.map(p => 
            (p.ticker === option.ticker && 
             p.type === option.type && 
             p.strikePrice === option.strikePrice &&
             p.expiryDate.getTime() === option.expiryDate.getTime())
              ? { ...p, quantity: (p.quantity || 0) + quantity, premium: option.premium } 
              : p
          );
        } else {
          // Create new position
          updatedOptionPositions.push({
            ...option,
            id: `opt-${Date.now()}`,
            quantity,
          });
        }
      } else { // Sell
        if (existingPosition) {
          if ((existingPosition.quantity || 0) === quantity) {
            // Remove position entirely
            updatedOptionPositions = updatedOptionPositions.filter(p => 
              !(p.ticker === option.ticker && 
                p.type === option.type && 
                p.strikePrice === option.strikePrice &&
                p.expiryDate.getTime() === option.expiryDate.getTime())
            );
          } else {
            // Reduce position quantity
            updatedOptionPositions = updatedOptionPositions.map(p => 
              (p.ticker === option.ticker && 
               p.type === option.type && 
               p.strikePrice === option.strikePrice &&
               p.expiryDate.getTime() === option.expiryDate.getTime())
                ? { ...p, quantity: (p.quantity || 0) - quantity } 
                : p
            );
          }
        }
      }
      
      // Update cash
      const newCash = type === 'buy' 
        ? portfolio.cash - total 
        : portfolio.cash + total;
      
      // Calculate new total value (cash + positions value + options value)
      const positionsValue = portfolio.positions.reduce(
        (sum, position) => sum + (position.quantity * position.currentPrice), 
        0
      );
      
      const optionsValue = updatedOptionPositions.reduce(
        (sum, option) => sum + ((option.quantity || 0) * option.premium * 100), 
        0
      );
      
      // Update portfolio
      setPortfolio({
        ...portfolio,
        cash: newCash,
        totalValue: newCash + positionsValue + optionsValue,
        optionPositions: updatedOptionPositions,
        transactions: [transaction, ...portfolio.transactions]
      });
      
      toast({
        title: "Option Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} ${option.type} option(s) for ${option.ticker}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error executing option trade:', error);
      toast({
        title: "Option Trade Failed",
        description: "An error occurred while executing the option trade.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPortfolio = () => {
    setPortfolio({
      cash: 10000,
      totalValue: 10000,
      positions: [],
      optionPositions: [],
      transactions: [],
    });
    
    toast({
      title: "Portfolio Reset",
      description: "Your portfolio has been reset to $10,000.",
    });
  };

  return (
    <PortfolioContext.Provider 
      value={{ 
        portfolio, 
        isLoading, 
        executeStockTrade, 
        executeOptionTrade,
        resetPortfolio 
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
