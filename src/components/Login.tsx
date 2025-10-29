import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Lock, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
const logo = 'https://i.imgur.com/I768xBG.png';

interface LoginProps {
  onLogin: (userType: 'user' | 'admin', username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate credentials
    if (username === 'htsscrm' && passcode === '272829') {
      toast.success('Welcome to Happy Teeth CRM!');
      setTimeout(() => {
        onLogin('user', username);
      }, 500);
    } else if (username === 'kreativlab' && passcode === '272829') {
      toast.success('Welcome, Admin!');
      setTimeout(() => {
        onLogin('admin', username);
      }, 500);
    } else {
      setIsLoading(false);
      toast.error('Invalid username or passcode');
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffe9f2] via-white to-[#ffe9f2] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-[#ff77a4]/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Happy Teeth Logo" className="w-20 h-20 rounded-2xl shadow-lg" />
          </div>
          <div>
            <CardTitle className="text-3xl text-slate-900">Happy Teeth CRM</CardTitle>
            <CardDescription className="mt-2">Administrative Support Services</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff77a4]" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-2 border-slate-200 focus:border-[#ff77a4]"
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passcode" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#ff77a4]" />
                Passcode
              </Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your passcode"
                className="border-2 border-slate-200 focus:border-[#ff77a4]"
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#ff77a4] hover:bg-[#ff5a8f] text-white py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              🔒 Secure access to your dental clinic CRM
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
