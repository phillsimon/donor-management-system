import React from 'react';
import { DonorDashboard } from './DonorDashboard';
import type { Donor } from '../types';

interface DonorDetailsProps {
  donor: Donor;
  onClose: () => void;
  onResetDonor: () => void;
}

export function DonorDetails({ donor, onClose, onResetDonor }: DonorDetailsProps) {
  return <DonorDashboard donor={donor} onClose={onClose} onResetDonor={onResetDonor} />;
}