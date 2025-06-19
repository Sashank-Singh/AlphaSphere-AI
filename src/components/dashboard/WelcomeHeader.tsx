
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          Welcome back, {user?.name?.split('@')[0] || 'Trader'}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's what's happening in your portfolio today
        </p>
      </div>
      
      {isMobile && (
        <Badge variant="secondary" className="gap-2 px-3 py-1">
          <Smartphone className="h-4 w-4" />
          Mobile Optimized
        </Badge>
      )}
    </div>
  );
};

export default WelcomeHeader;
