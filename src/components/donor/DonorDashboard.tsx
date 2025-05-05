import React from 'react';
import type { Donor } from '../../types';
import { KeyInformation } from './KeyInformation';

interface DonorDashboardProps {
  donor: Donor;
  onClose: () => void;
  onResetDonor: () => void;
}

export function DonorDashboard({ donor }: DonorDashboardProps) {
  return <KeyInformation donor={donor} />;
}