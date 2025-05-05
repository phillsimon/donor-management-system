import React, { useState } from 'react';
import { FileText, ChevronRight, PenSquare, Map, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Donor } from '../../types';
import { DonorAnalysis } from './DonorAnalysis';
import { KeyInformation } from './KeyInformation';
import { NoteModal } from './NoteModal';
import { DonorPaths } from './DonorPaths';

interface DonorDetailsProps {
  donor: Donor;
  onClose: () => void;
  onResetDonor: () => void;
}

export function DonorDetails({ donor, onClose, onResetDonor }: DonorDetailsProps) {
  const [view, setView] = useState<'dashboard' | 'analysis' | 'paths'>('dashboard');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const navigate = useNavigate();

  const donorId = donor.id;

  const renderContent = () => {
    switch (view) {
      case 'paths':
        return <DonorPaths donor={donor} onClose={() => setView('dashboard')} />;
      case 'analysis':
        return <DonorAnalysis donor={donor} onClose={() => setView('dashboard')} />;
      default:
        return <KeyInformation donor={donor} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        {/* Persistent Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {donor['First Name']} {donor['Last Name']}
              </h2>
              <p className="text-gray-500">
                DS Rating: {donor['DS Rating']} | Quality Score: {donor['Quality Score']}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              Add Note
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate(`/donors/${donor.id}/notes`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
              Show Notes
              <ChevronRight className="w-4 h-4" />
            </button>

            {view === 'dashboard' ? (
              <>
                <button
                  onClick={() => setView('analysis')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Start Analysis
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setView('paths')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Start Path
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}

        {/* Note Modal */}
        {showNoteModal && (
          <NoteModal
            isOpen={showNoteModal}
            onClose={() => setShowNoteModal(false)}
            donorId={donorId}
          />
        )}
      </div>
    </div>
  );
}