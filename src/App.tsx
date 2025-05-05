import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { DonorList } from './components/donor/DonorList';
import { DonorDetails } from './components/donor/DonorDetails';
import { DataUpload } from './pages/DataUpload';
import { AuthProvider } from './contexts/AuthContext';
import { RBACRoute } from './components/auth/RBACRoute';
import { useDonors } from './hooks/useDonors';
import type { Donor } from './types';
import { DonorNotesPage } from './pages/DonorNotesPage';

function ProspectsPage() {
  const {
    donors,
    loading: donorsLoading,
    error,
    addDonors,
    deleteDonor,
    updateDonor
  } = useDonors();

  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const handleResetDonor = () => {
    setSelectedDonor(null);
  };

  if (donorsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedDonor ? (
        <DonorDetails
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
          onResetDonor={handleResetDonor}
        />
      ) : (
        <DonorList
          donors={donors}
          onSelectDonor={setSelectedDonor}
          onAddDonors={addDonors}
          onDeleteDonor={deleteDonor}
          onUpdateDonor={updateDonor}
        />
      )}
    </div>
  );
}

function App() {
  const handleResetDonor = () => {
    // Optional: Add logic to reset donor state globally if needed
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <Header onResetDonor={handleResetDonor} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/upload"
              element={
                <RBACRoute requiredPermissions={['donors.create']}>
                  <DataUpload />
                </RBACRoute>
              }
            />
            <Route path="/donors/:donorId/notes" element={<DonorNotesPage />} />
            <Route
              path="/prospects"
              element={
                <RBACRoute requiredPermissions={['donors.read']}>
                  <ProspectsPage />
                </RBACRoute>
              }
            />
          </Routes>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;