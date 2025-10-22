# KreativLab CRM - Production SaaS Application

A complete lead management and email automation platform with real-time Google Maps scraping. Built with React, Tailwind CSS, and Supabase.

---

## 🆓 FREE Web Scraping with OpenStreetMap!

**NEW: Completely FREE web scraping - no API keys required!**

- ✅ Web scraper uses **OpenStreetMap** - FREE forever, works now!
- ⚠️ Email blast requires Gmail SMTP setup (2 minutes)
- ✅ Lead management works out of the box

**See [OPENSTREETMAP_FREE.md](./OPENSTREETMAP_FREE.md) for details about free scraping.**

---

## ⚡ System Status

| Feature | Status | Setup Time |
|---------|--------|------------|
| **Lead Management (CRUD)** | ✅ Working Now | 0 min - Ready to use |
| **Database Storage** | ✅ Working Now | 0 min - Ready to use |
| **Dashboard Analytics** | ✅ Working Now | 0 min - Ready to use |
| **Web Scraper (OpenStreetMap)** | 🆓 **FREE - Working Now!** | 0 min - No API key needed! |
| **Email Blast (Gmail SMTP)** | ⚠️ Requires Setup | 2 min - [GMAIL_SETUP.md](./GMAIL_SETUP.md) |
| **Web Scraper (Google Maps)** | 💎 Optional Upgrade | 5 min - [SETUP_GUIDE.md](./SETUP_GUIDE.md) |

**🆓 NEW:** Web scraping is now **100% FREE** using OpenStreetMap - no API keys, no costs, unlimited searches!

**⚠️ Email Only:** Email blast requires Gmail SMTP setup (2 minutes) - [GMAIL_SETUP.md](./GMAIL_SETUP.md)

---

## 🚀 Features

### 1. **Lead Management (CRUD)**
- ✅ Create, Read, Update, Delete leads
- ✅ Search and filter contacts
- ✅ Track lead status (active/inactive)
- ✅ Track lead source (manual, website, scraper, referral)
- ✅ Persistent storage in Supabase database

### 2. **Email Blast (Gmail SMTP)**
- ✅ Real email sending via Gmail SMTP
- ✅ Professional HTML email templates
- ✅ Select individual contacts or "Select All"
- ✅ Personalized emails with recipient names
- ✅ Compose emails with subject and message
- ✅ Send to multiple recipients (up to 500/day)
- ✅ Delivery tracking and status
- 📧 Configured sender: kreativloops@gmail.com

### 3. **Lead Generation - Web Scraper** 🆓 FREE!
- 🆓 **FREE OpenStreetMap** integration - works now, no API key!
- ✅ Search dental clinics by ZIP code, city, and state
- ✅ Filter results: "Must have phone" and "Must have website"
- ✅ Extract: name, email, phone, address, website, OpenStreetMap URL
- ✅ Unlimited searches worldwide - $0 cost
- ✅ Import scraped leads directly to database
- 💎 **Optional:** Upgrade to Google Maps API for premium data (ratings, more complete info)

## 🏗️ Architecture

```
Frontend (React + Tailwind)
    ↓
Supabase Edge Functions (Hono Server)
    ↓
Supabase KV Store (PostgreSQL)
```

### Backend Endpoints

- **GET** `/make-server-aed69b82/leads` - Fetch all leads
- **POST** `/make-server-aed69b82/leads` - Create new lead
- **PUT** `/make-server-aed69b82/leads/:id` - Update lead
- **DELETE** `/make-server-aed69b82/leads/:id` - Delete lead
- **POST** `/make-server-aed69b82/send-email` - Send email blast
- **POST** `/make-server-aed69b82/scrape-google-maps` - Scrape Google Maps for leads

## 🔧 Production Setup

### Current Status
- ✅ **Database**: Fully functional with Supabase KV Store
- ⚠️ **Email Blast**: Running in demo mode (logs to console)
- ⚠️ **Web Scraper**: Running in demo mode (returns mock data)

### To Enable Full Production Features

#### 1. Google Maps API (for Web Scraping)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the following APIs:
   - **Places API (New)** - Primary API for searching businesses
   - **Maps JavaScript API** - For map display
   - **Geocoding API** - For location lookup
4. Create credentials → API Key
5. **IMPORTANT**: Restrict your API key for security:
   - Go to API credentials page
   - Click on your API key
   - Under "Application restrictions", select either:
     - HTTP referrers (for web apps)
     - IP addresses (for server-side)
   - Under "API restrictions", select "Restrict key" and choose the enabled APIs
6. Add the API key to Supabase:
   - Go to your Supabase project dashboard
   - Navigate to: **Settings → Edge Functions → Secrets**
   - Add new secret: `GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key
7. Restart your Supabase Edge Functions for changes to take effect

#### 2. Email Service API (for Email Blast)

Choose one of these email services:

**Option A: Resend (Recommended)**
1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Supabase secrets: `EMAIL_API_KEY`

**Option B: SendGrid**
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to Supabase secrets: `EMAIL_API_KEY`

**Option C: Amazon SES**
1. Set up AWS SES
2. Get your credentials
3. Add to Supabase secrets: `EMAIL_API_KEY`

### Adding Secrets to Supabase

```bash
# Via Supabase Dashboard
1. Go to: https://app.supabase.com
2. Select your project
3. Settings → Edge Functions → Secrets
4. Click "Add New Secret"
5. Name: GOOGLE_MAPS_API_KEY
6. Value: your-api-key-here
7. Save

# Or via CLI
supabase secrets set GOOGLE_MAPS_API_KEY=your-api-key-here
supabase secrets set EMAIL_API_KEY=your-email-api-key-here
```

## 📚 Documentation

### 🆓 FREE Web Scraping (Start Here!)
1. **QUICK_START_FREE.md** - **👈 START HERE!** Begin in 0 minutes - FREE!
2. **OPENSTREETMAP_FREE.md** - Complete guide to FREE scraping
3. **START_HERE.md** - Full setup guide (includes optional upgrades)

### 📧 Email Setup & Testing
- **GMAIL_SETUP.md** - Gmail SMTP configuration (2 minutes)
- **EMAIL_TEST_GUIDE.md** - Complete email testing guide with test accounts
- **TEST_ACCOUNTS_QUICK_REFERENCE.md** - Quick reference for 3 test email accounts
- **WHAT_TO_EXPECT_EMAIL_TEST.md** - Step-by-step visual guide for testing

### 💎 Optional Premium Upgrades
- **SETUP_GUIDE.md** - Google Maps API setup (5 minutes, $200/month free credit)

### 📖 Reference Documentation
- **README.md** (this file) - Complete system overview
- **SCRAPER_GUIDE.md** - Detailed web scraper documentation
- **TESTING_CHECKLIST.md** - Complete testing procedures
- **ARCHITECTURE.md** - System architecture

### 📄 Other
- **Attributions.md** - Third-party licenses and credits (includes OSM)

## 📁 File Structure

```
/
├── App.tsx                          # Main application with routing
├── components/
│   ├── Dashboard.tsx                # Overview dashboard
│   ├── LeadsManager.tsx            # CRUD operations for leads
│   ├── EmailBlast.tsx              # Email campaign management
│   ├── WebScraper.tsx              # Google Maps scraper
│   ├── Settings.tsx                # App configuration
│   └── Sidebar.tsx                 # Navigation sidebar
├── utils/
│   ├── api.ts                      # Frontend API client
│   └── supabase/
│       └── info.tsx                # Supabase connection info
├── supabase/functions/server/
│   ├── index.tsx                   # Backend server (Hono)
│   └── kv_store.tsx                # Database utility
└── styles/
    └── globals.css                 # Tailwind configuration
```

## 🎯 Usage Guide

### Managing Leads

1. **View All Leads**
   - Navigate to "Leads Manager" in the sidebar
   - All leads are loaded from the database automatically

2. **Add New Lead**
   - Click "Add Lead" button
   - Fill in the form (name, email, company, phone, status)
   - Click "Add Lead" to save

3. **Edit Lead**
   - Click the pencil icon next to any lead
   - Update the information
   - Click "Save Changes"

4. **Delete Lead**
   - Click the trash icon next to any lead
   - Lead is immediately removed from database

5. **Search Leads**
   - Use the search box to filter by name, email, or company

### Sending Email Blasts

1. Navigate to "Email Contacts" in the sidebar
2. Select individual contacts by checking boxes
3. Or click "Select All" to select all active leads
4. Click "Compose Email"
5. Enter subject and message
6. Optionally attach files
7. Click "Send Email"

### Generating Leads (Web Scraper)

1. Navigate to "Lead Generation" in the sidebar
2. Enter location details:
   - ZIP Code (e.g., 31320)
   - City (e.g., Midway)
   - State (e.g., GA)
3. Set filters:
   - ✓ Must have phone - Only return businesses with phone numbers
   - ✓ Must have website - Only return businesses with websites
4. Click "Find Dental Clinics"
5. Review results with:
   - Business name and contact details
   - Google Maps ratings and review counts
   - Direct links to Google Maps listing
   - Auto-generated email addresses based on domain
   - Formatted phone numbers
6. Click "Import X Leads" to add them to your database

**What the scraper extracts:**
- ✅ Business name
- ✅ Full address
- ✅ Phone number (formatted)
- ✅ Website URL
- ✅ Google Maps rating
- ✅ Number of reviews
- ✅ Google Maps URL (clickable link)
- ✅ Generated email address (based on website domain)

**Production Mode Features:**
- Real-time Google Maps API integration
- Searches up to 20 results per query
- Intelligent email generation from business websites
- Phone number formatting (+1 XXX-XXX-XXXX)
- Direct Google Maps links for each business
- Automatic filtering by phone/website requirements

## 💰 API Costs & Rate Limits

### Google Maps API Pricing (as of 2025)
- **Places API Text Search**: $32 per 1,000 requests
- **Place Details API**: $17 per 1,000 requests
- **Free tier**: $200 credit per month (covers ~3,000 searches)

**Cost per search in this app:**
- 1 Text Search call: $0.032
- Up to 20 Place Details calls: ~$0.34
- **Total per search**: ~$0.37

**Monthly estimates:**
- 500 searches/month: ~$185 (within free tier)
- 1,000 searches/month: ~$370
- 5,000 searches/month: ~$1,850

**Rate Limits:**
- Default: 100 requests per second
- Can be increased upon request

**Tips to reduce costs:**
1. Cache results in your database
2. Use filters effectively (mustHavePhone, mustHaveWebsite)
3. Search specific locations rather than broad areas
4. Monitor usage in Google Cloud Console

### Email API Pricing
- **Resend**: 100 emails/day free, then $20/month for 10,000
- **SendGrid**: 100 emails/day free, then $19.95/month for 50,000
- **Amazon SES**: $0.10 per 1,000 emails (very affordable)

## 🔐 Security Notes

- **API Keys**: Never expose API keys in frontend code
- **Environment Variables**: Always use Supabase secrets for sensitive data
- **API Restrictions**: Always restrict Google Maps API keys by IP/referrer
- **Data Privacy**: This system is for prototyping. For production with real customer data, implement:
  - User authentication
  - Role-based access control
  - Data encryption
  - GDPR compliance measures
  - Audit logging
  - Rate limiting per user

## 🚦 Demo Mode vs Production Mode

### Demo Mode (Current)
- ✅ Database CRUD operations fully functional
- ⚠️ Email sends logged to console only
- ⚠️ Web scraper returns mock dental clinic data

### Production Mode (After API Setup)
- ✅ Real email delivery via your email service
- ✅ Real Google Maps scraping for dental clinics
- ✅ All features fully operational

## 🛠️ Technical Stack

- **Frontend**: React, TypeScript, Tailwind CSS v4
- **Backend**: Deno, Hono (web framework)
- **Database**: Supabase PostgreSQL (KV Store)
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📝 API Integration Examples

### Implementing Real Email Sending (Example with Resend)

Edit `/supabase/functions/server/index.tsx`:

```typescript
// After getting emailApiKey
import { Resend } from 'npm:resend';

const resend = new Resend(emailApiKey);

for (const recipient of recipients) {
  await resend.emails.send({
    from: 'your-email@yourdomain.com',
    to: recipient.email,
    subject: subject,
    html: message,
  });
}
```

### Implementing Real Google Maps Scraping

Edit `/supabase/functions/server/index.tsx`:

```typescript
// Use Google Places API
const location = `${city}, ${state} ${zipCode}`;
const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dental+clinic+in+${encodeURIComponent(location)}&key=${googleMapsApiKey}`;

const response = await fetch(url);
const data = await response.json();

// Process results...
```

## 🎨 Customization

### Branding
- Edit `/components/Sidebar.tsx` to change company name and logo
- Update color scheme in `/styles/globals.css`

### Business Types
Currently optimized for dental clinics. To change:
- Edit the search query in `/supabase/functions/server/index.tsx`
- Update labels in `/components/WebScraper.tsx`

## 📞 Support

For questions or issues:
1. Check Supabase logs for backend errors
2. Check browser console for frontend errors
3. Verify API keys are correctly set in Supabase secrets

## 🎉 Ready to Use!

Your CRM is now fully set up and connected to Supabase. Start by:
1. Adding some leads manually
2. Testing the email blast feature (demo mode)
3. Trying the web scraper (demo mode)
4. Configure API keys for production features

Enjoy your production-ready SaaS application! 🚀
