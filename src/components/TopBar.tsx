import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bell,
  Settings,
  User,
  ChevronDown,
  Plus,
  RefreshCw
} from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency } from '@/lib/utils';
import { mockStocks, refreshStockPrices } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useNavigate } from 'react-router-dom';
import SearchSuggestions from './SearchSuggestions';
import { Stock } from '@/types';

interface TopBarProps {
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch }) => {
  const { portfolio } = usePortfolio();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Stock[]>([]);
  const [notifications, setNotifications] = useState<{ id: string; message: string; isRead: boolean }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  // Filter stocks based on search query
  const filterStocks = useCallback((query: string) => {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase().trim();
    return mockStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.name.toLowerCase().includes(normalizedQuery)
    );
  }, []);

  // Update suggestions when search query changes
  useEffect(() => {
    const filtered = filterStocks(searchQuery);
    setSuggestions(filtered);
    setShowSuggestions(searchQuery.length > 0);
  }, [searchQuery, filterStocks]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/market?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  // Handle stock selection
  const handleStockSelect = (stock: Stock) => {
    navigate(`/stocks/${stock.symbol}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    const updatedStocks = refreshStockPrices();
    // You might want to update your global state here
    console.log('Stocks refreshed:', updatedStocks);
  };

  // Mock notifications for demo
  useEffect(() => {
    setNotifications([
      { id: '1', message: 'AAPL up 5% - Consider taking profits', isRead: false },
      { id: '2', message: 'New AI trading opportunity available', isRead: false },
      { id: '3', message: 'Market volatility alert: VIX above 25', isRead: true },
    ]);
  }, []);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1 search-container">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
            />
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={handleStockSelect}
              visible={showSuggestions}
            />
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </Button>
        </form>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map(notification => (
              <DropdownMenuItem key={notification.id} className="flex items-start p-3">
                <div className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'font-medium'}`}>
                  {notification.message}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
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

        {/* Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <User className="h-4 w-4" />
              <span>Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>John Doe</span>
                <span className="text-sm text-muted-foreground">john@example.com</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-sm text-muted-foreground">Cash Balance:</span>
              <span className="ml-2 font-medium">{formatCurrency(portfolio?.cash || 0)}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar; 