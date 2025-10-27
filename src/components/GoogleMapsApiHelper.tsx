import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle2, ExternalLink, Copy } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function GoogleMapsApiHelper() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Google Maps API Setup</h2>
        <p className="text-slate-600">
          The Lead Discovery System requires a Google Maps API key configured for server-side use.
        </p>
      </div>

      {/* Error Alert */}
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Common Error</AlertTitle>
        <AlertDescription>
          <strong>REQUEST_DENIED - API keys with referer restrictions cannot be used with this API.</strong>
          <br />
          This happens when your API key has HTTP referrer restrictions, which only work for browser requests.
          Our server makes backend API calls, so you need an unrestricted API key.
        </AlertDescription>
      </Alert>

      {/* Step-by-Step Guide */}
      <Card className="p-6">
        <h3 className="text-slate-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#ff77a4]" />
          Step-by-Step Fix
        </h3>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-[#ff77a4] pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#ff77a4]">Step 1</Badge>
              <span className="text-slate-900">Go to Google Cloud Console</span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Open the Google Cloud Console and navigate to API credentials:
            </p>
            <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-lg">
              <code className="text-sm flex-1">https://console.cloud.google.com/apis/credentials</code>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('https://console.cloud.google.com/apis/credentials')}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                className="bg-[#ff77a4] hover:bg-[#ff5a8f]"
                onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Open
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-[#ff77a4] pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#ff77a4]">Step 2</Badge>
              <span className="text-slate-900">Create New API Key</span>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Click <strong>"+ CREATE CREDENTIALS"</strong></li>
              <li>Select <strong>"API key"</strong></li>
              <li>A new API key will be generated</li>
              <li>Copy the API key immediately</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-[#ff77a4] pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#ff77a4]">Step 3</Badge>
              <span className="text-slate-900">Configure API Restrictions</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">Click "EDIT API KEY" and configure:</p>
            <div className="bg-slate-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-sm text-slate-900 mb-1">
                  <strong>Name:</strong> Server-Side Maps Key
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-900 mb-1"><strong>API restrictions:</strong></p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                  <li>Select "Restrict key"</li>
                  <li>Enable: <strong>Places API</strong></li>
                  <li>Enable: <strong>Geocoding API</strong> (optional)</li>
                </ul>
              </div>
              <div>
                <p className="text-sm text-slate-900 mb-1"><strong>Application restrictions:</strong></p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside ml-4">
                  <li>Select <strong>"None"</strong> (for testing)</li>
                  <li className="text-amber-600">⚠️ For production: Use "IP addresses" restrictions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-[#ff77a4] pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-[#ff77a4]">Step 4</Badge>
              <span className="text-slate-900">Update Environment Variable</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Go to Supabase Dashboard and update the secret:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
              <li>Settings → Edge Functions → Secrets</li>
              <li>Find: <code className="bg-slate-100 px-2 py-1 rounded">GOOGLE_MAPS_API_KEY</code></li>
              <li>Update with your new API key</li>
              <li>Click "Save"</li>
            </ul>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-green-500 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-500">Step 5</Badge>
              <span className="text-slate-900">Test the System</span>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              Return to Lead Discovery and try searching for:
            </p>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Test Search:</strong> City: "Los Angeles" | State: "CA"
              </p>
              <p className="text-sm text-green-600 mt-1">
                ✅ Should return 10-50 real dental clinics
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Important Notes */}
      <Card className="p-6 bg-amber-50 border-amber-200">
        <h3 className="text-slate-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          Important Security Notes
        </h3>
        <ul className="space-y-2 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">⚠️</span>
            <span>
              <strong>Two API Keys Recommended:</strong> Use one with referrer restrictions for frontend display,
              and another without restrictions for server-side Lead Discovery.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">⚠️</span>
            <span>
              <strong>Enable Billing Alerts:</strong> Set up alerts in Google Cloud Console to monitor API usage and costs.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-1">⚠️</span>
            <span>
              <strong>API Costs:</strong> Each Lead Discovery search costs approximately $0.88 (1 Text Search + 50 Place Details).
              Google provides $200 free credit per month (~227 free searches).
            </span>
          </li>
        </ul>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="text-sm text-slate-900 mb-2">📚 Full Guide</h4>
          <p className="text-xs text-slate-600 mb-3">
            Complete step-by-step instructions with screenshots
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/FIX_GOOGLE_MAPS_API_KEY.md';
              link.download = 'FIX_GOOGLE_MAPS_API_KEY.md';
              link.click();
            }}
          >
            Download Guide
          </Button>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm text-slate-900 mb-2">🔧 Google Console</h4>
          <p className="text-xs text-slate-600 mb-3">
            Manage your API keys and credentials
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Open Console
          </Button>
        </Card>

        <Card className="p-4">
          <h4 className="text-sm text-slate-900 mb-2">📊 API Dashboard</h4>
          <p className="text-xs text-slate-600 mb-3">
            Monitor usage and enable required APIs
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://console.cloud.google.com/apis/dashboard', '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            View Dashboard
          </Button>
        </Card>
      </div>
    </div>
  );
}
