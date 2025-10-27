# 🚨 QUICK FIX GUIDE - Lead Discovery Error

## ❌ ERROR YOU'RE SEEING

```
API Error: REQUEST_DENIED - API keys with referer restrictions cannot be used with this API.
```

---

## ⚡ 5-MINUTE FIX

### **Step 1: Go to Google Cloud Console**
👉 **Click here:** https://console.cloud.google.com/apis/credentials

### **Step 2: Create New API Key**
1. Click the **"+ CREATE CREDENTIALS"** button at the top
2. Select **"API key"**
3. Your new API key will appear - **COPY IT IMMEDIATELY**

### **Step 3: Configure the API Key**
1. Click **"EDIT API KEY"** (or the pencil icon next to your new key)
2. **Name it:** "Server-Side Maps Key"
3. **API restrictions:**
   - Select **"Restrict key"**
   - Check ✅ **Places API**
   - Check ✅ **Geocoding API** (optional)
4. **Application restrictions:**
   - Select **"None"** ⚠️ (This is critical!)
5. Click **"SAVE"**

### **Step 4: Update Supabase**
1. Go to your Supabase Dashboard
2. Navigate to: **Settings** → **Edge Functions** → **Secrets**
3. Find the secret named: `GOOGLE_MAPS_API_KEY`
4. **Paste your new API key**
5. Click **"Save"**

### **Step 5: Test It**
1. Go back to your CRM Lead Discovery page
2. Search for: **City:** "Los Angeles" | **State:** "CA"
3. You should now get 10-50 real dental clinic results ✅

---

## 🔍 WHY THIS HAPPENS

Your current API key has **HTTP referrer restrictions** (like `*.yourwebsite.com/*`).

- ✅ **Referrer restrictions** = Works for **browser** requests
- ❌ **Referrer restrictions** = Does NOT work for **server** requests

Our Lead Discovery System runs on the **backend server** (Supabase Edge Functions), which doesn't send HTTP referrer headers. Google blocks the request because it can't verify the referrer.

**Solution:** You need an API key with **NO referrer restrictions** for server-side use.

---

## 🔐 SECURITY NOTE

⚠️ An API key without referrer restrictions can be used from anywhere. To keep it secure:

1. **Enable only required APIs:**
   - ✅ Places API
   - ✅ Geocoding API
   - ❌ Disable everything else

2. **Set billing alerts:**
   - Go to Google Cloud Console → Billing
   - Set alerts at $50, $100, $150

3. **Monitor usage:**
   - Check: APIs & Services → Dashboard
   - Review daily usage

4. **For production (advanced):**
   - Use **IP restrictions** instead of "None"
   - Contact Supabase support for their server IP addresses
   - Add those IPs to your API key restrictions

---

## 💰 COST WARNING

Each Lead Discovery search costs approximately **$0.88**:
- 1 Text Search = $0.032
- 50 Place Details = 50 × $0.017 = $0.85
- **Total ≈ $0.88 per search**

**Good News:** Google gives **$200 free credit per month**
- That's **~227 free searches per month**
- Monitor your usage to avoid unexpected charges

---

## 🆘 STILL NOT WORKING?

### **Check 1: Is the API enabled?**
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Search for **"Places API"**
3. Make sure it says **"API enabled"** ✅
4. If not, click **"ENABLE"**

### **Check 2: Wait for propagation**
- API key changes can take **1-2 minutes** to take effect
- Wait, then try again

### **Check 3: Verify the key in Supabase**
- Make sure you copied the **entire API key** (starts with `AIzaSy...`)
- No extra spaces or characters
- In Supabase secrets, it should be exactly as Google shows it

### **Check 4: Try a different location**
- Test with a major city: "New York, NY" or "Miami, FL"
- If that works, your original location might not have dental clinics

---

## ✅ SUCCESS CHECKLIST

Once working, you should see:

**In Browser Console:**
```
✅ Google Maps Found: 20 dental locations
✅ USA Filter: 20 → 20 US dental clinics
✅ Lead Discovery Complete: 15 qualified dental clinics
```

**On Screen:**
- List of real dental clinic names
- Real phone numbers
- Real websites
- Real addresses in USA
- Google Maps links

---

## 📞 NEED MORE HELP?

See the detailed guide: **FIX_GOOGLE_MAPS_API_KEY.md**

Or check the Admin Dashboard for setup instructions.

---

**Last Updated:** Quick Fix Guide v1.0
