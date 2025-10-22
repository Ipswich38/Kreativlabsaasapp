# KreativLab CRM - Testing Checklist

Use this checklist to verify all features are working correctly.

---

## ✅ Database Features (Should Already Work)

### Lead Management - Create
- [ ] Click "Leads Manager" in sidebar
- [ ] Click "Add Lead" button
- [ ] Fill in lead details:
  - Name: "Test User"
  - Email: "test@example.com"
  - Company: "Test Company"
  - Phone: "+1 555-0100"
  - Status: "Active"
- [ ] Click "Add Lead"
- [ ] ✅ Success toast appears
- [ ] ✅ Lead appears in table

### Lead Management - Read
- [ ] See list of all leads in table
- [ ] Search for a lead by name
- [ ] ✅ Search filters results correctly

### Lead Management - Update
- [ ] Click pencil icon on a lead
- [ ] Change the name to "Updated Test User"
- [ ] Click "Save Changes"
- [ ] ✅ Success toast appears
- [ ] ✅ Lead name updated in table

### Lead Management - Delete
- [ ] Click trash icon on a lead
- [ ] ✅ Success toast appears
- [ ] ✅ Lead removed from table

### Dashboard
- [ ] Click "Dashboard" in sidebar
- [ ] ✅ See total leads count
- [ ] ✅ See active leads count
- [ ] ✅ See recent leads list
- [ ] ✅ See system status card

---

## ⚠️ Demo Mode Features (Work Without API Keys)

### Web Scraper - Demo Mode
- [ ] Click "Lead Generation" in sidebar
- [ ] Enter location:
  - ZIP Code: "31320"
  - City: "Midway"
  - State: "GA"
- [ ] Check filters:
  - ✅ Must have phone
  - ✅ Must have website
- [ ] Click "Find Dental Clinics"
- [ ] ✅ See 5 demo results
- [ ] ✅ See amber "Demo Mode" badge
- [ ] ✅ See demo mode warning banner
- [ ] Click "Import 5 Leads"
- [ ] ✅ Success toast appears
- [ ] Go to "Leads Manager"
- [ ] ✅ See 5 new leads with source "scraper"

### Email Blast - Demo Mode
- [ ] Click "Email Contacts" in sidebar
- [ ] Select 2-3 leads by checkbox
- [ ] Click "Compose Email"
- [ ] Enter subject: "Test Email"
- [ ] Enter message: "This is a test"
- [ ] Click "Send Email"
- [ ] ✅ Success toast appears
- [ ] Open browser console (F12)
- [ ] ✅ See logged email data

---

## 🚀 Production Mode Features (Requires API Keys)

### Setup Prerequisites
- [ ] Have `GOOGLE_MAPS_API_KEY` in Supabase secrets
- [ ] Have `EMAIL_API_KEY` in Supabase secrets (for email)
- [ ] Wait 30 seconds after adding secrets
- [ ] Refresh the app

### Web Scraper - Production Mode

#### Test 1: Basic Search
- [ ] Go to "Lead Generation"
- [ ] Enter real location:
  - City: "New York"
  - State: "NY"
  - ZIP: "10001"
- [ ] Click "Find Dental Clinics"
- [ ] ⏳ Wait for results (5-10 seconds)
- [ ] ✅ See green "✓ Live Data" badge
- [ ] ✅ No demo mode warning
- [ ] ��� See real business results
- [ ] ✅ Phone numbers are real (+1 XXX-XXX-XXXX format)
- [ ] ✅ Websites are clickable and real
- [ ] ✅ "View on Maps" links work

#### Test 2: Filter by Phone
- [ ] Check "Must have phone" only
- [ ] Uncheck "Must have website"
- [ ] Click "Find Dental Clinics"
- [ ] ✅ All results have phone numbers
- [ ] ✅ Some may not have websites

#### Test 3: Filter by Website
- [ ] Uncheck "Must have phone"
- [ ] Check "Must have website" only
- [ ] Click "Find Dental Clinics"
- [ ] ✅ All results have websites
- [ ] ✅ Some may not have phones

#### Test 4: Both Filters
- [ ] Check both filters
- [ ] Click "Find Dental Clinics"
- [ ] ✅ All results have both phone and website

#### Test 5: Import to Database
- [ ] After any search with results
- [ ] Click "Import X Leads"
- [ ] ✅ Success toast appears
- [ ] Go to "Leads Manager"
- [ ] ✅ See imported leads with:
  - Real business names
  - Real phone numbers
  - Real websites
  - Real addresses
  - Source: "scraper"
  - Status: "active"

#### Test 6: Google Maps Integration
- [ ] In results, click any "View on Maps" link
- [ ] ✅ Opens Google Maps in new tab
- [ ] ✅ Shows correct business location
- [ ] ✅ Matches name and address

#### Test 7: Different Locations
Test with various locations:
- [ ] Major city: "Los Angeles, CA"
- [ ] Small town: "Midway, GA 31320"
- [ ] ZIP only: "90210"
- [ ] City + State: "Miami, FL"
- [ ] ✅ All return appropriate results

#### Test 8: Error Handling
- [ ] Leave all fields empty
- [ ] Click "Find Dental Clinics"
- [ ] ✅ See error toast
- [ ] Enter invalid location: "Zzzz, XX"
- [ ] Click "Find Dental Clinics"
- [ ] ✅ See "No leads found" message

### Email Blast - Production Mode

*Note: Requires email service integration (Resend/SendGrid/SES)*

- [ ] Go to "Email Contacts"
- [ ] Select real leads (with real emails)
- [ ] Click "Compose Email"
- [ ] Enter real subject and message
- [ ] Click "Send Email"
- [ ] ✅ Success toast appears
- [ ] Check email provider dashboard
- [ ] ✅ See emails in sent queue
- [ ] Check recipient inboxes
- [ ] ✅ Emails delivered

---

## 🔍 Settings Verification

### API Configuration Page
- [ ] Go to "Settings" in sidebar
- [ ] ✅ See API setup instructions
- [ ] ✅ See Google Maps setup guide
- [ ] ✅ See Email service setup guide
- [ ] ✅ Links to external services work

### Notifications
- [ ] Go to Settings → Notifications
- [ ] Toggle switches
- [ ] ✅ Switches respond to clicks

---

## 📊 Performance Tests

### Loading Speed
- [ ] Refresh app
- [ ] ✅ Dashboard loads in < 2 seconds
- [ ] ✅ Leads Manager loads in < 2 seconds
- [ ] ✅ No console errors

### Search Speed (Production Mode)
- [ ] Run a Google Maps search
- [ ] ⏱️ Results appear in < 10 seconds
- [ ] ✅ Loading spinner shows during search
- [ ] ✅ Results display correctly

### Database Operations
- [ ] Create 5 leads quickly
- [ ] ✅ All save successfully
- [ ] Update 3 leads quickly
- [ ] ✅ All update successfully
- [ ] Delete 2 leads quickly
- [ ] ✅ All delete successfully

---

## 🌐 Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge ✅
- [ ] Firefox ✅
- [ ] Safari ✅

For each browser:
- [ ] All pages load
- [ ] Navigation works
- [ ] Forms submit correctly
- [ ] Toasts appear
- [ ] No console errors

---

## 📱 Mobile Responsive

### Test on Mobile Device or Resize Browser

- [ ] Resize to mobile width (< 768px)
- [ ] ✅ Sidebar becomes hamburger menu
- [ ] ✅ Tables scroll horizontally
- [ ] ✅ Forms stack vertically
- [ ] ✅ Buttons are tap-friendly
- [ ] ✅ Text is readable

---

## 🐛 Error Scenarios

### Network Errors
- [ ] Turn off internet
- [ ] Try to load leads
- [ ] ✅ See error toast
- [ ] Turn on internet
- [ ] ✅ App recovers

### Invalid Data
- [ ] Try to add lead without name
- [ ] ✅ Validation prevents submission
- [ ] Try to search without location
- [ ] ✅ Error message appears

### API Errors (Production)
- [ ] Remove API key from Supabase
- [ ] Try Google Maps search
- [ ] ✅ Falls back to demo mode
- [ ] ✅ Shows demo mode badge

---

## 🎯 Integration Tests

### Full Workflow: Scrape → Import → Email

1. **Scrape Leads**
   - [ ] Go to Lead Generation
   - [ ] Search for dental clinics
   - [ ] ✅ Results appear

2. **Import Leads**
   - [ ] Click "Import X Leads"
   - [ ] ✅ Success message
   - [ ] Go to Leads Manager
   - [ ] ✅ New leads visible

3. **Send Email**
   - [ ] Go to Email Contacts
   - [ ] Select imported leads
   - [ ] Compose email
   - [ ] Send
   - [ ] ✅ Email sent successfully

4. **Verify Dashboard**
   - [ ] Go to Dashboard
   - [ ] ✅ Total leads count increased
   - [ ] ✅ Recent leads shows new entries

---

## 📈 Data Integrity

### Persistence Test
- [ ] Add 3 new leads
- [ ] Note their IDs/names
- [ ] Refresh the browser
- [ ] ✅ All 3 leads still there
- [ ] Close browser completely
- [ ] Reopen app
- [ ] ✅ All 3 leads still there

### Update Consistency
- [ ] Update a lead's email
- [ ] Refresh browser
- [ ] �� Email change persisted
- [ ] View in Dashboard
- [ ] ✅ Shows updated email

---

## 🔐 Security Checks

### API Keys
- [ ] Open browser DevTools → Network tab
- [ ] Perform any action
- [ ] Check request headers
- [ ] ✅ API keys NOT visible in frontend
- [ ] ✅ Only auth tokens visible

### CORS
- [ ] All API calls succeed
- [ ] ✅ No CORS errors in console

---

## ✨ Final Checks

- [ ] All navigation links work
- [ ] All buttons have hover effects
- [ ] All forms validate properly
- [ ] All toasts display correctly
- [ ] No console errors
- [ ] No 404 errors
- [ ] Proper loading states everywhere
- [ ] Professional appearance

---

## 🎉 Test Results

**Date Tested:** ________________

**Tester Name:** ________________

**Overall Status:**
- [ ] ✅ All tests passed - Production ready!
- [ ] ⚠️ Minor issues found (list below)
- [ ] ❌ Major issues found (list below)

**Notes:**
```
[Write any issues or observations here]
```

---

## 📞 Support

If any tests fail:
1. Check browser console for errors
2. Check Supabase Edge Function logs
3. Verify API keys are correct
4. Review setup in SETUP_GUIDE.md
5. Check README.md troubleshooting section

---

**Happy testing!** 🚀
