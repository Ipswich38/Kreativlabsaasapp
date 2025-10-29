import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, Upload, AlertCircle } from 'lucide-react';
const logoImage = 'https://i.imgur.com/I768xBG.png';

export function UploadLogoFix() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const uploadLogo = async () => {
    try {
      setUploading(true);
      setStatus('idle');
      setMessage('');

      console.log('📤 Converting logo to base64...');
      
      // Fetch the logo image and convert to base64
      const response = await fetch(logoImage);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        console.log('✅ Logo converted to base64');
        
        // Upload to server
        console.log('📤 Uploading to Supabase Storage...');
        const uploadResponse = await fetch(
          'https://wjhxqtrrbflqxzkqqbmj.supabase.co/functions/v1/make-server-aed69b82/upload-logo',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqaHhxdHJyYmZscXh6a3FxYm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1NDk5MDMsImV4cCI6MjA0NTEyNTkwM30.X01vX_yhT3gUvBB43hIkJcUo3ifQNj9zRoHqbm6EY4Y'
            },
            body: JSON.stringify({ base64Data })
          }
        );

        const result = await uploadResponse.json();
        
        if (result.success) {
          console.log('✅ Logo uploaded successfully!');
          setStatus('success');
          setMessage(`Logo uploaded! URL: ${result.logoUrl}`);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read logo file');
      };
      
    } catch (error) {
      console.error('❌ Logo upload error:', error);
      setStatus('error');
      setMessage(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(false);
    }
  };

  // Auto-upload on mount
  useEffect(() => {
    uploadLogo();
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-pink-50 to-white border-2 border-pink-200">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
            <Upload className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">Happy Teeth Logo Fix</h3>
            <p className="text-sm text-slate-600">Uploading logo to Supabase Storage</p>
          </div>
        </div>

        <div className="bg-white border-2 border-pink-200 rounded-lg p-4">
          <img 
            src={logoImage} 
            alt="Happy Teeth Logo" 
            className="w-48 h-auto mx-auto"
          />
        </div>

        {status === 'success' && (
          <Alert className="bg-green-50 border-green-300">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Logo uploaded successfully!</strong><br />
              {message}
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="bg-red-50 border-red-300">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Upload failed:</strong><br />
              {message}
            </AlertDescription>
          </Alert>
        )}

        {status === 'idle' && uploading && (
          <Alert className="bg-blue-50 border-blue-300">
            <Upload className="h-5 w-5 text-blue-600 animate-pulse" />
            <AlertDescription className="text-blue-800">
              Uploading logo to Supabase Storage...
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={uploadLogo} 
          disabled={uploading}
          className="w-full bg-pink-600 hover:bg-pink-700"
        >
          {uploading ? 'Uploading...' : 'Re-upload Logo'}
        </Button>

        <div className="text-xs text-slate-500 space-y-1">
          <p>✓ Logo will be stored in Supabase Storage (reliable & fast)</p>
          <p>✓ Publicly accessible for email delivery</p>
          <p>✓ No more broken Imgur links!</p>
        </div>
      </div>
    </Card>
  );
}
