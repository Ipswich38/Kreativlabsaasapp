import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ServerConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    try {
      // Test 1: Health Check
      console.log('🧪 Testing server health...');
      try {
        const healthResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/health`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          testResults.tests.push({
            name: 'Health Check',
            status: 'success',
            message: 'Server is running',
            details: healthData,
          });
        } else {
          testResults.tests.push({
            name: 'Health Check',
            status: 'error',
            message: `Server returned ${healthResponse.status}`,
          });
        }
      } catch (error: any) {
        testResults.tests.push({
          name: 'Health Check',
          status: 'error',
          message: error.message,
        });
      }

      // Test 2: Leads API
      console.log('🧪 Testing leads API...');
      try {
        const leadsResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/leads`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json();
          testResults.tests.push({
            name: 'Leads API',
            status: 'success',
            message: `Found ${leadsData.leads?.length || 0} leads`,
          });
        } else {
          testResults.tests.push({
            name: 'Leads API',
            status: 'error',
            message: `Server returned ${leadsResponse.status}`,
          });
        }
      } catch (error: any) {
        testResults.tests.push({
          name: 'Leads API',
          status: 'error',
          message: error.message,
        });
      }

      // Test 3: Logo URL
      console.log('🧪 Testing logo URL...');
      try {
        const logoResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/logo-url`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (logoResponse.ok) {
          const logoData = await logoResponse.json();
          testResults.tests.push({
            name: 'Logo URL',
            status: 'success',
            message: logoData.exists ? 'Logo exists' : 'Logo not uploaded yet',
          });
        } else {
          testResults.tests.push({
            name: 'Logo URL',
            status: 'error',
            message: `Server returned ${logoResponse.status}`,
          });
        }
      } catch (error: any) {
        testResults.tests.push({
          name: 'Logo URL',
          status: 'error',
          message: error.message,
        });
      }

      setResults(testResults);
    } catch (error) {
      console.error('Connection test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
  };

  const allTestsPassed = results?.tests?.every((test: any) => test.status === 'success');

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Server Connection Diagnostics
        </CardTitle>
        <CardDescription>
          Test connectivity to backend services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={testing}
          className="w-full"
          style={{ background: '#ff77a4' }}
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Connection Tests
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            {allTestsPassed ? (
              <Alert style={{ background: '#d4edda', border: '1px solid #c3e6cb' }}>
                <AlertDescription className="text-green-800">
                  ✅ All tests passed! Server is fully operational.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  ⚠️ Some tests failed. See details below.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              {results.tests.map((test: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    test.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{test.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{test.message}</p>
                      {test.details && (
                        <details className="mt-2">
                          <summary className="text-xs cursor-pointer text-blue-600">
                            Show details
                          </summary>
                          <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 border-t pt-3">
              <p><strong>Server URL:</strong> {`https://${projectId}.supabase.co/functions/v1/make-server-aed69b82`}</p>
              <p><strong>Test Time:</strong> {new Date(results.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        {!results && !testing && (
          <Alert>
            <AlertDescription className="text-sm">
              Click the button above to test your connection to the backend server.
              This will check if the server is running and all APIs are accessible.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
