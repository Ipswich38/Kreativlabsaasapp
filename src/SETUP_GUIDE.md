# KreativLab CRM - Production Setup Guide

## 🚀 Quick Start (5 Minutes)

Your CRM is already connected to Supabase and working! Follow these steps to enable production features.

---

## ✅ Current Status

- ✅ **Database**: Fully operational
- ✅ **Lead Management**: Create, read, update, delete - Working
- ⚠️ **Web Scraper**: Demo mode (mock data)
- ⚠️ **Email Blast**: Demo mode (logs only)

---

## 🔧 Enable Production Features

### Option 1: Use Demo Mode (No Setup Required)
Your app works right now! The web scraper returns realistic mock data, and email blast logs to console.

**Perfect for:**
- Testing the interface
- Training your team
- Demonstrating to clients
- Development

### Option 2: Enable Production Mode (5-10 Minutes)

Follow these steps to enable real Google Maps scraping and email sending.

---

## 📍 Step 1: Enable Google Maps Scraping (5 minutes)

### 1.1 Get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create or Select Project**
   - Click "Select a project" at the top
   - Click "New Project"
   - Name it "KreativLab CRM" or similar
   - Click "Create"

3. **Enable Required APIs**
   - In the left menu, go to "APIs & Services" → "Library"
   - Search and enable each of these:
     - ✅ **Places API (New)**
     - ✅ **Maps JavaScript API**  
     - ✅ **Geocoding API**

4. **Create API Key**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key (save it somewhere safe)

5. **Restrict API Key (Important for Security)**
   - Click on your new API key
   - Under "Application restrictions":
     - Select "IP addresses"
     - Add your Supabase Edge Function IP (or use "HTTP referrers" for web)
   - Under "API restrictions":
     - Select "Restrict key"
     - Check: Places API, Maps JavaScript API, Geocoding API
   - Click "Save"

### 1.2 Add API Key to Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Select your project

2. **Add Secret**
   - Go to: Settings → Edge Functions → Secrets
   - Click "Add New Secret"
   - Name: `GOOGLE_MAPS_API_KEY`
   - Value: Paste your Google Maps API key
   - Click "Save"

3. **Restart Edge Functions**
   - The secret will be available after a few seconds
   - Test by running a search in the Lead Generation page

### 1.3 Test It Works

1. Go to "Lead Generation" in your CRM
2. Enter a location (e.g., ZIP: 10001, City: New York, State: NY)
3. Click "Find Dental Clinics"
4. You should see a green "✓ Live Data" badge
5. Results will include real businesses with Google Maps links

**Success!** You now have real-time lead generation! 🎉

---

## 📧 Step 2: Enable Email Blast (5 minutes)

### 2.1 Choose Email Provider

**Recommended: Resend (Easiest)**

1. **Sign up for Resend**
   - Visit: https://resend.com
   - Sign up for free account
   - Get 100 emails/day free

2. **Get API Key**
   - Go to: API Keys section
   - Click "Create API Key"
   - Name it "KreativLab CRM"
   - Copy the API key

3. **Add to Supabase**
   - Go to: Supabase Dashboard → Settings → Edge Functions → Secrets
   - Add New Secret:
     - Name: `EMAIL_API_KEY`
     - Value: Your Resend API key
   - Click "Save"

4. **Update Backend Code**
   - Edit `/supabase/functions/server/index.tsx`
   - Find the email endpoint
   - Add Resend integration (example provided in README)

**Alternative: SendGrid or Amazon SES**
- See README.md for setup instructions

---

## 💡 Tips & Best Practices

### For Google Maps Scraping

✅ **DO:**
- Start with specific locations (city + state + ZIP)
- Use filters (must have phone/website) to reduce API calls
- Monitor your Google Cloud Console for usage
- Cache results in your database

❌ **DON'T:**
- Make broad searches without location
- Run unlimited searches (watch your budget)
- Share your API key publicly
- Forget to restrict your API key

### For Email Blast

✅ **DO:**
- Verify sender email domain
- Follow CAN-SPAM Act requirements
- Include unsubscribe links
- Test with small batches first

❌ **DON'T:**
- Send unsolicited emails
- Use purchased email lists
- Send from unverified domains

---

## 🔍 Troubleshooting

### "Demo Mode" still showing after adding API key

**Solution:**
1. Check API key is exactly named: `GOOGLE_MAPS_API_KEY`
2. Wait 30 seconds for secrets to propagate
3. Check Supabase logs for errors
4. Verify APIs are enabled in Google Cloud Console

### "API Error: REQUEST_DENIED"

**Solution:**
1. Make sure you enabled the APIs in Google Cloud
2. Check API key restrictions aren't blocking requests
3. Verify billing is enabled on your Google Cloud project

### No results found

**Solution:**
1. Try a more specific location (add ZIP code)
2. Remove filters temporarily to see all results
3. Try a major city first (e.g., "New York, NY")

### Email not sending

**Solution:**
1. Check `EMAIL_API_KEY` is set in Supabase
2. Verify email domain is verified with your provider
3. Check Supabase Edge Function logs for errors

---

## 📊 Monitoring Usage

### Google Maps API
- Dashboard: https://console.cloud.google.com
- Go to: APIs & Services → Dashboard
- View requests per day/month
- Set up billing alerts

### Email API
- **Resend**: Dashboard shows email count
- **SendGrid**: Analytics in dashboard
- **Amazon SES**: CloudWatch metrics

---

## 🎯 Next Steps

1. ✅ Add your API keys (Steps 1 & 2 above)
2. ✅ Test with a small search
3. ✅ Import a few leads to your database
4. ✅ Send a test email blast
5. ✅ Train your team on the interface
6. ✅ Set up billing alerts
7. ✅ Monitor API usage weekly

---

## 💬 Support

If you run into issues:

1. Check the browser console (F12) for errors
2. Check Supabase Edge Function logs
3. Verify API keys are correctly set
4. Review the main README.md for detailed docs

---

## 🎉 You're All Set!

Your production-ready CRM is now configured! 

- 💾 Database: Storing all your leads
- 🔍 Scraper: Finding real dental clinics
- 📧 Email: Reaching out to prospects
- 📊 Dashboard: Tracking everything

Happy lead hunting! 🚀
