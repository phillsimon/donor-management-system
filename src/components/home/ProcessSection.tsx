import React from 'react';
import { LineChart, Target, Handshake } from 'lucide-react';

export function ProcessSection() {
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-teal-500 font-semibold tracking-wide uppercase">Our Process</h2>
          <p className="mt-2 text-3xl font-extrabold text-navy-500 sm:text-4xl">
            Intelligent Donor Analysis
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-charcoal-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl mb-4">
                <LineChart className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-500">Data Analysis</h3>
              <p className="mt-2 text-charcoal-500">
                AI-powered analysis of giving history, wealth indicators, and engagement patterns.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-charcoal-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl mb-4">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-500">Strategy Generation</h3>
              <p className="mt-2 text-charcoal-500">
                Personalized approach strategies based on donor interests and giving capacity.
              </p>
            </div>

            <div className="relative p-6 bg-white rounded-xl shadow-sm border border-charcoal-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center w-12 h-12 bg-gold-50 rounded-xl mb-4">
                <Handshake className="h-6 w-6 text-gold-500" />
              </div>
              <h3 className="text-xl font-semibold text-navy-500">Engagement Planning</h3>
              <p className="mt-2 text-charcoal-500">
                Customized cultivation plans and communication recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}