// Supabase Client Configuration
// This file initializes the Supabase client for authentication
// Auth data is stored in Supabase cloud and persists across deployments

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qthtjxpdfcazewlfwtjl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aHRqeHBkZmNhemV3bGZ3dGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDE3MjAsImV4cCI6MjA4MzQ3NzcyMH0.x-1NVxcrxlemoH3zLB0AJtXtGkbWIAcHMCIrs5iuR5E';

// Debug logging only in development
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('[Supabase] Initializing with URL:', SUPABASE_URL);
}

// Create a single Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (for OAuth callbacks - future use)
    detectSessionInUrl: true,
    // Use PKCE flow for better security
    flowType: 'pkce',
  },
});

// Debug: Log session status on init (dev only)
if (isDev) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.log('[Supabase] Session error:', error.message);
    } else {
      console.log('[Supabase] Session status:', data.session ? 'Active' : 'None');
    }
  });
}

export default supabase;
