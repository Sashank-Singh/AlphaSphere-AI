
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Globe, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { stockDataService } from '@/lib/stockDataService';

interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  exchange: string;
  marketCap: number;
  description: string;
  employees: number;
  website: string;
  ceo: string;
  founded: string;
}

interface StockInfoCardProps {
  symbol: string;
  companyInfo?: CompanyInfo;
}

const StockInfoCard: React.FC<StockInfoCardProps> = ({ symbol, companyInfo: propCompanyInfo }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(propCompanyInfo || null);
  const [loading, setLoading] = useState(!propCompanyInfo);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!propCompanyInfo && symbol) {
      const fetchCompanyInfo = async () => {
        try {
          setLoading(true);
          setError(null);
          const info = await stockDataService.getCompanyInfo(symbol);
          if (info) {
            // Map the mock service response to our expected format
            const mappedInfo: CompanyInfo = {
              symbol: symbol,
              name: info.name,
              sector: info.sector,
              industry: info.industry,
              exchange: 'NASDAQ', // Default value since mock service doesn't provide this
              marketCap: info.marketCap,
              description: info.description,
              employees: info.employees,
              website: info.website,
              ceo: 'Unknown', // Default value since mock service doesn't provide this
              founded: '1970' // Default value since mock service doesn't provide this
            };
            setCompanyInfo(mappedInfo);
          }
        } catch (err) {
          console.error('Error fetching company info:', err);
          setError('Failed to load company information');
        } finally {
          setLoading(false);
        }
      };

      fetchCompanyInfo();
    }
  }, [symbol, propCompanyInfo]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            Loading company information for {symbol}...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!companyInfo) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            No company information available for {symbol}
          </div>
        </CardContent>
      </Card>
    );
  }

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const shouldShowExpandButton = companyInfo?.description && companyInfo.description.length > 150;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Company Name and Symbol - Compact Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{companyInfo.name}</h3>
            <Badge variant="secondary" className="text-xs mt-1">{companyInfo.symbol}</Badge>
          </div>
        </div>
        
        {/* Key Metrics - Horizontal Layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-muted-foreground">Sector</span>
            <p className="font-medium truncate">{companyInfo.sector}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Industry</span>
            <p className="font-medium truncate">{companyInfo.industry}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Exchange</span>
            <p className="font-medium">{companyInfo.exchange}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Market Cap</span>
            <p className="font-medium">${(companyInfo.marketCap / 1000000000).toFixed(2)}B</p>
          </div>
        </div>

        {/* Additional Info - Compact Row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {companyInfo.employees && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{(companyInfo.employees / 1000).toFixed(0)}K</span>
            </div>
          )}
          {companyInfo.founded && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{companyInfo.founded}</span>
            </div>
          )}
          {companyInfo.website && (
            <a 
              href={companyInfo.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
            >
              <Globe className="h-3 w-3" />
              <span>Website</span>
            </a>
          )}
        </div>

        {/* Description - Expandable */}
        {companyInfo.description && (
          <div className="space-y-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Description</span>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                {isExpanded ? companyInfo.description : truncateDescription(companyInfo.description)}
              </p>
            </div>
            {shouldShowExpandButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show More
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockInfoCard;
