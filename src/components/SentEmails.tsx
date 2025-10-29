import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { RefreshCw, Search, Mail, Clock, CheckCircle2, Eye, MousePointerClick, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SentEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
  openedAt?: string;
  clickedAt?: string;
  openCount: number;
  clickCount: number;
  sentBy: string;
}

export function SentEmails() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchSentEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82/sent-emails`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sent emails');
      }

      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Error fetching sent emails:', error);
      toast.error('Failed to load sent emails');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentEmails();
    
    // Auto-refresh every 10 seconds to catch status updates
    const interval = setInterval(() => {
      fetchSentEmails();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string, openCount: number, clickCount: number) => {
    switch (status) {
      case 'opened':
        return (
          <Badge className="bg-green-500 text-white gap-1">
            <Eye className="w-3 h-3" />
            Opened {openCount > 1 ? `(${openCount}x)` : ''}
          </Badge>
        );
      case 'clicked':
        return (
          <Badge className="bg-blue-500 text-white gap-1">
            <MousePointerClick className="w-3 h-3" />
            Clicked {clickCount > 1 ? `(${clickCount}x)` : ''}
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className="bg-emerald-500 text-white gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </Badge>
        );
      case 'bounced':
        return (
          <Badge className="bg-red-500 text-white gap-1">
            <XCircle className="w-3 h-3" />
            Bounced
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-400 text-white gap-1">
            <Clock className="w-3 h-3" />
            Sent
          </Badge>
        );
    }
  };

  const getEngagementLabel = (email: SentEmail) => {
    const hoursSinceSent = (Date.now() - new Date(email.sentAt).getTime()) / (1000 * 60 * 60);
    
    if (email.status === 'opened' || email.status === 'clicked') {
      return 'Engaged';
    } else if (email.status === 'bounced') {
      return 'Failed';
    } else if (hoursSinceSent > 72 && email.status === 'sent') {
      return 'Not Opened';
    } else if (hoursSinceSent > 24) {
      return 'Pending';
    } else {
      return 'Recent';
    }
  };

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' || email.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: emails.length,
    sent: emails.filter((e) => e.status === 'sent').length,
    delivered: emails.filter((e) => e.status === 'delivered').length,
    opened: emails.filter((e) => e.status === 'opened' || e.status === 'clicked').length,
    clicked: emails.filter((e) => e.status === 'clicked').length,
    bounced: emails.filter((e) => e.status === 'bounced').length,
    openRate: emails.length > 0 
      ? Math.round((emails.filter((e) => e.status === 'opened' || e.status === 'clicked').length / emails.length) * 100) 
      : 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-1">Sent Emails</h1>
          <p className="text-sm text-slate-500">Track and monitor your sent email campaigns</p>
        </div>
        <Button onClick={fetchSentEmails} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Sent</CardDescription>
            <CardTitle className="text-3xl text-[#ff77a4]">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Delivered</CardDescription>
            <CardTitle className="text-3xl text-emerald-500">{stats.delivered}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Opened</CardDescription>
            <CardTitle className="text-3xl text-green-500">{stats.opened}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Clicked</CardDescription>
            <CardTitle className="text-3xl text-blue-500">{stats.clicked}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Bounced</CardDescription>
            <CardTitle className="text-3xl text-red-500">{stats.bounced}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-slate-400">{stats.sent}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Rate</CardDescription>
            <CardTitle className="text-3xl text-purple-500">{stats.openRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by recipient, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({stats.total})
            </Button>
            <Button
              variant={filterStatus === 'delivered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('delivered')}
              className={filterStatus === 'delivered' ? 'bg-emerald-500' : ''}
            >
              Delivered ({stats.delivered})
            </Button>
            <Button
              variant={filterStatus === 'opened' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('opened')}
              className={filterStatus === 'opened' ? 'bg-green-500' : ''}
            >
              Opened ({stats.opened})
            </Button>
            <Button
              variant={filterStatus === 'clicked' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('clicked')}
              className={filterStatus === 'clicked' ? 'bg-blue-500' : ''}
            >
              Clicked ({stats.clicked})
            </Button>
            <Button
              variant={filterStatus === 'bounced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('bounced')}
              className={filterStatus === 'bounced' ? 'bg-red-500' : ''}
            >
              Bounced ({stats.bounced})
            </Button>
            <Button
              variant={filterStatus === 'sent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('sent')}
            >
              Pending ({stats.sent})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#ff77a4]" />
            Email History ({filteredEmails.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading sent emails...
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="mb-1">No sent emails found</p>
              <p className="text-sm">
                {searchTerm || filterStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Emails sent from Multimail will appear here'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Sent By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <div>
                          <div className="text-slate-900">{email.recipientName}</div>
                          <div className="text-sm text-slate-500">{email.recipientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={email.subject}>
                          {email.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(email.status, email.openCount, email.clickCount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getEngagementLabel(email)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {new Date(email.sentAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {email.openedAt && (
                          <div className="text-xs">
                            Opened: {new Date(email.openedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        {email.clickedAt && (
                          <div className="text-xs">
                            Clicked: {new Date(email.clickedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                        {!email.openedAt && !email.clickedAt && <span className="text-slate-400">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{email.sentBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
