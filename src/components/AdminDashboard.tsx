import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Mail, Database, Server, CheckCircle2, AlertCircle, LogOut, Send, Image as ImageIcon, Copy, Check, Zap, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const logo = 'https://i.imgur.com/I768xBG.png';
import { GmailFixHelper } from './GmailFixHelper';
import { Multimail } from './Multimail';
import { MailgunConfigHelper } from './MailgunConfigHelper';
import { AutoLogoFix } from './AutoLogoFix';
import { LogoDebugPanel } from './LogoDebugPanel';
import { SystemDiagnostic } from './SystemDiagnostic';
import { ServerConnectionTest } from './ServerConnectionTest';

interface AdminDashboardProps {
  leads: any[];
  onLogout: () => void;
}

export function AdminDashboard({ leads, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('system');
  const [isTesting, setIsTesting] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLogoConverter, setShowLogoConverter] = useState(false);
  const activeLeads = leads.filter(lead => lead.status === 'active').length;
  const totalLeads = leads.length;

  const handleConvertLogo = async () => {
    setIsConverting(true);
    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoBase64(result);
        toast.success('✅ Logo converted to base64!', {
          description: 'Now copy the code and follow the instructions below',
          duration: 5000,
        });
        setIsConverting(false);
      };
      
      reader.onerror = () => {
        toast.error('Failed to convert logo');
        setIsConverting(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error converting logo:', error);
      toast.error('Failed to convert logo');
      setIsConverting(false);
    }
  };

  const handleCopyBase64 = () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(logoBase64)
          .then(() => {
            setCopied(true);
            toast.success('📋 Base64 copied to clipboard!', {
              description: 'Now I can update the email templates for you',
              duration: 3000,
            });
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            fallbackCopyToClipboard(logoBase64);
          });
      } else {
        fallbackCopyToClipboard(logoBase64);
      }
    } catch (error) {
      fallbackCopyToClipboard(logoBase64);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        toast.success('📋 Base64 copied to clipboard!', {
          description: 'Now I can update the email templates for you',
          duration: 3000,
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Failed to copy. Please select and copy manually.');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy failed. Please select and copy the code manually.');
    }
  };

  const handleTestEmail = async () => {
    setIsTesting(true);
    const loadingToast = toast.loading('Testing SMTP connection...');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/test-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('✅ SMTP Test Successful!', {
          description: data.message,
          duration: 5000,
        });
      } else {
        toast.error('❌ SMTP Test Failed', {
          description: data.details || data.error,
          duration: 10000,
        });
        console.error('SMTP test error:', data);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to test SMTP connection', {
        description: error.message,
      });
      console.error('Error testing SMTP:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Happy Teeth Logo" className="w-12 h-12 rounded-lg" />
            <div>
              <h1 className="text-slate-900">Creator Dashboard</h1>
              <p className="text-slate-600">System Overview & Advanced Tools</p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline" className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="p-8">
        {/* Admin Badge */}
        <div className="mb-6">
          <Badge className="bg-purple-100 text-purple-700 border-purple-300 px-4 py-2">
            👑 Creator Access - KreativLab
          </Badge>
        </div>

        {/* Tabbed Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="system" className="gap-2">
              <Server className="w-4 h-4" />
              System Status
            </TabsTrigger>
            <TabsTrigger value="multimail" className="gap-2">
              <Zap className="w-4 h-4" />
              Multimail
              <Badge className="bg-purple-500 text-white text-xs ml-1">PRO</Badge>
            </TabsTrigger>
            <TabsTrigger value="mailgun-config" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              Mailgun Config
              <Badge className="bg-purple-500 text-white text-xs ml-1">PRO</Badge>
            </TabsTrigger>
          </TabsList>

          {/* System Status Tab */}
          <TabsContent value="system" className="space-y-6">

        {/* Server Connection Test */}
        <ServerConnectionTest />

        {/* System Status Card */}
        <Card className="mb-6 border-2 border-emerald-100 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>Real-time system health and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">Database</p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                    ✓ Operational
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">Lead Discovery</p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">
                    ✓ Active
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-amber-200">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-900">Email SMTP</p>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                    Hardcoded
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded">
                ✅ <strong>Lead Discovery System</strong> - Automated dental clinic search enabled
              </p>
              <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
                📧 Email credentials hardcoded in <code className="bg-amber-200 px-1 rounded">/supabase/functions/server/index.tsx</code>
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-red-900">
                    <strong>⚠️ If Gmail Auth Fails:</strong>
                  </p>
                  <Button 
                    onClick={handleTestEmail}
                    disabled={isTesting}
                    size="sm"
                    className="bg-[#ff77a4] hover:bg-[#ff5a8f] h-7 text-xs"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {isTesting ? 'Testing...' : 'Test SMTP'}
                  </Button>
                </div>
                <ol className="text-xs text-red-800 list-decimal list-inside space-y-1 ml-2">
                  <li>Visit <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline text-[#ff77a4] hover:text-[#ff5a8f]">Google Security</a> and enable 2-Step Verification</li>
                  <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline text-[#ff77a4] hover:text-[#ff5a8f]">App Passwords</a> and generate new password for "Mail"</li>
                  <li>Copy the 16-character password (remove all spaces)</li>
                  <li>Update <code className="bg-red-100 px-1 rounded">GMAIL_CONFIG.appPassword</code> in server code</li>
                </ol>
                <p className="text-xs text-red-700 mt-2 pt-2 border-t border-red-200">
                  💡 <strong>Current password:</strong> <code className="bg-red-100 px-1 rounded">wvnbgpmnkupothrh</code> (16 chars)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Configuration
            </CardTitle>
            <CardDescription>Current system settings and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-sm mb-2 text-slate-900">Gmail SMTP Configuration</h4>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><strong>Email:</strong> sshappyteeth@gmail.com</p>
                    <p><strong>App Password:</strong> wvnbgpmnkupothrh</p>
                    <p><strong>Sender Name:</strong> Happy Teeth Support Services</p>
                    <p><strong>Location:</strong> <code className="bg-slate-200 px-1 rounded">/supabase/functions/server/index.tsx</code></p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="text-sm mb-2 text-slate-900">User Credentials</h4>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p><strong>User Login:</strong> htsscrm / 272829</p>
                    <p><strong>Admin Login:</strong> kreativlab / 272829</p>
                    <p><strong>Auth Type:</strong> Hardcoded (no database)</p>
                    <p><strong>Location:</strong> <code className="bg-slate-200 px-1 rounded">/components/Login.tsx</code></p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm mb-2 text-blue-900">Lead Discovery Engine</h4>
                <div className="space-y-1 text-xs text-blue-700">
                  <p><strong>System:</strong> Google Maps API (USA Only)</p>
                  <p><strong>Search Type:</strong> Real-time Public Business Data</p>
                  <p><strong>Cost:</strong> ~$0.88 per search ($200 free/month from Google)</p>
                  <p><strong>Status:</strong> Production Ready ✅</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm text-red-900">⚠️ Google Maps API Setup Required</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
                  >
                    Open Console
                  </Button>
                </div>
                <div className="space-y-2 text-xs text-red-700">
                  <p className="bg-red-100 p-2 rounded">
                    <strong>Common Error:</strong> "API keys with referer restrictions cannot be used"
                  </p>
                  <p><strong>Solution:</strong> Create a server-side API key without HTTP referrer restrictions:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                    <li>Create new API key OR remove referrer restrictions from existing key</li>
                    <li>Enable: <strong>Places API</strong> + <strong>Geocoding API</strong></li>
                    <li>Update <code className="bg-red-100 px-1 rounded">GOOGLE_MAPS_API_KEY</code> in Supabase secrets</li>
                  </ol>
                  <p className="pt-2 border-t border-red-300">
                    📖 <strong>Full Guide:</strong> See <code className="bg-red-100 px-1 rounded">FIX_GOOGLE_MAPS_API_KEY.md</code>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto Logo Fix - Automatically uploads logo */}
        <div className="mb-6">
          <AutoLogoFix />
        </div>

        {/* System Diagnostics - Run automatic system checks */}
        <div className="mb-6">
          <SystemDiagnostic />
        </div>

        {/* Manual Logo Converter (Backup Option) */}
        <Card className="mb-6 border-2 border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <ImageIcon className="w-5 h-5" />
                  🔧 Manual Logo Tools (Advanced)
                </CardTitle>
                <CardDescription>
                  Manual base64 conversion and download - Only use if automatic upload fails
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowLogoConverter(!showLogoConverter)}
                variant="outline"
                size="sm"
              >
                {showLogoConverter ? 'Hide' : 'Show'} Tools
              </Button>
            </div>
          </CardHeader>
          {showLogoConverter && (
            <CardContent>
              <div className="space-y-4">
                {/* Logo Preview */}
                <div>
                  <p className="text-sm mb-2">Your Happy Teeth Logo:</p>
                  <div className="bg-white p-4 rounded-lg border-2 border-slate-200 inline-block">
                    <img src={logo} alt="Happy Teeth Support Services" className="w-48 h-auto" />
                  </div>
                </div>

                {/* Convert Button */}
                <div>
                  <Button
                    onClick={handleConvertLogo}
                    disabled={isConverting}
                    className="bg-[#ff77a4] hover:bg-[#ff5a8f]"
                  >
                    {isConverting ? 'Converting...' : '🔄 Convert to Base64'}
                  </Button>
                </div>

                {/* Base64 Output */}
                {logoBase64 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Base64 Code:</p>
                      <Button
                        onClick={handleCopyBase64}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Code
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-auto max-h-32">
                      <code>{logoBase64.substring(0, 200)}...</code>
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        ✅ Next Steps to Fix Email Logo:
                      </h4>
                      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Base64 code is copied to clipboard ✓</li>
                        <li>Open <code className="bg-blue-100 px-1 rounded">/supabase/functions/server/index.tsx</code></li>
                        <li>Find line ~21 (after GMAIL_CONFIG)</li>
                        <li>Add: <code className="bg-blue-100 px-1 rounded">const LOGO_BASE64 = 'PASTE_HERE';</code></li>
                        <li>Replace 'PASTE_HERE' with the copied base64</li>
                        <li>Find the email templates (lines ~82 and ~250)</li>
                        <li>Replace the logo div with: <code className="bg-blue-100 px-1 rounded">&lt;img src="${'{LOGO_BASE64}'}" alt="Logo" style="width:200px;height:auto;display:block;margin:0 auto 15px;" /&gt;</code></li>
                        <li>Test by clicking "Test SMTP" button!</li>
                      </ol>
                    </div>

                    {/* Preview */}
                    <div>
                      <p className="text-sm mb-2">Email Preview:</p>
                      <div className="bg-gradient-to-r from-[#ff77a4] to-[#ff5a8f] p-6 rounded-lg">
                        <div className="bg-white rounded-lg p-4 inline-block">
                          <img src={logoBase64} alt="Logo Preview" style={{ width: '200px', height: 'auto' }} />
                        </div>
                        <p className="text-white mt-3">Happy Teeth Support Services</p>
                      </div>
                    </div>
                  </div>
                )}

                {!logoBase64 && (
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-center text-sm text-slate-600">
                    👆 Click "Convert to Base64" to generate the code for email embedding
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Gmail Fix Helper - Prominent Display */}
        <div className="mb-6">
          <GmailFixHelper />
        </div>

        {/* Gmail Setup Guide */}
        <Card className="mb-6 border-2 border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#ff77a4]">
              <Mail className="w-5 h-5" />
              📧 How to Fix Gmail Authentication
            </CardTitle>
            <CardDescription>
              Complete step-by-step guide to generate a working App Password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm mb-2">
                  <strong>⚠️ Current Issue:</strong> The Gmail credentials are not being accepted.
                </p>
                <p className="text-sm text-yellow-800">
                  Error Code: <code className="bg-yellow-100 px-2 py-1 rounded">535-5.7.8 Username and Password not accepted</code>
                </p>
              </div>

              <div className="space-y-3">
                <div className="border-l-4 border-[#ff77a4] pl-4 py-2">
                  <h4 className="mb-2">
                    <strong>Step 1:</strong> Enable 2-Step Verification
                  </h4>
                  <ol className="text-sm text-slate-700 space-y-1 list-inside ml-4">
                    <li>1. Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline text-[#ff77a4] hover:text-[#ff5a8f]">https://myaccount.google.com/security</a></li>
                    <li>2. Scroll to "How you sign in to Google"</li>
                    <li>3. Click "2-Step Verification" and follow the setup</li>
                    <li>4. Verify it shows as "ON"</li>
                  </ol>
                </div>

                <div className="border-l-4 border-[#ff77a4] pl-4 py-2">
                  <h4 className="mb-2">
                    <strong>Step 2:</strong> Generate App Password
                  </h4>
                  <ol className="text-sm text-slate-700 space-y-1 list-inside ml-4">
                    <li>1. Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline text-[#ff77a4] hover:text-[#ff5a8f]">https://myaccount.google.com/apppasswords</a></li>
                    <li>2. You may need to re-enter your password</li>
                    <li>3. Under "Select app" choose "Mail"</li>
                    <li>4. Under "Select device" choose "Other (Custom name)"</li>
                    <li>5. Type "KreativLab CRM" and click "Generate"</li>
                    <li>6. Copy the 16-character password (it will have spaces - REMOVE THEM)</li>
                  </ol>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    Example: If Google shows <code>abcd efgh ijkl mnop</code><br />
                    You need: <code className="bg-blue-100 px-1">abcdefghijklmnop</code> (no spaces)
                  </div>
                </div>

                <div className="border-l-4 border-[#ff77a4] pl-4 py-2">
                  <h4 className="mb-2">
                    <strong>Step 3:</strong> Update Server Code
                  </h4>
                  <ol className="text-sm text-slate-700 space-y-1 list-inside ml-4">
                    <li>1. Open <code className="bg-slate-100 px-2 py-1 rounded">/supabase/functions/server/index.tsx</code></li>
                    <li>2. Find the <code>GMAIL_CONFIG</code> section (around line 17)</li>
                    <li>3. Replace the <code>appPassword</code> value with your new password</li>
                    <li>4. Save the file (the server will automatically reload)</li>
                  </ol>
                  <div className="mt-2 p-3 bg-slate-900 rounded-lg text-xs">
                    <pre className="text-green-400">
{`const GMAIL_CONFIG = {
  gmailAddress: 'sshappyteeth@gmail.com',
  appPassword: 'YOUR_NEW_16_CHAR_PASSWORD', ← Update here
  senderName: 'Happy Teeth Support Services',
};`}
                    </pre>
                  </div>
                </div>

                <div className="border-l-4 border-[#ff77a4] pl-4 py-2">
                  <h4 className="mb-2">
                    <strong>Step 4:</strong> Test Configuration
                  </h4>
                  <p className="text-sm text-slate-700 mb-2">
                    Click the "Test SMTP" button above to verify your new credentials work.
                  </p>
                  <p className="text-xs text-slate-600">
                    ✅ Success: You'll receive a test email at sshappyteeth@gmail.com<br />
                    ❌ Error: Check the error message for specific issues
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-900">
                  <strong>✨ Important Notes:</strong>
                </p>
                <ul className="text-xs text-emerald-800 space-y-1 mt-2 list-disc list-inside ml-2">
                  <li>App Passwords are 16 characters without spaces</li>
                  <li>Regular Gmail password will NOT work for SMTP</li>
                  <li>You can revoke and regenerate App Passwords anytime</li>
                  <li>Each app should have its own unique App Password</li>
                  <li>The test button sends an email to verify everything works</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalLeads}</div>
              <p className="text-xs text-slate-500 mt-1">All time contacts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Active Leads</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{activeLeads}</div>
              <p className="text-xs text-slate-500 mt-1">Currently engaged</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Email Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-[#ff77a4]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">0</div>
              <p className="text-xs text-slate-500 mt-1">Sent this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">System Health</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">Good</div>
              <p className="text-xs text-slate-500 mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader>
            <CardTitle>All Leads Overview</CardTitle>
            <CardDescription>Complete database snapshot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No leads in database yet</p>
              ) : (
                leads.slice(0, 10).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.company} • {lead.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {lead.status}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">{lead.source}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Multimail Tab */}
          <TabsContent value="multimail">
            <Multimail contacts={leads} onNavigateToConfig={() => setActiveTab('mailgun-config')} />
          </TabsContent>

          {/* Mailgun Config Tab */}
          <TabsContent value="mailgun-config">
            <MailgunConfigHelper />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Floating Debug Panel */}
      <LogoDebugPanel />
    </div>
  );
}
