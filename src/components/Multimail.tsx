import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Mail, Send, Zap, Image as ImageIcon, Eye } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
const logo = 'https://i.imgur.com/I768xBG.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MultimailProps {
  contacts: any[];
  username?: string;
}

// Default email template for dental practice outreach
const DEFAULT_SUBJECT = 'Reclaim Your Time: Let Us Handle the Admin, You Handle the Smiles';
const DEFAULT_MESSAGE = `Hi Dental Practice Leaders,

Are you finding that administrative tasks, patient calls, and insurance paperwork are taking up too much of your day?

At Happy Teeth Support Services, we specialize in providing virtual support exclusively for dental practices like yours. Our mission is to handle the complex administrative workload so you can get back to what you do best: providing exceptional patient care.

We're here to help you streamline your practice with our expert services:

Core Virtual Call Center & Admin Support: Never miss a patient call again. We provide 24/7 call intake, professional scheduling and appointment management, and patient communication (including reminders and recall efforts).

Virtual Dental Assistant (VDA) Services: Consider our VDAs an extension of your team. We manage complex front-office tasks, including patient insurance eligibility verification and full Revenue Cycle Management (RCM)—from claim submission to A/R and denial management.

Specialized Projects & Training: Need to optimize your processes? We offer financial and operational audits, insurance credentialing services, and even specialized training for your in-house staff, delivered by a practicing dentist.

Let us help you reduce overhead, improve efficiency, and free up your team to focus on your patients.

Ready to transform your practice?
Visit our services page to see the full details or call us directly at (202) 780-8048 for a personalized consultation.

Warm regards,
The Team at Happy Teeth Support Services`;

export function Multimail({ contacts, username = 'user' }: MultimailProps) {
  const [selectedContacts, setSelectedContacts] = useState<any[]>([]);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [isSending, setIsSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  // Imgur logo is always available (no upload needed!) - https://i.imgur.com/I768xBG.png
  const hasLogo = true;
  const isCheckingLogo = false;

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedContacts(contacts.filter(c => c.email));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleContactToggle = (contact: any) => {
    if (selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleSendEmails = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      const { gmailMultimailApi } = await import('../utils/api');
      
      const response = await gmailMultimailApi.sendBlast(
        selectedContacts,
        subject,
        message,
        username
      );
      
      console.log('📧 Gmail Multimail Response:', response);

      if (response.success) {
        if (response.successful > 0) {
          toast.success(`✅ Sent to ${response.successful} recipient(s) with Happy Teeth letterhead!`, {
            description: 'Professional email with logo delivered via Gmail',
            duration: 5000,
          });
          
          // Clear form and reset to default template
          setSubject(DEFAULT_SUBJECT);
          setMessage(DEFAULT_MESSAGE);
          setSelectedContacts([]);
          setSelectAll(false);
        }
        
        // Show errors if any failed
        if (response.failed > 0 && response.errors) {
          response.errors.forEach((err: any) => {
            toast.error(`Failed to send to ${err.email}`, {
              description: err.error,
              duration: 10000,
            });
          });
        }
        
        // If all failed, show a general error
        if (response.successful === 0 && response.failed > 0) {
          toast.error('All emails failed to send', {
            description: 'Check the individual error messages above for details',
            duration: 10000,
          });
        }
      } else {
        toast.error(`Failed to send emails: ${response.error}`);
      }
    } catch (error: any) {
      console.error('Multimail error:', error);
      
      toast.error(error.message || 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const eligibleContacts = contacts.filter(c => c.email);

  // Generate email preview HTML
  const generatePreviewHTML = () => {
    const formattedMessage = message.replace(/\n/g, '<br>');
    const year = new Date().getFullYear();
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Avenir',Arial,sans-serif;background-color:#f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f5f5f5;padding:20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="700" style="background-color:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header with Logo -->
          <tr>
            <td style="background:#ff77a4;padding:25px 30px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="20%" valign="middle">
                    <img src="${logo}" alt="Happy Teeth" style="max-width:120px;height:auto;display:block;border:none;" border="0" />
                  </td>
                  <td width="50%" valign="middle" align="center" style="padding:0 15px;">
                    <div style="font-family:'Avenir',Arial,sans-serif;font-size:26px;margin:0;color:white;font-weight:900;letter-spacing:0.5px;line-height:1.2;">
                      Happy Teeth<br/>Support Services, LLC
                    </div>
                  </td>
                  <td width="30%" valign="middle" align="right">
                    <div style="font-size:10px;line-height:1.5;color:white;text-align:right;">
                      <div style="margin-bottom:4px;">
                        <a href="https://happyteethsupportservices.com/" style="color:white;text-decoration:none;">happyteethsupportservices.com</a>
                      </div>
                      <div style="margin-bottom:4px;">+1 202-780-8048 USA</div>
                      <div style="margin-bottom:4px;">+1 912-756-0422 USA</div>
                      <div style="margin-bottom:4px;">+63 908-596-2421 Philippines</div>
                      <div>US Headquarters in Midway GA 31320</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 15px 0;">
                Hello [Recipient Name],
              </p>
              <div style="color:#333;font-size:16px;line-height:1.8;margin:20px 0;">
                ${formattedMessage}
              </div>
              <p style="color:#333;font-size:16px;line-height:1.6;margin:25px 0 0 0;">
                Best regards,<br>
                <strong style="color:#ff77a4;">Happy Teeth Support Services</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color:#ffe9f2;padding:25px 30px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 10px 0;">
                📞 +1 202-780-8048 USA / +1 912-756-0422 USA / +63 908-596-2421 Philippines
              </p>
              <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 10px 0;">
                📧 DrCamila@happyteethsupportservices.com
              </p>
              <p style="color:#999;font-size:12px;line-height:1.5;margin:15px 0 0 0;">
                © ${year} Happy Teeth Support Services, LLC<br>
                Administrative Support for Dental Professionals
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 flex items-center gap-2">
              Multimail
              <Badge className="bg-purple-500 text-white">PRO</Badge>
            </h1>
            <p className="text-slate-600 text-sm">
              Professional email delivery via Gmail SMTP with Happy Teeth letterhead
            </p>
          </div>
        </div>
        
        {/* Gmail Status Indicator */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900 mb-1">
                Powered by Gmail SMTP
              </p>
              <p className="text-xs text-purple-700">
                Professional emails with Happy Teeth logo letterhead • Reliable Gmail infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipients Panel */}
        <Card className="lg:col-span-1 p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 mb-1">Recipients</h3>
            <p className="text-sm text-slate-600">
              {selectedContacts.length} of {eligibleContacts.length} selected
            </p>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({eligibleContacts.length})
              </label>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eligibleContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-start gap-2 p-3 bg-white border rounded-lg hover:bg-slate-50 cursor-pointer"
                onClick={() => handleContactToggle(contact)}
              >
                <Checkbox
                  checked={selectedContacts.some(c => c.id === contact.id)}
                  onCheckedChange={() => handleContactToggle(contact)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{contact.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Email Composition Panel */}
        <Card className="lg:col-span-2 p-6">
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="compose" className="gap-2">
                <Mail className="w-4 h-4" />
                Compose
              </TabsTrigger>
              <TabsTrigger value="preview" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="message">Message</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setSubject(DEFAULT_SUBJECT);
                      setMessage(DEFAULT_MESSAGE);
                    }}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Reset to Default Template
                  </button>
                </div>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your message here..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Pre-loaded with dental practice outreach template. Customize as needed.
                </p>
              </div>

            {/* Logo Preview */}
            {!isCheckingLogo && hasLogo && (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-pink-200">
                    <img src={logo} alt="Happy Teeth Logo" className="w-16 h-auto" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <p className="text-sm font-semibold text-pink-900">
                        ✨ Happy Teeth Logo Active
                      </p>
                    </div>
                    <p className="text-xs text-pink-700">
                      Your emails will include this professional logo in the letterhead. Recipients will see it at the top of every message.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Preview Note */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    Professional Letterhead Included
                  </p>
                  <p className="text-xs text-blue-700">
                    Your message will be sent with {hasLogo ? 'the Happy Teeth logo, ' : ''}professional formatting, and contact information footer.
                  </p>
                </div>
              </div>
            </div>

              {/* Send Button */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-600">
                  {selectedContacts.length > 0 && (
                    <span>Ready to send to {selectedContacts.length} recipient(s)</span>
                  )}
                </div>
                <Button
                  onClick={handleSendEmails}
                  disabled={isSending || selectedContacts.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending via Gmail...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Professional Email
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    <h4 className="text-purple-900">Email Preview</h4>
                  </div>
                  <p className="text-xs text-purple-700">
                    This is exactly how your email will appear to recipients, including the Happy Teeth letterhead and footer.
                  </p>
                </div>

                <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 border-b border-slate-200">
                    <p className="text-sm text-slate-700">
                      <strong>Subject:</strong> {subject || '(No subject)'}
                    </p>
                  </div>
                  <div className="bg-white overflow-auto" style={{ maxHeight: '600px' }}>
                    <iframe
                      srcDoc={generatePreviewHTML()}
                      style={{
                        width: '100%',
                        minHeight: '500px',
                        border: 'none',
                      }}
                      title="Email Preview"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    {selectedContacts.length > 0 && (
                      <span>Ready to send to {selectedContacts.length} recipient(s)</span>
                    )}
                  </div>
                  <Button
                    onClick={handleSendEmails}
                    disabled={isSending || selectedContacts.length === 0}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending via Gmail...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Professional Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-900 mb-1">
              Professional Email Delivery via Gmail SMTP
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>✓ Happy Teeth logo letterhead on every email</li>
              <li>✓ Professional HTML formatting with gradient header</li>
              <li>✓ Contact information footer automatically included</li>
              <li>✓ Personalized greetings for each recipient</li>
              <li>✓ Reliable Gmail infrastructure for delivery</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
