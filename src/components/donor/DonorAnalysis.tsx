import React, { useState } from 'react';
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import type { Donor } from '../../types';

interface DonorAnalysisProps {
  donor: Donor;
  onClose: () => void;
}

export function DonorAnalysis({ donor, onClose }: DonorAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/.netlify/functions/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ donorData: donor })
      });

      if (!response.ok) {
  const contentType = response.headers.get("Content-Type");
  const isJson = contentType && contentType.includes("application/json");

  let errorMessage = 'Failed to generate analysis';

  if (isJson) {
    const errorData = await response.json();
    errorMessage = errorData.error || errorMessage;
  } else {
    const errorText = await response.text();
    console.error('Raw error response:', errorText);
  }

  throw new Error(errorMessage);
}


      const data = await response.json();
      if (!data.analysis) {
        throw new Error('No analysis received from server');
      }

      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">AI Analysis</h2>
          </div>
        </div>

        {!analysis && !loading && !error && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Generate AI Analysis
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our AI will analyze this donor's profile and provide strategic insights
              and recommendations for engagement.
            </p>
            <button
              onClick={generateAnalysis}
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Generate Analysis
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Generating analysis...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setAnalysis(null);
              }}
              className="mt-4 text-sm text-red-600 hover:text-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            <div className="prose max-w-none bg-gray-50 rounded-lg p-6">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                onClick={() => setAnalysis(null)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Generate New Analysis
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Complete
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
