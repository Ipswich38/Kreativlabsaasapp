import { Hono } from "npm:hono@4.3.11";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger(console.log));

// ============================================
// GMAIL SMTP CONFIGURATION
// ============================================

// Save Gmail configuration
app.post("/make-server-aed69b82/gmail-config", async (c) => {
  try {
    const { gmailAddress, appPassword, senderName } = await c.req.json();
    
    if (!gmailAddress || !senderName) {
      return c.json({ 
        success: false, 
        error: "Gmail address and sender name are required" 
      }, 400);
    }
    
    // Get existing config to check if password exists
    const existingConfig = await kv.get("gmail:config");
    
    // If no password provided but one exists, keep the existing one
    let finalPassword = appPassword;
    if (!appPassword && existingConfig?.appPassword) {
      finalPassword = existingConfig.appPassword;
    } else if (!appPassword) {
      return c.json({ 
        success: false, 
        error: "App password is required for initial setup" 
      }, 400);
    }
    
    const config = {
      gmailAddress,
      appPassword: finalPassword,
      senderName,
    };
    
    await kv.set("gmail:config", config);
    console.log("✅ Gmail configuration saved:", gmailAddress);
    
    return c.json({ success: true, message: "Gmail configuration saved" });
  } catch (error) {
    console.error("Error saving Gmail config:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Get Gmail configuration
app.get("/make-server-aed69b82/gmail-config", async (c) => {
  try {
    const config = await kv.get("gmail:config");
    
    if (!config) {
      return c.json({ success: true, config: null });
    }
    
    // Return config without password for security
    return c.json({ 
      success: true, 
      config: {
        gmailAddress: config.gmailAddress,
        senderName: config.senderName,
        hasPassword: !!config.appPassword,
      }
    });
  } catch (error) {
    console.error("Error loading Gmail config:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// EMAIL SENDING
// ============================================

// Helper function to create SMTP transporter
async function createTransporter() {
  const config = await kv.get("gmail:config");
  
  if (!config || !config.gmailAddress || !config.appPassword) {
    throw new Error("Gmail not configured. Please configure Gmail in Settings first.");
  }
  
  const nodemailer = await import("npm:nodemailer@6.9.7");
  
  return nodemailer.default.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: config.gmailAddress,
      pass: config.appPassword,
    },
  });
}

// Test email endpoint
app.post("/make-server-aed69b82/test-email", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ success: false, error: "Email address is required" }, 400);
    }
    
    const config = await kv.get("gmail:config");
    if (!config) {
      return c.json({ 
        success: false, 
        error: "Gmail not configured. Please save your settings first." 
      }, 400);
    }
    
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: `"${config.senderName}" <${config.gmailAddress}>`,
      to: email,
      subject: 'Test Email from KreativLab CRM',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Avenir', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff77a4 0%, #ff5a8f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .content { background: white; padding: 30px; border: 1px solid #ffe9f2; border-top: none; border-radius: 0 0 10px 10px; }
            .badge { background: #ffe9f2; color: #ff77a4; padding: 5px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: 600; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🦷 Happy Teeth Support Services</div>
              <p>Test Email - Configuration Successful</p>
            </div>
            <div class="content">
              <h2 style="color: #ff77a4; margin-top: 0;">✅ Your Gmail SMTP is Working!</h2>
              <p>Congratulations! This test email confirms that your Gmail SMTP configuration is set up correctly.</p>
              
              <div class="badge">✓ Gmail Connected</div>
              
              <p><strong>What this means:</strong></p>
              <ul>
                <li>Your email campaigns will be sent successfully</li>
                <li>Recipients will see emails from: ${config.senderName}</li>
                <li>Your CRM is ready for production use</li>
              </ul>
              
              <p style="margin-top: 20px;">You can now send email campaigns to your dental clinic leads with confidence!</p>
            </div>
            <div class="footer">
              <p>Sent via KreativLab CRM | Powered by Happy Teeth Support Services</p>
              <p>This is a test email sent at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    console.log("✅ Test email sent to:", email);
    
    return c.json({ success: true, message: "Test email sent successfully" });
  } catch (error) {
    console.error("Error sending test email:", error);
    return c.json({ 
      success: false, 
      error: `Failed to send test email: ${error.message}` 
    }, 500);
  }
});

// Email blast endpoint
app.post("/make-server-aed69b82/send-email", async (c) => {
  try {
    const { recipients, subject, message, attachments } = await c.req.json();
    
    console.log("📧 Email blast request:", {
      recipientCount: recipients.length,
      subject,
      hasAttachments: !!attachments?.length,
    });
    
    const config = await kv.get("gmail:config");
    if (!config) {
      return c.json({ 
        success: false, 
        error: "Gmail not configured. Please configure Gmail in Settings first." 
      }, 400);
    }
    
    const transporter = await createTransporter();
    
    // Process attachments
    let mailAttachments = [];
    if (attachments && attachments.length > 0) {
      mailAttachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: att.content.split(',')[1], // Remove data URL prefix
        encoding: 'base64',
      }));
    }
    
    // Add Happy Teeth logo to email
    const logoUrl = 'https://i.imgur.com/YourLogoHere.png'; // You can upload the logo and replace this URL
    
    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Avenir', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff77a4 0%, #ff5a8f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: white; padding: 30px; border: 1px solid #ffe9f2; border-top: none; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 20px; padding: 20px; background: #ffe9f2; border-radius: 10px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🦷 Happy Teeth Support Services</div>
          </div>
          <div class="content">
            ${message}
          </div>
          <div class="footer">
            <p><strong>${config.senderName}</strong></p>
            <p style="margin: 5px 0;">${config.gmailAddress}</p>
            <p style="margin: 10px 0; font-size: 10px; color: #999;">
              This email was sent from KreativLab CRM
            </p>
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
          from: `"${config.senderName}" <${config.gmailAddress}>`,
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
        errors.push({ email: recipient.email, error: error.message });
        results.push({ email: recipient.email, success: false, error: error.message });
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
    return c.json({ 
      success: false, 
      error: `Email blast failed: ${error.message}` 
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
// WEB SCRAPING - OPENSTREETMAP
// ============================================

app.post("/make-server-aed69b82/scrape-leads", async (c) => {
  try {
    const { zipCode, city, state, mustHavePhone, mustHaveWebsite } = await c.req.json();
    
    console.log("🔍 Scraping request:", { zipCode, city, state, mustHavePhone, mustHaveWebsite });
    
    // Build search query
    let searchQuery = "dental clinic";
    if (city) searchQuery += ` ${city}`;
    if (state) searchQuery += ` ${state}`;
    if (zipCode) searchQuery += ` ${zipCode}`;
    
    // Search using Nominatim (OpenStreetMap)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=50&addressdetails=1&extratags=1`;
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'KreativLab-CRM/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }
    
    const results = await response.json();
    console.log(`📍 Found ${results.length} locations from OpenStreetMap`);
    
    // Transform results into leads
    const leads = results
      .map((place: any, index: number) => {
        const address = place.address || {};
        const name = place.display_name?.split(',')[0] || `Dental Clinic ${index + 1}`;
        
        // Extract contact info from extratags if available
        const phone = place.extratags?.phone || place.extratags?.['contact:phone'] || '';
        const website = place.extratags?.website || place.extratags?.['contact:website'] || '';
        
        return {
          name: name,
          email: '', // OSM doesn't provide emails
          company: name,
          phone: phone,
          address: place.display_name || '',
          website: website,
          city: address.city || address.town || address.village || city || '',
          state: address.state || state || '',
          zipCode: address.postcode || zipCode || '',
          latitude: place.lat,
          longitude: place.lon,
          source: 'OpenStreetMap',
        };
      })
      .filter((lead: any) => {
        // Apply filters
        if (mustHavePhone && !lead.phone) return false;
        if (mustHaveWebsite && !lead.website) return false;
        return true;
      });
    
    console.log(`✅ Returning ${leads.length} filtered leads`);
    
    return c.json({ success: true, leads });
  } catch (error) {
    console.error("Error scraping leads:", error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ============================================
// START SERVER
// ============================================

Deno.serve(app.fetch);
