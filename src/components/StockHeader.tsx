import React, { useEffect, useState } from 'react';
import { mockStockService, CompanyInfo } from '@/lib/mockStockService';
import { ChevronLeft } from 'lucide-react';
import TVQuoteWidget from './TVQuoteWidget';

interface StockHeaderProps {
  symbol: string;
}

const StockHeader: React.FC<StockHeaderProps> = ({ symbol }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Check if this is a forex pair
  const isForex = symbol.toUpperCase().startsWith('FX:');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const data = await mockStockService.getCompanyInfo(symbol);
        setCompanyInfo(data);
      } catch (error) {
        console.error('Error fetching company info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [symbol]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!companyInfo) {
    return <div>Company information not available</div>;
  }

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
                    {companyInfo.name}
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