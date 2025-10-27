
# Kreativ CRM - Dental Clinic Lead Generation & Email Marketing

A modern CRM application built with React, TypeScript, and Vite, designed specifically for dental clinic lead generation and email marketing campaigns.

## 🚀 Features

- **Dental Clinic Web Scraping**: Use Google Maps API to find dental clinics in specific locations (USA only)
- **Lead Management**: Full CRUD operations for managing dental clinic leads
- **Email Marketing**: Bulk email campaigns powered by Mailgun with tracking
- **Dashboard & Analytics**: Visual insights into your leads and email campaigns
- **Supabase Integration**: Real-time database with PostgreSQL
- **Modern UI**: Built with Radix UI components and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Database**: Supabase (PostgreSQL)
- **Email Service**: Mailgun
- **Maps Integration**: Google Maps Places API
- **UI Components**: Radix UI, Tailwind CSS
- **Deployment**: Vercel

## 📋 Prerequisites

Before setting up the project, you'll need accounts and API keys for:

1. [Supabase](https://supabase.com/) - Database (already configured)
2. [Google Maps API](https://developers.google.com/maps) - For dental clinic scraping
3. [Mailgun](https://www.mailgun.com/) - For email campaigns
4. [Vercel](https://vercel.com/) - For deployment

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Kreativcrm
npm install
```

### 2. Database Setup

The project uses Supabase as the database. Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy the contents of supabase_schema.sql and run it in Supabase SQL Editor
```

This will create the necessary tables:
- `leads` - Store dental clinic information
- `email_campaigns` - Track email blast campaigns
- `email_logs` - Log individual email send results

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Google Maps API Key (with Places API enabled)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Mailgun Configuration
VITE_MAILGUN_API_KEY=your_mailgun_api_key_here
VITE_MAILGUN_DOMAIN=your_verified_mailgun_domain
VITE_FROM_EMAIL=noreply@yourdomain.com
VITE_FROM_NAME=Happy Teeth Support Services
```

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create an API key
5. Add your domain to API key restrictions (for production)

### 5. Mailgun Setup

1. Sign up for [Mailgun](https://www.mailgun.com/)
2. Add and verify your sending domain
3. Get your API key from Settings → API Keys
4. Update your environment variables

### 6. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

## 🚀 Deployment to Vercel

### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `VITE_GOOGLE_MAPS_API_KEY`
   - `VITE_MAILGUN_API_KEY`
   - `VITE_MAILGUN_DOMAIN`
   - `VITE_FROM_EMAIL`
   - `VITE_FROM_NAME`

3. Deploy automatically on git push

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_GOOGLE_MAPS_API_KEY
vercel env add VITE_MAILGUN_API_KEY
vercel env add VITE_MAILGUN_DOMAIN
vercel env add VITE_FROM_EMAIL
vercel env add VITE_FROM_NAME
```

## 📚 Usage

### Lead Generation

1. Navigate to "Lead Generation" in the sidebar
2. Enter a ZIP code, state, or city + state combination
3. Set filters (phone, email, website requirements)
4. Click "Find Dental Clinics" to search
5. Review results and import selected leads

### Email Campaigns

1. Go to "Email Contacts" section
2. Select leads you want to email
3. Click "Compose Email" to create campaign
4. Customize subject and message
5. Add attachments if needed
6. Send bulk emails via Mailgun

### Dashboard

- View lead statistics and conversion metrics
- Monitor email campaign performance
- Track lead sources and status

## 🔐 Security Features

- Row Level Security (RLS) enabled on all Supabase tables
- Environment variables for sensitive data
- API key restrictions for Google Maps
- Mailgun domain verification required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software developed for dental clinic lead generation and email marketing.

## 🐛 Support

For support and bug reports, please create an issue in the repository or contact the development team.

---

**Note**: This application is designed specifically for dental clinic lead generation in the USA. The Google Maps integration focuses on finding dental practices and estimating contact information.
  