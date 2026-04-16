import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    'https://whmlixcnsiiiylrczyzx.supabase.co',
    'sb_publishable_7J--TKbbIY1jm9kfT4ta9A_y48cAdZs',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    }
)
