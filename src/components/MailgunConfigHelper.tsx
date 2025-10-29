import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export function MailgunConfigHelper() {
  return (
    <div className="space-y-6">
      <Alert className="border-2 border-blue-200 bg-blue-50">
        <Mail className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-900">Email System Update</AlertTitle>
        <AlertDescription className="text-blue-800">
          The system has been switched from Mailgun to Gmail SMTP for better reliability and ease of use.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Mailgun Configuration (Deprecated)
          </CardTitle>
          <CardDescription>
            Mailgun API integration has been replaced with Gmail SMTP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-2">⚠️ Why We Switched</h4>
              <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside">
                <li>Mailgun has strict API restrictions causing 403 Forbidden errors</li>
                <li>Gmail SMTP is more reliable for small-scale email sending</li>
                <li>Working Gmail credentials (sshappyteeth@gmail.com) already configured</li>
                <li>No additional API setup required</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">✅ Current Email System</h4>
              <div className="text-sm text-green-800 space-y-2">
                <p><strong>Provider:</strong> Gmail SMTP</p>
                <p><strong>Email:</strong> sshappyteeth@gmail.com</p>
                <p><strong>Configuration:</strong> Hardcoded in server</p>
                <p><strong>Location:</strong> <code className="bg-green-100 px-1 rounded">/supabase/functions/server/index.tsx</code></p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-2">📧 Email Features Available</h4>
              <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                <li>Single email blast to multiple recipients</li>
                <li>Multimail with professional HTML templates</li>
                <li>Happy Teeth logo embedded in emails</li>
                <li>Batch sending (max 10 recipients at once)</li>
                <li>SMTP testing functionality</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">🔧 Need to Configure Gmail?</h4>
              <p className="text-sm text-blue-800 mb-2">
                Go to the <strong>System Status</strong> tab for:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside ml-4">
                <li>Gmail App Password setup guide</li>
                <li>SMTP testing tools</li>
                <li>Email logo configuration</li>
                <li>System diagnostics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
