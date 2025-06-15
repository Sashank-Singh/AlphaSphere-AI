
import React from 'react';
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
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Trading Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="orderType" className="text-sm">Default Order Type</label>
                  <select 
                    id="orderType"
                    name="orderType"
                    className="text-sm border rounded p-1"
                    aria-label="Select default order type"
                  >
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="riskLevel" className="text-sm">Risk Level</label>
                  <select
                    id="riskLevel"
                    name="riskLevel"
                    className="text-sm border rounded p-1"
                    aria-label="Select risk level"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Notifications</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="priceAlerts" className="text-sm">Price Alerts</label>
                  <input 
                    type="checkbox" 
                    id="priceAlerts"
                    name="priceAlerts"
                    defaultChecked 
                    aria-label="Enable price alerts"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="tradeConfirmations" className="text-sm">Trade Confirmations</label>
                  <input 
                    type="checkbox" 
                    id="tradeConfirmations"
                    name="tradeConfirmations"
                    defaultChecked 
                    aria-label="Enable trade confirmations"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label htmlFor="aiRecommendations" className="text-sm">AI Recommendations</label>
                  <input 
                    type="checkbox" 
                    id="aiRecommendations"
                    name="aiRecommendations"
                    defaultChecked 
                    aria-label="Enable AI recommendations"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Reset to Default</Button>
          <Button>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
