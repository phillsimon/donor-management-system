import React from 'react';
import { DiscussionHeader } from '../components/discussion/DiscussionHeader';
import { TopicList } from '../components/discussion/TopicList';
import { Guidelines } from '../components/discussion/Guidelines';
import { ComingSoon } from '../components/discussion/ComingSoon';

const topics = [
  { id: '1', title: 'Donor engagement strategies' },
  { id: '2', title: 'Campaign planning' },
  { id: '3', title: 'Best practices' },
  { id: '4', title: 'Success stories' },
];

const guidelines = [
  { id: '1', text: 'Be respectful and professional' },
  { id: '2', text: 'Share relevant experiences' },
  { id: '3', text: 'Maintain donor confidentiality' },
  { id: '4', text: 'Focus on constructive feedback' },
];

export function Discussion() {
  const handleTopicSelect = (topic: { id: string; title: string }) => {
    console.log('Selected topic:', topic);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DiscussionHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ComingSoon />
        </div>
        
        <div className="space-y-6">
          <TopicList topics={topics} onSelectTopic={handleTopicSelect} />
          <Guidelines guidelines={guidelines} />
        </div>
      </div>
    </div>
  );
}