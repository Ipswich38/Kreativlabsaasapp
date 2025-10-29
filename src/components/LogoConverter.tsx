import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Copy, Check, Mail, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
const logo = 'https://i.imgur.com/I768xBG.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LogoConverter() {
  const [base64, setBase64] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [currentServerLogo, setCurrentServerLogo] = useState<string>('');

  // Check if logo is already uploaded on component mount
  const checkServerLogo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/email-logo`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.logo) {
          setCurrentServerLogo(data.logo);
          setUploadSuccess(true);
        }
      }
    } catch (error) {
      console.error('Error checking server logo:', error);
    }
  };

  // Check on mount
  useEffect(() => {
    checkServerLogo();
  }, []);

  const convertToBase64 = async () => {
    setIsConverting(true);
    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const result = reader.result as string;
        setBase64(result);
        toast.success('Logo converted to base64!');
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

  const copyToClipboard = () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(base64)
          .then(() => {
            setCopied(true);
            toast.success('Base64 code copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            // Fallback to legacy method
            fallbackCopyToClipboard(base64);
          });
      } else {
        // Use fallback method
        fallbackCopyToClipboard(base64);
      }
    } catch (error) {
      // Use fallback method
      fallbackCopyToClipboard(base64);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    try {
      // Create temporary textarea
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      // Execute copy command
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setCopied(true);
        toast.success('Base64 code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error('Failed to copy. Please select and copy manually.');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Copy failed. Please select and copy the code manually.');
    }
  };

  const uploadToEmailServer = async () => {
    setIsUploading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/email-logo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ logo: base64 }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      setUploadSuccess(true);
      toast.success('🎉 Logo uploaded! Your emails will now show the Happy Teeth logo!');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo to email server');
    } finally {
      setIsUploading(false);
    }
  };

  const sendTestEmail = async () => {
    setIsSendingTest(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/test-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('✅ Test email sent! Check sshappyteeth@gmail.com inbox to see your logo!', {
          duration: 6000,
        });
      } else {
        toast.error(`Failed to send test email: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Logo to Base64 Converter
                </h2>
                <p className="text-slate-600">
                  Convert your Happy Teeth logo to base64 for email embedding
                </p>
              </div>
              {currentServerLogo && (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-300">
                  <CheckCircle className="w-5 h-5" />
                  <div className="text-sm">
                    <div className="font-semibold">Logo Active</div>
                    <div className="text-xs text-green-700">Displaying in all emails</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Logo Preview */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Your Happy Teeth Logo:
              </h3>
              <div className="bg-white p-6 rounded-lg border-2 border-slate-200 inline-block">
                <img 
                  src={logo} 
                  alt="Happy Teeth Support Services" 
                  className="w-64 h-auto"
                />
              </div>
            </div>

            {/* Convert Button */}
            <div className="flex gap-3">
              <Button 
                onClick={convertToBase64}
                disabled={isConverting}
                className="bg-[#ff77a4] hover:bg-[#ff5a8f]"
                size="lg"
              >
                {isConverting ? 'Converting...' : '1️⃣ Convert Logo to Base64'}
              </Button>
              
              {base64 && !uploadSuccess && (
                <Button 
                  onClick={uploadToEmailServer}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : '2️⃣ Upload to Email Server'}
                </Button>
              )}
              
              {uploadSuccess && (
                <>
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Logo Active in Emails! ✨</span>
                  </div>
                  <Button 
                    onClick={sendTestEmail}
                    disabled={isSendingTest}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSendingTest ? 'Sending...' : '3️⃣ Send Test Email'}
                  </Button>
                </>
              )}
            </div>

            {/* Base64 Output */}
            {base64 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Base64 Code (Ready for Email):
                  </h3>
                  <Button
                    onClick={copyToClipboard}
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
                
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-64">
                  <code>{base64}</code>
                </div>

                {!uploadSuccess ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      👆 Next Step:
                    </h4>
                    <p className="text-sm text-yellow-800">
                      Click the <strong>"2️⃣ Upload to Email Server"</strong> button above to activate your logo in all emails!
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      🎉 Success! Your logo is now active!
                    </h4>
                    <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                      <li>Your Happy Teeth logo will now appear in ALL emails as a professional letterhead</li>
                      <li>Click the <strong>"3️⃣ Send Test Email"</strong> button above to see it in action</li>
                      <li>Or go to "Email & Contacts" to send emails to your leads</li>
                      <li>Check sshappyteeth@gmail.com inbox - you'll see your beautiful logo! ✨</li>
                    </ol>
                  </div>
                )}

                {/* Preview in Email Format */}
                <div className="mt-6">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    📧 Email Letterhead Preview
                  </h4>
                  <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-slate-50 p-4">
                    {/* Email header simulation */}
                    <div className="bg-gradient-to-r from-[#ff77a4] to-[#ff5a8f] p-10 rounded-lg text-center">
                      <div className="bg-white rounded-xl p-5 inline-block shadow-lg">
                        <img 
                          src={base64} 
                          alt="Happy Teeth Logo" 
                          style={{ maxWidth: '200px', height: 'auto', display: 'block' }}
                        />
                      </div>
                    </div>
                    {/* Email body simulation */}
                    <div className="bg-white p-6 mt-2 rounded-lg">
                      <p className="text-slate-600 text-sm italic">
                        Your email message will appear here...
                      </p>
                      <div className="mt-6 pt-4 border-t-2 border-pink-100">
                        <p className="font-semibold text-[#ff77a4] mb-1">Happy Teeth Support Services</p>
                        <p className="text-sm text-slate-500">sshappyteeth@gmail.com</p>
                      </div>
                    </div>
                    {/* Email footer simulation */}
                    <div className="bg-pink-50 p-3 mt-2 rounded-lg text-center">
                      <p className="text-xs text-slate-500">This email was sent from KreativLab CRM</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 text-center">
                    ✨ This is exactly how your logo will appear in all sent emails!
                  </p>
                </div>
              </div>
            )}

            {!base64 && (
              <div className="bg-slate-100 border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-600">
                  👆 Click the button above to convert your logo to base64 format for emails
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
