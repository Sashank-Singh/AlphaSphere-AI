import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { aiTradingIntegration } from '@/lib/aiTradingIntegration';
import UnifiedAIDemo from '@/components/ai/UnifiedAIDemo';

const TestPage: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('Running test...');

    try {
      // Test 1: Create a trading session
      const session = await aiTradingIntegration.createTradingSession(
        'test-user',
        10000,
        ['AAPL', 'MSFT']
      );
      
      setTestResult(`✅ Session created: ${session.sessionId}`);

      // Test 2: Get RL predictions
      const predictions = await aiTradingIntegration.getRLPredictions(['AAPL', 'MSFT']);
      
      setTestResult(prev => prev + `\n✅ Predictions received: ${predictions.length} predictions`);

      // Test 3: Get LLM analysis
      const analysis = await aiTradingIntegration.getLLMAnalysis(
        ['AAPL', 'MSFT'],
        {},
        predictions
      );
      
      setTestResult(prev => prev + `\n✅ Analysis received: ${analysis.marketContext}`);

      // Test 4: Generate signals
      const signals = aiTradingIntegration.generateTradingSignals(
        predictions,
        analysis,
        session
      );
      
      setTestResult(prev => prev + `\n✅ Signals generated: ${signals.length} signals`);

      setTestResult(prev => prev + '\n🎉 All tests passed! AI Trading integration is working correctly.');

    } catch (error) {
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Test & Demo Page</h1>
        <p className="text-muted-foreground">
          Test AI trading integration and explore the Unified AI Demo component.
        </p>
      </div>

      <Tabs defaultValue="unified-ai-demo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unified-ai-demo">Unified AI Demo</TabsTrigger>
          <TabsTrigger value="integration-test">Integration Test</TabsTrigger>
        </TabsList>

        <TabsContent value="unified-ai-demo" className="space-y-6">
          <UnifiedAIDemo />
        </TabsContent>

        <TabsContent value="integration-test" className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Integration Test</CardTitle>
          <CardDescription>
            Test the AI trading integration components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Running Test...' : 'Run Integration Test'}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Check if environment variables are loaded correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>VITE_ALPACA_API_KEY:</span>
              <Badge variant={import.meta.env.VITE_ALPACA_API_KEY ? 'default' : 'secondary'}>
                {import.meta.env.VITE_ALPACA_API_KEY ? 'Set' : 'Not Set'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>VITE_RL_API_ENDPOINT:</span>
              <Badge variant={import.meta.env.VITE_RL_API_ENDPOINT ? 'default' : 'secondary'}>
                {import.meta.env.VITE_RL_API_ENDPOINT || 'http://localhost:8501'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>VITE_LLM_API_ENDPOINT:</span>
              <Badge variant={import.meta.env.VITE_LLM_API_ENDPOINT ? 'default' : 'secondary'}>
                {import.meta.env.VITE_LLM_API_ENDPOINT || 'http://localhost:5001'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>✅ If the test passes, you can:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Navigate to <code>/ai-trading</code> to use the full AI Trading Platform</li>
              <li>Start the backend services for real AI predictions</li>
              <li>Add your Alpaca API keys for paper trading</li>
            </ul>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestPage; 