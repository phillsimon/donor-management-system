import React from 'react';

interface Guideline {
  id: string;
  text: string;
}

interface GuidelinesProps {
  guidelines: Guideline[];
}

export function Guidelines({ guidelines }: GuidelinesProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Guidelines</h2>
      <ul className="space-y-2 text-sm text-gray-600">
        {guidelines.map(guideline => (
          <li key={guideline.id} className="flex items-start gap-2">
            <span className="font-medium">•</span>
            {guideline.text}
          </li>
        ))}
      </ul>
    </div>
  );
}