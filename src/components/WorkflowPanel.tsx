import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Mail,
  Phone,
  FileText,
  Gift,
  Building2,
  DollarSign,
  Award,
  Heart,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import type { Donor } from '../types';
import { useWorkflowResponses } from '../hooks/useWorkflowResponses';

interface WorkflowPanelProps {
  donor: Donor;
}

interface Step {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  recommendations: string[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'select' | 'radio' | 'checkbox';
  options?: string[];
  required?: boolean;
}

interface Answer {
  questionId: string;
  value: string | string[];
}

export function WorkflowPanel({ donor }: WorkflowPanelProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { responses, loading, error, saveResponse } = useWorkflowResponses(donor['Client ID'] || donor['First Name']);

  useEffect(() => {
    if (responses.length > 0) {
      const savedAnswers: Record<string, Answer> = {};
      responses.forEach(response => {
        savedAnswers[response.question_id] = {
          questionId: response.question_id,
          value: response.response
        };
      });
      setAnswers(savedAnswers);
    }
  }, [responses]);

  const steps: Step[] = [
    {
      id: 'initial-research',
      title: 'Initial Research & Qualification',
      description: 'Let\'s analyze the donor\'s capacity and affinity.',
      questions: [
        {
          id: 'capacity-review',
          text: 'Have you reviewed the following wealth indicators?',
          type: 'checkbox',
          options: [
            'Real estate holdings',
            'Business affiliations',
            'Stock holdings',
            'Previous philanthropic giving'
          ],
          required: true
        },
        {
          id: 'giving-history',
          text: 'Based on their giving history, what is their typical gift range?',
          type: 'select',
          options: [
            'Under $1,000',
            '$1,000 - $5,000',
            '$5,000 - $10,000',
            'Over $10,000'
          ],
          required: true
        }
      ],
      recommendations: [
        `Based on wealth screening, ${donor['First Name']}'s estimated capacity is ${donor['Estimated Capacity']}`,
        `Previous giving history shows ${donor['Total Gift Amount']} across ${donor['# Of Gifts']} gifts`,
        `Consider focusing on ${donor['Higher Education Count'] > 0 ? 'education' : 'healthcare'} initiatives based on giving patterns`
      ]
    },
    {
      id: 'outreach-strategy',
      title: 'Outreach Strategy Planning',
      description: 'Let\'s determine the best way to connect.',
      questions: [
        {
          id: 'connection-path',
          text: 'What is your warmest connection path to the donor?',
          type: 'radio',
          options: [
            'Board member introduction',
            'Existing donor referral',
            'Professional network',
            'Cold outreach needed'
          ],
          required: true
        },
        {
          id: 'preferred-contact',
          text: 'What contact methods do you have available?',
          type: 'checkbox',
          options: [
            'Email address',
            'Phone number',
            'Mailing address',
            'LinkedIn profile'
          ]
        }
      ],
      recommendations: [
        'Personalized email is recommended for initial contact',
        'Consider mentioning their 13-year giving history',
        'Reference specific impact in their areas of interest'
      ]
    },
    {
      id: 'meeting-prep',
      title: 'First Meeting Preparation',
      description: 'Let\'s prepare for the initial conversation.',
      questions: [
        {
          id: 'meeting-goals',
          text: 'What are your primary goals for the first meeting?',
          type: 'checkbox',
          options: [
            'Learn about their philanthropic interests',
            'Share organizational impact',
            'Discuss specific funding opportunities',
            'Build personal connection'
          ]
        },
        {
          id: 'meeting-materials',
          text: 'What materials will you prepare?',
          type: 'checkbox',
          options: [
            'Impact report',
            'Project overview',
            'Financial statements',
            'Testimonials'
          ]
        }
      ],
      recommendations: [
        'Focus on listening (80%) over talking (20%)',
        'Prepare 2-3 specific impact stories',
        'Have gift range options ready if asked'
      ]
    },
    {
      id: 'cultivation-plan',
      title: 'Cultivation Plan Development',
      description: 'Let\'s create a personalized engagement strategy.',
      questions: [
        {
          id: 'engagement-preferences',
          text: 'What types of engagement would interest this donor?',
          type: 'checkbox',
          options: [
            'Site visits',
            'Executive briefings',
            'Donor events',
            'Program updates'
          ]
        },
        {
          id: 'timeline',
          text: 'What is your estimated timeline for making an ask?',
          type: 'select',
          options: [
            '1-3 months',
            '3-6 months',
            '6-12 months',
            'Over 12 months'
          ]
        }
      ],
      recommendations: [
        'Consider quarterly touchpoints',
        'Plan engagement around their interests',
        'Document all interactions and preferences'
      ]
    }
  ];

  const currentStep = steps[currentStepIndex];

  const handleAnswer = async (questionId: string, value: string | string[]) => {
    try {
      const stringValue = Array.isArray(value) ? JSON.stringify(value) : value;
      await saveResponse(currentStep.id, questionId, stringValue);
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: { questionId, value }
      }));
    } catch (err) {
      console.error('Failed to save response:', err);
    }
  };

  const handleNoteChange = (stepId: string, note: string) => {
    setNotes(prev => ({
      ...prev,
      [stepId]: note
    }));
  };

  const canProceed = () => {
    const requiredQuestions = currentStep.questions.filter(q => q.required);
    return requiredQuestions.every(q => answers[q.id]?.value);
  };

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id]?.value || '';

    switch (question.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(currentAnswer) && currentAnswer.includes(option)}
                  onChange={(e) => {
                    const newValue = Array.isArray(currentAnswer) ? currentAnswer : [];
                    if (e.target.checked) {
                      handleAnswer(question.id, [...newValue, option]);
                    } else {
                      handleAnswer(question.id, newValue.filter(v => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'select':
        return (
          <div className="relative">
            <select
              value={currentAnswer as string}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              className="mt-1 block w-full rounded-md border-2 border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-500">Select an option...</option>
              {question.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 mt-1">
              <ChevronRight className="h-4 w-4 text-gray-400 rotate-90" />
            </div>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer as string}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="h-2 bg-gray-200 rounded-t-lg">
        <div
          className="h-full bg-blue-600 rounded-tl-lg transition-all duration-300"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Cultivation Strategy</h2>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentStep.title}</h3>
            <p className="mt-1 text-gray-600">{currentStep.description}</p>
          </div>

          <div className="space-y-6">
            {currentStep.questions.map(question => (
              <div key={question.id} className="space-y-2">
                <label className="block font-medium text-gray-700">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {currentStep.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-blue-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Notes for this step
            </label>
            <textarea
              value={notes[currentStep.id] || ''}
              onChange={(e) => handleNoteChange(currentStep.id, e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes or observations..."
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
              disabled={!canProceed() || currentStepIndex === steps.length - 1}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}