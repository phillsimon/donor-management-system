import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function pingDatabase() {
  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Pinging database...`);
    
    // Simple query to keep the connection alive
    const { data, error } = await supabase
      .from('_pings')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error pinging database:', error.message);
      return;
    }

    console.log(`[${timestamp}] Database ping successful`);
  } catch (error) {
    console.error('Error executing ping:', error);
  }
}

// Schedule the ping to run daily at midnight
cron.schedule('0 0 * * *', pingDatabase, {
  timezone: 'UTC'
});

// Execute an initial ping when the script starts
pingDatabase();

console.log('Database ping scheduler started. Will run daily at midnight UTC.');