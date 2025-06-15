
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Globe, Calendar } from 'lucide-react';
import { mockStockService } from '@/lib/mockStockService';

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

  useEffect(() => {
    if (!propCompanyInfo && symbol) {
      const fetchCompanyInfo = async () => {
        try {
          setLoading(true);
          setError(null);
          const info = await mockStockService.getCompanyInfo(symbol);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-lg">{companyInfo.name}</h3>
          <Badge variant="secondary">{companyInfo.symbol}</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Sector</label>
            <p>{companyInfo.sector}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Industry</label>
            <p>{companyInfo.industry}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Exchange</label>
            <p>{companyInfo.exchange}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Market Cap</label>
            <p>${(companyInfo.marketCap / 1000000000).toFixed(2)}B</p>
          </div>
        </div>

        {companyInfo.description && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Description</label>
            <p className="text-sm text-muted-foreground mt-1">
              {companyInfo.description}
            </p>
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {companyInfo.employees && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {companyInfo.employees.toLocaleString()} employees
            </div>
          )}
          {companyInfo.founded && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Founded {companyInfo.founded}
            </div>
          )}
        </div>

        {companyInfo.website && (
          <div>
            <a 
              href={companyInfo.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Globe className="h-4 w-4" />
              Visit Website
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockInfoCard;
