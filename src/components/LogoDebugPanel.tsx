import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertCircle, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
const logo = 'https://i.imgur.com/I768xBG.png';

export function LogoDebugPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [logoStatus, setLogoStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [base64Preview, setBase64Preview] = useState<string>('');

  const checkLogoStatus = async () => {
    setIsChecking(true);
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
      
      const data = await response.json();
      
      const status = {
        exists: !!data.logo,
        length: data.logo?.length || 0,
        isValid: data.logo && data.logo.length > 1000 && data.logo.startsWith('data:image'),
        startsWithDataImage: data.logo?.startsWith('data:image') || false,
        preview: data.logo?.substring(0, 100) || 'No logo data',
        fullLogo: data.logo || null,
      };
      
      console.log('🔍 Logo Debug Status:', status);
      setLogoStatus(status);
      
      if (status.fullLogo) {
        setBase64Preview(status.fullLogo);
      }
    } catch (error) {
      console.error('❌ Error checking logo:', error);
      setLogoStatus({
        error: String(error),
        exists: false,
        isValid: false,
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkLogoStatus();
  }, []);

  const forceReupload = async () => {
    setIsChecking(true);
    try {
      console.log('🔄 Force re-uploading logo...');
      
      const response = await fetch(logo);
      const blob = await response.blob();
      
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      console.log('📤 Uploading to server...');
      
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

      if (uploadResponse.ok) {
        console.log('✅ Re-upload successful!');
        await checkLogoStatus();
      } else {
        console.error('❌ Re-upload failed:', await uploadResponse.text());
      }
    } catch (error) {
      console.error('❌ Force reupload error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="outline"
          size="sm"
          className="shadow-lg gap-2"
        >
          <Eye className="w-4 h-4" />
          Logo Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="p-4 shadow-2xl border-2 border-slate-300 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">🔍 Logo Debug Panel</h3>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>

        {isChecking ? (
          <div className="flex items-center gap-2 text-slate-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Checking logo...</span>
          </div>
        ) : logoStatus ? (
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-start gap-2">
              {logoStatus.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">
                  {logoStatus.isValid ? 'Logo Active ✅' : 'Logo Invalid ❌'}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  {logoStatus.exists ? (
                    <>Length: {logoStatus.length} chars</>
                  ) : (
                    'No logo found in database'
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-slate-50 rounded p-2 text-xs font-mono space-y-1">
              <div>Exists: {logoStatus.exists ? '✅' : '❌'}</div>
              <div>Valid: {logoStatus.isValid ? '✅' : '❌'}</div>
              <div>Starts with data:image: {logoStatus.startsWithDataImage ? '✅' : '❌'}</div>
              {logoStatus.error && (
                <div className="text-red-600">Error: {logoStatus.error}</div>
              )}
            </div>

            {/* Preview */}
            {base64Preview && logoStatus.isValid && (
              <div className="bg-slate-100 p-2 rounded">
                <div className="text-xs text-slate-600 mb-1">Preview:</div>
                <img 
                  src={base64Preview} 
                  alt="Logo preview" 
                  className="w-24 h-auto mx-auto"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={checkLogoStatus}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={isChecking}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh
              </Button>
              <Button
                onClick={forceReupload}
                variant="default"
                size="sm"
                className="flex-1 bg-[#ff77a4] hover:bg-[#ff5a8f]"
                disabled={isChecking}
              >
                Force Re-upload
              </Button>
            </div>

            <div className="text-[10px] text-slate-500 text-center">
              Press F12 to see detailed console logs
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">Loading...</div>
        )}
      </Card>
    </div>
  );
}
