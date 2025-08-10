import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, DollarSign, Play } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const TradingModeToggle: React.FC = () => {
  const { user, toggleTradingMode } = useAuth();

  if (!user) return null;

  const isPaperMode = user.tradingMode === 'paper';

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isPaperMode ? "secondary" : "destructive"}
        className="flex items-center gap-1"
      >
        {isPaperMode ? (
          <>
            <DollarSign className="h-3 w-3" />
            Paper Money
          </>
        ) : (
          <>
            <Play className="h-3 w-3" />
            Live Trading
          </>
        )}
      </Badge>
      
      {isPaperMode ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Switch to Live
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Switch to Live Trading
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to switch to live trading mode. This will use real money and real market orders. 
                Make sure you understand the risks involved. Note: Demo mode shows $0 balance.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={toggleTradingMode}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Switch to Live
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={toggleTradingMode}
          className="text-xs"
        >
          Switch to Paper
        </Button>
      )}
    </div>
  );
};

export default TradingModeToggle;
