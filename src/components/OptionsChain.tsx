import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchRealtimeOptions, fetchHistoricalOptions, extractCallOptions, extractPutOptions, formatOptionsByExpiration } from '@/lib/api';

interface OptionsChainProps {
  symbol: string;
  currentPrice: number;
}

const OptionsChain: React.FC<OptionsChainProps> = ({ symbol, currentPrice }) => {
  const [optionsData, setOptionsData] = useState<any>(null);
  const [optionsType, setOptionsType] = useState<'realtime' | 'historical'>('realtime');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedExpiration, setSelectedExpiration] = useState<string>('');
  const [callOptions, setCallOptions] = useState<any[]>([]);
  const [putOptions, setPutOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expirationDates, setExpirationDates] = useState<{ expirationDate: string; options: any[] }[]>([]);

  // Fetch options data
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        if (optionsType === 'realtime') {
          data = await fetchRealtimeOptions(symbol, true);
        } else {
          data = await fetchHistoricalOptions(symbol, selectedDate || undefined);
        }

        if (data.error) {
          setError(data.message);
          setOptionsData(null);
        } else {
          setOptionsData(data);
          
          // Extract calls and puts
          const calls = extractCallOptions(data);
          const puts = extractPutOptions(data);
          
          // Format by expiration date
          const callsByExpiration = formatOptionsByExpiration(calls);
          const putsByExpiration = formatOptionsByExpiration(puts);
          
          // Combine and deduplicate expiration dates
          const allExpirationDates = [...callsByExpiration];
          
          // Set first expiration date as default
          if (allExpirationDates.length > 0 && !selectedExpiration) {
            setSelectedExpiration(allExpirationDates[0].expirationDate);
          }
          
          setExpirationDates(allExpirationDates);
          
          // Update displayed options based on selected expiration
          updateDisplayedOptions(calls, puts, selectedExpiration || (allExpirationDates[0]?.expirationDate || ''));
        }
      } catch (err) {
        setError('Failed to fetch options data');
        console.error('Error fetching options:', err);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchOptions();
    }
  }, [symbol, optionsType, selectedDate]);

  // Update displayed options when expiration date changes
  useEffect(() => {
    if (optionsData) {
      const calls = extractCallOptions(optionsData);
      const puts = extractPutOptions(optionsData);
      updateDisplayedOptions(calls, puts, selectedExpiration);
    }
  }, [selectedExpiration, optionsData]);

  // Helper to update displayed options based on selected expiration
  const updateDisplayedOptions = (calls: any[], puts: any[], expDate: string) => {
    const filteredCalls = calls.filter(option => 
      (option.expirationDate || option.expiration_date) === expDate
    );
    
    const filteredPuts = puts.filter(option => 
      (option.expirationDate || option.expiration_date) === expDate
    );
    
    // Sort by strike price
    filteredCalls.sort((a, b) => parseFloat(a.strikePrice || a.strike_price) - parseFloat(b.strikePrice || b.strike_price));
    filteredPuts.sort((a, b) => parseFloat(a.strikePrice || a.strike_price) - parseFloat(b.strikePrice || b.strike_price));
    
    setCallOptions(filteredCalls);
    setPutOptions(filteredPuts);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days until expiration
  const getDaysUntilExpiration = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = Math.abs(expDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get appropriate CSS class based on whether the option is in the money
  const getMoneyClass = (strikePrice: number, isCall: boolean) => {
    if (isCall) {
      return currentPrice > strikePrice ? 'text-green-500' : 'text-white';
    } else {
      return currentPrice < strikePrice ? 'text-green-500' : 'text-white';
    }
  };

  return (
    <div className="bg-black text-white rounded-lg shadow-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Options Chain</h2>
        
        <div className="flex gap-2">
          <Select 
            value={optionsType} 
            onValueChange={(value) => setOptionsType(value as 'realtime' | 'historical')}
          >
            <SelectTrigger className="w-[150px] bg-black text-white border-gray-700">
              <SelectValue placeholder="Options Type" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white border-gray-700">
              <SelectItem value="realtime">Realtime</SelectItem>
              <SelectItem value="historical">Historical</SelectItem>
            </SelectContent>
          </Select>
          
          {optionsType === 'historical' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1 bg-black text-white border border-gray-700 rounded-md"
              aria-label="Select historical date"
              title="Select a date to view historical options data"
              placeholder="Select date"
            />
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 text-center">{error}</div>
      ) : expirationDates.length > 0 ? (
        <div>
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">Expiration Date</label>
            <Select 
              value={selectedExpiration} 
              onValueChange={setSelectedExpiration}
            >
              <SelectTrigger className="w-full bg-black text-white border-gray-700">
                <SelectValue placeholder="Select Expiration" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-gray-700 max-h-72">
                {expirationDates.map((date) => (
                  <SelectItem key={date.expirationDate} value={date.expirationDate}>
                    {formatDate(date.expirationDate)} ({getDaysUntilExpiration(date.expirationDate)} days)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="calls" className="w-full">
            <TabsList className="bg-gray-900 mb-4">
              <TabsTrigger value="calls" className="data-[state=active]:bg-blue-600">
                Calls
              </TabsTrigger>
              <TabsTrigger value="puts" className="data-[state=active]:bg-blue-600">
                Puts
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="calls" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strike</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bid</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ask</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">OI</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {callOptions.map((option, index) => {
                      const strikePrice = parseFloat(option.strikePrice || option.strike_price);
                      return (
                        <tr key={index} className="hover:bg-gray-900">
                          <td className={`px-2 py-2 whitespace-nowrap text-sm ${getMoneyClass(strikePrice, true)}`}>
                            ${strikePrice.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.lastPrice || option.last_price || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.bid || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.ask || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {parseInt(option.volume || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {parseInt(option.openInterest || option.open_interest || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {(parseFloat(option.impliedVolatility || option.implied_volatility || 0) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="puts" className="mt-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Strike</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bid</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ask</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Volume</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">OI</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {putOptions.map((option, index) => {
                      const strikePrice = parseFloat(option.strikePrice || option.strike_price);
                      return (
                        <tr key={index} className="hover:bg-gray-900">
                          <td className={`px-2 py-2 whitespace-nowrap text-sm ${getMoneyClass(strikePrice, false)}`}>
                            ${strikePrice.toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.lastPrice || option.last_price || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.bid || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            ${parseFloat(option.ask || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {parseInt(option.volume || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {parseInt(option.openInterest || option.open_interest || 0).toLocaleString()}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-300">
                            {(parseFloat(option.impliedVolatility || option.implied_volatility || 0) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="text-gray-400 p-4 text-center">No options data available</div>
      )}
    </div>
  );
};

export default OptionsChain; 