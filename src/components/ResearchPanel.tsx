import React from 'react';
import { ExternalLink, Building2, DollarSign, Users, Award } from 'lucide-react';
import type { Donor } from '../types';

interface ResearchPanelProps {
  donor: Donor;
}

export function ResearchPanel({ donor }: ResearchPanelProps) {
  const getLinkedInSearchUrl = () => {
    const name = `${donor['First Name']} ${donor['Last Name']}`;
    return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(name)}`;
  };

  const getGoogleNewsUrl = () => {
    const name = `${donor['First Name']} ${donor['Last Name']}`;
    return `https://news.google.com/search?q=${encodeURIComponent(name)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Research & Qualification</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-3">Capacity Indicators</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h5 className="font-medium text-blue-900">Real Estate</h5>
              </div>
              <p className="text-blue-800">{donor['Real Estate Est']}</p>
              <p className="text-sm text-blue-600 mt-1">Properties: {donor['# Of Prop']}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h5 className="font-medium text-green-900">Business & Securities</h5>
              </div>
              <p className="text-green-800">Revenue: {donor['Business Revenue']}</p>
              <p className="text-sm text-green-600 mt-1">SEC Value: {donor['SEC Stock Value']}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-3">Affinity Indicators</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <h5 className="font-medium text-purple-900">Philanthropic Activity</h5>
              </div>
              <p className="text-purple-800">
                {donor['Philanthropy and Grantmaking Count']} grants totaling {donor['Philanthropy and Grantmaking Total']}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-orange-600" />
                <h5 className="font-medium text-orange-900">Education Support</h5>
              </div>
              <p className="text-orange-800">
                {donor['Education Gift Count']} gifts totaling {donor['Education Gift Amount']}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-700 mb-3">External Research</h4>
          <div className="flex flex-wrap gap-4">
            <a
              href={getLinkedInSearchUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              LinkedIn Search
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href={getGoogleNewsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              News Search
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}