# Database Setup Instructions

## Quick Setup for Supabase

Your Supabase project is already configured. Now you need to set up the database tables:

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/lxyexybnotixgpzflota
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Database Schema

Copy and paste the entire content from `supabase_schema.sql` and run it. This will create:

- ✅ `leads` table for storing dental clinic information
- ✅ `email_campaigns` table for tracking email blasts
- ✅ `email_logs` table for individual email tracking
- ✅ Proper indexes for performance
- ✅ Row Level Security policies
- ✅ Sample data for testing

### Step 3: Verify Setup

After running the SQL, you should see 3 new tables in your database with some sample leads already populated.

## Testing the Application

With your Google Maps API key now configured (`AIzaSyBgReJwAkACKivxkfSHD7tnKgFcNpLwCUs`), you can:

1. **Open the app**: http://localhost:3000/
2. **Login**: Use either "User" or "Admin" login
3. **Test Lead Generation**:
   - Go to "Lead Generation" tab
   - Enter a ZIP code like "90210" or city/state like "Beverly Hills, CA"
   - Click "Find Dental Clinics"
   - Should return actual dental clinics from Google Maps

4. **Test Database Integration**:
   - Import some scraped leads
   - View them in "Contacts" section
   - Check that they're saved to Supabase

## Next Steps for Mailgun

To complete the email functionality:

1. Sign up at https://www.mailgun.com/
2. Add your domain and verify it
3. Get your API key
4. Update the `.env` file with your Mailgun credentials

The app is now ready for testing with Google Maps integration working!