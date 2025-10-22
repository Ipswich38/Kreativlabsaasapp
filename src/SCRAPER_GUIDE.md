# Web Scraper Feature Guide

## 🎯 What It Does

The KreativLab CRM web scraper uses Google Maps API to find dental clinics in any location and extract their contact information automatically.

---

## 🔍 How It Works

### Input Parameters

```
Location:
├── ZIP Code: 31320 (optional)
├── City: Midway (optional)
├── State: GA (optional)
└── Note: At least one required

Filters:
├── Must have phone ✓
└── Must have website ✓
```

### API Workflow

```
1. User enters location → CRM Frontend
2. Frontend sends request → Supabase Edge Function
3. Edge Function calls → Google Places Text Search API
4. For each result → Google Place Details API
5. Extract & format data → Return to frontend
6. Display results → Import to database
```

---

## 📊 Data Extracted

### For Each Business Found:

| Field | Source | Example |
|-------|--------|---------|
| **Name** | Google Maps | "Bright Smile Dental Care" |
| **Company** | Same as name | "Bright Smile Dental Care" |
| **Email** | Generated* | info@brightsmile.com |
| **Phone** | Google Maps | +1 912-555-0101 |
| **Address** | Google Maps | "123 Main St, Midway, GA 31320" |
| **Website** | Google Maps | brightsmile.com |
| **Rating** | Google Maps | 4.8 |
| **Reviews** | Google Maps | 342 |
| **Google Maps URL** | Generated | Direct link to listing |
| **Place ID** | Google Maps | Unique identifier |

\* *Email addresses are intelligently generated based on the business website domain (info@domain.com, contact@domain.com, etc.)*

---

## ⚙️ Technical Details

### Google Places APIs Used

1. **Text Search API**
   - Query: "dental clinic in [location]"
   - Returns: Up to 20 places
   - Cost: $32 per 1,000 requests

2. **Place Details API** (for each result)
   - Fields requested: name, address, phone, website, rating, reviews, url
   - Cost: $17 per 1,000 requests
   - Rate limit: 100 requests/second

### Phone Number Formatting

Input formats handled:
- `(912) 555-0101`
- `912-555-0101`
- `9125550101`
- `+1-912-555-0101`

Output format:
- `+1 912-555-0101` (standardized)

### Email Generation Logic

```typescript
if (website exists) {
  domain = extractDomain(website) // "brightsmile.com"
  email = "info@" + domain         // "info@brightsmile.com"
} else {
  cleanName = sanitize(name)       // "brightsmile"
  email = "contact@" + cleanName + ".com"
}
```

---

## 📈 Search Results

### Example Search Results (Production Mode)

**Location:** Midway, GA 31320

```json
[
  {
    "name": "Bright Smile Dental Care",
    "company": "Bright Smile Dental Care",
    "email": "info@brightsmile.com",
    "phone": "+1 912-555-0101",
    "address": "123 Main St, Midway, GA 31320, USA",
    "website": "brightsmile.com",
    "rating": 4.8,
    "reviews": 342,
    "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJ...",
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  },
  {
    "name": "Family Dentistry Plus",
    "company": "Family Dentistry Plus",
    "email": "contact@familydentistryplus.com",
    "phone": "+1 912-555-0102",
    "address": "456 Oak Ave, Midway, GA 31320, USA",
    "website": "familydentistryplus.com",
    "rating": 4.6,
    "reviews": 215,
    "googleMapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIK...",
    "placeId": "ChIJN1t_tDeuEmsRUsoyG83frY5"
  }
]
```

---

## 🎨 UI Features

### Results Display

- ✅ **Name column**: Business name
- ✅ **Email column**: Generated contact email
- ✅ **Phone column**: Formatted phone number
- ✅ **Website column**: Clickable link (opens in new tab)
- ✅ **Address column**: Full street address
- ✅ **Rating column**: Stars + review count
- ✅ **Actions column**: "View on Maps" link

### Mode Indicators

**Production Mode:**
```
✓ Live Data (green badge)
- Real Google Maps results
- Actual business information
- Clickable Google Maps links
```

**Demo Mode:**
```
Demo Mode (amber badge)
- Sample data for testing
- Realistic but not real
- Shows API key not configured
```

---

## 🔧 Advanced Features

### Filtering

**Must Have Phone:**
- ✅ Only returns businesses with phone numbers
- ❌ Skips listings without contact phone
- Reduces API costs by filtering early

**Must Have Website:**
- ✅ Only returns businesses with websites
- ❌ Skips listings without web presence
- Better quality leads for outreach

### Rate Limiting Protection

```typescript
// Built-in delay between Place Details calls
for (const place of results) {
  // Get place details
  await getPlaceDetails(place);
  
  // Wait 100ms before next call
  await delay(100);
}
```

Prevents hitting Google's rate limits while maintaining speed.

---

## 💡 Best Practices

### Search Strategy

✅ **Good searches:**
- "ZIP: 10001, City: New York, State: NY" - Specific
- "City: Los Angeles, State: CA" - Major city
- "ZIP: 90210" - Targeted area

❌ **Avoid:**
- "State: CA" only - Too broad (may hit limits)
- Empty fields - Won't return results
- Special characters in location

### Cost Optimization

1. **Use specific locations**
   - Reduces unnecessary results
   - Better targeting
   - Lower API costs

2. **Apply filters**
   - `mustHavePhone: true` - Skip non-contactable
   - `mustHaveWebsite: true` - Skip low-quality leads

3. **Cache results**
   - Import to database immediately
   - Don't re-search same location
   - Reference saved data

4. **Monitor usage**
   - Check Google Cloud Console
   - Set up billing alerts
   - Track searches per month

---

## 🚀 Production vs Demo Mode

### Demo Mode (Default)

**When active:**
- No `GOOGLE_MAPS_API_KEY` set in Supabase
- Returns 5 realistic sample businesses
- Always same results for testing
- Zero cost
- Perfect for development

**Shows:**
- Amber "Demo Mode" badge
- Warning message about API key
- Sample dental clinics for testing

### Production Mode

**When active:**
- `GOOGLE_MAPS_API_KEY` configured
- Real Google Maps API calls
- Actual business data
- API costs apply
- Real contact information

**Shows:**
- Green "✓ Live Data" badge
- Real search results
- Google Maps links work
- Accurate ratings & reviews

---

## 📱 Mobile Responsive

The scraper interface is fully responsive:

- **Desktop**: Full table view with all columns
- **Tablet**: Scrollable table
- **Mobile**: Stacked card view (auto-adapts)

---

## 🔐 Security Features

1. **API Key Protection**
   - Never exposed to frontend
   - Stored in Supabase secrets
   - Server-side only access

2. **Rate Limiting**
   - Built-in delays between requests
   - Respects Google's limits
   - Prevents abuse

3. **Input Validation**
   - Sanitizes location inputs
   - Prevents injection attacks
   - Validates parameters

4. **CORS Protection**
   - Backend validates requests
   - Origin checking
   - Token authentication

---

## 📊 Success Metrics

Track your scraping effectiveness:

```
Total Searches: Count of API calls
Results Found: Average per search
Import Rate: % of results imported
Cost Per Lead: Total API cost / leads imported
Quality Score: Leads with phone + website
```

---

## 🎯 Use Cases

### 1. Market Research
"How many dental clinics are in ZIP 10001?"
→ Quick market analysis

### 2. Lead Generation
"Find all dental clinics in Miami, FL with websites"
→ Qualified outreach list

### 3. Competitive Analysis
"Who are the top-rated dental clinics in my area?"
→ Rating comparison

### 4. Territory Planning
"Map dental clinics across multiple ZIP codes"
→ Sales territory design

---

## 🎉 Quick Start

1. **Enter Location** (ZIP/City/State)
2. **Set Filters** (optional)
3. **Click "Find Dental Clinics"**
4. **Review Results**
5. **Click "Import X Leads"**
6. **Done!** Leads now in database

---

## 💬 Troubleshooting

### No Results Found

**Check:**
- Location spelling (e.g., "Los Angeles" not "LA")
- At least one location field filled
- Not too specific (small towns may have no results)
- Try without filters first

### Demo Mode Won't Switch to Production

**Fix:**
1. Verify API key added to Supabase
2. Name must be exactly: `GOOGLE_MAPS_API_KEY`
3. Wait 30 seconds for secrets to load
4. Check Supabase logs for errors

### Google Maps Links Not Working

**Reason:**
- Demo mode uses placeholder URLs
- Enable production mode for real links
- Links only work with actual Place IDs

---

## 📚 Related Documentation

- **Main README**: `/README.md` - Full system documentation
- **Setup Guide**: `/SETUP_GUIDE.md` - API key configuration
- **Backend Code**: `/supabase/functions/server/index.tsx` - Implementation

---

**Happy scraping!** 🎯
