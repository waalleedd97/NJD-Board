import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function init(url, serviceKey) {
  supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return supabase;
}

export function getClient() {
  if (!supabase) throw new Error('Supabase client not initialized');
  return supabase;
}
