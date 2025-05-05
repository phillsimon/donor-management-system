import React from 'react';
import { Map } from 'lucide-react';
import type { Donor } from '../../types';

interface DonorPathsProps {
  donor: Donor;
  onClose: () => void;
}

export function DonorPaths({ donor, onClose }: DonorPathsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Donor Path</h2>
          </div>
          
        </div>
      </div>
    </div>
  );
}