import { Hono } from "npm:hono@4.3.11";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// ============================================
// EMAIL SENDING - HARDCODED GMAIL CREDENTIALS
// ============================================

// Hardcoded Gmail configuration for production
const GMAIL_CONFIG = {
  gmailAddress: 'sshappyteeth@gmail.com',
  appPassword: 'brroixsaorgufsiu',
  senderName: 'Happy Teeth Support Services',
  phone: '(202) 780-8048',
};

// IMPORTANT: Paste your base64 logo code below between the quotes
// Get the base64 from the Logo Converter in Admin Dashboard
const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zUAAADMmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6SXB0YzR4bXBFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgZXhpZjpEYXRlVGltZU9yaWdpbmFsPSIyMDI1LTEwLTIwVDIyOjMyOjU5KzAwOjAwIiBJcHRjNHhtcEV4dDpEaWdpdGFsU291cmNlRmlsZVR5cGU9Imh0dHA6Ly9jdi5pcHRjLm9yZy9uZXdzY29kZXMvZGlnaXRhbHNvdXJjZXR5cGUvY29tcG9zaXRlV2l0aFRyYWluZWRBbGdvcml0aG1pY01lZGlhIiBJcHRjNHhtcEV4dDpEaWdpdGFsU291cmNlVHlwZT0iaHR0cDovL2N2LmlwdGMub3JnL25ld3Njb2Rlcy9kaWdpdGFsc291cmNldHlwZS9jb21wb3NpdGVXaXRoVHJhaW5lZEFsZ29yaXRobWljTWVkaWEiIHBob3Rvc2hvcDpDcmVkaXQ9IkVkaXRlZCB3aXRoIEdvb2dsZSBBSSIgcGhvdG9zaG9wOkRhdGVDcmVhdGVkPSIyMDI1LTEwLTIwVDIyOjMyOjU5KzAwOjAwIi8+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+ICAgPD94cGFja2V0IGVuZD0idyI/PphhGqgAACAASURBVHicdL3bdgU5shsIUP7/7/Tx47T9MD5LxDwEgGCq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";

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
  apiKey: Deno.env.get('CLOUDINARY_API_KEY'),
  apiSecret: Deno.env.get('CLOUDINARY_API_SECRET'),
};

// Logo Solution: Use inline SVG for email compatibility
// SVG logos work perfectly in emails and don't require external hosting
const EMAIL_LOGO_SVG = `
  <svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#ff77a4;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff99bb;stop-opacity:1" />
      </linearGradient>
    </defs>
    <!-- Background -->
    <rect width="400" height="100" fill="white" rx="12"/>
    <!-- Headset Icon -->
    <circle cx="50" cy="50" r="15" fill="url(#pinkGradient)"/>
    <path d="M 35 50 Q 35 30, 50 30 Q 65 30, 65 50" stroke="#ff77a4" stroke-width="4" fill="none"/>
    <rect x="32" y="45" width="8" height="15" rx="3" fill="#ff77a4"/>
    <rect x="60" y="45" width="8" height="15" rx="3" fill="#ff77a4"/>
    <!-- Text -->
    <text x="85" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#333">
      Happy Teeth
    </text>
    <text x="85" y="70" font-family="Arial, sans-serif" font-size="16" fill="#666">
      Support Services
    </text>
  </svg>
`;

// Also keep the Cloudinary URL as backup
const CLOUDINARY_CLOUD = CLOUDINARY_CONFIG.cloudName || 'drkudvyog';
let EMAIL_LOGO_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/happyteethlogo_pinkheadset_mgvjbi`;

// Helper function to get logo HTML - Using text instead of image for better compatibility
const getLogoHTML = () => `
  <div style="text-align: center;">
    <h1 style="font-family: 'Avenir', Arial, sans-serif; font-size: 28px; margin: 0; color: #ff77a4; font-weight: 900; letter-spacing: 0.5px;">Happy Teeth</h1>
    <p style="font-family: 'Avenir', Arial, sans-serif; font-size: 14px; margin: 5px 0 0 0; color: #666; font-weight: 500;">Support Services</p>
  </div>
`;

// Text-based logo for emails (more reliable than images)
const TEXT_LOGO_HTML = `
  <h1 style="font-family: 'Avenir', Arial, sans-serif; font-size: 28px; margin: 0; color: #ff77a4; font-weight: 900; letter-spacing: 0.5px;">Happy Teeth</h1>
  <p style="font-family: 'Avenir', Arial, sans-serif; font-size: 14px; margin: 5px 0 0 0; color: #666; font-weight: 500;">Support Services</p>
`;

console.log('📸 Email using inline SVG logo (always works!)');
console.log('🔧 Cloudinary backup URL:', EMAIL_LOGO_URL);

// Upload logo to Cloudinary and get URL
app.post('/make-server-aed69b82/upload-logo', async (c) => {
  try {
    const { logo } = await c.req.json();
    
    if (!CLOUDINARY_CONFIG.cloudName) {
      return c.json({ 
        success: false, 
        error: 'Cloudinary cloud name not configured.' 
      }, 500);
    }
    
    console.log('📤 Uploading logo to Cloudinary...');
    
    // Create signature for authenticated upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const crypto = await import('node:crypto');
    
    const paramsToSign = `timestamp=${timestamp}&upload_preset=kreativlab_crm${CLOUDINARY_CONFIG.apiSecret}`;
    const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
    
    // Upload to Cloudinary with authentication
    const formData = new FormData();
    formData.append('file', logo);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey || '');
    formData.append('signature', signature);
    formData.append('folder', 'kreativlab-crm');
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ Cloudinary upload failed:', errorText);
      return c.json({ success: false, error: 'Failed to upload to Cloudinary: ' + errorText }, 500);
    }
    
    const result = await uploadResponse.json();
    EMAIL_LOGO_URL = result.secure_url;
    
    console.log('✅ Logo uploaded to Cloudinary:', EMAIL_LOGO_URL);
    
    return c.json({ 
      success: true, 
      message: 'Logo uploaded successfully! This URL will now be used in all emails.',
      url: EMAIL_LOGO_URL 
    });
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get logo URL
app.get('/make-server-aed69b82/email-logo', async (c) => {
  return c.json({ url: EMAIL_LOGO_URL });
});

// Helper function to create SMTP transporter
async function createTransporter() {
  const nodemailer = await import("npm:nodemailer@6.9.7");
  
  console.log('🔧 Creating SMTP transporter with:', {
    email: GMAIL_CONFIG.gmailAddress,
    passwordLength: GMAIL_CONFIG.appPassword?.length,
    host: 'smtp.gmail.com',
    port: 587,
  });
  
  return nodemailer.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_CONFIG.gmailAddress,
      pass: GMAIL_CONFIG.appPassword,
    },
    logger: true,
    debug: true,
  });
}

// Test SMTP connection
app.post('/make-server-aed69b82/test-email', async (c) => {
  try {
    console.log('🧪 Testing SMTP connection...');
    
    const transporter = await createTransporter();
    
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');
    
    // Send test email to the configured Gmail address
    const testMailOptions = {
      from: `"${GMAIL_CONFIG.senderName}" <${GMAIL_CONFIG.gmailAddress}>`,
      to: GMAIL_CONFIG.gmailAddress,
      subject: '✅ SMTP Test Successful - KreativLab CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Avenir', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
            .email-wrapper { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff77a4 0%, #ff5a8f 100%); color: white; padding: 40px 30px; text-align: center; }
            .logo-container { background: white; border-radius: 12px; padding: 20px 40px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: center; }
            .logo-container img { display: none; }
            .logo-container h1 { font-family: 'Avenir', Arial, sans-serif; font-size: 28px; margin: 0; color: #ff77a4; font-weight: 900; letter-spacing: 0.5px; }
            .logo-container p { font-family: 'Avenir', Arial, sans-serif; font-size: 14px; margin: 5px 0 0 0; color: #666; font-weight: 500; }
            .company-name { font-family: 'Avenir', Arial, sans-serif; font-size: 32px; margin: 0 0 15px 0; color: white; letter-spacing: 0.5px; }
            .header-title { margin: 0; font-size: 14px; opacity: 0.95; letter-spacing: 0.5px; }
            .content { background: white; padding: 30px; }
            .config-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
            .footer { text-align: center; padding: 20px 30px; background: #ffe9f2; color: #666; font-size: 12px; }
            .success-badge { background: #d4edda; color: #155724; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 15px 0; border: 1px solid #c3e6cb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="email-wrapper">
              <div class="header">
                <div class="logo-container">
                  <img src="${EMAIL_LOGO_URL || 'https://via.placeholder.com/200x80/ff77a4/white?text=Happy+Teeth'}" alt="Happy Teeth Support Services" class="logo" />
                </div>
                <p class="header-title">${TEXT_LOGO_HTML}
                <br>
                SMTP Test - Configuration Successful</p>
              </div>
              <div class="content">
                <h2 style="color: #ff77a4; margin-top: 0;">🎉 Email System Successfully Configured!</h2>
                <div class="success-badge">
                  ✅ Your Gmail SMTP credentials are working correctly!
                </div>
                <p>This test email confirms that your email system is properly configured and ready to send campaigns.</p>
                
                <div class="config-box">
                  <strong>📋 Configuration Details:</strong><br><br>
                  <strong>Email:</strong> ${GMAIL_CONFIG.gmailAddress}<br>
                  <strong>SMTP Server:</strong> smtp.gmail.com:587<br>
                  <strong>Authentication:</strong> App Password (${GMAIL_CONFIG.appPassword?.length || 0} characters)<br>
                  <strong>Sender Name:</strong> ${GMAIL_CONFIG.senderName}
                </div>
                
                <h3 style="color: #ff77a4;">✨ What This Means:</h3>
                <ul style="line-height: 1.8;">
                  <li>✅ Your email campaigns will be sent successfully</li>
                  <li>✅ Recipients will see emails from: ${GMAIL_CONFIG.senderName}</li>
                  <li>✅ Your CRM is ready for production use</li>
                  <li>✅ File attachments will work properly</li>
                  <li>✅ Your Happy Teeth branding will display perfectly!</li>
                </ul>
                
                <p style="margin-top: 20px; padding: 15px; background: #e7f3ff; border-left: 4px solid #2196F3; border-radius: 4px;">
                  <strong>💡 Next Steps:</strong> You can now send email campaigns to your dental clinic leads with confidence!
                </p>
              </div>
              <div class="footer">
                <p><strong>Sent via KreativLab CRM</strong></p>
                <p style="margin: 5px 0;">Powered by Happy Teeth Support Services</p>
                <p style="margin: 5px 0;"><strong>📞 ${GMAIL_CONFIG.phone}</strong></p>
                <p style="margin: 10px 0; font-size: 10px; color: #999;">
                  Test email sent on ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    console.log('📧 Sending test email to:', GMAIL_CONFIG.gmailAddress);
    console.log('🖼️  Using logo URL:', EMAIL_LOGO_URL);
    await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully');
    
    return c.json({
      success: true,
      message: `✅ SMTP test successful! A confirmation email has been sent to ${GMAIL_CONFIG.gmailAddress}`,
      details: {
        host: 'smtp.gmail.com',
        port: 587,
        user: GMAIL_CONFIG.gmailAddress,
        passwordLength: GMAIL_CONFIG.appPassword?.length,
        testEmailSentTo: GMAIL_CONFIG.gmailAddress,
      }
    });
  } catch (error) {
    console.error('❌ SMTP test failed:', error);
    
    let errorDetails = error.message;
    let instructions = '';
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      instructions = `

🔧 HOW TO FIX GMAIL AUTHENTICATION:

1. Enable 2-Step Verification
   → Go to https://myaccount.google.com/security
   → Click "2-Step Verification" and follow the setup

2. Generate App Password
   → Go to https://myaccount.google.com/apppasswords
   → Select "Mail" as the app
   → Select "Other (Custom name)" and type "KreativLab CRM"
   → Click "Generate"

3. Copy the Password
   → Google will show a 16-character password with spaces
   → REMOVE ALL SPACES before using it
   → Example: "abcd efgh ijkl mnop" becomes "abcdefghijklmnop"

4. Update Server Code
   → Open /supabase/functions/server/index.tsx
   → Find GMAIL_CONFIG (around line 17)
   → Update appPassword with your new 16-character password (no spaces)

5. Test Again
   → Click the "Test SMTP" button to verify it works
      `;
    }
    
    return c.json({
      success: false,
      error: 'SMTP authentication failed',
      details: errorDetails + instructions,
      errorCode: error.code,
      responseCode: error.responseCode,
    }, 500);
  }
});

// Email blast endpoint
app.post("/make-server-aed69b82/send-email", async (c) => {
  try {
    const { recipients, subject, message, attachments } = await c.req.json();
    
    console.log("📧 Email blast request:", {
      recipientCount: recipients?.length || 0,
      subject,
      hasAttachments: !!attachments?.length,
      logoUrl: EMAIL_LOGO_URL,
    });
    
    if (!recipients || recipients.length === 0) {
      return c.json({ success: false, error: 'No recipients provided' }, 400);
    }
    
    const transporter = await createTransporter();
    
    // Process attachments
    let mailAttachments = [];
    if (attachments && attachments.length > 0) {
      mailAttachments = attachments.map((att: any) => {
        // Handle base64 data URL format (data:mime/type;base64,content)
        const content = att.content.includes(',') 
          ? att.content.split(',')[1] 
          : att.content;
        
        return {
          filename: att.filename,
          content: content,
          encoding: 'base64',
          contentType: att.contentType || 'application/octet-stream'
        };
      });
      console.log(`📎 Processing ${mailAttachments.length} attachment(s)`);
    }
    
    // Format message content (preserve line breaks)
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Avenir', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
          .email-wrapper { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ff77a4 0%, #ff5a8f 100%); color: white; padding: 40px 30px; text-align: center; }
          .logo-container { background: white; border-radius: 12px; padding: 20px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .logo { max-width: 200px; height: auto; display: block; }
          .company-name { font-family: 'Avenir', Arial, sans-serif; font-size: 32px; margin: 0; color: white; letter-spacing: 0.5px; }
          .content { background: white; padding: 35px 30px; }
          .message-content { font-size: 15px; line-height: 1.7; color: #444; }
          .signature { margin-top: 30px; padding-top: 25px; border-top: 2px solid #ffe9f2; }
          .signature-name { margin: 0; font-size: 16px; font-weight: bold; color: #ff77a4; }
          .signature-email { margin: 5px 0 0 0; color: #666; font-size: 14px; }
          .footer { text-align: center; padding: 20px 30px; background: #ffe9f2; color: #666; font-size: 12px; }
          .footer-text { margin: 5px 0; font-size: 10px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="email-wrapper">
            <div class="header">
              <div class="logo-container">
                <img src="${EMAIL_LOGO_URL || 'https://via.placeholder.com/200x80/ff77a4/white?text=Happy+Teeth'}" alt="Happy Teeth Support Services" class="logo" />
              </div>
            </div>
            <div class="content">
              <div class="message-content">
                ${formattedMessage}
              </div>
              <div class="signature">
                <p class="signature-name">${GMAIL_CONFIG.senderName}</p>
                <p class="signature-email">${GMAIL_CONFIG.gmailAddress}</p>
              </div>
            </div>
            <div class="footer">
              <p class="footer-text">
                This email was sent from KreativLab CRM
              </p>
              <p style="margin: 8px 0; color: #444;"><strong>${GMAIL_CONFIG.senderName}</strong></p>
              <p style="margin: 5px 0; color: #444;">📞 <strong>${GMAIL_CONFIG.phone}</strong></p>
              <p style="margin: 5px 0; color: #666;">${GMAIL_CONFIG.gmailAddress}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send emails
    const results = [];
    const errors = [];
    
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: `"${GMAIL_CONFIG.senderName}" <${GMAIL_CONFIG.gmailAddress}>`,
          to: recipient.email,
          subject: subject,
          html: htmlMessage,
          attachments: mailAttachments,
        };
        
        await transporter.sendMail(mailOptions);
        results.push({ email: recipient.email, success: true });
        console.log(`✅ Email sent to: ${recipient.email}`);
      } catch (error) {
        console.error(`❌ Failed to send to ${recipient.email}:`, error);
        
        let errorMessage = error.message;
        if (error.code === 'EAUTH' || error.responseCode === 535) {
          errorMessage = `Gmail Auth Failed - Check 2-Step Verification & App Password for ${GMAIL_CONFIG.gmailAddress}`;
        }
        
        errors.push({ email: recipient.email, error: errorMessage });
        results.push({ email: recipient.email, success: false, error: errorMessage });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`📊 Email blast complete: ${successCount} sent, ${failureCount} failed`);
    
    return c.json({
      success: true,
      message: `Sent ${successCount} of ${recipients.length} emails`,
      results,
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error("❌ Email blast error:", error);
    
    let userMessage = `Email blast failed: ${error.message}`;
    
    // Check for authentication error
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      userMessage = `Gmail Authentication Failed - Unable to send emails.\n\nRequired Setup:\n1. Enable 2-Step Verification on ${GMAIL_CONFIG.gmailAddress}\n2. Generate a new App Password at: https://myaccount.google.com/apppasswords\n3. Update credentials in server code\n\nTechnical Error: ${error.message}`;
    }
    
    return c.json({ 
      success: false, 
      error: userMessage 
    }, 500);
  }
});

// ============================================
// LEADS CRUD OPERATIONS
// ============================================

// Create lead
app.post("/make-server-aed69b82/leads", async (c) => {
  try {
    const lead = await c.req.json();
    const allLeads = (await kv.get("leads")) || [];
    const newLead = {
      ...lead,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    allLeads.push(newLead);
    await kv.set("leads", allLeads);
    return c.json({ success: true, lead: newLead });
  } catch (error) {
    console.error("Error creating lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get all leads
app.get("/make-server-aed69b82/leads", async (c) => {
  try {
    const leads = (await kv.get("leads")) || [];
    return c.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Update lead
app.put("/make-server-aed69b82/leads/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const updates = await c.req.json();
    const allLeads = (await kv.get("leads")) || [];
    const index = allLeads.findIndex((lead: any) => lead.id === id);
    
    if (index === -1) {
      return c.json({ success: false, error: "Lead not found" }, 404);
    }
    
    allLeads[index] = { ...allLeads[index], ...updates, updatedAt: new Date().toISOString() };
    await kv.set("leads", allLeads);
    return c.json({ success: true, lead: allLeads[index] });
  } catch (error) {
    console.error("Error updating lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Delete lead
app.delete("/make-server-aed69b82/leads/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    const allLeads = (await kv.get("leads")) || [];
    const filteredLeads = allLeads.filter((lead: any) => lead.id !== id);
    await kv.set("leads", filteredLeads);
    return c.json({ success: true, message: "Lead deleted" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// GOOGLE MAPS LEAD DISCOVERY SYSTEM (USA ONLY)
// ============================================

app.post("/make-server-aed69b82/scrape-leads", async (c) => {
  try {
    const { zipCode, city, state, mustHavePhone, mustHaveWebsite, mustHaveEmail } = await c.req.json();
    
    console.log("🔍 Lead Discovery Request:", { zipCode, city, state, mustHavePhone, mustHaveWebsite, mustHaveEmail });
    
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    
    // Require Google Maps API key
    if (!GOOGLE_MAPS_API_KEY) {
      console.error("❌ Google Maps API key not configured");
      return c.json({ 
        success: false, 
        error: 'Lead Discovery System requires Google Maps API configuration',
        results: [],
        mode: 'error'
      }, 500);
    }
    
    // Build location query with USA enforcement
    const locationQuery = [city, state, zipCode, 'USA'].filter(Boolean).join(', ');
    console.log(`🗺️  Google Maps Search: "dentist ${locationQuery}"`);
    
    // Use Google Places API Text Search
    const searchQuery = `dentist ${locationQuery}`;
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&region=us&key=${GOOGLE_MAPS_API_KEY}`;
    
    const googleResponse = await fetch(googleUrl);
    
    if (!googleResponse.ok) {
      throw new Error(`Google Maps API request failed: ${googleResponse.status}`);
    }
    
    const googleData = await googleResponse.json();
    
    // Check API response status
    if (googleData.status === 'ZERO_RESULTS') {
      console.log(`⚠️ No dental clinics found in ${locationQuery}`);
      return c.json({ 
        success: true, 
        results: [],
        mode: 'professional',
        dataSource: 'google_maps',
        message: 'No dental clinics found in this area. Try a different location.'
      });
    }
    
    if (googleData.status !== 'OK') {
      // Special handling for REQUEST_DENIED error
      if (googleData.status === 'REQUEST_DENIED') {
        console.error(`❌ Google Maps API Key Error: ${googleData.error_message}`);
        const errorMsg = googleData.error_message?.includes('referer restrictions') 
          ? 'Google Maps API Key has referrer restrictions. For server-side use, you need an API key WITHOUT referrer restrictions. Please create a new API key or remove restrictions from the existing one.'
          : `Google Maps API Key Error: ${googleData.error_message || 'REQUEST_DENIED'}`;
        
        return c.json({ 
          success: false, 
          error: errorMsg,
          results: [],
          mode: 'error',
          fixInstructions: 'Go to Google Cloud Console → APIs & Services → Credentials �� Create a new API key OR edit existing key to remove HTTP referrer restrictions for server-side use.'
        }, 403);
      }
      
      throw new Error(`Google Maps API error: ${googleData.status}${googleData.error_message ? ' - ' + googleData.error_message : ''}`);
    }
    
    if (!googleData.results || googleData.results.length === 0) {
      console.log(`⚠️ No results returned from Google Maps`);
      return c.json({ 
        success: true, 
        results: [],
        mode: 'professional',
        dataSource: 'google_maps',
        message: 'No dental clinics found. Try adjusting your search.'
      });
    }
    
    console.log(`✅ Google Maps Found: ${googleData.results.length} dental locations`);
    
    // Process each result with Place Details API for complete information
    const dentalLeads = await Promise.all(
      googleData.results.slice(0, 50).map(async (place: any) => {
        const placeId = place.place_id;
        let detailedInfo: any = {};
        
        // Fetch detailed place information
        try {
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry,address_components,business_status&key=${GOOGLE_MAPS_API_KEY}`;
          const detailsResponse = await fetch(detailsUrl);
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            if (detailsData.status === 'OK') {
              detailedInfo = detailsData.result;
            }
          }
        } catch (error) {
          console.warn(`⚠️ Could not fetch details for ${place.name}:`, error);
        }
        
        // Extract address components
        const addressComponents = detailedInfo.address_components || place.address_components || [];
        let extractedCity = '';
        let extractedState = '';
        let extractedZipCode = '';
        let extractedCountry = '';
        
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            extractedCity = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            extractedState = component.short_name;
          } else if (component.types.includes('postal_code')) {
            extractedZipCode = component.long_name;
          } else if (component.types.includes('country')) {
            extractedCountry = component.short_name;
          }
        });
        
        // USA FILTER: Only return results from United States
        if (extractedCountry && extractedCountry !== 'US') {
          console.log(`���� Filtered non-US result: ${place.name} (${extractedCountry})`);
          return null;
        }
        
        // Skip if business is permanently closed
        if (detailedInfo.business_status === 'CLOSED_PERMANENTLY') {
          console.log(`🚫 Filtered closed business: ${place.name}`);
          return null;
        }
        
        const name = detailedInfo.name || place.name;
        const website = detailedInfo.website || '';
        const phone = detailedInfo.formatted_phone_number || '';
        const address = detailedInfo.formatted_address || place.formatted_address || '';
        
        const lat = detailedInfo.geometry?.location?.lat || place.geometry?.location?.lat;
        const lng = detailedInfo.geometry?.location?.lng || place.geometry?.location?.lng;
        
        return {
          name: name,
          email: '', // Google Maps does not provide email addresses (complies with privacy)
          emailGenerated: false,
          company: name,
          phone: phone, // Real phone from Google Maps public data
          address: address,
          website: website, // Real website from Google Maps public data
          city: extractedCity || city || '',
          state: extractedState || state || '',
          zipCode: extractedZipCode || zipCode || '',
          latitude: lat,
          longitude: lng,
          rating: (detailedInfo.rating || place.rating || '').toString(),
          reviews: detailedInfo.user_ratings_total || place.user_ratings_total || 0,
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
          source: 'google_maps'
        };
      })
    );
    
    // Filter out null results (non-US locations and closed businesses)
    let validLeads = dentalLeads.filter((lead: any) => lead !== null);
    
    console.log(`✅ USA Filter: ${dentalLeads.length} → ${validLeads.length} US dental clinics`);
    
    // Deduplication by name and location
    const uniqueLeads = validLeads.filter((lead: any, index: number, self: any[]) => 
      index === self.findIndex((l: any) => {
        if (!l.latitude || !lead.latitude) return l.name === lead.name;
        const latMatch = Math.abs(parseFloat(l.latitude) - parseFloat(lead.latitude)) < 0.0001;
        const lonMatch = Math.abs(parseFloat(l.longitude) - parseFloat(lead.longitude)) < 0.0001;
        const nameMatch = l.name === lead.name;
        return (latMatch && lonMatch) || nameMatch;
      })
    );
    
    console.log(`🧹 Deduplicated: ${validLeads.length} → ${uniqueLeads.length}`);
    
    // Apply user filters
    let filteredLeads = uniqueLeads.filter((lead: any) => {
      if (mustHavePhone && !lead.phone) {
        return false;
      }
      if (mustHaveEmail && !lead.email) {
        // Note: Google Maps doesn't provide emails for privacy/data protection
        return false;
      }
      if (mustHaveWebsite && !lead.website) {
        return false;
      }
      return true;
    });
    
    console.log(`📊 Filter Results: ${uniqueLeads.length} → ${filteredLeads.length} (Phone: ${mustHavePhone}, Email: ${mustHaveEmail}, Website: ${mustHaveWebsite})`);
    
    // Limit to 50 results
    filteredLeads = filteredLeads.slice(0, 50);
    
    console.log(`✅ Lead Discovery Complete: ${filteredLeads.length} qualified dental clinics`);
    
    return c.json({ 
      success: true, 
      results: filteredLeads,
      mode: 'professional',
      dataSource: 'google_maps',
      message: filteredLeads.length > 0 
        ? `Found ${filteredLeads.length} dental clinics in ${locationQuery}` 
        : 'No dental clinics match your filter criteria. Try removing some filters.'
    });
    
  } catch (error) {
    console.error("❌ Lead Discovery Error:", error);
    return c.json({ 
      success: false, 
      error: `Lead Discovery System Error: ${error.message}`,
      results: [],
      mode: 'error'
    }, 500);
  }
});

// ============================================
// START SERVER
// ============================================

Deno.serve(app.fetch);
