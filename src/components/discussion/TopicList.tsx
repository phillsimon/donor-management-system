import React from 'react';

interface Topic {
  id: string;
  title: string;
}

interface TopicListProps {
  topics: Topic[];
  onSelectTopic: (topic: Topic) => void;
}

export function TopicList({ topics, onSelectTopic }: TopicListProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Discussion Topics</h2>
      <ul className="space-y-3">
        {topics.map(topic => (
          <li key={topic.id}>
            <button
              onClick={() => onSelectTopic(topic)}
              className="w-full text-left px-4 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
            >
              {topic.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}