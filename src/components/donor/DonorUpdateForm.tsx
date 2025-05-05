import React, { useState } from 'react';
import { Save, Upload, AlertCircle, Loader2 } from 'lucide-react';
import type { Donor } from '../../types';
import { supabase } from '../../lib/supabase';

interface DonorUpdateFormProps {
  donor: Donor;
  onSave: (updatedDonor: Donor) => void;
  onCancel: () => void;
}

export function DonorUpdateForm({ donor, onSave, onCancel }: DonorUpdateFormProps) {
  const [formData, setFormData] = useState<Partial<Donor>>(donor);
  const [narrative, setNarrative] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group fields by category
  const fieldGroups = {
    'Personal Information': [
      'First Name', 'Middle Name', 'Last Name', 'Prefix', 'Suffix',
      'Age', 'Date Of Birth', 'Phone Number'
    ],
    'Address': [
      'Address', 'Address 2', 'City', 'State', 'Zip'
    ],
    'Spouse Information': [
      'SP-First', 'SP-Middle', 'SP-Last'
    ],
    'Giving History': [
      'Total Gift Amount', '# Of Gifts', 'Last Gift Date', 'Last Gift Amount',
      'Largest Gift Amount', 'Largest Gift Date', 'First Gift Amount',
      'num_of_gift_matches'
    ],
    'Capacity Indicators': [
      'DS Rating', 'Quality Score', 'Estimated Capacity', 'Business Revenue',
      'Real Estate Est', 'SEC Stock Value', 'Fnd Assets'
    ],
    'Likelihood Scores': [
      'Annual Fund Likelihood', 'Major Gift Likelihood', 'RFM Total',
      'Classic Quality Score'
    ]
  };

  // Find empty fields that need attention
  const emptyFields = Object.entries(donor).filter(([key, value]) => {
    const skipFields = ['Middle Name', 'Address 2', 'Notes', 'Client ID'];
    if (skipFields.includes(key)) return false;
    return !value || value === '' || value === '$0' || value === 0;
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

      const { error: updateError } = await supabase
        .from('donors')
        .update(formData)
        .eq('id', donor.id);

      if (updateError) throw updateError;

      if (narrative) {
        const updatedNotes = donor.Notes 
          ? `${donor.Notes}\n\n${new Date().toISOString()}: ${narrative}`
          : `${new Date().toISOString()}: ${narrative}`;

        const { error: notesError } = await supabase
          .from('donors')
          .update({ Notes: updatedNotes })
          .eq('id', donor.id);

        if (notesError) throw notesError;
      }

      onSave({ ...donor, ...formData, Notes: narrative ? donor.Notes + '\n\n' + narrative : donor.Notes });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update donor');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: string) => {
    const value = formData[field as keyof Donor] || '';
    const isEmptyField = emptyFields.includes(field);
    const isNumericField = [
      'Age', '# Of Gifts', 'Annual Fund Likelihood', 'Major Gift Likelihood',
      'RFM Total', 'Quality Score', 'Classic Quality Score', 'num_of_gift_matches'
    ].includes(field);

    const displayLabel = field === 'num_of_gift_matches' ? '# Of Gift Matches' : field;

    return (
      <div key={field} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {displayLabel}
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

        {/* Narrative Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Additional Information
          </label>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter any additional information about this donor..."
          />
        </div>

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