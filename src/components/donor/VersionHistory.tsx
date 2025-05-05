import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { History, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { AnalysisVersion } from '../../hooks/useAnalysisVersions';

interface VersionHistoryProps {
  versions: AnalysisVersion[];
  onRestoreVersion: (versionId: string) => void;
  onBack: () => void;
}

export function VersionHistory({ versions, onRestoreVersion, onBack }: VersionHistoryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-800">Version History</h2>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analysis
        </button>
      </div>

      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.id}
            className={`p-4 rounded-lg border ${
              version.is_current
                ? 'border-purple-200 bg-purple-50'
                : 'border-gray-200 hover:border-purple-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">
                    Version {version.version}
                  </h3>
                  {version.is_current && (
                    <span className="flex items-center gap-1 text-sm text-purple-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Created {formatDistanceToNow(new Date(version.created_at))} ago
                </p>
                {version.note && (
                  <p className="mt-2 text-gray-700">{version.note}</p>
                )}
              </div>
              {!version.is_current && (
                <button
                  onClick={() => onRestoreVersion(version.id)}
                  className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50"
                >
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}