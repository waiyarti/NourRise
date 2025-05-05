// Fichier : supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Ton URL et ta clé publique (anon key) depuis Supabase
const supabaseUrl = 'https://iukagcbgrqtscomsvnso.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a2FnY2JncnF0c2NvbXN2bnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMTgzNDYsImV4cCI6MjA2MTU5NDM0Nn0.0iaVcyQ_j8E_Zp2_XyVR87KSll20RywoA3G7CqtGwo4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)