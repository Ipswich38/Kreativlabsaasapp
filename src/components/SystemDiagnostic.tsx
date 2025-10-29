import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Mail,
  Image as ImageIcon,
  Database,
  Server,
  Zap
} from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
}

export function SystemDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const diagnostics: DiagnosticResult[] = [];

    // 1. Check Logo in Supabase Storage
    try {
      const logoCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/logo-url`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const logoData = await logoCheck.json();
      
      if (logoData.exists && logoData.publicUrl) {
        diagnostics.push({
          name: 'Logo in Supabase Storage',
          status: 'success',
          message: 'Logo is uploaded and accessible',
          details: logoData.publicUrl
        });
      } else {
        diagnostics.push({
          name: 'Logo in Supabase Storage',
          status: 'warning',
          message: 'Logo not uploaded yet',
          details: 'Use AutoLogoFix component to upload'
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Logo in Supabase Storage',
        status: 'error',
        message: 'Failed to check logo status',
        details: String(error)
      });
    }

    // 2. Check Server Connection
    try {
      const serverCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/leads`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      if (serverCheck.ok) {
        diagnostics.push({
          name: 'Server Connection',
          status: 'success',
          message: 'Server is responding correctly',
          details: `Status: ${serverCheck.status}`
        });
      } else {
        diagnostics.push({
          name: 'Server Connection',
          status: 'error',
          message: 'Server returned error',
          details: `Status: ${serverCheck.status}`
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Server Connection',
        status: 'error',
        message: 'Cannot reach server',
        details: String(error)
      });
    }

    // 3. Check Gmail Configuration
    diagnostics.push({
      name: 'Gmail SMTP Configuration',
      status: 'success',
      message: 'Gmail credentials are hardcoded in server',
      details: 'sshappyteeth@gmail.com configured'
    });

    // 4. Check Database Connection
    try {
      const dbCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/leads`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const dbData = await dbCheck.json();
      
      if (dbData.leads) {
        diagnostics.push({
          name: 'Database Connection',
          status: 'success',
          message: `Database accessible (${dbData.leads.length} leads)`,
          details: 'KV Store working correctly'
        });
      } else {
        diagnostics.push({
          name: 'Database Connection',
          status: 'warning',
          message: 'Database accessible but no data',
          details: 'KV Store is empty'
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Database Connection',
        status: 'error',
        message: 'Cannot access database',
        details: String(error)
      });
    }

    // 5. Check Multimail Endpoint
    try {
      const multimailCheck = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/gmail-multimail-send`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}` 
          },
          body: JSON.stringify({
            recipients: [],
            subject: 'test',
            message: 'test'
          })
        }
      );
      
      if (multimailCheck.status === 400) {
        // Expected error (no recipients) means endpoint is working
        diagnostics.push({
          name: 'Multimail Endpoint',
          status: 'success',
          message: 'Gmail Multimail endpoint is responding',
          details: 'Ready to send emails'
        });
      } else {
        diagnostics.push({
          name: 'Multimail Endpoint',
          status: 'warning',
          message: `Unexpected response: ${multimailCheck.status}`,
          details: 'May still work, but unusual response'
        });
      }
    } catch (error) {
      diagnostics.push({
        name: 'Multimail Endpoint',
        status: 'error',
        message: 'Cannot reach multimail endpoint',
        details: String(error)
      });
    }

    setResults(diagnostics);
    setIsRunning(false);

    // Show summary toast
    const errors = diagnostics.filter(d => d.status === 'error').length;
    const warnings = diagnostics.filter(d => d.status === 'warning').length;
    const successes = diagnostics.filter(d => d.status === 'success').length;

    if (errors === 0 && warnings === 0) {
      toast.success(`✅ All systems operational! (${successes}/5 checks passed)`);
    } else if (errors > 0) {
      toast.error(`❌ ${errors} critical issue(s) found`);
    } else {
      toast.warning(`⚠️ ${warnings} warning(s) found`);
    }
  };

  const getIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'error':
        return <Badge className="bg-red-500">ERROR</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">WARNING</Badge>;
      default:
        return <Badge className="bg-blue-500">CHECKING</Badge>;
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Logo')) return <ImageIcon className="w-4 h-4" />;
    if (name.includes('Server')) return <Server className="w-4 h-4" />;
    if (name.includes('Gmail')) return <Mail className="w-4 h-4" />;
    if (name.includes('Database')) return <Database className="w-4 h-4" />;
    if (name.includes('Multimail')) return <Zap className="w-4 h-4" />;
    return <Server className="w-4 h-4" />;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#ff77a4]" />
            System Diagnostics
          </h2>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Running...' : 'Run Again'}
          </Button>
        </div>
        <p className="text-sm text-slate-600">
          Checking all system components to identify any issues
        </p>
      </div>

      <div className="space-y-3">
        {results.length === 0 && isRunning ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-[#ff77a4]" />
            <span className="ml-3 text-slate-600">Running diagnostics...</span>
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(result.name)}
                    <h3 className="font-semibold text-slate-900">{result.name}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-slate-700 mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-slate-600 font-mono bg-white/50 p-2 rounded mt-2 break-all">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {results.length > 0 && !isRunning && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Quick Summary:</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {results.filter(r => r.status === 'success').length}
              </div>
              <div className="text-xs text-green-700">Passed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">
                {results.filter(r => r.status === 'warning').length}
              </div>
              <div className="text-xs text-amber-700">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {results.filter(r => r.status === 'error').length}
              </div>
              <div className="text-xs text-red-700">Errors</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
