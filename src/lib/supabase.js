import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Vérifie que l'URL est bien une URL Supabase valide (commence par https://)
const isValidUrl = rawUrl.startsWith('https://')

export const isConfigured = isValidUrl && rawKey.length > 20

const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-anon-key-xxxxxxxxxxxxxxxxxxxx'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
