import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-aed69b82`;

async function apiCall(endpoint: string, options: RequestInit = {}) {
  try {
    console.log(`🌐 API Call: ${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ API Error at ${endpoint}:`, data);
      const errorMessage = data.error || 'API request failed';
      
      // Add helpful context for configuration errors
      if (data.requiresSetup) {
        throw new Error(`${errorMessage} (Configuration required)`);
      }
      
      throw new Error(errorMessage);
    }

    console.log(`✅ API Success: ${endpoint}`);
    return data;
  } catch (error: any) {
    // Better error handling for network issues
    if (error.message === 'Failed to fetch') {
      console.error(`🔌 Network Error: Cannot reach server at ${API_BASE_URL}${endpoint}`);
      console.error('💡 Possible causes:');
      console.error('   1. Server is not running');
      console.error('   2. Network connection issue');
      console.error('   3. CORS blocking the request');
      console.error('   4. Incorrect API URL');
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

// Leads API
export const leadsApi = {
  getAll: async () => {
    const data = await apiCall('/leads');
    return data.leads;
  },

  create: async (lead: any) => {
    const data = await apiCall('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
    return data.lead;
  },

  update: async (id: number, lead: any) => {
    const data = await apiCall(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
    return data.lead;
  },

  delete: async (id: number) => {
    await apiCall(`/leads/${id}`, {
      method: 'DELETE',
    });
  },
};

// Email API
export const emailApi = {
  sendBlast: async (recipients: any[], subject: string, message: string, attachments?: any[]) => {
    const data = await apiCall('/send-email', {
      method: 'POST',
      body: JSON.stringify({
        recipients,
        subject,
        message,
        attachments,
      }),
    });
    return data;
  },
};

// Web Scraping API
export const scraperApi = {
  scrapeGoogleMaps: async (params: {
    zipCode: string;
    city: string;
    state: string;
    mustHavePhone: boolean;
    mustHaveWebsite: boolean;
    mustHaveEmail: boolean;
  }) => {
    console.log('📤 API Call to /scrape-leads with params:', params);
    const data = await apiCall('/scrape-leads', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    console.log('📥 API Response from /scrape-leads:', data);
    // Return full response including mode and metadata
    return data;
  },
};

// Gmail Multimail API (Professional Email Delivery)
export const gmailMultimailApi = {
  sendBlast: async (recipients: any[], subject: string, message: string, username?: string) => {
    const data = await apiCall('/gmail-multimail-send', {
      method: 'POST',
      body: JSON.stringify({
        recipients,
        subject,
        message,
        username,
      }),
    });
    return data;
  },
};
