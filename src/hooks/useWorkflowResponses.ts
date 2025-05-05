import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface WorkflowResponse {
  id: string;
  donor_id: string;
  user_id: string;
  step_id: string;
  question_id: string;
  response: string;
  created_at: string;
  updated_at: string;
}

export function useWorkflowResponses(donorId: string) {
  const [responses, setResponses] = useState<WorkflowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !donorId) return;
    
    const fetchResponses = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_responses')
          .select('*')
          .eq('donor_id', donorId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResponses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch responses');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [donorId, user]);

  const saveResponse = async (stepId: string, questionId: string, response: string | string[]) => {
    if (!user || !donorId) return;

    try {
      const responseStr = Array.isArray(response) ? JSON.stringify(response) : response;

      const { data, error } = await supabase
        .from('workflow_responses')
        .upsert({
          donor_id: donorId,
          user_id: user.id,
          step_id: stepId,
          question_id: questionId,
          response: responseStr
        }, {
          onConflict: 'donor_id,user_id,step_id,question_id'
        })
        .select()
        .single();

      if (error) throw error;

      setResponses(prev => {
        const index = prev.findIndex(r => 
          r.step_id === stepId && 
          r.question_id === questionId &&
          r.donor_id === donorId
        );
        
        if (index >= 0) {
          return [
            ...prev.slice(0, index),
            data,
            ...prev.slice(index + 1)
          ];
        }
        return [data, ...prev];
      });

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save response');
      throw err;
    }
  };

  const parseResponse = (response: string): string | string[] => {
    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : response;
    } catch {
      return response;
    }
  };

  return { 
    responses, 
    loading, 
    error, 
    saveResponse,
    parseResponse
  };
}