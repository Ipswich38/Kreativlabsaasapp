import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lxyexybnotixgpzflota.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4eWV4eWJub3RpeGdwemZsb3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyMDcwODIsImV4cCI6MjA3NTc4MzA4Mn0.TSbnvPKWiDdEFbyOh38qj_L87LZ75p3FiOW05hzEBlM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number
          name: string
          email: string
          company: string
          phone: string | null
          address: string | null
          website: string | null
          rating: number | null
          reviews: number | null
          status: 'active' | 'inactive' | 'contacted' | 'converted'
          source: 'manual' | 'scraper' | 'import'
          contact_status: 'new' | 'contacted' | 'follow_up' | 'qualified' | 'unqualified'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          company: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          reviews?: number | null
          status?: 'active' | 'inactive' | 'contacted' | 'converted'
          source?: 'manual' | 'scraper' | 'import'
          contact_status?: 'new' | 'contacted' | 'follow_up' | 'qualified' | 'unqualified'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          company?: string
          phone?: string | null
          address?: string | null
          website?: string | null
          rating?: number | null
          reviews?: number | null
          status?: 'active' | 'inactive' | 'contacted' | 'converted'
          source?: 'manual' | 'scraper' | 'import'
          contact_status?: 'new' | 'contacted' | 'follow_up' | 'qualified' | 'unqualified'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_campaigns: {
        Row: {
          id: number
          subject: string
          body: string
          recipients_count: number
          sent_count: number
          failed_count: number
          status: 'draft' | 'sending' | 'sent' | 'failed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          subject: string
          body: string
          recipients_count: number
          sent_count?: number
          failed_count?: number
          status?: 'draft' | 'sending' | 'sent' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          subject?: string
          body?: string
          recipients_count?: number
          sent_count?: number
          failed_count?: number
          status?: 'draft' | 'sending' | 'sent' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: number
          campaign_id: number | null
          lead_id: number
          email: string
          subject: string
          status: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened'
          error_message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: number
          campaign_id?: number | null
          lead_id: number
          email: string
          subject: string
          status?: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          campaign_id?: number | null
          lead_id?: number
          email?: string
          subject?: string
          status?: 'sent' | 'failed' | 'bounced' | 'delivered' | 'opened'
          error_message?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
    }
  }
}