import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, ArrowRight, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OptionLeg {
  id: string;
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  premium: number;
  quantity: number;
}

interface OptionStrategyBuilderProps {
  symbol: string;
  stockPrice: number;
  expiryDate: string;
  iv: number;
  accountId: string;
}

const OptionStrategyBuilder: React.FC<OptionStrategyBuilderProps> = ({
  symbol,
  stockPrice,
  expiryDate,
  iv,
  accountId
}) => {
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [newLeg, setNewLeg] = useState<{
    type: 'call' | 'put';
    action: 'buy' | 'sell';
    strike: string;
    quantity: string;
  }>({
    type: 'call',
    action: 'buy',
    strike: stockPrice.toString(),
    quantity: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderStatus, setOrderStatus] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Calculate premium based on strike, type, and IV
  const calculatePremium = (strike: number, type: 'call' | 'put') => {
    const strikeDiff = Math.abs(stockPrice - strike);
    const timeValue = iv * stockPrice * 0.1; // Simple model for time value
    
    if (type === 'call') {
      return strike < stockPrice ? (stockPrice - strike) + timeValue : timeValue;
    } else {
      return strike > stockPrice ? (strike - stockPrice) + timeValue : timeValue;
    }
  };

  const addLeg = () => {
    const strike = parseFloat(newLeg.strike);
    if (isNaN(strike)) return;
    
    const quantity = parseInt(newLeg.quantity);
    if (isNaN(quantity) || quantity <= 0) return;
    
    const premium = calculatePremium(strike, newLeg.type);
    
    const leg: OptionLeg = {
      id: Date.now().toString(),
      type: newLeg.type,
      action: newLeg.action,
      strike,
      premium,
      quantity
    };
    
    setLegs([...legs, leg]);
    
    // Reset form
    setNewLeg({
      ...newLeg,
      strike: stockPrice.toString(),
      quantity: '1'
    });
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const calculateTotalCost = () => {
    return legs.reduce((total, leg) => {
      const legCost = leg.premium * leg.quantity * 100; // Each option is for 100 shares
      return leg.action === 'buy' ? total + legCost : total - legCost;
    }, 0);
  };

  const calculateMaxProfit = () => {
    // This is a simplified calculation and would be more complex for real strategies
    if (legs.length === 0) return 0;
    
    // For a simple long call
    if (legs.length === 1 && legs[0].type === 'call' && legs[0].action === 'buy') {
      return 'Unlimited';
    }
    
    // For a simple long put
    if (legs.length === 1 && legs[0].type === 'put' && legs[0].action === 'buy') {
      return formatCurrency(Math.max(0, legs[0].strike * 100 - calculateTotalCost()));
    }
    
    // For a covered call
    if (legs.length === 2 && 
        legs.some(leg => leg.type === 'call' && leg.action === 'sell') &&
        legs.some(leg => leg.type === 'stock' && leg.action === 'buy')) {
      const callLeg = legs.find(leg => leg.type === 'call')!;
      return formatCurrency(callLeg.premium * callLeg.quantity * 100);
    }
    
    return 'Varies by strategy';
  };

  const calculateMaxLoss = () => {
    // This is a simplified calculation and would be more complex for real strategies
    if (legs.length === 0) return 0;
    
    // For a simple long call or put
    if (legs.length === 1 && legs[0].action === 'buy') {
      return formatCurrency(calculateTotalCost());
    }
    
    // For a simple short call
    if (legs.length === 1 && legs[0].type === 'call' && legs[0].action === 'sell') {
      return 'Unlimited';
    }
    
    // For a simple short put
    if (legs.length === 1 && legs[0].type === 'put' && legs[0].action === 'sell') {
      return formatCurrency(legs[0].strike * 100 - legs[0].premium * 100);
    }
    
    return 'Varies by strategy';
  };

  const getStrategyName = () => {
    if (legs.length === 0) return 'No strategy selected';
    
    // Single leg strategies
    if (legs.length === 1) {
      const leg = legs[0];
      if (leg.type === 'call' && leg.action === 'buy') return 'Long Call';
      if (leg.type === 'call' && leg.action === 'sell') return 'Short Call';
      if (leg.type === 'put' && leg.action === 'buy') return 'Long Put';
      if (leg.type === 'put' && leg.action === 'sell') return 'Short Put';
    }
    
    // Two leg strategies
    if (legs.length === 2) {
      const callLegs = legs.filter(leg => leg.type === 'call');
      const putLegs = legs.filter(leg => leg.type === 'put');
      
      // Vertical spreads
      if (callLegs.length === 2 && callLegs[0].action !== callLegs[1].action) {
        return callLegs[0].action === 'buy' ? 'Bull Call Spread' : 'Bear Call Spread';
      }
      
      if (putLegs.length === 2 && putLegs[0].action !== putLegs[1].action) {
        return putLegs[0].action === 'buy' ? 'Bear Put Spread' : 'Bull Put Spread';
      }
      
      // Straddle and strangle
      if (callLegs.length === 1 && putLegs.length === 1 && 
          callLegs[0].action === 'buy' && putLegs[0].action === 'buy') {
        return callLegs[0].strike === putLegs[0].strike ? 'Long Straddle' : 'Long Strangle';
      }
      
      if (callLegs.length === 1 && putLegs.length === 1 && 
          callLegs[0].action === 'sell' && putLegs[0].action === 'sell') {
        return callLegs[0].strike === putLegs[0].strike ? 'Short Straddle' : 'Short Strangle';
      }
    }
    
    // Four leg strategies
    if (legs.length === 4) {
      const callLegs = legs.filter(leg => leg.type === 'call');
      const putLegs = legs.filter(leg => leg.type === 'put');
      
      if (callLegs.length === 2 && putLegs.length === 2 &&
          callLegs.filter(leg => leg.action === 'buy').length === 1 &&
          putLegs.filter(leg => leg.action === 'buy').length === 1) {
        return 'Iron Condor';
      }
      
      if (callLegs.length === 2 && putLegs.length === 2 &&
          callLegs.filter(leg => leg.action === 'buy').length === 2 &&
          putLegs.filter(leg => leg.action === 'buy').length === 2) {
        return 'Iron Butterfly';
      }
    }
    
    return 'Custom Strategy';
  };

  const executeStrategy = async () => {
    if (legs.length === 0) {
      setOrderStatus({
        success: false,
        message: 'Please add at least one option leg to your strategy'
      });
      return;
    }
    
    setIsSubmitting(true);
    setOrderStatus(null);
    
    try {
      // In a real app, this would call the broker API to execute the strategy
      // For now, we'll just simulate a successful order
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setOrderStatus({
        success: true,
        message: `Successfully placed ${getStrategyName()} order for ${symbol}`
      });
      
      // Clear legs after successful order
      setLegs([]);
    } catch (error) {
      console.error('Error executing option strategy:', error);
      setOrderStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-black border border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Option Strategy Builder</CardTitle>
        <CardDescription>
          Build custom option strategies for {symbol}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Add Option Legs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor="option-type">Option Type</Label>
                    <Select 
                      value={newLeg.type} 
                      onValueChange={(value) => setNewLeg({...newLeg, type: value as 'call' | 'put'})}
                    >
                      <SelectTrigger id="option-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="put">Put</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="option-action">Action</Label>
                    <Select 
                      value={newLeg.action} 
                      onValueChange={(value) => setNewLeg({...newLeg, action: value as 'buy' | 'sell'})}
                    >
                      <SelectTrigger id="option-action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="option-strike">Strike Price</Label>
                    <Input
                      id="option-strike"
                      type="number"
                      step="0.5"
                      value={newLeg.strike}
                      onChange={(e) => setNewLeg({...newLeg, strike: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="option-quantity">Quantity</Label>
                    <Input
                      id="option-quantity"
                      type="number"
                      min="1"
                      step="1"
                      value={newLeg.quantity}
                      onChange={(e) => setNewLeg({...newLeg, quantity: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button onClick={addLeg} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leg
                </Button>
              </CardContent>
            </Card>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Strategy Legs</h3>
              {legs.length === 0 ? (
                <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6 text-center text-muted-foreground">
                  No option legs added yet. Use the form above to build your strategy.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Strike</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {legs.map((leg) => (
                      <TableRow key={leg.id}>
                        <TableCell>
                          <Badge className={leg.type === 'call' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}>
                            {leg.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className={leg.action === 'buy' ? 'text-green-500' : 'text-red-500'}>
                          {leg.action === 'buy' ? 'BUY' : 'SELL'}
                        </TableCell>
                        <TableCell>${leg.strike.toFixed(2)}</TableCell>
                        <TableCell>${leg.premium.toFixed(2)}</TableCell>
                        <TableCell>{leg.quantity}</TableCell>
                        <TableCell>${(leg.premium * leg.quantity * 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeLeg(leg.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
          
          <div>
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Strategy Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Strategy Name</div>
                  <div className="font-semibold text-lg">{getStrategyName()}</div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Cost</div>
                  <div className="font-semibold text-lg flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(Math.abs(calculateTotalCost()))}
                    {calculateTotalCost() >= 0 ? (
                      <Badge className="ml-2 bg-red-500/20 text-red-500">DEBIT</Badge>
                    ) : (
                      <Badge className="ml-2 bg-green-500/20 text-green-500">CREDIT</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Max Profit</div>
                  <div className="font-semibold text-lg text-green-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {calculateMaxProfit()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Max Loss</div>
                  <div className="font-semibold text-lg text-red-500 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    {calculateMaxLoss()}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Breakeven</div>
                  <div className="font-semibold">
                    {legs.length > 0 ? 'Varies by strategy' : 'N/A'}
                  </div>
                </div>
                
                {legs.length > 0 && (
                  <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-md flex items-start gap-2 text-sm mt-4">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div>
                      Options trading involves significant risk and is not suitable for all investors. Make sure you understand the strategy before trading.
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={legs.length === 0 || isSubmitting}
                  onClick={executeStrategy}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Execute Strategy
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            {orderStatus && (
              <div className={`mt-4 p-3 rounded ${orderStatus.success ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                {orderStatus.message}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionStrategyBuilder;
