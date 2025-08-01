
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { stockDataService } from '@/lib/stockDataService';
import SearchSuggestions from './SearchSuggestions';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface TopBarProps {
  onSearch?: (query: string) => void;
  onMenuClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch, onMenuClick }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Popular stocks for suggestions
  const popularStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC',
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'JNJ', 'PFE', 'UNH', 'ABBV', 'TMO',
    'SPY', 'QQQ', 'DIA', 'VTI', 'VOO', 'ARKK', 'PLTR', 'COIN', 'SQ', 'ROKU'
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const query = searchQuery.toLowerCase();
        
        // Filter stocks that match the query
        const matchingStocks = popularStocks.filter(stock => 
          stock.toLowerCase().includes(query)
        ).slice(0, 8); // Limit to 8 suggestions

        if (matchingStocks.length > 0) {
          const suggestionsData = await Promise.all(
            matchingStocks.map(async (symbol) => {
              try {
                const quote = await stockDataService.getStockQuote(symbol);
                return {
                  symbol: quote.symbol,
                  name: quote.symbol, // In real app, this would be company name
                  price: quote.price,
                  changePercent: quote.changePercent
                };
              } catch (error) {
                console.error(`Error fetching ${symbol}:`, error);
                return null;
              }
            })
          );

          const validSuggestions = suggestionsData.filter(s => s !== null) as SearchSuggestion[];
          setSuggestions(validSuggestions);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedIndex].symbol);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (symbol: string) => {
    navigate(`/stocks/${symbol}`);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleViewAllClick = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleNotificationsClick = () => {
    console.log('Notifications clicked');
  };

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/settings');
  };

  // Get user display name with fallbacks
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name;
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Use email prefix as fallback
    }
    return 'Guest';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (name === 'Guest') return 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="flex justify-between items-center p-3 sm:p-4 bg-card border-b border-card sticky top-0 z-40">
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden text-main hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-700 mr-2 sm:mr-3"
          title="Menu"
        >
          <span className="icon">menu</span>
        </button>
      )}
      
      {/* Search Section */}
      <div ref={searchRef} className="flex-1 max-w-xs sm:max-w-md relative">
        <form onSubmit={handleSearch} className="flex items-center">
          <button type="submit" className="text-secondary mr-4 hover:text-main transition-colors">
            <span className="icon">search</span>
          </button>
          <input 
            className="bg-transparent text-main focus:outline-none flex-1" 
            placeholder="Search stocks..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        </form>

        {/* Search Suggestions */}
        {showSuggestions && (
          <SearchSuggestions
            query={searchQuery}
            onSuggestionClick={handleSuggestionClick}
            onViewAllClick={handleViewAllClick}
            isLoading={isLoading}
            suggestions={suggestions}
            selectedIndex={selectedIndex}
          />
        )}
      </div>

      {/* User Section */}
      <div className="flex items-center space-x-1 sm:space-x-4 -mr-2 sm:mr-0">
        {/* Notifications */}
        <button 
          className="text-secondary hover:text-main transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-gray-700"
          onClick={handleNotificationsClick}
          title="Notifications"
        >
          <span className="icon">notifications</span>
        </button>

        {/* User Menu */}
        <div ref={userMenuRef} className="relative">
          <button 
            className="flex items-center text-main bg-gray-700 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={handleUserClick}
            title="User menu"
          >
            {/* User Avatar */}
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center mr-1.5 sm:mr-3 text-white font-semibold text-xs sm:text-sm">
              {getUserInitials()}
            </div>
            
            {/* User Name */}
            <span className="font-medium text-sm sm:text-base hidden sm:block">{getUserDisplayName()}</span>
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-main">{getUserDisplayName()}</p>
                  <p className="text-xs text-secondary">{user?.email}</p>
                </div>
                
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-main hover:bg-gray-700 transition-colors flex items-center"
                >
                  <span className="icon text-sm mr-2">person</span>
                  Profile Settings
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center"
                >
                  <span className="icon text-sm mr-2">logout</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
