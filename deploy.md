# Deployment Guide

## Quick Deployment Steps

### 1. Supabase Database Setup

1. Go to your Supabase project: https://lxyexybnotixgpzflota.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the entire content from `supabase_schema.sql`
4. Run the SQL to create all necessary tables and policies

### 2. Environment Variables Setup

For Vercel deployment, add these environment variables in your Vercel dashboard:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_MAILGUN_API_KEY=your_mailgun_api_key
VITE_MAILGUN_DOMAIN=your_mailgun_domain
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Happy Teeth Support Services
```

### 3. Google Maps API Configuration

Required APIs to enable in Google Cloud Console:
- Maps JavaScript API
- Places API
- Geocoding API

### 4. Mailgun Configuration

1. Create Mailgun account
2. Add and verify your domain
3. Get API key from dashboard
4. Update environment variables

### 5. Deploy to Vercel

Option A - GitHub Integration:
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

Option B - Vercel CLI:
```bash
npm install -g vercel
vercel
vercel env add VITE_GOOGLE_MAPS_API_KEY
vercel env add VITE_MAILGUN_API_KEY
vercel env add VITE_MAILGUN_DOMAIN
vercel env add VITE_FROM_EMAIL
vercel env add VITE_FROM_NAME
```

## Testing Checklist

After deployment, test these features:

- [ ] Login functionality
- [ ] Lead management (CRUD operations)
- [ ] Google Maps dental clinic search
- [ ] Email blast functionality
- [ ] Dashboard analytics
- [ ] Database connectivity
- [ ] Responsive design

## Production Considerations

- Set up proper API key restrictions for Google Maps
- Configure Mailgun domain authentication
- Monitor email delivery rates
- Set up error tracking (Sentry, etc.)
- Configure proper CORS settings
- Enable Supabase security policies