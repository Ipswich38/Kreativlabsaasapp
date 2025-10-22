import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Mail, Send, Paperclip, X, CheckSquare, AlertTriangle, Settings } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  status: string;
  source: string;
  createdAt: string;
}

interface EmailBlastProps {
  leads: Lead[];
  onAddTestContacts?: () => Promise<void>;
  onNavigateToSettings?: () => void;
}

const DEFAULT_EMAIL_TEMPLATE = `Hello!

We hope this message finds you well. We're reaching out to connect and explore how Happy Teeth Support Services can help elevate your practice to the next level.

Our team specializes in providing comprehensive administrative support tailored specifically for dental practices. We handle everything from patient communications to scheduling, allowing you to focus on what you do best—providing exceptional care.

We'd love to learn more about your practice and discuss how we can support your goals. Would you be available for a brief conversation this week?

Looking forward to connecting with you!

Warm regards,
Happy Teeth Support Services Team`;

export function EmailBlast({ leads, onAddTestContacts, onNavigateToSettings }: EmailBlastProps) {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Partnership Opportunity with Happy Teeth Support Services');
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isAddingTestContacts, setIsAddingTestContacts] = useState(false);
  const [isGmailConfigured, setIsGmailConfigured] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLeads = leads.filter(lead => lead.status === 'active');

  // Check if Gmail is configured
  useEffect(() => {
    checkGmailConfig();
  }, []);

  const checkGmailConfig = async () => {
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
      setIsGmailConfigured(data.success && data.config && data.config.hasPassword);
    } catch (error) {
      console.error('Error checking Gmail config:', error);
      setIsGmailConfigured(false);
    }
  };
  
  const handleAddTestContacts = async () => {
    if (onAddTestContacts) {
      setIsAddingTestContacts(true);
      try {
        await onAddTestContacts();
        toast.success('Test contacts added successfully!');
      } catch (error) {
        console.error('Error adding test contacts:', error);
        toast.error('Failed to add test contacts');
      } finally {
        setIsAddingTestContacts(false);
      }
    }
  };

  const handleSelectLead = (leadId: number) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === activeLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(activeLeads.map(lead => lead.id));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (!isGmailConfigured) {
      toast.error('Gmail is not configured. Please go to Settings first.');
      return;
    }

    if (selectedLeads.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    const selectedRecipients = activeLeads.filter(lead => selectedLeads.includes(lead.id));
    
    // Show sending toast
    const sendingToast = toast.loading(`Sending emails to ${selectedLeads.length} recipient(s)...`);
    
    try {
      const { emailApi } = await import('../utils/api');
      
      // Convert File objects to metadata for the backend
      const attachmentData = attachments.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      const response = await emailApi.sendBlast(selectedRecipients, emailSubject, emailBody, attachmentData);
      
      // Dismiss loading toast
      toast.dismiss(sendingToast);
      
      // Show success with details
      if (response.mode === 'production') {
        const summary = response.summary;
        if (summary.failed > 0) {
          toast.warning(`Sent to ${summary.sent} recipient(s), ${summary.failed} failed`);
        } else {
          toast.success(`✅ Email sent successfully to ${summary.sent} recipient(s)`);
        }
      } else {
        toast.info(`📧 Email logged in demo mode for ${selectedLeads.length} recipient(s)`);
      }
      
      setIsEmailDialogOpen(false);
      setEmailSubject('Partnership Opportunity with Happy Teeth Support Services');
      setEmailBody(DEFAULT_EMAIL_TEMPLATE);
      setAttachments([]);
      setSelectedLeads([]);
    } catch (error) {
      toast.dismiss(sendingToast);
      console.error('Error sending email:', error);
      toast.error('Failed to send email blast');
    }
  };

  const openEmailComposer = () => {
    if (!isGmailConfigured) {
      toast.error('Please configure Gmail in Settings first');
      onNavigateToSettings?.();
      return;
    }
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    setIsEmailDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-slate-900 mb-2">Email Contacts</h1>
        <p className="text-slate-600">Send personalized email campaigns to your leads</p>
      </div>

      {/* Gmail Configuration Status Card */}
      {isGmailConfigured === false && (
        <Card className="mb-6 border-2 border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-900 mb-1">⚠️ Gmail Not Configured</h3>
                <p className="text-sm text-red-700 mb-3">
                  You need to configure Gmail SMTP before sending emails. Click below to set up your credentials.
                </p>
                <div className="bg-red-100 rounded p-3 mb-3 text-sm text-red-800">
                  <strong>Quick Setup:</strong><br />
                  Gmail: sshappyteeth@gmail.com<br />
                  App Password: wvnbgpmnkupothrh
                </div>
                <Button
                  onClick={() => onNavigateToSettings?.()}
                  className="bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Gmail Now
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {isGmailConfigured === true && (
        <Card className="mb-6 border-2 border-green-100 bg-green-50/50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-900 mb-1">✅ Production Gmail SMTP Configured</h3>
                <p className="text-sm text-green-700 mb-2">
                  Emails will be sent from <strong>sshappyteeth@gmail.com</strong> with professional HTML templates.
                </p>
                <div className="flex gap-4 text-xs text-green-700">
                  <span>📧 500 emails/day limit</span>
                  <span>✉️ Branded templates</span>
                  <span>👤 Personalized</span>
                  <span>✓ Production ready</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Test Contacts Helper */}
      {activeLeads.length === 0 && (
        <Card className="mb-6 border-2 border-[#ff77a4]/30 bg-[#ffe9f2]">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="text-[#ff77a4] mb-2">🧪 Test Email Blast Feature</h4>
                <p className="text-sm text-slate-700 mb-3">
                  No contacts found. Add test contacts to test the email blast functionality.
                </p>
                <Button 
                  onClick={handleAddTestContacts}
                  disabled={isAddingTestContacts}
                  className="bg-[#ff77a4] hover:bg-[#ff5a8f]"
                >
                  {isAddingTestContacts ? 'Adding...' : '➕ Add Test Contacts (3)'}
                </Button>
                <p className="text-xs text-slate-600 mt-2">
                  Will add: kreativloops@gmail.com, io.kreativloops@gmail.com, fernandez.cherwin@gmail.com
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Blast</CardTitle>
              <CardDescription>
                Select contacts and send personalized email campaigns
              </CardDescription>
            </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              {selectedLeads.length === activeLeads.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button onClick={openEmailComposer} className="gap-2" disabled={selectedLeads.length === 0}>
              <Mail className="w-4 h-4" />
              Compose Email ({selectedLeads.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedLeads.length === activeLeads.length && activeLeads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500">
                    No active leads available
                  </TableCell>
                </TableRow>
              ) : (
                activeLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeads.includes(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <Badge variant="default">{lead.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
              <DialogDescription>
                Sending to {selectedLeads.length} recipient(s)
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter your email message..."
                  rows={8}
                />
              </div>
              <div className="grid gap-2">
                <Label>Attachments</Label>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach Files
                  </Button>
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-slate-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} className="gap-2">
                <Send className="w-4 h-4" />
                Send Email
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </div>
  );
}
