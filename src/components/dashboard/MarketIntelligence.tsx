
import React from 'react';

const MarketIntelligence: React.FC = () => {
  return (
    <div className="bg-card p-6 rounded-lg border border-card">
      <h2 className="text-lg font-semibold text-main mb-1 flex items-center">
        <span className="icon mr-2">sentiment_satisfied</span> 
        Market Intelligence
      </h2>
      <p className="text-sm text-secondary mb-4">Overall market mood and positioning</p>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-main">Market Sentiment</span>
          <span className="px-2 py-1 text-xs font-semibold text-green-300 bg-green-500/20 rounded-full">
            Bullish
          </span>
        </div>
        <div className="space-y-4 mt-6">
          <div className="flex items-center py-1">
            <span className="text-sm text-secondary w-16">Bullish</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mx-3">
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '55%' }}></div>
            </div>
            <span className="text-sm text-main ml-2">55%</span>
          </div>
          <div className="flex items-center py-1">
            <span className="text-sm text-secondary w-16">Neutral</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mx-3">
              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
            </div>
            <span className="text-sm text-main ml-2">35%</span>
          </div>
          <div className="flex items-center py-1">
            <span className="text-sm text-secondary w-16">Bearish</span>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mx-3">
              <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '10%' }}></div>
            </div>
            <span className="text-sm text-main ml-2">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketIntelligence;
