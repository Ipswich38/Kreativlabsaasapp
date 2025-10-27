import { supabase } from './supabase'
import type { Database } from './supabase'

type Lead = Database['public']['Tables']['leads']['Row']
type LeadInsert = Database['public']['Tables']['leads']['Insert']
type LeadUpdate = Database['public']['Tables']['leads']['Update']

type EmailCampaign = Database['public']['Tables']['email_campaigns']['Row']
type EmailCampaignInsert = Database['public']['Tables']['email_campaigns']['Insert']

type EmailLog = Database['public']['Tables']['email_logs']['Row']
type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert']

// Leads API
export const leadsApi = {
  getAll: async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      throw new Error(`Failed to fetch leads: ${error.message}`)
    }

    return data || []
  },

  create: async (lead: LeadInsert): Promise<Lead> => {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      throw new Error(`Failed to create lead: ${error.message}`)
    }

    return data
  },

  update: async (id: number, lead: LeadUpdate): Promise<Lead> => {
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      throw new Error(`Failed to update lead: ${error.message}`)
    }

    return data
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      throw new Error(`Failed to delete lead: ${error.message}`)
    }
  },

  bulkCreate: async (leads: LeadInsert[]): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .insert(leads)
      .select()

    if (error) {
      console.error('Error bulk creating leads:', error)
      throw new Error(`Failed to bulk create leads: ${error.message}`)
    }

    return data || []
  }
}

// Email Campaigns API
export const emailCampaignsApi = {
  create: async (campaign: EmailCampaignInsert): Promise<EmailCampaign> => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .insert(campaign)
      .select()
      .single()

    if (error) {
      console.error('Error creating email campaign:', error)
      throw new Error(`Failed to create email campaign: ${error.message}`)
    }

    return data
  },

  updateStatus: async (id: number, status: string, sentCount?: number, failedCount?: number): Promise<EmailCampaign> => {
    const updateData: any = { status }
    if (sentCount !== undefined) updateData.sent_count = sentCount
    if (failedCount !== undefined) updateData.failed_count = failedCount

    const { data, error } = await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating email campaign:', error)
      throw new Error(`Failed to update email campaign: ${error.message}`)
    }

    return data
  }
}

// Email Logs API
export const emailLogsApi = {
  create: async (log: EmailLogInsert): Promise<EmailLog> => {
    const { data, error } = await supabase
      .from('email_logs')
      .insert(log)
      .select()
      .single()

    if (error) {
      console.error('Error creating email log:', error)
      throw new Error(`Failed to create email log: ${error.message}`)
    }

    return data
  },

  bulkCreate: async (logs: EmailLogInsert[]): Promise<EmailLog[]> => {
    const { data, error } = await supabase
      .from('email_logs')
      .insert(logs)
      .select()

    if (error) {
      console.error('Error bulk creating email logs:', error)
      throw new Error(`Failed to bulk create email logs: ${error.message}`)
    }

    return data || []
  }
}