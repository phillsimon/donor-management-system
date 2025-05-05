import React from 'react';
import { Clock, ChevronRight, Trash2 } from 'lucide-react';
import { useWorkflowResponses } from '../../hooks/useWorkflowResponses';
import type { Donor } from '../../types';

interface SavedAnalysesProps {
  donor: Donor;
  onLoadAnalysis: (stepId: string) => void;
}

export function SavedAnalyses({ donor, onLoadAnalysis }: SavedAnalysesProps) {
  const donorId = donor['Client ID'] || `${donor['First Name']}_${donor['Last Name']}`;
  const { responses, loading, error } = useWorkflowResponses(donorId);

  const savedSteps = responses.reduce((acc, response) => {
    if (!acc[response.step_id]) {
      acc[response.step_id] = {
        stepId: response.step_id,
        updatedAt: response.updated_at,
        questionCount: 1
      };
    } else {
      acc[response.step_id].questionCount++;
    }
    return acc;
  }, {} as Record<string, { stepId: string; updatedAt: string; questionCount: number }>);

  const sortedSteps = Object.values(savedSteps).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading saved analyses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading saved analyses: {error}
      </div>
    );
  }

  if (sortedSteps.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No saved analyses found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedSteps.map((step) => (
        <div
          key={step.stepId}
          className="bg-white p-4 rounded-lg shadow border border-gray-100 hover:border-purple-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">
                {step.stepId.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  Last updated: {new Date(step.updatedAt).toLocaleDateString()}
                </span>
                <span className="text-purple-600">
                  {step.questionCount} responses
                </span>
              </div>
            </div>
            <button
              onClick={() => onLoadAnalysis(step.stepId)}
              className="flex items-center gap-1 text-purple-600 hover:text-purple-700"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}