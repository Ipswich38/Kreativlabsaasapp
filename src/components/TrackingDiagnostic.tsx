import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CheckCircle2, XCircle, AlertTriangle, Eye, Mail, Link2 } from 'lucide-react';

export function TrackingDiagnostic() {
  const [testEmail, setTestEmail] = useState('');
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [latestEmails, setLatestEmails] = useState<any[]>([]);

  const runDiagnostic = async () => {
    setTesting(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Check Supabase URL
      const supabaseUrl = `https://${projectId}.supabase.co`;
      results.supabaseUrl = supabaseUrl;
      results.tests.push({
        name: 'Supabase URL',
        status: 'pass',
        message: supabaseUrl
      });

      // Test 2: Fetch latest sent emails
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/make-server-aed69b82/sent-emails`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setLatestEmails(data.emails.slice(0, 5));
          results.tests.push({
            name: 'Fetch Sent Emails',
            status: 'pass',
            message: `Found ${data.emails.length} emails`
          });
        } else {
          results.tests.push({
            name: 'Fetch Sent Emails',
            status: 'fail',
            message: `HTTP ${response.status}`
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'Fetch Sent Emails',
          status: 'fail',
          message: String(error)
        });
      }

      // Test 3: Test tracking pixel endpoint
      if (latestEmails.length > 0) {
        const testTrackingId = latestEmails[0].id;
        const trackingUrl = `${supabaseUrl}/functions/v1/make-server-aed69b82/track-email-open/${testTrackingId}`;
        
        try {
          const response = await fetch(trackingUrl);
          if (response.ok && response.headers.get('content-type')?.includes('image/gif')) {
            results.tests.push({
              name: 'Tracking Pixel Endpoint',
              status: 'pass',
              message: 'Returns GIF image correctly'
            });
          } else {
            results.tests.push({
              name: 'Tracking Pixel Endpoint',
              status: 'warn',
              message: `Status: ${response.status}, Type: ${response.headers.get('content-type')}`
            });
          }
        } catch (error) {
          results.tests.push({
            name: 'Tracking Pixel Endpoint',
            status: 'fail',
            message: String(error)
          });
        }
      }

      // Test 4: Check SUPABASE_URL environment variable on server
      try {
        const response = await fetch(
          `${supabaseUrl}/functions/v1/make-server-aed69b82/diagnostic/check-env`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          results.tests.push({
            name: 'Server SUPABASE_URL',
            status: data.supabaseUrl ? 'pass' : 'fail',
            message: data.supabaseUrl || 'Not set'
          });
        }
      } catch (error) {
        results.tests.push({
          name: 'Server SUPABASE_URL',
          status: 'warn',
          message: 'Cannot check (endpoint may not exist)'
        });
      }

      setDiagnosticResults(results);
      toast.success('Diagnostic complete');
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast.error('Diagnostic failed');
    } finally {
      setTesting(false);
    }
  };

  const testTrackingPixel = async (emailId: string, recipientEmail: string) => {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    const trackingUrl = `${supabaseUrl}/functions/v1/make-server-aed69b82/track-email-open/${emailId}`;
    
    try {
      // Open in new tab to trigger the pixel
      window.open(trackingUrl, '_blank');
      toast.success(`Tracking pixel triggered for ${recipientEmail}. Wait 10 seconds and check status.`);
    } catch (error) {
      toast.error('Failed to trigger tracking pixel');
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setTesting(true);
    try {
      const supabaseUrl = `https://${projectId}.supabase.co`;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/make-server-aed69b82/gmail-multimail-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            recipients: [{ email: testEmail, name: 'Test User' }],
            subject: 'Tracking Test Email',
            message: 'This is a test email to verify tracking functionality. Please open this email and make sure images are loaded.',
            sentBy: 'tracking-diagnostic'
          }),
        }
      );

      if (response.ok) {
        toast.success('Test email sent! Open it and load images to test tracking.');
        setTimeout(() => runDiagnostic(), 2000);
      } else {
        const error = await response.text();
        toast.error(`Failed to send: ${error}`);
      }
    } catch (error) {
      console.error('Send error:', error);
      toast.error('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-slate-900 mb-1">Email Tracking Diagnostic</h1>
        <p className="text-sm text-slate-500">Debug and test email tracking functionality</p>
      </div>

      {/* Send Test Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#ff77a4]" />
            Send Test Email
          </CardTitle>
          <CardDescription>Send yourself a test email to verify tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your-email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendTestEmail} disabled={testing}>
              Send Test
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            ⚠️ After receiving, open the email and click "Show Images" if prompted
          </p>
        </CardContent>
      </Card>

      {/* Run Diagnostic */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            System Diagnostic
          </CardTitle>
          <CardDescription>Check if tracking system is configured correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={testing} className="w-full">
            {testing ? 'Running...' : 'Run Full Diagnostic'}
          </Button>
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {diagnosticResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Diagnostic Results</CardTitle>
            <CardDescription>
              Ran at: {new Date(diagnosticResults.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnosticResults.tests.map((test: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                {test.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                {test.status === 'fail' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                {test.status === 'warn' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-slate-900">{test.name}</div>
                  <div className="text-xs text-slate-600 break-all">{test.message}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Latest Emails with Test Buttons */}
      {latestEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-600" />
              Test Tracking Pixels
            </CardTitle>
            <CardDescription>
              Click "Test Pixel" to manually trigger tracking for any email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestEmails.map((email) => {
              const supabaseUrl = `https://${projectId}.supabase.co`;
              const trackingUrl = `${supabaseUrl}/functions/v1/make-server-aed69b82/track-email-open/${email.id}`;
              
              return (
                <div key={email.id} className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{email.recipientEmail}</div>
                      <div className="text-xs text-slate-500">{email.subject}</div>
                    </div>
                    <Badge variant={email.status === 'opened' ? 'default' : 'secondary'}>
                      {email.status}
                      {email.openCount > 0 && ` (${email.openCount}x)`}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testTrackingPixel(email.id, email.recipientEmail)}
                      className="text-xs"
                    >
                      Test Pixel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(trackingUrl);
                        toast.success('Tracking URL copied');
                      }}
                      className="text-xs"
                    >
                      Copy URL
                    </Button>
                  </div>
                  <div className="text-xs text-slate-400 font-mono break-all bg-white p-2 rounded border">
                    {trackingUrl}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">How to Test Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p><strong>Method 1: Send yourself a test email</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Enter your email above and click "Send Test"</li>
            <li>Check your inbox and open the email</li>
            <li>Make sure to click "Show Images" if prompted</li>
            <li>Wait 10-30 seconds</li>
            <li>Go to "Sent Emails" tab and check if status changed to "Opened"</li>
          </ol>
          
          <p className="mt-4"><strong>Method 2: Manually test tracking pixel</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Run diagnostic to see latest emails</li>
            <li>Click "Test Pixel" button for any email</li>
            <li>This simulates opening the email</li>
            <li>Wait 10 seconds</li>
            <li>Go to "Sent Emails" and verify status changed</li>
          </ol>

          <p className="mt-4"><strong>What to check:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Supabase URL is correct</li>
            <li>Tracking pixel endpoint returns image/gif</li>
            <li>Email HTML contains tracking pixel at the end</li>
            <li>Status updates from "delivered" to "opened"</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
