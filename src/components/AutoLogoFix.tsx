import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, Download, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
const logo = 'https://i.imgur.com/I768xBG.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function AutoLogoFix() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [publicUrl, setPublicUrl] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLogoStatus();
  }, []);

  const checkLogoStatus = async () => {
    try {
      setIsChecking(true);
      
      // First check if server is reachable
      try {
        const healthCheck = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/health`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (!healthCheck.ok) {
          console.warn('⚠️ Server health check failed');
        }
      } catch (healthError) {
        console.error('❌ Server is not reachable:', healthError);
        setIsChecking(false);
        return; // Don't try to upload if server is down
      }
      
      // Check if logo exists on server (Supabase Storage)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/logo-url`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.exists && data.publicUrl) {
          console.log('✅ Logo already exists in Supabase Storage');
          console.log('🔗 Public URL:', data.publicUrl);
          setUploadSuccess(true);
          setPublicUrl(data.publicUrl);
          setIsChecking(false);
          return;
        }
      }
      
      // Logo doesn't exist - automatically convert and upload it!
      console.log('🔄 No logo found - automatically uploading to Supabase Storage...');
      setIsChecking(false);
      await convertAndUploadLogo();
      
    } catch (err) {
      console.error('Error checking server logo:', err);
      setIsChecking(false);
      // Don't auto-upload on error to avoid cascade failures
    }
  };

  const convertAndUploadLogo = async () => {
    setIsUploading(true);
    try {
      // Convert logo to base64
      console.log('🔄 Converting Happy Teeth logo to base64...');
      
      const response = await fetch(logo);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to convert to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('✅ Logo converted to base64, length:', base64.length);
      
      // Upload to Supabase Storage via server endpoint
      console.log('📤 Uploading logo to Supabase Storage...');
      
      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/upload-logo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ base64Data: base64 }),
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload logo');
      }

      const result = await uploadResponse.json();
      console.log('✅ Logo successfully uploaded to Supabase Storage!');
      console.log('🔗 Public URL:', result.publicUrl);
      
      setPublicUrl(result.publicUrl || '');
      toast.success('🎨 Happy Teeth logo is now active in all emails!', { 
        description: 'Your logo is publicly accessible for email clients',
        duration: 5000 
      });
      setUploadSuccess(true);
    } catch (err) {
      console.error('❌ Error converting/uploading logo:', err);
      toast.error('Failed to upload logo to Supabase Storage', { 
        description: 'Click "Fix Email Logo Automatically" to retry.',
        duration: 6000 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyPublicUrl = () => {
    if (!publicUrl) return;
    
    navigator.clipboard.writeText(publicUrl);
    toast.success('Public URL copied to clipboard!');
  };

  const testInBrowser = () => {
    if (!publicUrl) return;
    window.open(publicUrl, '_blank');
  };

  if (isChecking) {
    return (
      <Card className="p-6 bg-slate-50 border-2 border-slate-200">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff77a4]" />
          <span className="text-slate-600">Checking logo in Supabase Storage...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 to-white border-2 border-[#ff77a4]">
      {/* Logo Preview */}
      <div className="mb-4 flex items-center gap-4">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <img src={logo} alt="Happy Teeth Logo" className="w-24 h-auto" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#ff77a4]" />
            <span>Email Logo Configuration</span>
          </h3>
          <p className="text-sm text-slate-600">
            Upload logo to Supabase Storage for emails
          </p>
        </div>
      </div>

      {/* Status and Action */}
      {uploadSuccess ? (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-lg border border-green-300">
            <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">Logo Active in Supabase Storage! ✨</div>
              <div className="text-xs text-green-700 mt-1">
                Your Happy Teeth logo is publicly accessible for all email clients
              </div>
            </div>
          </div>
          
          {publicUrl && publicUrl.length > 0 && (
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-semibold text-blue-900 mb-1">Public URL:</div>
                <div className="text-xs text-blue-700 font-mono break-all">{publicUrl}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={copyPublicUrl}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Copy URL</span>
                </Button>
                <Button
                  onClick={testInBrowser}
                  variant="outline"
                  size="sm"
                  className="gap-2 flex-1"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Test in Browser</span>
                </Button>
                <Button
                  onClick={convertAndUploadLogo}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <span>Re-upload</span>
                </Button>
              </div>
            </div>
          )}

          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="text-xs text-purple-700">
                <div className="font-semibold mb-1">Why this works for emails:</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Email clients block base64 images for security</li>
                  <li>Supabase Storage provides a real HTTPS URL</li>
                  <li>Your logo is publicly accessible (required for emails)</li>
                  <li>Gmail, Outlook, and other clients will display it perfectly!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold mb-1">Logo Not Configured</div>
              <div className="text-amber-700">
                Your emails are being sent without the Happy Teeth logo. Click below to upload it to Supabase Storage (this creates a public URL that works in emails).
              </div>
            </div>
          </div>

          <Button
            onClick={convertAndUploadLogo}
            disabled={isUploading}
            className="w-full gap-2 bg-[#ff77a4] hover:bg-[#ff5a8f]"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading to Supabase Storage...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Fix Email Logo Automatically</span>
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
}
