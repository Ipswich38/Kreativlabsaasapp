import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, Download, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function AutoLogoFix() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [base64Preview, setBase64Preview] = useState<string>('');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkServerLogo();
  }, []);

  const checkServerLogo = async () => {
    try {
      setIsChecking(true);
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
        if (data.logo && data.logo.length > 1000) {
          setUploadSuccess(true);
          setBase64Preview(data.logo);
        }
      }
    } catch (error) {
      console.error('Error checking server logo:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const convertAndUploadLogo = async () => {
    setIsUploading(true);
    try {
      // Convert logo to base64
      toast.loading('Converting logo to base64...', { id: 'logo-convert' });
      
      const response = await fetch(logo);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('✅ Logo converted to base64, length:', base64.length);
      setBase64Preview(base64);
      
      // Upload to server
      toast.loading('Uploading to email server...', { id: 'logo-convert' });
      
      const uploadResponse = await fetch(
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

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo');
      }

      toast.success('✅ Logo successfully uploaded! Your emails will now display the Happy Teeth logo perfectly!', { 
        id: 'logo-convert',
        duration: 5000 
      });
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error converting/uploading logo:', error);
      toast.error('Failed to upload logo. Please try again.', { id: 'logo-convert' });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadBase64 = () => {
    if (!base64Preview) return;
    
    const element = document.createElement('a');
    const file = new Blob([base64Preview], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'logo-base64.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success('Base64 code downloaded!');
  };

  if (isChecking) {
    return (
      <Card className="p-6 bg-slate-50 border-2 border-slate-200">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff77a4]" />
          <span className="text-slate-600">Checking email logo status...</span>
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
          <h3 className="font-semibold text-slate-900 mb-1">
            Email Logo Configuration
          </h3>
          <p className="text-sm text-slate-600">
            Automatically fix broken logo in emails
          </p>
        </div>
      </div>

      {/* Status and Action */}
      {uploadSuccess ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-3 rounded-lg border border-green-300">
            <Check className="w-5 h-5" />
            <div>
              <div className="font-semibold">Logo Active in All Emails! ✨</div>
              <div className="text-xs text-green-700 mt-1">
                Your Happy Teeth logo is displaying perfectly in all sent emails
              </div>
            </div>
          </div>
          
          {base64Preview && (
            <div className="flex gap-2">
              <Button
                onClick={downloadBase64}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download Base64 (Backup)
              </Button>
              <Button
                onClick={convertAndUploadLogo}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                Re-upload Logo
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-amber-50 text-amber-800 px-4 py-3 rounded-lg border border-amber-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold mb-1">Logo Not Configured</div>
              <div className="text-amber-700">
                Your emails are being sent without the Happy Teeth logo. Click the button below to fix this automatically.
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
                Converting & Uploading Logo...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Fix Email Logo Automatically
              </>
            )}
          </Button>
        </div>
      )}

      {/* Technical Details */}
      {base64Preview && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer text-slate-600 hover:text-slate-900">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-slate-900 text-green-400 rounded font-mono text-[10px] overflow-hidden">
            <div className="mb-1 text-slate-400">Base64 Length: {base64Preview.length} characters</div>
            <div className="truncate">{base64Preview.substring(0, 100)}...</div>
          </div>
        </details>
      )}
    </Card>
  );
}
