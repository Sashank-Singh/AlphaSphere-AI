import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Typewriter from '@/components/Typewriter';

interface DeepseekStockAnalysisProps {
  symbol: string;
}

const DeepseekStockAnalysis: React.FC<DeepseekStockAnalysisProps> = ({ symbol }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      setAnalysis('');

      const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || import.meta.env.DEEPSEEK_API_KEY;

      if (!apiKey) {
        setError('DEEPSEEK_API_KEY is not set.');
        setIsLoading(false);
        return;
      }

      const prompt = `Provide a detailed stock analysis for ${symbol}. Cover the following aspects:
1.  **Overall Sentiment:** Is it bullish, bearish, or neutral?
2.  **Key Drivers:** What are the main factors driving the stock's performance?
3.  **Potential Risks:** What are the potential risks associated with this stock?
4.  **Future Outlook:** What is the likely future performance?
Please provide a comprehensive but concise analysis.`;

      try {
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful financial assistant providing stock analysis.',
              },
              { role: 'user', content: prompt },
            ],
            stream: false, // Set to false to get the full response at once
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          setAnalysis(data.choices[0].message.content);
        } else {
          throw new Error('No analysis data received.');
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(`Failed to fetch analysis: ${e.message}`);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchAnalysis();
    }
  }, [symbol]);

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">AI Stock Analysis for {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {analysis && !isLoading && (
          <div className="text-gray-300">
            <Typewriter text={analysis} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeepseekStockAnalysis;
