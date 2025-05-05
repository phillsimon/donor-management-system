import React from 'react';
import { Construction } from 'lucide-react';

export function ComingSoon() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="flex justify-center mb-6">
        <Construction className="h-16 w-16 text-purple-600" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Discussion Feature Coming Soon
      </h2>
      <p className="text-gray-600 max-w-md mx-auto">
        We're working on building a better way for you to collaborate and share insights about donor prospects. Check back soon for updates!
      </p>
    </div>
  );
}