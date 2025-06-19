import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';

interface OptionsChainProps {
  symbol: string;
}

interface OptionData {
  contractSymbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
}

const OptionsChain: React.FC<OptionsChainProps> = ({ symbol }) => {
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [optionsData, setOptionsData] = useState<{ options: OptionData[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOptionsData = async () => {
      try {
        setLoading(true);
        const data = await stockDataService.getOptionsData(symbol);
        setOptionsData(data);
        
        if (data.options && data.options.length > 0) {
          setSelectedExpiry(data.options[0].expiration);
        }
      } catch (error) {
        console.error('Error fetching options data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptionsData();
  }, [symbol]);

  if (loading) {
    return (
      <Card>
        <CardContent>Loading options data...</CardContent>
      </Card>
    );
  }

  if (!optionsData || !optionsData.options) {
    return (
      <Card>
        <CardContent>Failed to load options data.</CardContent>
      </Card>
    );
  }

  const uniqueExpiries = Array.from(
    new Set(optionsData.options.map((option: OptionData) => option.expiration))
  );

  const filteredOptions = optionsData.options.filter(
    (option: OptionData) => option.expiration === selectedExpiry
  );

  const calls = filteredOptions.filter((option: OptionData) => option.type === 'call');
  const puts = filteredOptions.filter((option: OptionData) => option.type === 'put');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Options Chain for {symbol}
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue={uniqueExpiries[0] || ''} className="space-y-4">
          <TabsList>
            {uniqueExpiries.map((expiry: string) => (
              <TabsTrigger 
                key={expiry} 
                value={expiry} 
                onClick={() => setSelectedExpiry(expiry)}
              >
                {expiry}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {uniqueExpiries.map((expiry: string) => (
            <TabsContent key={expiry} value={expiry} className="space-y-4">
              <h4 className="text-sm font-semibold">Calls</h4>
              <div className="overflow-x-auto scrollbar-none -mx-2">
                <table className="min-w-[600px] w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Strike
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Bid
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Ask
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Open Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calls.map((call: OptionData) => (
                      <tr key={call.contractSymbol}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium text-gray-900">
                          {call.strike}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{call.bid}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{call.ask}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{call.volume}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{call.openInterest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-semibold mt-4">Puts</h4>
              <div className="overflow-x-auto scrollbar-none -mx-2">
                <table className="min-w-[600px] w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Strike
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Bid
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Ask
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Open Interest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {puts.map((put: OptionData) => (
                      <tr key={put.contractSymbol}>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap font-medium text-gray-900">
                          {put.strike}
                        </td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{put.bid}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{put.ask}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{put.volume}</td>
                        <td className="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-gray-500">{put.openInterest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OptionsChain;
