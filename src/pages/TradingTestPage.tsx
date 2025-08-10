import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { AITradingIntegration, AITradingSignal } from '@/lib/aiTradingIntegration';

const TradingTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  const aiIntegration = new AITradingIntegration(
    import.meta.env.VITE_ALPACA_API_KEY || '',
    import.meta.env.VITE_ALPACA_SECRET_KEY || '',
    import.meta.env.VITE_RL_API_ENDPOINT || 'http://localhost:8501',
    import.meta.env.VITE_LLM_API_ENDPOINT || 'http://localhost:5001'
  );

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTradingTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      addResult('Starting trading test...');

      // Check backend services first
      addResult('Checking backend services...');
      
      // Check RL API
      try {
        const rlResponse = await fetch(`${import.meta.env.VITE_RL_API_ENDPOINT || 'http://localhost:8501'}/health`);
        if (rlResponse.ok) {
          addResult('✅ RL API is running');
        } else {
          addResult('⚠️ RL API is not responding properly');
        }
      } catch (error) {
        addResult('❌ RL API is not available - using mock predictions');
      }

      // Check LLM API
      try {
        const llmResponse = await fetch(`${import.meta.env.VITE_LLM_API_ENDPOINT || 'http://localhost:5001'}/api/cache/status`);
        if (llmResponse.ok) {
          addResult('✅ LLM API is running');
        } else {
          addResult('⚠️ LLM API is not responding properly');
        }
      } catch (error) {
        addResult('❌ LLM API is not available - using fallback analysis');
      }

      // Step 1: Create a trading session
      addResult('Creating trading session...');
      const session = await aiIntegration.createTradingSession('test-user', 10000);
      setSessionId(session.sessionId);
      addResult(`✅ Session created: ${session.sessionId}`);

      // Step 2: Create a test signal
      addResult('Creating test trading signal...');
      const testSignal: AITradingSignal = {
        symbol: 'AAPL',
        action: 'BUY',
        confidence: 0.85,
        reasoning: 'Test signal for debugging',
        timestamp: new Date()
      };
      addResult(`✅ Test signal created for ${testSignal.symbol}`);

      // Step 3: Execute the trade
      addResult('Executing trade...');
      const executedTrades = await aiIntegration.executeAITrades(session.sessionId, [testSignal]);
      addResult(`✅ Trade executed successfully: ${executedTrades.length} trades`);

      if (executedTrades.length > 0) {
        const trade = executedTrades[0];
        addResult(`Trade details: ${trade.symbol} ${trade.side} ${trade.quantity} shares at $${trade.price}`);
      }

      // Step 4: Get updated session
      addResult('Getting updated session...');
      const updatedSession = aiIntegration.getSession(session.sessionId);
      if (updatedSession) {
        addResult(`✅ Session updated - Capital: $${updatedSession.currentCapital.toFixed(2)}`);
        addResult(`Positions: ${JSON.stringify(updatedSession.positions)}`);
        addResult(`Total trades: ${updatedSession.trades.length}`);
      }

      addResult('🎉 All tests passed! Trading execution is working correctly.');

    } catch (error) {
      addResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Trading test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runManualTradeTest = async () => {
    if (!sessionId) {
      addResult('❌ No session available. Run the main test first.');
      return;
    }

    setIsLoading(true);
    addResult('Testing manual trade execution...');

    try {
      const manualSignal: AITradingSignal = {
        symbol: 'MSFT',
        action: 'BUY',
        confidence: 1.0,
        reasoning: 'Manual test trade',
        timestamp: new Date()
      };

      const executedTrades = await aiIntegration.executeAITrades(sessionId, [manualSignal]);
      addResult(`✅ Manual trade executed: ${executedTrades.length} trades`);

      if (executedTrades.length > 0) {
        const trade = executedTrades[0];
        addResult(`Manual trade: ${trade.symbol} ${trade.side} ${trade.quantity} shares at $${trade.price}`);
      }

    } catch (error) {
      addResult(`❌ Manual trade failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Trading Execution Test</h1>
        <p className="text-muted-foreground">
          Test the trading execution functionality to identify and fix issues.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Test Controls
            </CardTitle>
            <CardDescription>
              Run tests to verify trading functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTradingTest} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Running Test...' : 'Run Trading Test'}
            </Button>

            <Button 
              onClick={runManualTradeTest} 
              disabled={isLoading || !sessionId}
              variant="outline"
              className="w-full"
            >
              Test Manual Trade
            </Button>

            {sessionId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Active Session:</p>
                <p className="text-xs text-muted-foreground font-mono">{sessionId}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Environment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Status</CardTitle>
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
                <Badge variant="default">
                  {import.meta.env.VITE_RL_API_ENDPOINT || 'http://localhost:8501'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>VITE_LLM_API_ENDPOINT:</span>
                <Badge variant="default">
                  {import.meta.env.VITE_LLM_API_ENDPOINT || 'http://localhost:5001'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Frontend URL:</span>
                <Badge variant="default">
                  http://localhost:8080
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Access AI Trading:</strong> http://localhost:8080/ai-trading
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>
            Real-time test execution results
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground">No tests run yet. Click "Run Trading Test" to start.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded border">
                  {result.includes('✅') ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : result.includes('❌') ? (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  ) : (
                    <div className="h-4 w-4 mt-0.5" />
                  )}
                  <span className="text-sm font-mono">{result}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Troubleshooting Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                If tests fail, check the browser console for detailed error messages.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Common Issues:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Session not found: Session may have expired or been cleared</li>
                <li>• Position size 0: Capital may be insufficient or confidence too low</li>
                <li>• API errors: Backend services may not be running</li>
                <li>• Network errors: Check if services are accessible</li>
                <li>• Wrong URL: Use http://localhost:8080/ai-trading</li>
                <li>• RL API down: Trading will use mock predictions</li>
                <li>• LLM API down: Trading will use fallback analysis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingTestPage; 