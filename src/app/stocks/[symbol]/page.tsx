import React from 'react';
import StockPriceChart from '@/components/StockPriceChart';
import StockHeader from '@/components/StockHeader';

type Props = {
  params: {
    symbol: string;
  };
};

// For metadata configuration in Next.js 13/14, you can use a dynamic metadata approach
// instead of the import from next
export const generateMetadata = async ({ params }: Props) => {
  const symbol = params.symbol.toUpperCase();
  
  return {
    title: `${symbol} - Stock Analysis`,
    description: `Real-time stock analysis for ${symbol}. View charts, options, and AI insights.`
  };
};

export default function StockPage({ params }: Props) {
  const symbol = params.symbol.toUpperCase();
  
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <StockHeader symbol={symbol} />
      <div className="container mx-auto p-4 max-w-7xl">
        <StockPriceChart ticker={symbol} />
      </div>
    </div>
  );
} 