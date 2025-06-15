
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import NotificationsDropdown from './NotificationsDropdown';
import SettingsDialog from './SettingsDialog';
import AccountDropdown from './AccountDropdown';
import SearchForm from './SearchForm';

interface TopBarProps {
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearch }) => {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Mobile sidebar toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 md:hidden w-64 bg-card text-card-foreground shadow-lg">
            <Sidebar collapsed={false} onToggle={() => { }} />
          </SheetContent>
        </Sheet>

        {/* Search Form */}
        <SearchForm onSearch={onSearch} />

        {/* Notifications */}
        <NotificationsDropdown />

        {/* Settings */}
        <SettingsDialog />

        {/* Account */}
        <AccountDropdown />
      </div>
    </div>
  );
};

export default TopBar;
