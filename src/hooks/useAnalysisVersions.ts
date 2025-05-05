import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AnalysisVersion {
  id: string;
  donor_id: string;
  user_id: string;
  version: number;
  note: string;
  created_at: string;
  is_current: boolean;
}

export function useAnalysisVersions(donorId: string) {
  const [versions, setVersions] = useState<AnalysisVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !donorId) return;
    
    const fetchVersions = async () => {
      try {
        const { data, error } = await supabase
          .from('analysis_versions')
          .select('*')
          .eq('donor_id', donorId)
          .eq('user_id', user.id)
          .order('version', { ascending: false });

        if (error) throw error;
        setVersions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch versions');
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [donorId, user]);

  const createVersion = async (note: string) => {
    if (!user || !donorId) return;

    try {
      // Get the latest version number
      const latestVersion = versions.length > 0 ? versions[0].version : 0;
      const newVersion = latestVersion + 1;

      // Create new version
      const { data: versionData, error: versionError } = await supabase
        .from('analysis_versions')
        .insert({
          donor_id: donorId,
          user_id: user.id,
          version: newVersion,
          note,
          is_current: true
        })
        .select()
        .single();

      if (versionError) throw versionError;

      // Update is_current flag for other versions
      await supabase
        .from('analysis_versions')
        .update({ is_current: false })
        .eq('donor_id', donorId)
        .eq('user_id', user.id)
        .neq('id', versionData.id);

      setVersions(prev => [versionData, ...prev.map(v => ({ ...v, is_current: false }))]);
      return versionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
      throw err;
    }
  };

  const restoreVersion = async (versionId: string) => {
    if (!user || !donorId) return;

    try {
      const { data, error } = await supabase
        .from('analysis_versions')
        .update({ is_current: true })
        .eq('id', versionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Set other versions as not current
      await supabase
        .from('analysis_versions')
        .update({ is_current: false })
        .eq('donor_id', donorId)
        .eq('user_id', user.id)
        .neq('id', versionId);

      setVersions(prev => 
        prev.map(v => ({
          ...v,
          is_current: v.id === versionId
        }))
      );

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore version');
      throw err;
    }
  };

  return {
    versions,
    loading,
    error,
    createVersion,
    restoreVersion
  };
}