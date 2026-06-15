import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase Environment Variables. Check your .env configuration.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Added safe parameters to stop faulty WebSocket handshakes from crashing your app environment
  realtime: {
    timeout: 20000, // Recycle broken connections every 20 seconds
    params: {
      eventsPerSecond: 10
    }
  }
})
