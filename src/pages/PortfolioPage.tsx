import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, TrendingUp, Calendar, DollarSign, Wallet, Clock } from 'lucide-react';
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
      <div className="px-8 py-6 flex items-center justify-between border-b border-border/40">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-full hover:bg-primary/5"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">Portfolio</h1>
        </div>
        
        <Button variant="outline" size="sm" className="h-9">
          <Clock className="h-4 w-4 mr-2" />
          Last Updated: {new Date().toLocaleTimeString()}
        </Button>
      </div>
      
      {/* Portfolio Summary */}
      <div className="px-8 py-6">
        <Card className="overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <div className="text-sm text-muted-foreground font-medium">
                  Total Portfolio Value
                </div>
                <div className="text-3xl font-bold tracking-tight mt-1">
                  {formatCurrency(portfolio.totalValue)}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Cash</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(portfolio.cash)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Stocks</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(stockValue)}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary/5 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div className="text-sm font-medium">Options</div>
                    </div>
                    <div className="text-lg font-semibold tracking-tight">
                      {formatCurrency(optionsValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <div className="px-8">
        <Tabs 
          defaultValue="positions" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'positions' | 'history')}
        >
          <div className="flex justify-between items-center mb-6">
            <TabsList className="p-1 bg-muted/50">
              <TabsTrigger 
                value="positions"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Positions
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                History
              </TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm"
              className="h-9"
              onClick={() => navigate('/search')}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Trade
            </Button>
          </div>
          
          {/* Positions Tab */}
          <TabsContent value="positions">
            {portfolio.positions.length === 0 && portfolio.optionPositions.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center mb-4">
                    You don't have any positions yet.<br />
                    Start trading to build your portfolio.
                  </p>
                  <Button 
                    onClick={() => navigate('/search')}
                    className="group"
                  >
                    Find Stocks to Trade
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {portfolio.positions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium tracking-tight flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                        Stocks
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {portfolio.positions.length} Position{portfolio.positions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {portfolio.positions.map(position => (
                        <StockPositionCard key={position.id} position={position} />
                      ))}
                    </div>
                  </div>
                )}
                
                {portfolio.optionPositions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium tracking-tight flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                        Options
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {portfolio.optionPositions.length} Position{portfolio.optionPositions.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    
                    <div className="grid gap-3">
                      {portfolio.optionPositions.map(option => (
                        <OptionPositionCard key={option.id} option={option} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history">
            {sortedTransactions.length === 0 ? (
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    No transaction history yet.<br />
                    Your trades will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedTransactions.map(transaction => (
                  <Card key={transaction.id} className="overflow-hidden hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full",
                              transaction.type === 'buy' 
                                ? "bg-green-500/10 text-green-500" 
                                : "bg-red-500/10 text-red-500"
                            )}>
                              {transaction.type.toUpperCase()}
                            </span>
                            <span className="font-medium">{transaction.symbol}</span>
                            
                            {transaction.assetType === 'option' && transaction.optionDetails && (
                              <span className={cn(
                                "text-xs font-medium px-2 py-1 rounded-full",
                                transaction.optionDetails.type === 'call' 
                                  ? "bg-green-500/10 text-green-500" 
                                  : "bg-red-500/10 text-red-500"
                              )}>
                                {transaction.optionDetails.type.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-2">
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
                          <div className="font-medium text-lg">
                            {formatCurrency(Math.abs(transaction.total))}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {transaction.quantity} × {formatCurrency(transaction.price)}
                            {transaction.assetType === 'option' ? '/contract' : '/share'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioPage;
