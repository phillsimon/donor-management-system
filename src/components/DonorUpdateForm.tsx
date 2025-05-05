import React, { useState } from 'react';
import { Save, Upload, AlertCircle, Loader2 } from 'lucide-react';
import type { Donor } from '../types';
import { supabase } from '../lib/supabase';

interface DonorUpdateFormProps {
  donor: Donor;
  onSave: (updatedDonor: Donor) => void;
  onCancel: () => void;
}

export function DonorUpdateForm({ donor, onSave, onCancel }: DonorUpdateFormProps) {
  const [formData, setFormData] = useState<Partial<Donor>>(donor);
  const [narrative, setNarrative] = useState(donor.Notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group fields by category
  const fieldGroups = {
    'Personal Information': [
      'First Name',
      'Middle Name',
      'Last Name',
      'Prefix',
      'Suffix',
      'Age',
      'Date Of Birth',
      'Phone Number',
      'Email'
    ],
    'Address Information': [
      'Address',
      'Address 2',
      'City',
      'State',
      'Zip'
    ],
    'Spouse Information': [
      'SP-First',
      'SP-Middle',
      'SP-Last'
    ],
    'Giving History': [
      'Total Gift Amount',
      '# Of Gifts',
      'Last Gift Date',
      'Last Gift Amount',
      'Largest Gift Amount',
      'Largest Gift Date',
      'First Gift Amount',
      'First Date Range',
      'Total Of Likely Matches',
      '# Of Gift Matches',
      'Largest Gift Found',
      'Largest Gift Found Lower Range'
    ],
    'Capacity Indicators': [
      'DS Rating',
      'Quality Score',
      'Estimated Capacity',
      'Wealth-Based Capacity',
      'Business Revenue',
      'Business Affiliation',
      'Real Estate Est',
      '# Of Prop',
      'Real Estate Trust',
      '# of ST w/Prop',
      'SEC Stock Value',
      'SEC Stock or Insider',
      'Market Guide',
      'Market Guide Comp',
      'Market Guide Options'
    ],
    'Foundation & Nonprofit': [
      'Foundation',
      'Fnd Assets',
      'NonProfit',
      'IRS 990PF',
      'IRS PUB78'
    ],
    'Political Giving': [
      'Political Likely Count',
      'Political Likely Total',
      'Republican Gift Count',
      'Republican Gift Total',
      'Democratic Gift Count',
      'Democratic Gift Amount',
      'Other Political Count',
      'Other Political Total'
    ],
    'Education & Philanthropy': [
      'Higher Education Count',
      'Higher Education Total',
      'Education Gift Count',
      'Education Gift Amount',
      'Philanthropy and Grantmaking Count',
      'Philanthropy and Grantmaking Total'
    ],
    'Healthcare & Arts': [
      'Healthcare Count',
      'Healthcare Total',
      'Arts Gift Count',
      'Arts Gift Amount'
    ],
    'Religious & Social': [
      'Religion Count',
      'Religion Total',
      'Society Benefit Count',
      'Society Benefit Total'
    ],
    'Likelihood Scores': [
      'Annual Fund Likelihood',
      'Major Gift Likelihood',
      'RFM Total',
      'RFM Recent Gift',
      'RFM Freq',
      'RFM Money',
      'Quality Score',
      'Classic Quality Score'
    ],
    'Assets & Net Worth': [
      'Average Home Value',
      'Median Household Income',
      'Zestimate Total',
      'Zestimate Count',
      'LN Total',
      'LN Count',
      'Pension Admin',
      'Pension Assets',
      'MBT Net Worth',
      'MBT Income Estimate',
      'MBT Highest Asset',
      'Shale Wealth'
    ],
    'Additional Indicators': [
      'PGID',
      'Vip Match',
      'Inner Circle',
      'Corp Tech',
      'FAA Pilots',
      'Airplane Owner',
      'Boat Owner',
      'Whos Who'
    ],
    'Notes & Comments': [
      'Notes'
    ],
    'Custom Fields': [
      'User1', 'User2', 'User3', 'User4', 'User5',
      'User6', 'User7', 'User8', 'User9', 'User10',
      'User11', 'User12', 'User13', 'User14', 'User15',
      'User16', 'User17', 'User18', 'User19', 'User20'
    ],
    'System Fields': [
      'Client ID',
      'Profile',
      'Assessed',
      'Assessment Questions',
      'Date Searched'
    ]
  };

  // Find empty fields that need attention
  const emptyFields = Object.entries(donor).filter(([key, value]) => {
    // Fields that can be empty
    const optionalFields = [
      'Middle Name', 'Address 2', 'Notes', 'Client ID',
      'User1', 'User2', 'User3', 'User4', 'User5',
      'User6', 'User7', 'User8', 'User9', 'User10',
      'User11', 'User12', 'User13', 'User14', 'User15',
      'User16', 'User17', 'User18', 'User19', 'User20',
      'Assessment Questions', 'Date Searched'
    ];

    if (optionalFields.includes(key)) return false;

    // Check for empty values
    return !value || 
           value === '' || 
           value === '$0' || 
           value === 0 ||
           (typeof value === 'string' && value.trim() === '');
  }).map(([key]) => key);

  const handleInputChange = (field: keyof Donor, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update the Notes field with the narrative content
      const updatedData = {
        ...formData,
        Notes: narrative
      };

      const { error: updateError } = await supabase
        .from('donors')
        .update(updatedData)
        .eq('id', donor.id);

      if (updateError) throw updateError;

      onSave({ ...donor, ...updatedData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update donor');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: string) => {
    const value = formData[field as keyof Donor] || '';
    const isEmptyField = emptyFields.includes(field);
    
    // Determine if field should be numeric
    const numericFields = [
      'Age', '# Of Gifts', 'Annual Fund Likelihood', 'Major Gift Likelihood',
      'RFM Total', 'Quality Score', 'Classic Quality Score', '# Of Gift Matches',
      'Political Likely Count', 'Zestimate Count', 'LN Count', '# Of Prop',
      '# of ST w/Prop', 'PGID', 'Inner Circle', 'RFM Recent Gift', 'RFM Freq',
      'RFM Money', 'Higher Education Count', 'Education Gift Count',
      'Philanthropy and Grantmaking Count', 'Healthcare Count', 'Arts Gift Count',
      'Republican Gift Count', 'Democratic Gift Count', 'Other Political Count',
      'Religion Count', 'Society Benefit Count', 'Shale Wealth'
    ];

    const isNumericField = numericFields.includes(field);

    // Special handling for Notes field
    if (field === 'Notes') {
      return (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {field}
          </label>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      );
    }

    return (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field}
          {isEmptyField && <span className="text-amber-500 ml-1">*</span>}
        </label>
        {isNumericField ? (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field as keyof Donor, parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              isEmptyField ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
            }`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field as keyof Donor, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              isEmptyField ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
            }`}
          />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Update {donor['First Name']} {donor['Last Name']}
        </h2>
        {emptyFields.length > 0 && (
          <p className="mt-2 text-sm text-amber-600">
            {emptyFields.length} field(s) need attention
          </p>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Field Groups */}
        {Object.entries(fieldGroups).map(([groupName, fields]) => (
          <div key={groupName} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              {groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map(field => renderField(field))}
            </div>
          </div>
        ))}

        {/* Media Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Media
          </label>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Upload className="w-4 h-4" />
            Choose Files
          </button>
          <p className="text-sm text-gray-500">
            Coming soon: Upload documents, images, or other media related to this donor
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}