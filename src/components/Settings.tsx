import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AutoLogoFix } from './AutoLogoFix';

export function Settings() {
  const [gmailAddress, setGmailAddress] = useState('sshappyteeth@gmail.com');
  const [appPassword, setAppPassword] = useState('wvnbgpmnkupothrh');
  const [senderName, setSenderName] = useState('Happy Teeth Support Services');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [configSaved, setConfigSaved] = useState(false);

  // Load existing config on mount and auto-save if needed
  useEffect(() => {
    loadConfigAndAutoSave();
  }, []);

  const loadConfigAndAutoSave = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/gmail-config`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.config) {
        setGmailAddress(data.config.gmailAddress || 'sshappyteeth@gmail.com');
        setSenderName(data.config.senderName || 'Happy Teeth Support Services');
        setConfigSaved(true);
        console.log('✅ Gmail configuration already saved');
      } else {
        // Config doesn't exist - auto-save it now
        console.log('📧 Gmail not configured yet - auto-saving credentials...');
        await autoSaveCredentials();
      }
    } catch (error) {
      console.error('Error loading config:', error);
      // Try auto-save on error too
      await autoSaveCredentials();
    }
  };

  const autoSaveCredentials = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/gmail-config`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gmailAddress: 'sshappyteeth@gmail.com',
            appPassword: 'wvnbgpmnkupothrh',
            senderName: 'Happy Teeth Support Services',
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setConfigSaved(true);
        toast.success('🎉 Gmail automatically configured! Email sending is now active.', {
          duration: 5000,
        });
        console.log('✅ Auto-saved Gmail configuration successfully');
      } else {
        console.error('Failed to auto-save config:', data.error);
      }
    } catch (error) {
      console.error('Error auto-saving credentials:', error);
    }
  };

  const handleSave = async () => {
    if (!gmailAddress || !senderName) {
      toast.error('Please fill in all fields');
      return;
    }

    // App password is required only for initial setup
    if (!appPassword && !configSaved) {
      toast.error('Please enter your Gmail App Password');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/gmail-config`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gmailAddress,
            appPassword: appPassword || undefined, // Only send if provided
            senderName,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Gmail configuration saved successfully');
        setConfigSaved(true);
        setAppPassword(''); // Clear password field after saving
      } else {
        toast.error(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setIsTesting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: testEmail }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Test email sent successfully! Check your inbox.');
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Configure your Gmail SMTP settings for email campaigns</p>
      </div>

      {/* Production Ready Banner */}
      {!configSaved && (
        <Alert className="mb-6 border-2 border-[#ff77a4] bg-[#ffe9f2]">
          <AlertTriangle className="h-5 w-5 text-[#ff77a4]" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-[#ff77a4]">
                🚀 Final Step: Save Your Gmail Configuration
              </p>
              <p className="text-sm text-slate-700">
                Your app password is pre-filled below. Click <strong>"Save Configuration"</strong> to activate email sending. This takes 5 seconds!
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {configSaved && (
        <Alert className="mb-6 border-2 border-green-500 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-green-800">
                ✅ Gmail Configured Successfully!
              </p>
              <p className="text-sm text-green-700">
                Your CRM is 100% production ready. Go to <strong>Email Contacts</strong> to start sending campaigns.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Email Logo Fix - Top Priority */}
        <AutoLogoFix />

        {/* Gmail Configuration */}
        <Card className="border-[#ff77a4]/30 bg-[#ffe9f2]/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#ff77a4]" />
              <CardTitle>Gmail SMTP Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure your Gmail account to send email campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Setup Instructions */}
            <Alert className="bg-green-50 border-green-300">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Quick Setup Guide:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
                    <li>Visit <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-[#ff77a4] underline">Google Security</a> and enable 2-Step Verification</li>
                    <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#ff77a4] underline">App Passwords</a> and generate a new password</li>
                    <li>Copy the 16-character password and paste it below</li>
                    <li>Click "Save Configuration"</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            {/* Gmail Address */}
            <div className="grid gap-2">
              <Label htmlFor="gmail-address">Gmail Address</Label>
              <Input
                id="gmail-address"
                type="email"
                value={gmailAddress}
                onChange={(e) => setGmailAddress(e.target.value)}
                placeholder="your-email@gmail.com"
              />
            </div>

            {/* App Password */}
            <div className="grid gap-2">
              <Label htmlFor="app-password">
                Gmail App Password
                {configSaved && <span className="ml-2 text-xs text-green-600">✓ Saved</span>}
              </Label>
              <Input
                id="app-password"
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder={configSaved ? "Leave blank to keep existing password" : "16-character app password"}
              />
              {configSaved ? (
                <p className="text-xs text-green-600">
                  ✓ Password saved. Leave blank to keep existing, or enter new password to update.
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  NOT your regular Gmail password! Generate at: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[#ff77a4] underline">App Passwords</a>
                </p>
              )}
            </div>

            {/* Sender Name */}
            <div className="grid gap-2">
              <Label htmlFor="sender-name">Sender Name</Label>
              <Input
                id="sender-name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your Company Name"
              />
              <p className="text-xs text-slate-500">
                This name will appear in the "From" field of sent emails
              </p>
            </div>

            {/* Save Button */}
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-[#ff77a4] hover:bg-[#ff5a8f] text-lg py-6"
            >
              {isSaving ? '💾 Saving...' : configSaved ? '✓ Update Configuration' : '🚀 Save Configuration & Activate Email'}
            </Button>
            
            {!configSaved && (
              <p className="text-center text-sm text-[#ff77a4] font-semibold">
                ⬆️ Click this button to enable email sending
              </p>
            )}

            {/* Test Email Section */}
            {configSaved && (
              <div className="border-t pt-4 space-y-4">
                <h4 className="text-slate-900">Test Your Configuration</h4>
                <div className="grid gap-2">
                  <Label htmlFor="test-email">Send test email to:</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <Button 
                  onClick={handleTestEmail} 
                  disabled={isTesting}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Web Scraping Info */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation</CardTitle>
            <CardDescription>Automated dental clinic discovery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4">
              <h4 className="text-emerald-900 mb-2">✅ Lead Discovery Enabled!</h4>
              <p className="text-sm text-emerald-700">
                Your CRM uses an intelligent multi-source system for lead generation. 
                No API keys required. Just enter a location and search for dental clinics!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
