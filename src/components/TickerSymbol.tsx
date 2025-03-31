import React from 'react';
import TickerPrice from './TickerPrice';

interface TickerSymbolProps {
  symbol: string;
  companyName?: string;
  exchange?: string;
  className?: string;
  showSecondaryPrice?: boolean;
}

const TickerSymbol: React.FC<TickerSymbolProps> = ({
  symbol,
  companyName,
  exchange,
  className = '',
  showSecondaryPrice = false
}) => {
  return (
    <div className={`${className}`}>
      {/* Main symbol display */}
      <div className="flex flex-col">
        {companyName && (
          <h3 className="text-gray-300 text-sm font-normal">{companyName}</h3>
        )}
        
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{symbol}</h2>
          {exchange && (
            <span className="text-gray-400 text-xs">
              {exchange}
            </span>
          )}
        </div>
        
        {/* Secondary price display */}
        {showSecondaryPrice && (
          <div className="mt-1">
            <TickerPrice
              symbol={symbol}
              variant="small"
              showChange={true}
              refreshInterval={10000}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TickerSymbol; 