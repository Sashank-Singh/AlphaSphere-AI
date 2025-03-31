import React from 'react';
import { ForexWidget, ForexPairs } from '@/components/ForexWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: 'Forex Rates - Trade Simply AI',
  description: 'View real-time forex exchange rates powered by TradingView data'
};

export default function ForexPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="bg-black text-white py-4 sticky top-0 z-10 border-b border-gray-800">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Forex Exchange Rates</h1>
          <p className="text-gray-400">Real-time currency exchange rates</p>
        </div>
      </header>
      
      <main className="container mx-auto p-4 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured Forex Rate - EURUSD as requested */}
          <Card className="col-span-full bg-black border border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-xl">
                EUR/USD Exchange Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ForexWidget 
                pair="FX:EURUSD" 
                width="100%" 
              />
            </CardContent>
          </Card>
          
          {/* Other major currency pairs */}
          <ForexWidget pair={ForexPairs.GBPUSD} />
          <ForexWidget pair={ForexPairs.USDJPY} />
          <ForexWidget pair={ForexPairs.USDCAD} />
          <ForexWidget pair={ForexPairs.AUDUSD} />
          <ForexWidget pair={ForexPairs.EURGBP} />
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 border-t border-gray-800">
        <p className="text-xs">
          Data displayed using custom widgets based on TradingView data
        </p>
      </footer>
    </div>
  );
} 