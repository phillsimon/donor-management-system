import React, { useState } from 'react';
import { History, Plus, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAppVersions } from '../../hooks/useAppVersions';
import { VersionHistory } from './VersionHistory';

interface VersionControlProps {
  donorId: string;
  onVersionChange?: () => void;
}

export function VersionControl({ donorId, onVersionChange }: VersionControlProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [note, setNote] = useState('');
  const { versions, loading, error, createVersion, restoreVersion } = useAppVersions(donorId);

  const handleCreateVersion = async () => {
    try {
      await createVersion(note);
      setNote('');
      setShowNewVersion(false);
      onVersionChange?.();
    } catch (err) {
      console.error('Failed to create version:', err);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      await restoreVersion(versionId);
      setShowHistory(false);
      onVersionChange?.();
    } catch (err) {
      console.error('Failed to restore version:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <VersionHistory
        versions={versions}
        onRestoreVersion={handleRestoreVersion}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowHistory(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        <History className="w-4 h-4" />
        History
      </button>

      {showNewVersion ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Version note..."
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleCreateVersion}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Save className="w-4 h-4" />
            Save Version
          </button>
          <button
            onClick={() => setShowNewVersion(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNewVersion(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
        >
          <Plus className="w-4 h-4" />
          New Version
        </button>
      )}
    </div>
  );
}