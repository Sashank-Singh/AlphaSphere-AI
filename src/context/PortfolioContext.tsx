import React, { createContext, useState, useContext, useEffect } from 'react';
import { Portfolio, Transaction, Position, OptionContract, Stock } from '@/types';
import { mockPortfolio, getStockBySymbol } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface PortfolioContextType {
  portfolio: Portfolio;
  isLoading: boolean;
  executeStockTrade: (symbol: string, quantity: number, price: number, type: 'buy' | 'sell') => Promise<boolean>;
  executeOptionTrade: (option: OptionContract, quantity: number, type: 'buy' | 'sell') => Promise<boolean>;
  resetPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>(mockPortfolio);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const savedPortfolio = localStorage.getItem('tradingAppPortfolio');
        if (savedPortfolio) {
          const parsedPortfolio = JSON.parse(savedPortfolio);
          // Ensure all fields are present, falling back to mock data if not
          setPortfolio({
            ...mockPortfolio,
            ...parsedPortfolio,
          });
        }
      } catch (error) {
        console.error('Error loading portfolio from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const executeStockTrade = async (symbol: string, quantity: number, price: number, type: 'buy' | 'sell'): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Get stock details
      const stock = getStockBySymbol(symbol);
      if (!stock) {
        toast({
          title: "Error",
          description: `Stock with symbol ${symbol} not found.`,
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
        const position = portfolio.positions.find(p => p.symbol === symbol);
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
        symbol,
        quantity,
        price,
        total: type === 'buy' ? total : -total,
      };
      
      // Update positions
      let updatedPositions: Position[] = [...portfolio.positions];
      const existingPosition = updatedPositions.find(p => p.symbol === symbol);
      
      if (type === 'buy') {
        if (existingPosition) {
          // Update existing position
          const newQuantity = existingPosition.quantity + quantity;
          const newAvgPrice = (existingPosition.quantity * existingPosition.averagePrice + quantity * price) / newQuantity;
          
          updatedPositions = updatedPositions.map(p => 
            p.symbol === symbol 
              ? { ...p, quantity: newQuantity, averagePrice: newAvgPrice, currentPrice: price } 
              : p
          );
        } else {
          // Create new position
          updatedPositions.push({
            id: `pos-${Date.now()}`,
            stockId: stock.id,
            symbol,
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
            updatedPositions = updatedPositions.filter(p => p.symbol !== symbol);
          } else {
            // Reduce position quantity (keep average price the same)
            updatedPositions = updatedPositions.map(p => 
              p.symbol === symbol 
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
      const newPortfolio = {
        ...portfolio,
        cash: newCash,
        totalValue: newCash + positionsValue + optionsValue,
        positions: updatedPositions,
        transactions: [transaction, ...portfolio.transactions]
      };
      
      setPortfolio(newPortfolio);
      localStorage.setItem('tradingAppPortfolio', JSON.stringify(newPortfolio));
      
      toast({
        title: "Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${symbol}`,
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
    console.log('[PortfolioContext] executeOptionTrade started. Option:', option, 'Quantity:', quantity, 'Type:', type);
    try {
      setIsLoading(true);
      
      // Validate input parameters
      if (!option || !option.symbol || !option.type || !option.strikePrice || !option.expiryDate) {
        console.error('[PortfolioContext] Invalid option contract data:', option);
        toast({
          title: "Trade Failed",
          description: "Invalid option contract data",
          variant: "destructive"
        });
        return false;
      }
      
      if (!quantity || quantity <= 0) {
        console.error('[PortfolioContext] Invalid quantity:', quantity);
        toast({
          title: "Trade Failed",
          description: "Invalid quantity",
          variant: "destructive"
        });
        return false;
      }
      
      // Ensure expiryDate is a proper Date object
      const optionWithValidDate = {
        ...option,
        expiryDate: option.expiryDate instanceof Date 
          ? option.expiryDate 
          : new Date(option.expiryDate)
      };
      
      console.log('[PortfolioContext] Processed option with valid date:', optionWithValidDate);
      
      // Use normalized option from here on
      const processedOption = optionWithValidDate;
      
      console.log('[PortfolioContext] Current portfolio state:', portfolio);
      
      const contractCost = processedOption.premium * 100;
      const total = contractCost * quantity;
      
      // Add check for zero or invalid premium
      if (!processedOption.premium || processedOption.premium <= 0) {
        console.error('[PortfolioContext] Invalid option premium:', processedOption.premium);
        toast({
          title: "Trade Failed",
          description: "Invalid option data (premium is zero or less).",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user can afford the trade (for buys)
      if (type === 'buy' && total > portfolio.cash) {
        console.warn('[PortfolioContext] Insufficient funds. Needed:', total, 'Available:', portfolio.cash);
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough cash for this trade.",
          variant: "destructive"
        });
        return false;
      }
      console.log('[PortfolioContext] Funds check passed for buy.');
      
      // Create new transaction
      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        date: new Date(),
        type,
        assetType: 'option',
        symbol: processedOption.symbol,
        quantity,
        price: processedOption.premium,
        total: type === 'buy' ? total : -total,
        optionDetails: {
          type: processedOption.type,
          strikePrice: processedOption.strikePrice,
          expiryDate: processedOption.expiryDate,
          premium: processedOption.premium,
        },
      };
      
      // Update cash
      const newCash = type === 'buy' 
        ? portfolio.cash - total 
        : portfolio.cash + total;
      
      // Update option positions
      let updatedOptionPositions = [...portfolio.optionPositions];
      
      // Helper function to compare dates by converting to ISO strings and comparing just the date part
      const areDatesEqual = (date1: Date | string, date2: Date | string) => {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
      };
      
      // Find existing position that matches the option characteristics
      const existingPosition = updatedOptionPositions.find(p => 
        p.symbol === processedOption.symbol &&
        p.type === processedOption.type &&
        p.strikePrice === processedOption.strikePrice &&
        areDatesEqual(p.expiryDate, processedOption.expiryDate)
      );
      
      console.log('[PortfolioContext] Existing position found:', existingPosition);
      
      // Handle the position update based on trade type
      if (type === 'buy') {
        if (existingPosition) {
          // Update existing position
          updatedOptionPositions = updatedOptionPositions.map(p => 
            p.symbol === processedOption.symbol &&
            p.type === processedOption.type &&
            p.strikePrice === processedOption.strikePrice &&
            areDatesEqual(p.expiryDate, processedOption.expiryDate)
              ? { ...p, quantity: (p.quantity || 0) + quantity }
              : p
          );
        } else {
          // Create new position
          updatedOptionPositions.push({
            ...processedOption,
            id: processedOption.id || `opt-${Date.now()}`,
            quantity: quantity
          });
        }
      } else { // Sell
        if (existingPosition) {
          if ((existingPosition.quantity || 0) === quantity) {
            // Remove position entirely
            updatedOptionPositions = updatedOptionPositions.filter(p => 
              !(p.symbol === processedOption.symbol &&
                p.type === processedOption.type &&
                p.strikePrice === processedOption.strikePrice &&
                areDatesEqual(p.expiryDate, processedOption.expiryDate))
            );
          } else {
            // Reduce position quantity
            updatedOptionPositions = updatedOptionPositions.map(p => 
              p.symbol === processedOption.symbol &&
              p.type === processedOption.type &&
              p.strikePrice === processedOption.strikePrice &&
              areDatesEqual(p.expiryDate, processedOption.expiryDate)
                ? { ...p, quantity: (p.quantity || 0) - quantity }
                : p
            );
          }
        }
      }
      
      // Calculate new total value
      const positionsValue = portfolio.positions.reduce(
        (sum, position) => sum + (position.quantity * position.currentPrice), 
        0
      );
      
      const optionsValue = updatedOptionPositions.reduce(
        (sum, option) => sum + ((option.quantity || 0) * option.premium * 100), 
        0
      );
      
      // Update portfolio state
      const updatedPortfolio = {
        ...portfolio,
        cash: newCash,
        totalValue: newCash + positionsValue + optionsValue,
        optionPositions: updatedOptionPositions,
        transactions: [transaction, ...portfolio.transactions]
      };
      
      setPortfolio(updatedPortfolio);
      localStorage.setItem('tradingAppPortfolio', JSON.stringify(updatedPortfolio));
      
      console.log('[PortfolioContext] Updating portfolio state. New cash:', newCash, 'New options value:', optionsValue);
      
      toast({
        title: "Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} ${processedOption.type} option(s) for ${processedOption.symbol}`,
      });
      
      console.log('[PortfolioContext] Trade executed successfully.');
      return true;
    } catch (error) {
      console.error('[PortfolioContext] Error during option trade execution:', error);
      toast({
        title: "Trade Failed",
        description: "An error occurred while executing the trade.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
      console.log('[PortfolioContext] executeOptionTrade finished.');
    }
  };

  const resetPortfolio = () => {
    setPortfolio(mockPortfolio);
    localStorage.setItem('tradingAppPortfolio', JSON.stringify(mockPortfolio));
  };

  return (
    <PortfolioContext.Provider value={{ portfolio, isLoading, executeStockTrade, executeOptionTrade, resetPortfolio }}>
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
