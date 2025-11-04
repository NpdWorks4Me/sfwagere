// Lightweight Supabase client initializer.
// Usage on pages: import { supabase } from './supabase/client.js'
// Requires a local supabase/config.js (ignored from git) exporting SUPABASE_URL and SUPABASE_ANON_KEY

import { createClient as createBrowserClient } from '@supabase/supabase-js';

let _client = null;

export function createClient() {
  if (_client) return _client;
  _client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  return _client;
}

// Optional legacy export: preserve if something imports { supabase }
export const supabase = createClient();
