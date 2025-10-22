# KreativLab CRM - Production Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Tailwind)                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │    Leads     │  │    Email     │      │
│  │  Analytics   │  │  Management  │  │   Contacts   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │     Web      │  │   Settings   │                         │
│  │   Scraper    │  │     Page     │                         │
│  └──────────────┘  └──────────────┘                         │
│                                                               │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    HTTPS API Calls
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTIONS (Hono Server)           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /make-server-aed69b82/leads                           │
│  GET  /make-server-aed69b82/leads                           │
│  PUT  /make-server-aed69b82/leads/:id                       │
│  DELETE /make-server-aed69b82/leads/:id                     │
│                                                               │
│  POST /make-server-aed69b82/scrape-google-maps  🔑          │
│  POST /make-server-aed69b82/send-email          🔑          │
│                                                               │
└───────────┬───────────────────────┬─────────────────────────┘
            │                       │
            │                       │
    ┌───────▼────────┐    ┌────────▼─────────┐
    │   SUPABASE     │    │  EXTERNAL APIs   │
    │   PostgreSQL   │    │                  │
    │   KV Store     │    │  - Google Maps   │
    │                │    │  - Gmail SMTP    │
    └────────────────┘    └──────────────────┘
```

---

## 🔐 API Key Configuration

### Environment Variables (Supabase Secrets)

```
REQUIRED for Web Scraper:
├── GOOGLE_MAPS_API_KEY
│   ├── Purpose: Search Google Maps for businesses
│   ├── Used by: POST /scrape-google-maps
│   └── Without it: Returns 400 error

REQUIRED for Email Blast:
├── GMAIL_USER (kreativloops@gmail.com)
│   └── SMTP authentication
└── GMAIL_APP_PASSWORD (lqdzwfmhddfxjfpx)
    └── App-specific password

ALWAYS AVAILABLE (no setup):
├── SUPABASE_URL
├── SUPABASE_ANON_KEY
├── SUPABASE_SERVICE_ROLE_KEY
└── SUPABASE_DB_URL
```

---

## 📊 Data Flow

### Lead Management (No API Key Required)

```
User Action → Frontend Component → API Call → Edge Function
                                                    ↓
                                              KV Store Query
                                                    ↓
                                            PostgreSQL Database
                                                    ↓
                                              Return Data
                                                    ↓
                                           Update UI State
```

### Web Scraping (Requires GOOGLE_MAPS_API_KEY)

```
User Input (Location) → Frontend
                            ↓
                   API Call to Edge Function
                            ↓
                Check GOOGLE_MAPS_API_KEY exists
                            ↓
                    YES ─────────┬───────── NO
                     ↓                      ↓
            Google Places API       Return 400 Error
                     ↓                      ↓
            Text Search Request      Show Setup Message
                     ↓
            Get Place Details (for each)
                     ↓
            Extract Contact Info
                     ↓
            Format Phone Numbers
                     ↓
            Generate Emails
                     ↓
            Return Results Array
                     ↓
            Display in Frontend
                     ↓
            User Imports to Database
```

### Email Blast (Requires Gmail Credentials)

```
User Selects Leads → Frontend
                         ↓
                Compose Email
                         ↓
                API Call to Edge Function
                         ↓
        Check GMAIL_USER & GMAIL_APP_PASSWORD exist
                         ↓
                YES ─────────┬───────── NO
                 ↓                      ↓
         Create SMTP Connection  Return 400 Error
                 ↓                      ↓
         For Each Recipient      Show Setup Message
                 ↓
         Generate HTML Email
                 ↓
         Send via Gmail SMTP
                 ↓
         Track Success/Failure
                 ↓
         Return Results Summary
                 ↓
         Update Frontend Status
```

---

## 🔄 API Endpoints

### Lead Management

```typescript
// GET /leads
Request: None
Response: { leads: Lead[] }
Auth: Supabase Anon Key

// POST /leads
Request: { name, email, company, phone, status, source }
Response: { lead: Lead }
Auth: Supabase Anon Key

// PUT /leads/:id
Request: { name, email, company, phone, status }
Response: { lead: Lead }
Auth: Supabase Anon Key

// DELETE /leads/:id
Request: None
Response: { success: true }
Auth: Supabase Anon Key
```

### Web Scraping (Production Only)

```typescript
// POST /scrape-google-maps
Request: {
  zipCode: string,
  city: string,
  state: string,
  mustHavePhone: boolean,
  mustHaveWebsite: boolean
}

Success Response: {
  success: true,
  results: ScrapedBusiness[],
  totalFound: number,
  totalReturned: number
}

Error Response (No API Key): {
  success: false,
  error: "Google Maps API key not configured...",
  requiresSetup: true
}

Auth: Supabase Anon Key + GOOGLE_MAPS_API_KEY
```

### Email Blast (Production Only)

```typescript
// POST /send-email
Request: {
  recipients: Recipient[],
  subject: string,
  message: string,
  attachments?: Attachment[]
}

Success Response: {
  success: true,
  mode: 'production',
  results: EmailResult[],
  summary: {
    total: number,
    sent: number,
    failed: number
  }
}

Error Response (No Credentials): {
  success: false,
  error: "Gmail SMTP credentials not configured...",
  requiresSetup: true
}

Auth: Supabase Anon Key + GMAIL credentials
```

---

## 🗄️ Database Schema

### KV Store Table

```sql
CREATE TABLE kv_store_aed69b82 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Lead Object Structure

```typescript
interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  address?: string;
  website?: string;
  status: 'active' | 'inactive';
  source: 'manual' | 'website' | 'scraper' | 'referral';
  rating?: number;
  reviews?: number;
  googleMapsUrl?: string;
  placeId?: string;
  createdAt: string;
  updatedAt?: string;
}
```

---

## 🔌 External API Integrations

### Google Maps Places API

**Endpoints Used:**
1. **Text Search**
   - URL: `https://maps.googleapis.com/maps/api/place/textsearch/json`
   - Purpose: Search for businesses by location
   - Cost: $32 per 1,000 requests

2. **Place Details**
   - URL: `https://maps.googleapis.com/maps/api/place/details/json`
   - Purpose: Get detailed business information
   - Cost: $17 per 1,000 requests

**Fields Retrieved:**
- name
- formatted_address
- formatted_phone_number / international_phone_number
- website
- rating
- user_ratings_total
- url (Google Maps link)

### Gmail SMTP

**Configuration:**
- Host: smtp.gmail.com
- Port: 587
- Security: STARTTLS
- Auth: App Password

**Libraries Used:**
- nodemailer@6.9.7 (npm package)

---

## 🛡️ Security Architecture

### Frontend Security
```
✅ No API keys stored
✅ Only uses public Supabase Anon Key
✅ No sensitive data in localStorage
✅ HTTPS only
✅ CORS protected
```

### Backend Security
```
✅ API keys in environment variables only
✅ Server-side API calls only
✅ Request validation
✅ Error sanitization
✅ Rate limiting protection
✅ TLS encryption for SMTP
```

### Data Security
```
✅ Supabase RLS (Row Level Security)
✅ Encrypted data at rest
✅ Encrypted data in transit
✅ No plaintext passwords
✅ App passwords for Gmail
```

---

## 📈 Performance Considerations

### Frontend
- Lazy loading for routes
- Optimistic UI updates
- Debounced search inputs
- Cached API responses

### Backend
- Connection pooling for database
- Rate limiting between API calls
- Async/await for non-blocking operations
- Error recovery mechanisms

### Database
- Indexed KV store keys
- Efficient JSON queries
- Connection reuse
- Query optimization

---

## 🔧 Error Handling

### Frontend
```typescript
try {
  const result = await api.scrapeGoogleMaps(params);
  // Handle success
} catch (error) {
  if (error.message.includes('not configured')) {
    // Show setup instructions
  } else {
    // Show generic error
  }
}
```

### Backend
```typescript
if (!apiKey) {
  return c.json({ 
    success: false, 
    error: "API key not configured",
    requiresSetup: true
  }, 400);
}

try {
  // API call
} catch (error) {
  console.error("API error:", error);
  return c.json({ 
    success: false, 
    error: String(error) 
  }, 500);
}
```

---

## 🚀 Deployment

### Frontend
- Hosted on Figma Make platform
- React build optimized
- Tailwind CSS purged
- Assets bundled

### Backend
- Supabase Edge Functions
- Deno runtime
- Auto-scaling
- Global CDN

### Database
- Supabase PostgreSQL
- Automated backups
- Read replicas
- High availability

---

## 📊 Monitoring

### What to Monitor

**Frontend:**
- API call success rates
- Error frequencies
- User interactions
- Load times

**Backend:**
- Function invocation count
- Error rates
- Response times
- Database query performance

**External APIs:**
- Google Maps API quota
- Gmail sending limits
- Rate limit hits
- API costs

### Where to Monitor

**Supabase Dashboard:**
- Edge Function logs
- Database metrics
- API usage stats

**Google Cloud Console:**
- Places API requests
- Quota usage
- Billing alerts

**Gmail Account:**
- Sent email count
- Bounce rates
- Delivery status

---

## 🎯 Production Checklist

- [ ] `GOOGLE_MAPS_API_KEY` configured in Supabase
- [ ] `GMAIL_USER` configured in Supabase
- [ ] `GMAIL_APP_PASSWORD` configured in Supabase
- [ ] Google Cloud APIs enabled (Places, Maps, Geocoding)
- [ ] Gmail 2-Step Verification enabled
- [ ] API usage monitoring set up
- [ ] Billing alerts configured
- [ ] Error logging reviewed
- [ ] Backup strategy in place
- [ ] Team trained on usage

---

**Your production CRM architecture is ready!** 🚀
