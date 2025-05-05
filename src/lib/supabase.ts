import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

// Create Supabase client with retries and timeout
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'donorpath',
      'x-client-info': 'donorpath@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Initialize connection state
let isConnected = false;
let connectionError: Error | null = null;
let retryCount = 0;
const maxRetries = 3;
const retryDelay = 1000; // 1 second

// Test connection and log status
export const testConnection = async () => {
  try {
    if (isConnected) return true;

    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);

    // First try to read from _pings with abortSignal for timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 5000); // 5 second timeout

    const { data, error } = await supabase
      .from('_pings')
      .select('count')
      .limit(1)
      .abortSignal(abortController.signal);

    clearTimeout(timeoutId);
    
    if (error) {
      // Check for specific error types
      if (error.code === 'PGRST301' || error instanceof DOMException) {
        connectionError = new Error('Database connection timeout');
      } else if (error.code === '401') {
        connectionError = new Error('Invalid API key or authentication failed');
      } else if (error.code === '403') {
        connectionError = new Error('Permission denied - check RLS policies');
      } else if (error.message.includes('Failed to fetch')) {
        connectionError = new Error('Network error - check CORS settings and network connectivity');
      } else if (!error.message.includes('contains 0 rows')) {
        connectionError = error;
      }

      if (connectionError) {
        console.error('Supabase connection error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Implement retry logic
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Retrying connection (attempt ${retryCount} of ${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          return testConnection();
        }
        
        return false;
      }
    }

    // If no data exists or empty result, create an initial ping
    if (!data || data.length === 0) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 5000);

      const { error: insertError } = await supabase
        .from('_pings')
        .insert([{ count: 1 }])
        .abortSignal(abortController.signal);

      clearTimeout(timeoutId);

      if (insertError) {
        // If insert fails due to RLS, we can still consider the connection successful
        // since we were able to query the table
        if (!insertError.message.includes('row-level security')) {
          connectionError = insertError;
          console.error('Failed to create initial ping:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
          });
          return false;
        }
      }
    }

    isConnected = true;
    connectionError = null;
    retryCount = 0;
    console.log('Successfully connected to Supabase');
    return true;
  } catch (err) {
    connectionError = err instanceof Error ? err : new Error('Unknown connection error');
    console.error('Failed to connect to Supabase:', {
      error: connectionError.message,
      stack: connectionError.stack
    });

    // Implement retry logic
    if (retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying connection (attempt ${retryCount} of ${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
      return testConnection();
    }

    return false;
  }
};

// Export connection state
export const getConnectionStatus = () => ({
  isConnected,
  error: connectionError,
  retryCount,
  maxRetries
});

// Test connection immediately
testConnection().then(connected => {
  if (!connected) {
    console.error('Initial connection test failed. Check your Supabase configuration and network connectivity.');
  }
});