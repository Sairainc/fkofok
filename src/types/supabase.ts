export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          line_id: string | null
          user_type: 'men' | 'women'
          birthdate: string
          prefecture: string
          occupation: string
          gender: 'men' | 'women'
          phone_number: string | null
          income?: string | null
          company?: string | null
          appearance?: string | null
          updated_at: string
          personality?: string[]
          mbti?: string
          style?: string
          dating_experience?: string
          education?: string
          hometown_prefecture?: string
          hometown_city?: string
          current_city?: string
          email?: string
        }
        Insert: {
          id?: string
          created_at?: string
          line_id?: string | null
          user_type: 'men' | 'women'
          birthdate: string
          prefecture: string
          occupation: string
          gender: 'men' | 'women'
          phone_number?: string | null
          income?: string | null
          company?: string | null
          appearance?: string | null
          updated_at?: string
          personality?: string[]
          mbti?: string
          style?: string
          dating_experience?: string
          education?: string
          hometown_prefecture?: string
          hometown_city?: string
          current_city?: string
          email?: string
        }
        Update: {
          id?: string
          created_at?: string
          line_id?: string | null
          user_type?: 'men' | 'women'
          birthdate?: string
          prefecture?: string
          occupation?: string
          gender?: 'men' | 'women'
          phone_number?: string | null
          income?: string | null
          company?: string | null
          appearance?: string | null
          updated_at?: string
          personality?: string[]
          mbti?: string
          style?: string
          dating_experience?: string
          education?: string
          hometown_prefecture?: string
          hometown_city?: string
          current_city?: string
          email?: string
        }
      }
      stripe_customers: {
        Row: {
          id: string
          line_id: string
          stripe_customer_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          stripe_customer_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_id?: string
          stripe_customer_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          line_id: string
          stripe_customer_id: string
          amount: number
          currency: string
          payment_status: string
          payment_intent_id: string | null
          payment_method_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          stripe_customer_id: string
          amount: number
          currency?: string
          payment_status: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_id?: string
          stripe_customer_id?: string
          amount?: number
          currency?: string
          payment_status?: string
          payment_intent_id?: string | null
          payment_method_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          line_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      match_dates: {
        Row: {
          id: string
          line_id: string
          date: string        // YYYY-MM-DD形式
          area: string
          status: string
          vote_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          date: string
          area: string
          status?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_id?: string
          date?: string
          area?: string
          status?: string
          vote_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_photos: {
        Row: {
          id: string
          line_id: string
          photo_url: string
          is_main: boolean
          order_index: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          photo_url: string
          is_main?: boolean
          order_index?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          line_id?: string
          photo_url?: string
          is_main?: boolean
          order_index?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      men_preferences: {
        Row: {
          id: string
          line_id: string
          party_type: 'fun' | 'serious'
          preferred_age_min: number
          preferred_age_max: number
          preferred_personality: string[]
          preferred_body_type: 'スリム' | '普通' | 'グラマー' | '気にしない'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          party_type: 'fun' | 'serious'
          preferred_age_min: number
          preferred_age_max: number
          preferred_personality: string[]
          preferred_body_type: 'スリム' | '普通' | 'グラマー' | '気にしない'
          created_at?: string
          updated_at?: string
        }
      }
      women_preferences: {
        Row: {
          id: string
          line_id: string
          party_type: 'fun' | 'serious'
          preferred_age_min: number
          preferred_age_max: number
          preferred_personality: string[]
          preferred_style: 'クール' | 'カジュアル' | 'ビジネス' | '気にしない'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          line_id: string
          party_type: 'fun' | 'serious'
          preferred_age_min: number
          preferred_age_max: number
          preferred_personality: string[]
          preferred_style: 'クール' | 'カジュアル' | 'ビジネス' | '気にしない'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 