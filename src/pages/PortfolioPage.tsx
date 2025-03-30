
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, TrendingUp, Calendar } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency, cn } from '@/lib/utils';
import { StockPositionCard, OptionPositionCard } from '@/components/PositionCard';

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const { portfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  
  // Calculate portfolio metrics
  const stockValue = portfolio.positions.reduce(
    (sum, position) => sum + (position.quantity * position.currentPrice),
    0
  );
  
  const optionsValue = portfolio.optionPositions.reduce(
    (sum, option) => sum + ((option.quantity || 0) * option.premium * 100),
    0
  );
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...portfolio.transactions].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  
  return (
    <div className="pb-20">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-bold">Portfolio</h1>
        
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>
      
      {/* Portfolio Summary */}
      <Card className="mx-4 mb-6">
        <CardContent className="p-4">
          <div className="mb-1 text-sm text-muted-foreground">Total Portfolio Value</div>
          <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <div className="text-xs text-muted-foreground">Cash</div>
              <div className="font-medium">{formatCurrency(portfolio.cash)}</div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Stocks</div>
              <div className="font-medium">{formatCurrency(stockValue)}</div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">Options</div>
              <div className="font-medium">{formatCurrency(optionsValue)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs */}
      <Tabs 
        defaultValue="positions" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'positions' | 'history')}
        className="px-4"
      >
        <TabsList className="w-full">
          <TabsTrigger value="positions" className="flex-1">Positions</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>
        
        {/* Positions Tab */}
        <TabsContent value="positions">
          {portfolio.positions.length === 0 && portfolio.optionPositions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You don't have any positions yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/search')}
              >
                Find Stocks to Trade
              </Button>
            </div>
          ) : (
            <>
              {portfolio.positions.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-3 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Stocks
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3 mb-6">
                    {portfolio.positions.map(position => (
                      <StockPositionCard key={position.id} position={position} />
                    ))}
                  </div>
                </>
              )}
              
              {portfolio.optionPositions.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mt-4 mb-3 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Options
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {portfolio.optionPositions.map(option => (
                      <OptionPositionCard key={option.id} option={option} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
        
        {/* History Tab */}
        <TabsContent value="history">
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transaction history yet.</p>
            </div>
          ) : (
            <div className="mt-4">
              {sortedTransactions.map(transaction => (
                <div key={transaction.id} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded mr-2",
                          transaction.type === 'buy' 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-red-500/10 text-red-500"
                        )}>
                          {transaction.type.toUpperCase()}
                        </span>
                        <span className="font-medium">{transaction.ticker}</span>
                        
                        {transaction.assetType === 'option' && transaction.optionDetails && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded ml-2",
                            transaction.optionDetails.type === 'call' 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-red-500/10 text-red-500"
                          )}>
                            {transaction.optionDetails.type.toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1">
                        {transaction.date.toLocaleDateString()} at {transaction.date.toLocaleTimeString()}
                      </div>
                      
                      {transaction.assetType === 'option' && transaction.optionDetails && (
                        <div className="text-xs text-muted-foreground mt-1">
                          ${transaction.optionDetails.strikePrice} strike, exp: {
                            transaction.optionDetails.expiryDate.toLocaleDateString()
                          }
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(Math.abs(transaction.total))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.quantity} × {formatCurrency(transaction.price)}
                        {transaction.assetType === 'option' ? '/contract' : '/share'}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortfolioPage;
