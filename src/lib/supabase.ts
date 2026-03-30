import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Auth client — login, session, user info
const AUTH_URL = 'https://iauulqfgrbegwcnfatmx.supabase.co';
const AUTH_KEY = 'sb_publishable_Dvk_dI_FY6oxhyOw7__06Q_wzDmwguJ';

export const supabase = createClient<Database>(AUTH_URL, AUTH_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Data client — projects, sprints, tasks, design_items
const DATA_URL = 'https://xdiqvvctdwbexfyoqrzh.supabase.co';
const DATA_KEY = 'sb_publishable_2u374LLFIgxGUYANUhJUvA_WcGGxHft';

export const supabaseData = createClient(DATA_URL, DATA_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
