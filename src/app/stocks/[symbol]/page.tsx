
import React from 'react';
import { useParams } from 'react-router-dom';
import StockPriceChart from '@/components/StockPriceChart';

export default function StockDetailPage() {
  const { symbol } = useParams();
  
  if (!symbol) {
    return <div>Stock symbol not found</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{symbol} Stock Details</h1>
      <StockPriceChart symbol={symbol} />
    </div>
  );
}
