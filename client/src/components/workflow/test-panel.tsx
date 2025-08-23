import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface TestResult {
  success: boolean;
  response?: string;
  error?: string;
  timestamp?: string;
}

export function TestPanel() {
  const [testMessage, setTestMessage] = useState('Hello! Can you respond to test the OpenAI connection?');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const testOpenAI = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const response = await apiRequest('POST', '/api/test/openai', {
        message: testMessage
      });
      
      const data = await response.json();
      
      setTestResult({
        success: true,
        response: data.response,
        timestamp: data.timestamp
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="test-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Test OpenAI Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test-message">Test Message</Label>
          <Textarea
            id="test-message"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter a message to send to OpenAI..."
            rows={3}
            className="mt-1"
            data-testid="test-message-input"
          />
        </div>

        <Button 
          onClick={testOpenAI}
          disabled={isLoading}
          className="w-full"
          data-testid="test-openai-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing OpenAI Connection...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Test OpenAI API
            </>
          )}
        </Button>

        {testResult && (
          <Alert 
            variant={testResult.success ? "default" : "destructive"}
            data-testid="test-result"
          >
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5 text-red-600" />
              )}
              <div className="flex-1">
                <AlertDescription>
                  {testResult.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Success</Badge>
                        <span className="text-sm text-muted-foreground">
                          {testResult.timestamp && new Date(testResult.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm font-medium mb-1">OpenAI Response:</p>
                        <p className="text-sm">{testResult.response}</p>
                      </div>
                      <p className="text-sm text-green-700">
                        ✅ OpenAI API is working correctly! Your workflows can now use AI Agent nodes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Badge variant="destructive">Failed</Badge>
                      <p className="text-sm font-medium text-red-700">
                        ❌ OpenAI API test failed: {testResult.error}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Check if your OPENAI_API_KEY environment variable is configured correctly.
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-semibold mb-2">How to Test Your Workflows:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
            <li>Create a workflow with Manual Trigger → AI Agent</li>
            <li>Configure the AI Agent with your desired prompt</li>
            <li>Click "Execute Workflow" to run it</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}