# 🔧 FIX GOOGLE MAPS API KEY ERROR

## ❌ CURRENT ERROR

```
API Error: REQUEST_DENIED - API keys with referer restrictions cannot be used with this API.
```

---

## 🔍 WHY THIS HAPPENS

Your Google Maps API key has **HTTP referrer restrictions** (like `*.example.com/*`). These restrictions ONLY work for **browser/client-side** requests.

Our Lead Discovery System makes API calls from the **server backend** (Supabase Edge Functions), which doesn't send HTTP referrer headers. This causes Google to deny the request.

---

## ✅ SOLUTION: Create a Server-Side API Key

You need an API key **without referrer restrictions** for server-side use. Follow these steps:

### **Option 1: Create a NEW API Key (RECOMMENDED)**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials
   - Make sure you're in the correct project

2. **Create New API Key:**
   - Click **"+ CREATE CREDENTIALS"**
   - Select **"API key"**
   - A new API key will be created

3. **Configure the API Key:**
   - Click **"EDIT API KEY"** (or the pencil icon)
   - Name it: `"Server-Side Maps Key"` or similar
   - Under **"API restrictions"**:
     - Select **"Restrict key"**
     - Enable these APIs:
       ✅ **Places API**
       ✅ **Geocoding API** (optional, but recommended)
   - Under **"Application restrictions"**:
     - Select **"None"** (for testing)
     - OR select **"IP addresses"** and add your server IPs (more secure)
   - Click **"SAVE"**

4. **Copy the API Key:**
   - Copy the full API key (looks like: `AIzaSy...`)

5. **Update Environment Variable:**
   - Go to your Supabase Dashboard
   - Navigate to: **Settings → Edge Functions → Secrets**
   - Find `GOOGLE_MAPS_API_KEY`
   - Update with your new API key
   - Click **"Save"**

6. **Test the System:**
   - Go to Lead Discovery in your CRM
   - Try searching for dental clinics
   - Should now work! ✅

---

### **Option 2: Remove Restrictions from Existing Key (NOT RECOMMENDED)**

⚠️ **Warning:** This makes your API key less secure since it can be used from anywhere.

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Edit Your Existing API Key:**
   - Find your current API key
   - Click the **"EDIT"** (pencil) icon

3. **Remove Referrer Restrictions:**
   - Under **"Application restrictions"**:
   - Change from **"HTTP referrers (web sites)"** 
   - To **"None"**
   - Click **"SAVE"**

4. **Test the System:**
   - The Lead Discovery System should now work

⚠️ **Security Note:** Without restrictions, anyone who gets your API key can use it. Monitor your usage in Google Cloud Console.

---

## 🎯 BEST PRACTICE: Two API Keys

For production security, use **TWO separate API keys**:

| Key Type | Restrictions | Used For |
|----------|-------------|----------|
| **Client-Side Key** | HTTP referrer restrictions (`*.yourwebsite.com/*`) | Frontend maps display |
| **Server-Side Key** | No referrer restrictions OR IP restrictions | Backend Lead Discovery |

---

## 🔐 SECURITY RECOMMENDATIONS

### **For Production:**

1. **Enable Billing Alerts:**
   - Set up billing alerts in Google Cloud Console
   - Get notified if API usage spikes

2. **Use IP Restrictions (Most Secure):**
   - Instead of "None", select **"IP addresses"**
   - Add your Supabase Edge Function IPs
   - Contact Supabase support for their IP ranges

3. **Enable Only Required APIs:**
   - ✅ Places API
   - ✅ Geocoding API (optional)
   - ❌ Disable all other APIs

4. **Set Usage Quotas:**
   - Go to: APIs & Services → Library → Places API → Quotas
   - Set daily request limits to prevent abuse

5. **Monitor Usage:**
   - Regularly check: APIs & Services → Dashboard
   - Review usage patterns and costs

---

## 🧪 TESTING CHECKLIST

After updating the API key:

- [ ] Search for dental clinics in Los Angeles, CA
- [ ] Verify results appear (should get 10-50 results)
- [ ] Check that phone numbers are real
- [ ] Check that websites are real
- [ ] Verify all results are in USA only
- [ ] Test with ZIP code search (e.g., 90210)
- [ ] Test filters: "Must have phone"
- [ ] Test filters: "Must have website"

---

## 💰 GOOGLE MAPS API PRICING

Be aware of Google Maps API costs:

| API Call | Cost (per request) |
|----------|-------------------|
| Text Search | $0.032 |
| Place Details | $0.017 |

**Example Cost Calculation:**
- 1 Lead Discovery search = 1 Text Search + up to 50 Place Details
- Cost per search ≈ $0.032 + (50 × $0.017) = **$0.88 per search**
- Google gives **$200 free credit per month**
- That's ~227 free searches per month

**Cost Optimization:**
- The system limits to 50 results per search
- Results are sent to frontend immediately (no caching yet)
- Consider implementing caching for repeat searches

---

## 🆘 TROUBLESHOOTING

### **Still getting REQUEST_DENIED?**
- Wait 1-2 minutes for API key changes to propagate
- Clear browser cache
- Verify the API key in Supabase matches the one in Google Cloud Console
- Check that Places API is **enabled** in your Google Cloud project

### **Getting OVER_QUERY_LIMIT?**
- You've exceeded your daily quota
- Wait 24 hours OR enable billing in Google Cloud Console

### **Getting INVALID_REQUEST?**
- Check that you entered a valid City, State, or ZIP code
- Try a different location

### **No results found?**
- Try a major city first (Los Angeles, New York, Miami)
- Remove filters like "Must have phone" or "Must have website"
- Check the browser console for detailed error messages

---

## 📞 SUPPORT

If you continue having issues:

1. **Check Server Logs:**
   - Open browser console (F12)
   - Look for red error messages
   - Send screenshots to your developer

2. **Verify API Key:**
   - Copy your API key from Supabase secrets
   - Test it manually: `https://maps.googleapis.com/maps/api/place/textsearch/json?query=dentist%20los%20angeles&key=YOUR_KEY_HERE`
   - Should return JSON with results

3. **Contact Google Cloud Support:**
   - If billing or quota issues persist
   - Visit: https://cloud.google.com/support

---

## ✅ SUCCESS CHECKLIST

Once fixed, you should see:

```
✅ Console Log Example:
🔍 Lead Discovery Request: { city: "Los Angeles", state: "CA", ... }
🗺️  Google Maps Search: "dentist Los Angeles, CA, USA"
✅ Google Maps Found: 20 dental locations
✅ USA Filter: 20 → 20 US dental clinics
🧹 Deduplicated: 20 → 18
📊 Filter Results: 18 → 15
✅ Lead Discovery Complete: 15 qualified dental clinics
```

```
✅ Results Display:
- Real dental clinic names
- Real phone numbers (or empty)
- Real websites (or empty)
- Real addresses in USA
- Google Maps links work
```

---

## 🚀 NEXT STEPS

After fixing the API key:

1. ✅ Test the Lead Discovery System thoroughly
2. ✅ Set up billing alerts in Google Cloud Console
3. ✅ Enable IP restrictions for production security
4. ✅ Monitor API usage and costs
5. ✅ Document your API key management process

**The Lead Discovery System is production-ready once the API key is configured correctly!** 🎯

---

**Last Updated:** API Key Configuration Guide v1.0  
**Related Files:** `/supabase/functions/server/index.tsx` (line 483)
