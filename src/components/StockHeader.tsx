import React, { useState, useEffect } from 'react';
import { fetchCompanyOverview, CompanyInfo } from '@/lib/api';
import { ChevronLeft } from 'lucide-react';
import TVQuoteWidget from './TVQuoteWidget';

interface StockHeaderProps {
  symbol: string;
}

const StockHeader: React.FC<StockHeaderProps> = ({ 
  symbol
}) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Check if this is a forex pair
  const isForex = symbol.toUpperCase().startsWith('FX:');

  // Fetch company data
  useEffect(() => {
    // Skip fetching company info for forex pairs
    if (isForex) {
      setLoading(false);
      return;
    }
    
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyOverview(symbol);
        setCompanyInfo(data);
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [symbol, isForex]);

  return (
    <header className="bg-black text-white py-4 sticky top-0 z-10 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-4">
          {/* Price widget row - Moved to top */}
          <div className="w-full">
            <TVQuoteWidget 
              symbol={symbol} 
              width="100%" 
              isTransparent={true}
            />
          </div>

          {/* Company info row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className="mr-4 text-gray-400 hover:text-white">
                <ChevronLeft size={24} />
              </a>
              
              <div>
                {!loading && companyInfo && !isForex && (
                  <div className="text-sm text-gray-400">
                    {companyInfo.Name}
                  </div>
                )}
                {isForex && (
                  <div className="text-sm text-gray-400">
                    Foreign Exchange Rate
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default StockHeader; 