import { supabase } from '../supabase';
import { testConnection, getConnectionStatus } from '../supabase';
import type { Donor } from '../../types';
import { transformDonorFromDB, transformDonorForDB } from './transformers';

export interface DonorQueryOptions {
  userId?: string;
  isAdmin?: boolean;
}

export async function fetchDonors({ userId, isAdmin }: DonorQueryOptions) {
  // Check connection status
  const isConnected = await testConnection();
  if (!isConnected) {
    const { error: connError } = getConnectionStatus();
    throw new Error(`Database connection error: ${connError?.message || 'Unable to connect to database'}`);
  }

  let query = supabase.from('donors').select('*');

  // If not admin, only show own donors
  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error: fetchError } = await query
    .order('created_at', { ascending: false });

  if (fetchError) {
    // Check for specific error types
    if (fetchError.code === 'PGRST301' || fetchError instanceof DOMException) {
      throw new Error('Database request timed out. Please try again.');
    } else if (fetchError.code === '401') {
      throw new Error('Your session has expired. Please sign in again.');
    } else if (fetchError.code === '403') {
      throw new Error('You do not have permission to access this data.');
    } else if (fetchError.message.includes('Failed to fetch')) {
      throw new Error('Network error - check your internet connection.');
    } else {
      console.error('Error fetching donors:', fetchError);
      throw new Error(`Database error: ${fetchError.message}`);
    }
  }

  return data ? data.map(transformDonorFromDB) : [];
}

export async function addDonorBatch(donors: Donor[], userId?: string) {
  if (!userId) {
    throw new Error('User ID is required to add donors');
  }

  // Check connection status
  const isConnected = await testConnection();
  if (!isConnected) {
    const { error: connError } = getConnectionStatus();
    throw new Error(`Database connection error: ${connError?.message || 'Unable to connect to database'}`);
  }

  // Transform donors for database insertion
  const dbDonors = donors.map(donor => transformDonorForDB(donor, userId));

  // Insert donors in batches of 100 to avoid request size limits
  const batchSize = 100;
  for (let i = 0; i < dbDonors.length; i += batchSize) {
    const batch = dbDonors.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('donors')
      .insert(batch);

    if (insertError) {
      console.error('Error inserting donors:', insertError);
      throw new Error(`Failed to add donors: ${insertError.message}`);
    }
  }
}

export async function updateDonor(donor: Donor, userId?: string, isAdmin?: boolean) {
  if (!userId) {
    throw new Error('User ID is required to update donor');
  }

  // Check connection status
  const isConnected = await testConnection();
  if (!isConnected) {
    const { error: connError } = getConnectionStatus();
    throw new Error(`Database connection error: ${connError?.message || 'Unable to connect to database'}`);
  }

  const dbDonor = transformDonorForDB(donor, userId);
  let query = supabase.from('donors').update(dbDonor);

  // If not admin, only update own donors
  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  const { error: updateError } = await query
    .eq('id', donor.id)
    .single();

  if (updateError) {
    console.error('Error updating donor:', updateError);
    throw new Error(`Failed to update donor: ${updateError.message}`);
  }
}

export async function deleteDonor(donor: Donor, userId?: string, isAdmin?: boolean) {
  if (!userId) {
    throw new Error('User ID is required to delete donor');
  }

  // Check connection status
  const isConnected = await testConnection();
  if (!isConnected) {
    const { error: connError } = getConnectionStatus();
    throw new Error(`Database connection error: ${connError?.message || 'Unable to connect to database'}`);
  }

  let query = supabase.from('donors').delete();

  // If not admin, only delete own donors
  if (!isAdmin && userId) {
    query = query.eq('user_id', userId);
  }

  // Delete only the specific donor by ID
  const { error: deleteError } = await query
    .eq('id', donor.id)
    .single();

  if (deleteError) {
    console.error('Error deleting donor:', deleteError);
    throw new Error(`Failed to delete donor: ${deleteError.message}`);
  }
}