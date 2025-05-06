// --- Importation de la librairie officielle Supabase ---
import { createClient } from '@supabase/supabase-js'

// --- Informations de ton projet (OK à copier tel quel) ---
const supabaseUrl = 'https://iukagcbgrqtscomsvnso.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a2FnY2JncnF0c2NvbXN2bnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjA5NDksImV4cCI6MjA2MjAzNjk0OX0.Rx80_BW9dyG9rn9PBbYlK9kr3atDUuOsMtIYHIJrzzc'

// --- Création du client Supabase (connexion à ton projet) ---
export const supabase = createClient(supabaseUrl, supabaseAnonKey)