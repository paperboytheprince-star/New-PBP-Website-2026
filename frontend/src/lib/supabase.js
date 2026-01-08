// Supabase Client Configuration
// This file initializes the Supabase client for authentication
// Auth data is stored in Supabase cloud and persists across deployments

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qthtjxpdfcazewlfwtjl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aHRqeHBkZmNhemV3bGZ3dGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDE3MjAsImV4cCI6MjA4MzQ3NzcyMH0.x-1NVxcrxlemoH3zLB0AJtXtGkbWIAcHMCIrs5iuR5E';

// Create a single Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Persist session in localStorage
    persistSession: true,
    // Auto refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (for OAuth callbacks - future use)
    detectSessionInUrl: true,
  },
});

export default supabase;
