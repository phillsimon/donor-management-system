import React from 'react';
import { Building2, Users, Gift, DollarSign } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="py-16 bg-navy-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-teal-500 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl font-extrabold text-navy-500 sm:text-4xl">
            Comprehensive Analysis Tools
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl">
                  <Building2 className="h-6 w-6 text-teal-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy-500">Organizational Alignment</h3>
                <p className="mt-2 text-charcoal-500">
                  Match donor interests with organizational priorities and campaign goals.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-xl">
                  <Users className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy-500">Relationship Mapping</h3>
                <p className="mt-2 text-charcoal-500">
                  Identify key connections and relationship networks within your donor base.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-gold-50 rounded-xl">
                  <Gift className="h-6 w-6 text-gold-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy-500">Giving Pattern Analysis</h3>
                <p className="mt-2 text-charcoal-500">
                  Deep analysis of historical giving patterns and philanthropic interests.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-50 rounded-xl">
                  <DollarSign className="h-6 w-6 text-teal-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-navy-500">Capacity Assessment</h3>
                <p className="mt-2 text-charcoal-500">
                  Comprehensive wealth screening and giving capacity evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}