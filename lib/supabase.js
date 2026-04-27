import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    'https://whmlixcnsiiiylrczyzx.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobWxpeGNuc2lpaXlscmN6eXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NDgyNDUsImV4cCI6MjA5MTIyNDI0NX0.ncISSV41R4H_65WTkVT_gdfPF5ZJm-pOzSWQPd-tB2c',
    {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,

        },
    }
)
