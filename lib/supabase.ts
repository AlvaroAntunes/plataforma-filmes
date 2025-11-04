// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: 'CLIENT' | 'ADMIN'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: 'CLIENT' | 'ADMIN'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: 'CLIENT' | 'ADMIN'
          created_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          title_pt: string
          title_es: string
          title_zh: string
          synopsis: string
          synopsis_pt: string
          synopsis_es: string
          synopsis_zh: string
          genre: string
          duration: number
          release_year: number
          rating: number
          price: number
          poster_url: string | null
          img_1?: string | null
          img_2?: string | null
          img_3?: string | null
          trailer_url: string | null
          movie_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          title_pt: string
          title_es: string
          title_zh: string
          synopsis: string
          synopsis_pt: string
          synopsis_es: string
          synopsis_zh: string
          genre: string
          duration: number
          release_year: number
          rating: number
          price: number
          poster_url?: string | null
          img_1?: string | null
          img_2?: string | null
          img_3?: string | null
          trailer_url?: string | null
          movie_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          title_pt?: string
          title_es?: string
          title_zh?: string
          synopsis?: string
          synopsis_pt?: string
          synopsis_es?: string
          synopsis_zh?: string
          genre?: string
          duration?: number
          release_year?: number
          rating?: number
          price?: number
          poster_url?: string | null
          img_1?: string | null
          img_2?: string | null
          img_3?: string | null
          trailer_url?: string | null
          movie_url?: string | null
          created_at?: string
        }
      }
      client_films: {
        Row: {
          id: string
          client_id: string
          film_id: string
          purchase_date: string
        }
        Insert: {
          id?: string
          client_id: string
          film_id: string
          purchase_date?: string
        }
        Update: {
          id?: string
          client_id?: string
          film_id?: string
          purchase_date?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}