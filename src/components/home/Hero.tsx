import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Hero({ searchQuery, onSearchChange }: HeroProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-navy-500 sm:text-5xl md:text-6xl">
            <span className="block">AI-Powered</span>
            <span className="block text-teal-500">Donor Prospect Analysis</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-charcoal-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Leverage advanced AI to analyze donor prospects, determine optimal approach strategies, and maximize campaign success.
          </p>
          
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-charcoal-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search donor prospects..."
                className="w-full pl-10 pr-4 py-3 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}