# Email Tracking Debugging Guide

## Issue: Tracking Not Working

You reported that only "delivered" status is working, but recipient opens aren't being tracked.

## New Diagnostic Tools Added

### 1. Tracking Diagnostic Page (Creator Only)
- **Access**: Login as `kreativlab` → Look for "Tracking Diagnostic" in sidebar under "DEBUG TOOLS"
- **Features**:
  - Send test emails to yourself
  - Run full system diagnostic
  - Test tracking pixels manually
  - View tracking URLs
  - Check server configuration

### 2. Enhanced Server Logging
The server now logs every step of the tracking process:

```
🔍 Tracking pixel requested: email_123...
📦 Email record found: YES
📊 Current status: delivered, Opens: 0
✅ Updated to OPENED: contact@example.com (1x)
🔍 Verification - Status is now: opened, Opens: 1
```

## How to Debug Step-by-Step

### Step 1: Send a Test Email
1. Login as `kreativlab` (password: `272829`)
2. Go to "Tracking Diagnostic" in sidebar
3. Enter your email address
4. Click "Send Test"
5. Check your inbox

### Step 2: Open the Test Email
1. Open the email in your inbox
2. **IMPORTANT**: If you see "Show Images" or "Load Images", click it!
3. Wait 30 seconds

### Step 3: Check If It Worked
1. Go back to the app
2. Click "Run Full Diagnostic"
3. Check the diagnostic results:
   - ✅ Supabase URL should be correct
   - ✅ Fetch Sent Emails should work
   - ✅ Tracking Pixel Endpoint should return GIF
   - ✅ Server SUPABASE_URL should be set

### Step 4: Manual Pixel Test
If the email didn't work, try manual testing:
1. In "Test Tracking Pixels" section
2. Find your test email
3. Click "Test Pixel" button
4. Wait 10 seconds
5. Go to "Sent Emails" tab
6. Check if status changed to "Opened"

## Common Issues & Solutions

### Issue 1: Images Not Loading in Email
**Symptoms**: Email received but tracking doesn't work
**Solution**: 
- Gmail: Click "Display images below" or "Always display images from..."
- Outlook: Click "Click here to download pictures"
- Apple Mail: May have "Privacy Protection" - tracking won't work

### Issue 2: Tracking Pixel URL Wrong
**Symptoms**: Diagnostic shows wrong URL
**Check**:
```
Expected: https://[your-project].supabase.co/functions/v1/make-server-aed69b82/track-email-open/[id]
```
**Solution**: Check server logs for "🔗 Tracking pixel URL:" line

### Issue 3: Email Record Not Found
**Symptoms**: Server logs show "No email record found"
**Check**:
1. Go to diagnostic page
2. Run diagnostic
3. Check if "Fetch Sent Emails" passes
**Solution**: Email might not have been saved to database

### Issue 4: SUPABASE_URL Not Set on Server
**Symptoms**: Diagnostic shows "Not set" for Server SUPABASE_URL
**Solution**: Environment variable missing - contact admin

## What Should Work

### When You Send an Email:
```
Console Output:
✅ Gmail Multimail sent to contact@example.com
💾 Email record saved: email_1730227845_abc123
🔗 Tracking pixel URL: https://[project].supabase.co/functions/v1/make-server-aed69b82/track-email-open/email_1730227845_abc123
```

### When Recipient Opens Email:
```
Console Output:
🔍 Tracking pixel requested: email_1730227845_abc123
📦 Email record found: YES
📊 Current status: delivered, Opens: 0
✅ Updated to OPENED: contact@example.com (1x)
🔍 Verification - Status is now: opened, Opens: 1
```

### In the App:
- "Sent Emails" tab auto-refreshes every 10 seconds
- Status badge changes from "Delivered" to "Opened (1x)"
- Timestamp shows when opened

## Testing Checklist

Use this checklist to verify tracking works:

- [ ] Login as kreativlab
- [ ] Go to Tracking Diagnostic
- [ ] Send test email to yourself
- [ ] Receive email in inbox
- [ ] Open email and load images
- [ ] Run diagnostic after 30 seconds
- [ ] Verify diagnostic shows all green checkmarks
- [ ] Click "Test Pixel" button for any email
- [ ] Wait 10 seconds
- [ ] Go to "Sent Emails" tab
- [ ] Verify status changed to "Opened"
- [ ] Check browser console for errors
- [ ] Check server logs for tracking messages

## Server Logs to Check

Look for these log messages:

### Email Sending:
```
📷 Logo URL: https://...
✅ Gmail Multimail sent to [email]
💾 Email record saved: email_...
🔗 Tracking pixel URL: https://...
```

### Email Opening:
```
🔍 Tracking pixel requested: email_...
📦 Email record found: YES
📊 Current status: delivered, Opens: 0
✅ Updated to OPENED: [email] (1x)
🔍 Verification - Status is now: opened, Opens: 1
```

## Expected Tracking Pixel in Email HTML

The email should contain this at the end:
```html
<img src="https://[project].supabase.co/functions/v1/make-server-aed69b82/track-email-open/[tracking-id]" 
     width="1" 
     height="1" 
     style="display:block;border:none;" />
```

## Diagnostic Endpoint

New endpoint added for checking configuration:
```
GET /make-server-aed69b82/diagnostic/check-env
```

Returns:
```json
{
  "supabaseUrl": "https://[project].supabase.co",
  "hasAnonKey": true,
  "hasServiceKey": true,
  "trackingEndpoint": "https://[project].supabase.co/functions/v1/make-server-aed69b82/track-email-open/[id]",
  "serverTime": "2025-10-29T..."
}
```

## If Nothing Works

1. **Check browser console** for JavaScript errors
2. **Check server logs** for tracking pixel requests
3. **Try different email client** (Gmail web vs Outlook vs Apple Mail)
4. **Use diagnostic page** to manually test tracking pixel
5. **Copy tracking URL** and paste in browser - should return 1x1 GIF
6. **Verify email HTML** contains tracking pixel at the end

## Files Modified

- `/components/TrackingDiagnostic.tsx` - New diagnostic tool
- `/components/Sidebar.tsx` - Added debug tools section
- `/App.tsx` - Added tracking-diagnostic view
- `/supabase/functions/server/index.tsx` - Enhanced logging & diagnostic endpoint

## Next Steps

1. Login as kreativlab
2. Access Tracking Diagnostic from sidebar
3. Follow the testing checklist above
4. Report what you see in the diagnostic results
5. Check server console logs for the tracking messages

---

The tracking system is now fully instrumented with diagnostic tools. Use the Tracking Diagnostic page to debug exactly what's happening when emails are sent and opened.
