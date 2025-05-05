import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from './useRBAC';
import type { Donor } from '../types';
import {
  fetchDonors,
  addDonorBatch,
  deleteDonor as apiDeleteDonor,
  updateDonor as apiUpdateDonor,
} from '../lib/donors/api';

export function useDonors() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading, ready: authReady } = useAuth();
  const { hasRole, loading: rbacLoading } = useRBAC();
  const isAdmin = hasRole('admin');

  console.log("🔑 Current user ID:", user?.id);

  useEffect(() => {
    console.log(
      '🔁 EFFECT TRIGGERED: user =',
      user,
      'authReady =',
      authReady,
      'rbacLoading =',
      rbacLoading
    );

    if (!authReady || rbacLoading || !user?.id) {
      console.log('⏸ Skipping donor fetch - waiting on auth or RBAC');
      return;
    }

    let isMounted = true;

    const loadDonors = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📡 Fetching donors for user ID:', user.id);

        const data = await fetchDonors({ userId: user.id, isAdmin });

        if (isMounted) {
          setDonors(data);
        }
      } catch (err) {
        if (isMounted) {
          console.error('❌ Donor fetch failed:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch donors');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDonors();

    return () => {
      isMounted = false;
    };
  }, [authReady, rbacLoading, user?.id, isAdmin]);

  const addDonors = async (newDonors: Donor[]) => {
    try {
      if (!user?.id) {
        throw new Error('User ID is required to add donors');
      }

      setLoading(true);
      setError(null);

      await addDonorBatch(newDonors, user.id);

      const updatedDonors = await fetchDonors({ userId: user.id, isAdmin });
      setDonors(updatedDonors);
    } catch (err) {
      console.error('Error in addDonors:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add donors';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateDonor = async (donorToUpdate: Donor) => {
    try {
      if (!user?.id) {
        throw new Error('User ID is required to update donor');
      }

      setLoading(true);
      setError(null);

      await apiUpdateDonor(donorToUpdate, user.id, isAdmin);

      setDonors((prev) =>
        prev.map((donor) => (donor.id === donorToUpdate.id ? donorToUpdate : donor))
      );
    } catch (err) {
      console.error('Error in updateDonor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update donor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteDonor = async (donorToDelete: Donor) => {
    try {
      if (!user?.id) {
        throw new Error('User ID is required to delete donor');
      }

      setLoading(true);
      setError(null);

      await apiDeleteDonor(donorToDelete, user.id, isAdmin);

      setDonors((prev) => prev.filter((donor) => donor.id !== donorToDelete.id));
    } catch (err) {
      console.error('Error in deleteDonor:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete donor';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || authLoading || rbacLoading;

  return {
    donors,
    loading: isLoading,
    error,
    addDonors,
    updateDonor,
    deleteDonor,
  };
}
