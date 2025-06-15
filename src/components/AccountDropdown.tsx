
import React from 'react';
import { Button } from '@/components/ui/button';
import { User, ChevronDown } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import { formatCurrency } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const AccountDropdown: React.FC = () => {
  const { portfolio } = usePortfolio();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 hidden md:inline-flex">
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
  );
};

export default AccountDropdown;
