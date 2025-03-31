import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';
import TVTimelineWidget from './TVTimelineWidget';

interface StockNewsProps {
  symbol: string;
}

const StockNews: React.FC<StockNewsProps> = ({ symbol }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Latest News for {symbol}</CardTitle>
          <Newspaper className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <TVTimelineWidget 
          symbol={symbol}
          height="600"
          isMarketNews={false}
        />
      </CardContent>
    </Card>
  );
};

export default StockNews; 