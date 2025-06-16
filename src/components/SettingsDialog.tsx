
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

const SettingsDialog: React.FC = () => {
  const [orderType, setOrderType] = useState('Market');
  const [riskLevel, setRiskLevel] = useState('Medium');
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [tradeConfirmations, setTradeConfirmations] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);

  const handleSaveChanges = () => {
    console.log('Saving settings:', {
      orderType,
      riskLevel,
      priceAlerts,
      tradeConfirmations,
      aiRecommendations
    });
    // Here you would typically update a global state or call an API to persist settings
    alert('Settings saved successfully!');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="hidden md:inline-flex">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your trading preferences and account settings.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-base font-medium mb-3 text-foreground">Trading Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="orderType" className="text-sm text-foreground">Default Order Type</label>
                  <select 
                    id="orderType"
                    name="orderType"
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="text-sm border border-input rounded-md p-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                    aria-label="Select default order type"
                  >
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="riskLevel" className="text-sm text-foreground">Risk Level</label>
                  <select
                    id="riskLevel"
                    name="riskLevel"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="text-sm border border-input rounded-md p-2 bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                    aria-label="Select risk level"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="text-base font-medium mb-3 text-foreground">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="priceAlerts" className="text-sm text-foreground">Price Alerts</label>
                  <input 
                    type="checkbox" 
                    id="priceAlerts"
                    name="priceAlerts"
                    checked={priceAlerts}
                    onChange={() => setPriceAlerts(!priceAlerts)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    aria-label="Enable price alerts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="tradeConfirmations" className="text-sm text-foreground">Trade Confirmations</label>
                  <input 
                    type="checkbox" 
                    id="tradeConfirmations"
                    name="tradeConfirmations"
                    checked={tradeConfirmations}
                    onChange={() => setTradeConfirmations(!tradeConfirmations)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    aria-label="Enable trade confirmations"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="aiRecommendations" className="text-sm text-foreground">AI Recommendations</label>
                  <input 
                    type="checkbox" 
                    id="aiRecommendations"
                    name="aiRecommendations"
                    checked={aiRecommendations}
                    onChange={() => setAiRecommendations(!aiRecommendations)}
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded"
                    aria-label="Enable AI recommendations"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Reset to Default</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
