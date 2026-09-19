import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Get credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missingCredentials = new Proxy({}, {
    get() {
        throw new Error("Supabase server environment variables are not configured");
    },
}) as SupabaseClient;

export const supabase = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })
    : missingCredentials;

export { supabaseUrl };
