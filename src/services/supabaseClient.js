import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nozxiujeohrhyhefsedw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5venhpdWplb2hyaHloZWZzZWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MTE2MDksImV4cCI6MjA5ODk4NzYwOX0.xMk_qBQH7aM3Eo4XK46lZTiJnJMzYSZ8v6geVgXMmrI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)