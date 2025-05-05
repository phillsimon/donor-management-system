import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gift, LogIn, LogOut, Tag } from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../hooks/useRBAC';
import { signOut } from '../../lib/auth';

interface HeaderProps {
  onResetDonor: () => void;
}

export function Header({ onResetDonor }: HeaderProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const { hasRole } = useRBAC();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Reset state first
      onResetDonor();
      
      // Attempt to sign out
      const { error } = await signOut();

      if (error) {
        console.error('Error signing out:', error);
      }

      // Force a full page reload to clear all state
      window.location.href = '/';
    } catch (err) {
      console.error('Error in handleSignOut:', err);
      // Still force reload to ensure clean state
      window.location.href = '/';
    }
  };

  const handleProspectsClick = () => {
    onResetDonor();
    navigate('/prospects');
  };

  // Get user's full name from metadata
  const fullName = user?.user_metadata?.full_name;

  return (
    <>
      <nav className="bg-white border-b border-charcoal-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Gift className="h-8 w-8 text-teal-500" />
                <span className="ml-2 text-xl font-semibold text-navy-500">DonorPath</span>
                <div className="ml-2 px-2 py-1 bg-teal-50 rounded-md flex items-center gap-1">
                  <Tag className="w-3 h-3 text-teal-500" />
                  <span className="text-xs font-medium text-teal-600">v1.5.0</span>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-charcoal-500 hover:text-navy-500">Dashboard</Link>
              {user && (
                <>
                  <button 
                    onClick={handleProspectsClick}
                    className="text-charcoal-500 hover:text-navy-500"
                  >
                    Prospects
                  </button>
                  {hasRole('admin') && (
                    <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-md text-sm">
                      Admin
                    </span>
                  )}
                  {fullName && (
                    <span className="text-charcoal-500">
                      {fullName}
                    </span>
                  )}
                </>
              )}
              {user ? (
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 bg-charcoal-50 text-charcoal-700 px-4 py-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}