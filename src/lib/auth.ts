import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  try {
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Invalid email or password' };
      }
      return { error: 'Failed to sign in' };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function signUp(email: string, password: string, fullName: string) {
  try {
    if (!email || !password || !fullName) {
      return { error: 'All fields are required' };
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { 
          full_name: fullName.trim()
        }
      }
    });

    if (error) {
      return { error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return { error: 'Failed to create account' };
  }
}

export async function signOut() {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();

    // Clear all local storage
    localStorage.clear();
    sessionStorage.clear();

    // If no session exists, consider it already signed out
    if (!session) {
      return { error: null };
    }

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    // If session not found, consider it a successful sign-out
    if (error?.message?.includes('session_not_found')) {
      return { error: null };
    }

    return { error };
  } catch (err) {
    console.error('Sign out error:', err);
    return { error: 'Failed to sign out' };
  }
}