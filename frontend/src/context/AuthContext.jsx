// AuthContext - Uses Supabase Auth for deployment-safe authentication
// Auth persists across all deployments via Supabase cloud

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Debug logging only in development
const isDev = process.env.NODE_ENV === 'development';
const log = (...args) => isDev && console.log('[Auth]', ...args);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper to extract user-friendly error message
const getAuthErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message || error.error_description || '';
  
  // Map Supabase error messages to user-friendly messages
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please check your email and confirm your account first.';
  }
  if (message.includes('User already registered')) {
    return 'This email is already registered. Please log in instead.';
  }
  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (message.includes('Invalid email')) {
    return 'Please enter a valid email address.';
  }
  
  return message || 'An error occurred. Please try again.';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        log('getSession error:', error.message);
      }
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          is_admin: session.user.user_metadata?.is_admin || false,
        });
        log('User restored from session:', session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log('Auth state changed:', event);
        setSession(session);
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
            is_admin: session.user.user_metadata?.is_admin || false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, name) => {
    log('Attempting signup for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          is_admin: false,
        },
      },
    });
    
    if (error) {
      log('Signup error:', error.message, error.status);
      const friendlyError = new Error(getAuthErrorMessage(error));
      friendlyError.originalError = error;
      throw friendlyError;
    }
    
    log('Signup successful:', data.user?.email);
    return data;
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    log('Attempting signin for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      log('Signin error:', error.message, error.status);
      const friendlyError = new Error(getAuthErrorMessage(error));
      friendlyError.originalError = error;
      throw friendlyError;
    }
    
    log('Signin successful:', data.user?.email);
    return data;
  };

  // Sign out
  const signOut = async () => {
    log('Signing out');
    const { error } = await supabase.auth.signOut();
    if (error) {
      log('Signout error:', error.message);
      throw new Error(getAuthErrorMessage(error));
    }
    setUser(null);
    setSession(null);
    log('Signout successful');
  };

  // Reset password (sends email)
  const resetPassword = async (email) => {
    log('Requesting password reset for:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      log('Reset password error:', error.message);
      throw new Error(getAuthErrorMessage(error));
    }
    
    log('Password reset email sent');
    return data;
  };

  // Update password (after reset)
  const updatePassword = async (newPassword) => {
    log('Updating password');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      log('Update password error:', error.message);
      throw new Error(getAuthErrorMessage(error));
    }
    
    log('Password updated successfully');
    return data;
  };

  // Legacy login function for backward compatibility
  const login = (userData, authToken) => {
    log('Legacy login called - Supabase manages sessions automatically');
  };

  // Legacy logout function
  const logout = async () => {
    await signOut();
  };

  const value = {
    user,
    session,
    loading,
    // Supabase auth methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    // Legacy compatibility
    login,
    logout,
    token: session?.access_token,
    isAuthenticated: !!session,
    isAdmin: user?.is_admin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
