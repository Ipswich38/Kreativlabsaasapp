import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

export function GmailFixHelper() {
  const [copiedCode, setCopiedCode] = useState(false);

  const codeTemplate = `const GMAIL_CONFIG = {
  gmailAddress: 'sshappyteeth@gmail.com',
  appPassword: 'YOUR_NEW_16_CHAR_PASSWORD',  // ← Paste your NEW App Password here (NO SPACES!)
  senderName: 'Happy Teeth Support Services',
};`;

  const handleCopyCode = () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeTemplate)
          .then(() => {
            setCopiedCode(true);
            toast.success('Code template copied to clipboard!');
            setTimeout(() => setCopiedCode(false), 3000);
          })
          .catch(() => {
            fallbackCopyToClipboard();
          });
      } else {
        fallbackCopyToClipboard();
      }
    } catch (error) {
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = codeTemplate;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopiedCode(true);
        toast.success('Code template copied to clipboard!');
        setTimeout(() => setCopiedCode(false), 3000);
      } else {
        toast.error('Failed to copy. Please select and copy manually.');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy failed. Please select and copy the code manually.');
    }
  };

  return (
    <Card className="border-2 border-red-500 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          🚨 Gmail Authentication Failed - FIX REQUIRED
        </CardTitle>
        <CardDescription className="text-red-700">
          The current App Password is REJECTED by Gmail. Follow these steps to fix it NOW.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Error */}
        <Alert className="bg-red-100 border-red-300">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <p className="text-sm text-red-900 mb-2">
              <strong>Error:</strong> <code className="bg-red-200 px-2 py-1 rounded text-xs">535-5.7.8 Username and Password not accepted</code>
            </p>
            <p className="text-xs text-red-800">
              Current password <code className="bg-red-200 px-1 rounded">wvnbgpmnkupothrh</code> is invalid or revoked.
            </p>
          </AlertDescription>
        </Alert>

        {/* Step 1 */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-blue-300">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-blue-900">Enable 2-Step Verification</h4>
              <p className="text-sm text-slate-700 mb-3">
                You MUST have 2-Step Verification enabled to create App Passwords.
              </p>
              <Button
                onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Google Security Settings
              </Button>
              <p className="text-xs text-slate-600 mt-2">
                Look for "2-Step Verification" and make sure it's turned ON.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-green-300">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-green-900">Generate NEW App Password</h4>
              <ol className="text-sm text-slate-700 space-y-2 mb-3 list-decimal list-inside">
                <li>Click the button below to open App Passwords page</li>
                <li>Select app: <code className="bg-slate-100 px-2 py-0.5 rounded">Mail</code></li>
                <li>Select device: <code className="bg-slate-100 px-2 py-0.5 rounded">Other (Custom name)</code></li>
                <li>Type: <strong>KreativLab CRM</strong></li>
                <li>Click <strong>Generate</strong></li>
                <li className="text-red-700"><strong>CRITICAL: Remove ALL spaces from the password!</strong></li>
              </ol>
              <Button
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
                className="bg-green-600 hover:bg-green-700 gap-2"
                size="sm"
              >
                <ExternalLink className="w-4 h-4" />
                Generate App Password
              </Button>
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                <p className="text-xs mb-2"><strong>Password Format:</strong></p>
                <p className="text-xs">❌ Wrong: <code className="bg-red-100 px-1">abcd efgh ijkl mnop</code> (has spaces)</p>
                <p className="text-xs">✅ Correct: <code className="bg-green-100 px-1">abcdefghijklmnop</code> (NO spaces, 16 chars)</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-purple-300">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="mb-2 text-purple-900">Update Server Code</h4>
              <ol className="text-sm text-slate-700 space-y-1 mb-3 list-decimal list-inside">
                <li>Open file: <code className="bg-slate-100 px-2 py-0.5 rounded text-xs">/supabase/functions/server/index.tsx</code></li>
                <li>Find the <code className="bg-slate-100 px-2 py-0.5 rounded">GMAIL_CONFIG</code> section (line 17)</li>
                <li>Replace the old password with your NEW password (NO SPACES!)</li>
                <li>Save the file (server auto-reloads)</li>
              </ol>
              <div className="bg-slate-900 p-3 rounded-lg mb-2">
                <pre className="text-green-400 text-xs overflow-x-auto">
{codeTemplate}
                </pre>
              </div>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {copiedCode ? 'Copied!' : 'Copy Code Template'}
              </Button>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-4 bg-white rounded-lg border-2 border-[#ff77a4]">
            <div className="w-8 h-8 rounded-full bg-[#ff77a4] text-white flex items-center justify-center flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="mb-2" style={{ color: '#ff77a4' }}>Test the Fix</h4>
              <p className="text-sm text-slate-700 mb-3">
                After updating the code, click the "Test SMTP" button above to verify it works.
              </p>
              <div className="flex items-start gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800">
                  If successful, you'll receive a confirmation email at <strong>sshappyteeth@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <Alert className="bg-blue-50 border-blue-300">
          <AlertDescription>
            <p className="text-sm mb-2"><strong>Quick Links:</strong></p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                2-Step Verification
              </Button>
              <Button
                onClick={() => window.open('https://myaccount.google.com/apppasswords', '_blank')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                App Passwords
              </Button>
              <Button
                onClick={() => window.open('https://support.google.com/mail/?p=BadCredentials', '_blank')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Help Article
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
