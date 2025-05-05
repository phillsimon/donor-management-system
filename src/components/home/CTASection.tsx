import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function CTASection() {
  return (
    <div className="bg-navy-500">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to analyze your prospects?</span>
          <span className="block text-teal-200">Start your first AI-powered analysis today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link to="/prospects" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-navy-600 bg-white hover:bg-navy-50">
              Begin Analysis
              <ChevronRight className="ml-3 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}