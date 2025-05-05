import React, { useState } from 'react';
import { Hero } from '../components/home/Hero';
import { ProcessSection } from '../components/home/ProcessSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { CTASection } from '../components/home/CTASection';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import { Upload, Users, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { hasRole, loading } = useRBAC();
  const navigate = useNavigate();

  if (user) {
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      );
    }

    const isAdmin = hasRole('admin');

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to DonorPath
            </h1>
            {isAdmin ? (
              <div className="px-3 py-1 bg-teal-50 text-teal-600 rounded-md text-sm inline-block mb-4">
                Admin Access
              </div>
            ) : (
              <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm inline-block mb-4">
                Not an admin
              </div>
            )}
            <p className="text-lg text-gray-600">
              What would you like to do today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <button
              onClick={() => navigate('/upload')}
              className="group relative bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-purple-500 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Upload className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Upload Data Files
                </h3>
                <p className="text-gray-600">
                  Import new donor records and update your database
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/prospects')}
              className="group relative bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-teal-500 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Launch Cultivation Path
                </h3>
                <p className="text-gray-600">
                  Start analyzing and engaging with your donors
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/prospects')}
              className="group relative bg-white p-8 rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Update Existing Account Data
                </h3>
                <p className="text-gray-600">
                  Modify and manage your current donor records
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ProcessSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}