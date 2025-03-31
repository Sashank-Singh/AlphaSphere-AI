import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TVQuoteWidget from './TVQuoteWidget';

interface ForexWidgetProps {
  pair?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const ForexWidget: React.FC<ForexWidgetProps> = ({
  pair = "FX:EURUSD",
  width = 350,
  height = "auto",
  className = ""
}) => {
  return (
    <Card className={`bg-black border border-gray-800 ${className}`}>
      <CardHeader className="pb-0">
        <CardTitle className="text-white text-sm">
          {pair.replace('FX:', '')} Exchange Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TVQuoteWidget 
          symbol={pair}
          width={width}
          height={height}
          isTransparent={true}
        />
      </CardContent>
    </Card>
  );
};

// Example forex pairs that can be used
export const ForexPairs = {
  EURUSD: "FX:EURUSD",
  GBPUSD: "FX:GBPUSD",
  USDJPY: "FX:USDJPY",
  USDCAD: "FX:USDCAD",
  AUDUSD: "FX:AUDUSD",
  NZDUSD: "FX:NZDUSD",
  USDCHF: "FX:USDCHF",
  EURGBP: "FX:EURGBP",
  EURJPY: "FX:EURJPY"
};

export default ForexWidget; 