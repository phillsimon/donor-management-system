import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import type { Donor } from '../../types';

interface FileUploadProps {
  onUploadComplete: (donors: Donor[]) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ total: number } | null>(null);

  // Expected number of fields in the CSV
  const EXPECTED_FIELDS = 125;

  const validateData = (data: any[]): data is Donor[] => {
    // Check if we have any data
    if (!data.length) {
      throw new Error('The CSV file appears to be empty');
    }

    // Check the number of fields in the first row
    const firstRow = data[0];
    const fieldCount = Object.keys(firstRow).length;
    if (fieldCount !== EXPECTED_FIELDS) {
      throw new Error(
        `Invalid CSV format: Expected ${EXPECTED_FIELDS} columns but found ${fieldCount}. Please ensure you're using the correct CSV template.`
      );
    }

    // Required fields that must be present
    const requiredFields = [
      'First Name',
      'Last Name',
      'DS Rating',
      'Address',
      'City',
      'State',
      'Zip'
    ];

    // Check for required fields
    const missingFields = requiredFields.filter(field => !firstRow.hasOwnProperty(field));
    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields: ${missingFields.join(', ')}. Please check your CSV file.`
      );
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 1;
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          throw new Error(
            `Row ${rowNumber}: Missing required value for "${field}". All required fields must have values.`
          );
        }
      });
    });

    return true;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      setLoading(false);
      return;
    }

    // Configure Papa Parse with detailed error handling
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // Skip empty lines and trim whitespace
      transformHeader: (header: string) => header.trim(), // Trim whitespace from headers
      complete: (results) => {
        try {
          // Log parsing results for debugging
          console.log('CSV Parse Results:', {
            rows: results.data.length,
            fields: results.meta.fields?.length,
            errors: results.errors
          });

          // Check for parsing errors
          if (results.errors.length > 0) {
            const errorMessages = results.errors.map(err => 
              `Row ${err.row + 1}: ${err.message}`
            ).join('\n');
            throw new Error(`CSV parsing errors:\n${errorMessages}`);
          }

          // Validate data structure and content
          if (!validateData(results.data)) {
            throw new Error('Data validation failed');
          }

          // Transform data to match our schema
          const donors: Donor[] = results.data.map((row: any) => ({
            'First Name': row['First Name'] || '',
            'Middle Name': row['Middle Name'] || '',
            'Last Name': row['Last Name'] || '',
            'DS Rating': row['DS Rating'] || '',
            'Quality Score': parseFloat(row['Quality Score']) || 0,
            'Profile': row['Profile'] || '',
            'RFM Total': parseInt(row['RFM Total']) || 0,
            'Last Gift Date': row['Last Gift Date'] || '',
            'Total Gift Amount': row['Total Gift Amount'] || '$0',
            '# Of Gifts': parseInt(row['# Of Gifts']) || 0,
            'Age': parseInt(row['Age']) || 0,
            'Date Of Birth': row['Date Of Birth'] || '',
            'Phone Number': row['Phone Number'] || '',
            'Address': row['Address'] || '',
            'Address 2': row['Address 2'] || '',
            'City': row['City'] || '',
            'State': row['State'] || '',
            'Zip': row['Zip'] || '',
            'Client ID': row['Client ID'] || '',
            'SP-First': row['SP-First'] || '',
            'SP-Middle': row['SP-Middle'] || '',
            'SP-Last': row['SP-Last'] || '',
            'Notes': row['Notes'] || '',
            'Largest Gift Amount': row['Largest Gift Amount'] || '$0',
            'Largest Gift Date': row['Largest Gift Date'] || '',
            'Last Gift Amount': row['Last Gift Amount'] || '$0',
            'First Date Range': row['First Date Range'] || '',
            'First Gift Amount': row['First Gift Amount'] || '$0',
            'Total Of Likely Matches': row['Total Of Likely Matches'] || '$0',
            '# Of Gift Matches': parseInt(row['# Of Gift Matches']) || 0,
            'Foundation': row['Foundation'] || 'No',
            'Fnd Assets': row['Fnd Assets'] || '$0',
            'NonProfit': row['NonProfit'] || 'Maybe',
            'Political Likely Count': parseInt(row['Political Likely Count']) || 0,
            'Political Likely Total': row['Political Likely Total'] || '$0',
            'Maybe Total': row['Maybe Total'] || '$0',
            'Largest Gift Found': row['Largest Gift Found'] || '$0',
            'Largest Gift Found Lower Range': row['Largest Gift Found Lower Range'] || '$0',
            'Wealth-Based Capacity': row['Wealth-Based Capacity'] || '',
            'Real Estate Est': row['Real Estate Est'] || '$0',
            '# Of Prop': parseInt(row['# Of Prop']) || 0,
            'Real Estate Trust': row['Real Estate Trust'] || 'No',
            '# of ST w/Prop': parseInt(row['# of ST w/Prop']) || 0,
            'Zestimate Total': row['Zestimate Total'] || '$0',
            'Zestimate Count': parseInt(row['Zestimate Count']) || 0,
            'LN Total': row['LN Total'] || '$0',
            'LN Count': parseInt(row['LN Count']) || 0,
            'SEC Stock Value': row['SEC Stock Value'] || '$0',
            'SEC Stock or Insider': row['SEC Stock or Insider'] || 'No',
            'Market Guide': row['Market Guide'] || 'No',
            'Market Guide Comp': row['Market Guide Comp'] || '$0',
            'Market Guide Options': row['Market Guide Options'] || '$0',
            'Business Revenue': row['Business Revenue'] || '$0',
            'Business Affiliation': row['Business Affiliation'] || 'Yes',
            'Pension Admin': row['Pension Admin'] || 'No',
            'Pension Assets': row['Pension Assets'] || '$0',
            'Estimated Capacity': row['Estimated Capacity'] || '$518,133',
            'Annual Fund Likelihood': parseInt(row['Annual Fund Likelihood']) || 97,
            'Major Gift Likelihood': parseInt(row['Major Gift Likelihood']) || 93,
            'PGID': parseInt(row['PGID']) || 7,
            'Vip Match': row['Vip Match'] || 'No',
            'Inner Circle': parseInt(row['Inner Circle']) || 0,
            'Average Home Value': row['Average Home Value'] || '$178,037',
            'Median Household Income': row['Median Household Income'] || '$57,308',
            'Corp Tech': row['Corp Tech'] || 'No',
            'FAA Pilots': row['FAA Pilots'] || 'No',
            'Airplane Owner': row['Airplane Owner'] || 'No',
            'Boat Owner': row['Boat Owner'] || 'No',
            'Whos Who': row['Whos Who'] || 'No',
            'RFM Recent Gift': parseInt(row['RFM Recent Gift']) || 0,
            'RFM Freq': parseInt(row['RFM Freq']) || 0,
            'RFM Money': parseInt(row['RFM Money']) || 0,
            'Classic Quality Score': parseFloat(row['Classic Quality Score']) || 16.3,
            'Prefix': row['Prefix'] || '',
            'Suffix': row['Suffix'] || '',
            'Higher Education Count': parseInt(row['Higher Education Count']) || 0,
            'Higher Education Total': row['Higher Education Total'] || '$0',
            'Education Gift Count': parseInt(row['Education Gift Count']) || 0,
            'Education Gift Amount': row['Education Gift Amount'] || '$0',
            'Philanthropy and Grantmaking Count': parseInt(row['Philanthropy and Grantmaking Count']) || 0,
            'Philanthropy and Grantmaking Total': row['Philanthropy and Grantmaking Total'] || '$0',
            'Healthcare Count': parseInt(row['Healthcare Count']) || 0,
            'Healthcare Total': row['Healthcare Total'] || '$0',
            'Arts Gift Count': parseInt(row['Arts Gift Count']) || 0,
            'Arts Gift Amount': row['Arts Gift Amount'] || '$0',
            'Republican Gift Count': parseInt(row['Republican Gift Count']) || 0,
            'Republican Gift Total': row['Republican Gift Total'] || '$0',
            'Democratic Gift Count': parseInt(row['Democratic Gift Count']) || 0,
            'Democratic Gift Amount': row['Democratic Gift Amount'] || '$0',
            'Other Political Count': parseInt(row['Other Political Count']) || 0,
            'Other Political Total': row['Other Political Total'] || '$0',
            'Religion Count': parseInt(row['Religion Count']) || 0,
            'Religion Total': row['Religion Total'] || '$0',
            'Society Benefit Count': parseInt(row['Society Benefit Count']) || 0,
            'Society Benefit Total': row['Society Benefit Total'] || '$0',
            'Shale Wealth': parseInt(row['Shale Wealth']) || 0,
            'MBT Net Worth': row['MBT Net Worth'] || '',
            'MBT Income Estimate': row['MBT Income Estimate'] || '',
            'MBT Highest Asset': row['MBT Highest Asset'] || '',
            'User1': row['User1'],
            'User2': row['User2'],
            'User3': row['User3'],
            'User4': row['User4'],
            'User5': row['User5'],
            'User6': row['User6'],
            'User7': row['User7'],
            'User8': row['User8'],
            'User9': row['User9'],
            'User10': row['User10'],
            'User11': row['User11'],
            'User12': row['User12'],
            'User13': row['User13'],
            'User14': row['User14'],
            'User15': row['User15'],
            'User16': row['User16'],
            'User17': row['User17'],
            'User18': row['User18'],
            'User19': row['User19'],
            'User20': row['User20'],
            'Email': row['Email'],
            'Assessed': row['Assessed'],
            'Assessment Questions': row['Assessment Questions'],
            'IRS 990PF': row['IRS 990PF'],
            'IRS PUB78': row['IRS PUB78'],
            'Date Searched': row['Date Searched']
          }));

          onUploadComplete(donors);
          setSuccess({ total: donors.length });
        } catch (err) {
          console.error('Validation error:', err);
          setError(err instanceof Error ? err.message : 'Failed to validate CSV data');
        }
        setLoading(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setError(`Failed to parse CSV file: ${error.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Upload Donor Data</h2>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center items-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
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
              disabled={loading}
            />
          </label>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing file...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-sm whitespace-pre-wrap">{error}</div>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>Successfully uploaded {success.total} donor{success.total !== 1 ? 's' : ''}!</span>
          </div>
        )}
      </div>
    </div>
  );
}