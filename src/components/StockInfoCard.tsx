import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCompanyOverview, CompanyInfo } from '@/lib/api';
import { Skeleton } from "@/components/ui/skeleton";

interface StockInfoCardProps {
  symbol: string;
}

const StockInfoCard: React.FC<StockInfoCardProps> = ({ symbol }) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchCompanyOverview(symbol);
        setCompanyInfo(data);
      } catch (error) {
        console.error('Error fetching company data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <Card className="bg-black border border-gray-800 h-full">
        <CardHeader>
          <CardTitle className="text-white flex justify-between items-center">
            <Skeleton className="h-6 w-24 bg-gray-800" />
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full bg-gray-800" />
            <Skeleton className="h-4 w-full bg-gray-800" />
            <Skeleton className="h-4 w-3/4 bg-gray-800" />
            <Skeleton className="h-4 w-1/2 bg-gray-800" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black border border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">
          Company Info
        </CardTitle>
      </CardHeader>
      <CardContent className="text-white">
        <div className="space-y-2">
          <div>
            <span className="text-gray-400 text-sm">Sector:</span>
            <p className="font-semibold">{companyInfo?.Sector || '-'}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Industry:</span>
            <p className="font-semibold">{companyInfo?.Industry || '-'}</p>
          </div>
          <div>
            <span className="text-gray-400 text-sm">Exchange:</span>
            <p className="font-semibold">{companyInfo?.Exchange || '-'}</p>
          </div>
          {companyInfo?.Description && (
            <div className="mt-4">
              <span className="text-gray-400 text-sm">About:</span>
              <p className="text-sm mt-1 text-gray-300 line-clamp-4">{companyInfo.Description}</p>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-4">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StockInfoCard; 