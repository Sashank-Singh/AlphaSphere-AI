
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Bell,
  BellRing,
  BellOff,
  Plus,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  TrendingUp,
  BarChart2,
  BrainCircuit,
  Volume2,
  AlertTriangle,
} from 'lucide-react';

interface SmartAlertsProps {
  symbol?: string;
  className?: string;
}

interface SmartAlert {
  id: string;
  type: 'price' | 'volume' | 'volatility' | 'pattern' | 'sentiment';
  symbol: string;
  condition: string;
  value: number | string;
  active: boolean;
  triggered?: boolean;
  timestamp: Date;
  description: string;
}

const SmartAlerts: React.FC<SmartAlertsProps> = ({ symbol, className }) => {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAlertType, setNewAlertType] = useState<SmartAlert['type']>('price');
  const [newAlertCondition, setNewAlertCondition] = useState('above');
  const [newAlertValue, setNewAlertValue] = useState('');
  const { toast } = useToast();
  
  useEffect(() => {
    if (symbol) {
      // In a real app, fetch user's alerts for this symbol
      const mockAlerts = getMockAlerts(symbol);
      setAlerts(mockAlerts);
    } else {
      // Fetch all alerts across symbols
      const mockAlerts = [
        ...getMockAlerts('AAPL'),
        ...getMockAlerts('MSFT'),
        ...getMockAlerts('TSLA'),
      ];
      setAlerts(mockAlerts);
    }
  }, [symbol]);
  
  const getMockAlerts = (stockSymbol: string): SmartAlert[] => {
    return [
      {
        id: `${stockSymbol}-price-1`,
        type: 'price',
        symbol: stockSymbol,
        condition: 'above',
        value: stockSymbol === 'AAPL' ? 190 : stockSymbol === 'MSFT' ? 420 : 235,
        active: true,
        timestamp: new Date(),
        description: `Alert when ${stockSymbol} price goes above $${stockSymbol === 'AAPL' ? '190' : stockSymbol === 'MSFT' ? '420' : '235'}`
      },
      {
        id: `${stockSymbol}-volume-1`,
        type: 'volume',
        symbol: stockSymbol,
        condition: 'spike',
        value: 'significant',
        active: true,
        timestamp: new Date(),
        description: `Alert on unusual trading volume for ${stockSymbol}`
      },
      {
        id: `${stockSymbol}-pattern-1`,
        type: 'pattern',
        symbol: stockSymbol,
        condition: 'detected',
        value: 'breakout',
        active: true,
        timestamp: new Date(),
        description: `Alert when breakout pattern detected for ${stockSymbol}`
      }
    ];
  };
  
  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "The alert has been removed successfully.",
      variant: "default",
    });
  };
  
  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };
  
  const handleAddAlert = () => {
    if (!newAlertValue && newAlertType === 'price') {
      toast({
        title: "Missing Value",
        description: "Please enter a price for your alert.",
        variant: "destructive",
      });
      return;
    }
    
    const newAlert: SmartAlert = {
      id: `${symbol || 'ALL'}-${newAlertType}-${Date.now()}`,
      type: newAlertType,
      symbol: symbol || 'ALL',
      condition: newAlertCondition,
      value: newAlertType === 'price' ? parseFloat(newAlertValue) : newAlertValue,
      active: true,
      timestamp: new Date(),
      description: generateAlertDescription(newAlertType, newAlertCondition, newAlertValue, symbol)
    };
    
    setAlerts([newAlert, ...alerts]);
    setShowAddForm(false);
    setNewAlertValue('');
    
    toast({
      title: "Alert Created",
      description: "Your new alert has been set up successfully.",
      variant: "default",
    });
  };
  
  const generateAlertDescription = (
    type: SmartAlert['type'],
    condition: string,
    value: string,
    stockSymbol?: string
  ) => {
    const symbol = stockSymbol || 'selected stocks';
    
    switch (type) {
      case 'price':
        return `Alert when ${symbol} price goes ${condition} $${value}`;
      case 'volume':
        return `Alert on unusual trading volume for ${symbol}`;
      case 'volatility':
        return `Alert when volatility increases significantly for ${symbol}`;
      case 'pattern':
        return `Alert when technical pattern is detected for ${symbol}`;
      case 'sentiment':
        return `Alert on significant sentiment shifts for ${symbol}`;
      default:
        return `Custom alert for ${symbol}`;
    }
  };
  
  const getAlertIcon = (type: SmartAlert['type']) => {
    switch (type) {
      case 'price':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'volume':
        return <Volume2 className="h-4 w-4" />;
      case 'volatility':
        return <Activity className="h-4 w-4" />;
      case 'pattern':
        return <TrendingUp className="h-4 w-4" />;
      case 'sentiment':
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  const getAlertTypeLabel = (type: SmartAlert['type']) => {
    switch (type) {
      case 'price': return 'Price Alert';
      case 'volume': return 'Volume Alert';
      case 'volatility': return 'Volatility Alert';
      case 'pattern': return 'Pattern Alert';
      case 'sentiment': return 'Sentiment Alert';
      default: return 'Custom Alert';
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            <BellRing className="h-4 w-4 mr-2" />
            Smart Alerts
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? <BellOff className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription>
          AI-powered alerts that go beyond simple price notifications
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="space-y-3 bg-muted/30 p-3 rounded-md">
            <h4 className="text-sm font-medium">Create New Alert</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div 
                className={cn(
                  "border rounded-md p-2 cursor-pointer",
                  newAlertType === 'price' ? "border-primary bg-primary/10" : "border-border"
                )}
                onClick={() => setNewAlertType('price')}
              >
                <ArrowUpRight className={cn(
                  "h-4 w-4 mb-1",
                  newAlertType === 'price' ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">Price Alert</div>
              </div>
              
              <div 
                className={cn(
                  "border rounded-md p-2 cursor-pointer",
                  newAlertType === 'volume' ? "border-primary bg-primary/10" : "border-border"
                )}
                onClick={() => setNewAlertType('volume')}
              >
                <Volume2 className={cn(
                  "h-4 w-4 mb-1",
                  newAlertType === 'volume' ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">Volume Alert</div>
              </div>
              
              <div 
                className={cn(
                  "border rounded-md p-2 cursor-pointer",
                  newAlertType === 'pattern' ? "border-primary bg-primary/10" : "border-border"
                )}
                onClick={() => setNewAlertType('pattern')}
              >
                <TrendingUp className={cn(
                  "h-4 w-4 mb-1",
                  newAlertType === 'pattern' ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">Pattern Alert</div>
              </div>
              
              <div 
                className={cn(
                  "border rounded-md p-2 cursor-pointer",
                  newAlertType === 'sentiment' ? "border-primary bg-primary/10" : "border-border"
                )}
                onClick={() => setNewAlertType('sentiment')}
              >
                <BrainCircuit className={cn(
                  "h-4 w-4 mb-1",
                  newAlertType === 'sentiment' ? "text-primary" : "text-muted-foreground"
                )} />
                <div className="text-xs font-medium">Sentiment Alert</div>
              </div>
            </div>
            
            {newAlertType === 'price' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select 
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                    value={newAlertCondition}
                    onChange={(e) => setNewAlertCondition(e.target.value)}
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                    <option value="change">Change</option>
                  </select>
                </div>
                <div>
                  <Input 
                    placeholder="Price"
                    value={newAlertValue}
                    onChange={(e) => setNewAlertValue(e.target.value)}
                    type="number"
                    className="h-9"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleAddAlert}
              >
                Create Alert
              </Button>
            </div>
          </div>
        )}
        
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={cn(
                  "border rounded-md p-3 space-y-2",
                  alert.active ? "border-border" : "border-muted bg-muted/30"
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-1 rounded-md",
                      alert.type === 'price' ? "bg-blue-500/10" :
                      alert.type === 'volume' ? "bg-purple-500/10" :
                      alert.type === 'pattern' ? "bg-green-500/10" :
                      alert.type === 'sentiment' ? "bg-yellow-500/10" :
                      "bg-muted"
                    )}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{getAlertTypeLabel(alert.type)}</div>
                      <div className="text-xs text-muted-foreground">{alert.symbol}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.active}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                      aria-label="Toggle alert"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm">{alert.description}</p>
                
                {alert.triggered && (
                  <Badge variant="outline" className="text-red-500 bg-red-500/10">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Triggered
                  </Badge>
                )}
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Set {alert.timestamp.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4">
            <BellOff className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">No alerts configured</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Alert
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SmartAlerts;
