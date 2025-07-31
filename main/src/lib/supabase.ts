import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Receipt {
  id: number
  emoji_code: string
  description: string
  destination_chain: string
  destination_token: string
  destination_token_address: string
  destination_address: string
  amount: string
  created_at: string
  updated_at: string
} 