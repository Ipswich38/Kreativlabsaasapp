import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Mail, Send, Paperclip, X, CheckSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Alert, AlertDescription } from './ui/alert';
import logo from 'figma:asset/4d778675bb728bb5595e9394dadabf32025b40c1.png';
import { mailgunService, type EmailRecipient, type EmailAttachment } from '../lib/mailgun';
import { emailCampaignsApi, emailLogsApi } from '../lib/api';

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
  isAdmin?: boolean;
}

const DEFAULT_EMAIL_TEMPLATE = `Hello!

We hope this message finds you well. We're reaching out to connect and explore how Happy Teeth Support Services can help elevate your practice to the next level.

Our team specializes in providing comprehensive administrative support tailored specifically for dental practices. We handle everything from patient communications to scheduling, allowing you to focus on what you do best—providing exceptional care.

We'd love to learn more about your practice and discuss how we can support your goals. Would you be available for a brief conversation this week?

Looking forward to connecting with you!

Warm regards,
Happy Teeth Support Services Team`;

export function EmailBlast({ leads, isAdmin = false }: EmailBlastProps) {
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('Partnership Opportunity with Happy Teeth Support Services');
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_TEMPLATE);
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLeads = leads.filter(lead => lead.status === 'active');

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
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Please fill in subject and message');
      return;
    }

    // Check Mailgun configuration
    if (!process.env.VITE_MAILGUN_API_KEY || !process.env.VITE_MAILGUN_DOMAIN) {
      toast.error('Mailgun not configured', {
        description: 'Please set VITE_MAILGUN_API_KEY and VITE_MAILGUN_DOMAIN environment variables'
      });
      return;
    }

    const selectedRecipients = activeLeads.filter(lead => selectedLeads.includes(lead.id));

    // Show sending toast
    const sendingToast = toast.loading(`Sending emails to ${selectedLeads.length} recipient(s)...`);

    try {
      // Create email campaign record
      const campaign = await emailCampaignsApi.create({
        subject: emailSubject,
        body: emailBody,
        recipients_count: selectedRecipients.length,
        status: 'sending'
      });

      // Convert File objects to EmailAttachment format
      const emailAttachments: EmailAttachment[] = await Promise.all(
        attachments.map(async (file) => {
          return new Promise<EmailAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                filename: file.name,
                content: reader.result as string,
                contentType: file.type,
                size: file.size
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Transform leads to EmailRecipient format
      const recipients: EmailRecipient[] = selectedRecipients.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        company: lead.company
      }));

      // Create HTML email body with template
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #ff77a4, #ff5a8f); padding: 40px; text-align: center; color: white;">
            <div style="background: white; border-radius: 12px; padding: 20px; display: inline-block;">
              <img src="cid:logo" alt="Happy Teeth Support Services" style="max-width: 200px; height: auto;" />
            </div>
          </div>
          <div style="padding: 40px; background: white;">
            <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
              ${emailBody.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ff77a4;">
              <p style="font-weight: bold; color: #ff77a4; margin-bottom: 5px;">
                Happy Teeth Support Services
              </p>
              <p style="color: #666; font-size: 14px; margin: 0;">
                ${process.env.VITE_FROM_EMAIL || 'contact@happyteeth.com'}
              </p>
            </div>
          </div>
          <div style="background: #fdf2f8; padding: 20px; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This email was sent from KreativLab CRM
            </p>
          </div>
        </div>
      `;

      // Send bulk email via Mailgun
      const result = await mailgunService.sendBulkEmail(
        recipients,
        emailSubject,
        htmlBody,
        emailBody, // plain text version
        emailAttachments
      );

      // Update campaign status
      await emailCampaignsApi.updateStatus(
        campaign.id,
        result.success ? 'sent' : 'failed',
        result.successCount,
        result.failureCount
      );

      // Log individual email results
      const emailLogs = result.results.map(emailResult => ({
        campaign_id: campaign.id,
        lead_id: recipients.find(r => r.email === emailResult.email)?.id || 0,
        email: emailResult.email,
        subject: emailSubject,
        status: emailResult.success ? ('sent' as const) : ('failed' as const),
        error_message: emailResult.error || null,
        sent_at: emailResult.success ? new Date().toISOString() : null
      }));

      await emailLogsApi.bulkCreate(emailLogs);

      // Dismiss loading toast
      toast.dismiss(sendingToast);

      // Show results
      if (result.failureCount > 0) {
        toast.warning(`Sent to ${result.successCount} of ${selectedLeads.length} recipient(s). ${result.failureCount} failed.`);
      } else {
        toast.success(`✅ Successfully sent ${result.successCount} email(s)`);
      }

      setIsEmailDialogOpen(false);
      setEmailSubject('Partnership Opportunity with Happy Teeth Support Services');
      setEmailBody(DEFAULT_EMAIL_TEMPLATE);
      setAttachments([]);
      setSelectedLeads([]);
    } catch (error: any) {
      toast.dismiss(sendingToast);
      console.error('Error sending email:', error);

      if (error.message?.includes('Mailgun') || error.message?.includes('API key')) {
        if (isAdmin) {
          toast.error('Mailgun Configuration Error', {
            description: 'Please check your Mailgun API key and domain configuration',
            duration: 10000
          });
        } else {
          toast.error('❌ Email sending failed. Please contact support.');
        }
      } else {
        toast.error('Failed to send email blast');
      }
    }
  };

  const openEmailComposer = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    setIsEmailDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Email Contacts</h1>
          <p className="text-slate-600">Send personalized email campaigns to your leads</p>
        </div>
        <img src={logo} alt="Happy Teeth Logo" className="w-16 h-16 rounded-lg" />
      </div>

      {/* Mailgun Setup Alert - Only visible to admin */}
      {isAdmin && (
        <Alert className="mb-6 border-2 border-amber-500 bg-amber-50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-amber-900">
                <strong>⚠️ Mailgun Email Setup Instructions (Admin Only)</strong>
              </p>
              <p className="text-sm text-amber-800">
                Email sending is now powered by Mailgun. Ensure the following environment variables are set:
              </p>
              <ol className="text-sm text-amber-800 list-decimal list-inside space-y-1 ml-2">
                <li><code className="bg-amber-100 px-1 rounded text-xs">VITE_MAILGUN_API_KEY</code> - Your Mailgun API key</li>
                <li><code className="bg-amber-100 px-1 rounded text-xs">VITE_MAILGUN_DOMAIN</code> - Your verified Mailgun domain</li>
                <li><code className="bg-amber-100 px-1 rounded text-xs">VITE_FROM_EMAIL</code> - Sender email address</li>
                <li><code className="bg-amber-100 px-1 rounded text-xs">VITE_FROM_NAME</code> - Sender name</li>
              </ol>
              <details className="mt-2 pt-2 border-t border-amber-200">
                <summary className="text-xs text-amber-700 cursor-pointer hover:text-amber-900">Show detailed setup instructions</summary>
                <div className="mt-2 p-2 bg-amber-100 rounded text-xs text-amber-900 space-y-1">
                  <p><strong>Step 1:</strong> Sign up for <a href="https://www.mailgun.com/" target="_blank" rel="noopener noreferrer" className="underline text-[#ff77a4]">Mailgun</a></p>
                  <p><strong>Step 2:</strong> Add and verify your domain in Mailgun dashboard</p>
                  <p><strong>Step 3:</strong> Get your API key from Settings → API Keys</p>
                  <p><strong>Step 4:</strong> Set environment variables in your .env file</p>
                  <p><strong>Step 5:</strong> Test email sending functionality</p>
                  <p className="pt-1 border-t border-amber-300 mt-2"><strong>Note:</strong> Mailgun provides better deliverability and tracking than SMTP.</p>
                </div>
              </details>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* No Contacts Helper */}
      {activeLeads.length === 0 && (
        <Card className="mb-6 border-2 border-slate-200 bg-slate-50">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h4 className="text-slate-900 mb-2">📋 No Active Contacts Found</h4>
                <p className="text-sm text-slate-700 mb-3">
                  You don't have any active contacts yet. Add leads manually in the Leads Manager or use the Lead Generation feature to scrape dental clinics.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      const leadsBtn = document.querySelector('button[data-view="leads"]') as HTMLButtonElement;
                      if (leadsBtn) leadsBtn.click();
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Go to Leads Manager
                  </Button>
                  <Button 
                    onClick={() => {
                      const genBtn = document.querySelector('button[data-view="lead-generation"]') as HTMLButtonElement;
                      if (genBtn) genBtn.click();
                    }}
                    className="bg-[#ff77a4] hover:bg-[#ff5a8f]"
                    size="sm"
                  >
                    Generate Leads
                  </Button>
                </div>
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
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#ff77a4]" />
                Compose Email Campaign
              </DialogTitle>
              <DialogDescription>
                Sending to {selectedLeads.length} recipient(s) • What you see is what they'll receive
              </DialogDescription>
            </DialogHeader>

            {/* Email Preview Container - WYSIWYG */}
            <div className="bg-slate-50 p-4 rounded-lg border-2 border-slate-200">
              {/* Subject Line Editor */}
              <div className="mb-4 bg-white p-3 rounded-lg border border-slate-300">
                <Label htmlFor="subject" className="text-xs text-slate-500 mb-1 block">
                  Subject Line
                </Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="border-0 shadow-none text-lg p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* WYSIWYG Email Preview - Matches recipient view exactly */}
              <div className="bg-white rounded-lg overflow-hidden shadow-lg border-2 border-slate-300">
                {/* Email Header with Logo */}
                <div className="bg-gradient-to-r from-[#ff77a4] to-[#ff5a8f] p-8 text-center">
                  <div className="bg-white rounded-xl p-5 inline-block shadow-lg">
                    <img 
                      src={logo} 
                      alt="Happy Teeth Support Services" 
                      className="w-48 h-auto"
                    />
                  </div>
                </div>

                {/* Email Body - Editable */}
                <div className="p-8">
                  <Label htmlFor="message" className="text-xs text-slate-500 mb-2 block">
                    Email Message
                  </Label>
                  <Textarea
                    id="message"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type your message here... Recipients will see exactly what you type."
                    rows={12}
                    className="border-2 border-dashed border-slate-300 shadow-none font-sans text-[15px] leading-[1.7] focus-visible:border-[#ff77a4] transition-colors resize-none"
                  />

                  {/* Email Signature - Auto-generated */}
                  <div className="mt-6 pt-6 border-t-2 border-pink-100">
                    <p className="font-semibold text-[#ff77a4] mb-1">
                      Happy Teeth Support Services
                    </p>
                    <p className="text-sm text-slate-500">
                      sshappyteeth@gmail.com
                    </p>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-pink-50 p-4 text-center">
                  <p className="text-xs text-slate-500">
                    This email was sent from KreativLab CRM
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              <div className="mt-4">
                <Label className="text-sm text-slate-700 mb-2 block">
                  File Attachments
                </Label>
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
                    className="w-full gap-2 bg-white hover:bg-slate-50"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach Files
                  </Button>
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4 text-[#ff77a4]" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-slate-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAttachment(index)}
                            className="hover:bg-red-50 hover:text-red-600"
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

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
              <div className="flex-1 text-left">
                <p className="text-xs text-slate-500">
                  ✨ Live preview - Recipients see exactly what's shown above
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsEmailDialogOpen(false)}
                  className="flex-1 sm:flex-initial"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail} 
                  className="gap-2 bg-[#ff77a4] hover:bg-[#ff5a8f] flex-1 sm:flex-initial"
                >
                  <Send className="w-4 h-4" />
                  Send to {selectedLeads.length} Contact{selectedLeads.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </div>
  );
}
