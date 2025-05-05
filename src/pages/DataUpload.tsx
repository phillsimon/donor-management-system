import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import type { Donor } from '../types';
import { useDonors } from '../hooks/useDonors';

interface ValidationResult {
  field: string;
  records: number[];
}

export function DataUpload() {
  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationIssues, setValidationIssues] = useState<ValidationResult[]>([]);
  const [uploadedData, setUploadedData] = useState<Donor[]>([]);
  const { addDonors } = useDonors();
  const navigate = useNavigate();

  const requiredFields = [
    'First Name',
    'Last Name',
    'DS Rating',
    'Address',
    'City',
    'State',
    'Zip'
  ];

  const validateData = (data: any[]): ValidationResult[] => {
    console.log('Validating data:', data);
    const issues: ValidationResult[] = [];

    requiredFields.forEach(field => {
      const emptyRecords = data
        .map((record, index) => {
          const value = record[field];
          console.log(`Checking field "${field}" in record ${index + 1}:`, value);
          
          // Check for undefined, null, or empty string (after trimming)
          const isEmpty = value === undefined || 
                         value === null || 
                         (typeof value === 'string' && value.trim() === '');
          
          return { value, index, isEmpty };
        })
        .filter(({ isEmpty }) => isEmpty)
        .map(({ index }) => index + 1);

      if (emptyRecords.length > 0) {
        console.log(`Found empty records for field "${field}":`, emptyRecords);
        issues.push({
          field,
          records: emptyRecords
        });
      }
    });

    console.log('Validation issues:', issues);
    return issues;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setValidationIssues([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true, // Skip empty lines
      transformHeader: (header: string) => header.trim(), // Trim whitespace from headers
      complete: (results) => {
        setUploading(false);
        setValidating(true);

        console.log('Parsed CSV data:', results);
        console.log('Headers:', results.meta.fields);
        console.log('First row:', results.data[0]);

        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }

        const data = results.data as Donor[];
        const issues = validateData(data);
        setValidationIssues(issues);
        setUploadedData(data);
        setValidating(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setUploading(false);
      }
    });
  };

  const handleConfirmUpload = async () => {
    try {
      setUploading(true);
      await addDonors(uploadedData);
      // Force a reload of the prospects page by including a timestamp parameter
      navigate('/prospects?t=' + Date.now());
    } catch (error) {
      console.error('Error adding donors:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Upload Donor Data
          </h1>

          <div className="mb-8">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">CSV files only</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={uploading || validating}
                />
              </label>
            </div>
          </div>

          {(uploading || validating) && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">
                {uploading ? 'Uploading...' : 'Validating...'}
              </span>
            </div>
          )}

          {validationIssues.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Validation Issues Found
              </h2>
              <div className="bg-red-50 p-4 rounded-lg">
                <ul className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <li key={index} className="text-red-700">
                      <span className="font-medium">{issue.field}:</span> Missing data in
                      records {issue.records.join(', ')}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-red-600">
                  Please fix these issues in your CSV file and upload again.
                </p>
              </div>
            </div>
          )}

          {uploadedData.length > 0 && validationIssues.length === 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  {uploadedData.length} records validated successfully
                </span>
              </div>
              <button
                onClick={handleConfirmUpload}
                disabled={uploading}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Upload'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}