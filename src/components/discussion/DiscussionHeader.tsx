import React from 'react';
import { MessageSquareText } from 'lucide-react';

export function DiscussionHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <MessageSquareText className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">Discussion</h1>
      </div>
      <p className="mt-2 text-gray-600">
        Connect and engage with other team members about donor prospects and strategies.
      </p>
    </div>
  );
}