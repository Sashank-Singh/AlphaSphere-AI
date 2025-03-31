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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      setPortfolio({
        ...portfolio,
        cash: newCash,
        totalValue: newCash + positionsValue + optionsValue,
        positions: updatedPositions,
        transactions: [transaction, ...portfolio.transactions]
      });
      
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
    try {
      setIsLoading(true);
      
      const contractCost = option.premium * 100;
      const total = contractCost * quantity;
      
      // Check if user can afford the trade (for buys)
      if (type === 'buy' && total > portfolio.cash) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough cash for this trade.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if user has enough contracts (for sells)
      if (type === 'sell') {
        const position = portfolio.optionPositions.find(p => 
          p.symbol === option.symbol &&
          p.type === option.type &&
          p.strikePrice === option.strikePrice &&
          p.expiryDate.getTime() === option.expiryDate.getTime()
        );
        
        if (!position || (position.quantity || 0) < quantity) {
          toast({
            title: "Insufficient Contracts",
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
        symbol: option.symbol,
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
      let updatedOptionPositions: OptionContract[] = [...portfolio.optionPositions];
      const existingPosition = updatedOptionPositions.find(p => 
        p.symbol === option.symbol &&
        p.type === option.type &&
        p.strikePrice === option.strikePrice &&
        p.expiryDate.getTime() === option.expiryDate.getTime()
      );
      
      if (type === 'buy') {
        if (existingPosition) {
          // Update existing position
          updatedOptionPositions = updatedOptionPositions.map(p => 
            p.symbol === option.symbol &&
            p.type === option.type &&
            p.strikePrice === option.strikePrice &&
            p.expiryDate.getTime() === option.expiryDate.getTime()
              ? { ...p, quantity: (p.quantity || 0) + quantity, premium: option.premium }
              : p
          );
        } else {
          // Create new position
          updatedOptionPositions.push({
            ...option,
            quantity,
          });
        }
      } else { // Sell
        if (existingPosition) {
          if ((existingPosition.quantity || 0) === quantity) {
            // Remove position entirely
            updatedOptionPositions = updatedOptionPositions.filter(p => 
              !(p.symbol === option.symbol &&
                p.type === option.type &&
                p.strikePrice === option.strikePrice &&
                p.expiryDate.getTime() === option.expiryDate.getTime())
            );
          } else {
            // Reduce position quantity
            updatedOptionPositions = updatedOptionPositions.map(p => 
              p.symbol === option.symbol &&
              p.type === option.type &&
              p.strikePrice === option.strikePrice &&
              p.expiryDate.getTime() === option.expiryDate.getTime()
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
      
      // Calculate new total value (cash + positions value)
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
        title: "Trade Executed",
        description: `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} ${option.type} option(s) for ${option.symbol}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error executing option trade:', error);
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

  const resetPortfolio = () => {
    setPortfolio(mockPortfolio);
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
