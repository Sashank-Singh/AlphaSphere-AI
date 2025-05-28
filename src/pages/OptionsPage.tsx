import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OptionsAnalysis from '@/components/OptionsAnalysis';

const OptionsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Options Trading</h1>

      <div className="space-y-6">
        {/* Options Analysis Section */}
        <OptionsAnalysis />

        {/* Options Chain */}
        <Card>
          <CardHeader>
            <CardTitle>Options Chain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Example Options Data - Replace with actual data fetching */}
              <OptionsTable
                title="Calls"
                options={[
                  { strikePrice: 150, expiryDate: '2024-03-15', premium: 2.50 },
                  { strikePrice: 155, expiryDate: '2024-03-15', premium: 1.20 },
                  { strikePrice: 160, expiryDate: '2024-03-22', premium: 0.50 },
                ]}
              />

              <OptionsTable
                title="Puts"
                options={[
                  { strikePrice: 140, expiryDate: '2024-03-15', premium: 1.80 },
                  { strikePrice: 135, expiryDate: '2024-03-22', premium: 0.80 },
                  { strikePrice: 130, expiryDate: '2024-03-22', premium: 0.30 },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options Strategy Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Options Strategy Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">
              Strategy builder coming soon...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface Option {
  strikePrice: number;
  expiryDate: string;
  premium: number;
}

interface OptionsTableProps {
  title: string;
  options: Option[];
}

const OptionsTable: React.FC<OptionsTableProps> = ({ title, options }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Strike Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Premium
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {options.map((option, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {option.strikePrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {option.expiryDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {option.premium}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionsPage;
