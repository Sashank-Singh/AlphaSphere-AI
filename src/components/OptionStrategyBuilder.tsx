import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { DollarSign, LineChart } from 'lucide-react';

interface StrategyLeg {
  id: string;
  type: 'call' | 'put' | 'stock';
  side: 'buy' | 'sell';
  strike: number;
  premium: number;
  quantity: number;
}

const OptionStrategyBuilder: React.FC = () => {
  const [legs, setLegs] = useState<StrategyLeg[]>([
    { id: '1', type: 'call', side: 'buy', strike: 100, premium: 2, quantity: 1 },
  ]);
  const [spotPrice, setSpotPrice] = useState<number>(100);

  const addLeg = () => {
    const newLeg: StrategyLeg = {
      id: String(Date.now()),
      type: 'call',
      side: 'buy',
      strike: 100,
      premium: 2,
      quantity: 1,
    };
    setLegs([...legs, newLeg]);
  };

  const updateLeg = (id: string, field: string, value: any) => {
    setLegs(legs.map(leg => leg.id === id ? { ...leg, [field]: value } : leg));
  };

  const removeLeg = (id: string) => {
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const calculateProfitLoss = (legs: StrategyLeg[], spotPrice: number) => {
    return legs.reduce((total, leg) => {
      let optionValue = 0;
      
      if (leg.type === 'call') {
        optionValue = Math.max(0, spotPrice - leg.strike);
      } else if (leg.type === 'put') {
        optionValue = Math.max(0, leg.strike - spotPrice);
      }
      
      const legPnL = leg.side === 'buy' 
        ? (optionValue - leg.premium) * leg.quantity
        : (leg.premium - optionValue) * leg.quantity;
        
      return total + legPnL;
    }, 0);
  };

  const minStrike = Math.max(0, spotPrice - 50);
  const maxStrike = spotPrice + 50;
  const strikes = Array.from({ length: maxStrike - minStrike + 1 }, (_, i) => minStrike + i);

  const profitLoss = calculateProfitLoss(legs, spotPrice);

  return (
    <Card className="w-full">
      <CardContent className="space-y-4">
        <h2 className="text-lg font-semibold">Option Strategy Builder</h2>

        <div className="flex items-center space-x-2">
          <Label htmlFor="spotPrice">Spot Price:</Label>
          <Input
            type="number"
            id="spotPrice"
            value={spotPrice}
            onChange={(e) => setSpotPrice(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          {legs.map((leg) => (
            <div key={leg.id} className="flex items-center space-x-2">
              <Select value={leg.type} onValueChange={(value) => updateLeg(leg.id, 'type', value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="put">Put</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leg.side} onValueChange={(value) => updateLeg(leg.id, 'side', value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy</SelectItem>
                  <SelectItem value="sell">Sell</SelectItem>
                </SelectContent>
              </Select>

              <Select value={leg.strike} onValueChange={(value) => updateLeg(leg.id, 'strike', Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Strike" />
                </SelectTrigger>
                <SelectContent>
                  {strikes.map(strike => (
                    <SelectItem key={strike} value={strike.toString()}>{strike}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Premium"
                value={leg.premium}
                onChange={(e) => updateLeg(leg.id, 'premium', Number(e.target.value))}
                className="w-[80px]"
              />

              <Input
                type="number"
                placeholder="Quantity"
                value={leg.quantity}
                onChange={(e) => updateLeg(leg.id, 'quantity', Number(e.target.value))}
                className="w-[70px]"
              />

              <Button variant="ghost" size="sm" onClick={() => removeLeg(leg.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button onClick={addLeg}>Add Leg</Button>
        </div>

        <div>
          <h3 className="text-md font-semibold flex items-center gap-1">
            <LineChart className="h-4 w-4" />
            Profit/Loss at Spot Price:
          </h3>
          <div className="text-2xl font-bold flex items-center gap-1">
            <DollarSign className="h-5 w-5" />
            {profitLoss.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptionStrategyBuilder;
