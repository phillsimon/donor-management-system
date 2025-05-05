import React from 'react';
import {
  DollarSign,
  Users,
  Heart,
  Calendar,
  Building2,
  Target,
  Award,
  Gift,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { Donor } from '../../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  description?: string;
}

function MetricCard({ title, value, icon, trend, description }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon}
      </div>
      <div className="flex items-baseline">
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
        {trend && (
          <span className={`ml-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}

interface KeyInformationProps {
  donor: Donor;
}

export function KeyInformation({ donor }: KeyInformationProps) {
  // Calculate giving trends and patterns
  const totalGiving = parseFloat(donor['Total Gift Amount'].replace(/[$,]/g, '')) || 0;
  const giftCount = donor['# Of Gifts'];
  const averageGift = giftCount > 0 ? totalGiving / giftCount : 0;

  // Calculate capacity indicators
  const estimatedCapacity = donor['Estimated Capacity'];
  const realEstateValue = donor['Real Estate Est'];
  const businessRevenue = donor['Business Revenue'];

  // Calculate affinity scores
  const annualFundLikelihood = donor['Annual Fund Likelihood'];
  const majorGiftLikelihood = donor['Major Gift Likelihood'];

  // Calculate engagement metrics
  const philanthropyCount = donor['Philanthropy and Grantmaking Count'];
  const educationGiftCount = donor['Education Gift Count'];
  const artsGiftCount = donor['Arts Gift Count'];
  const totalEngagements = philanthropyCount + educationGiftCount + artsGiftCount;

  return (
    <div className="space-y-6">
      {/* Key Metrics Section */}
      <div className="lg:col-span-2 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Estimated Capacity"
            value={estimatedCapacity}
            icon={<DollarSign className="h-6 w-6 text-green-500" />}
            description="Total giving potential based on wealth indicators"
          />
          <MetricCard
            title="Total Giving"
            value={donor['Total Of Likely Matches']}
            icon={<Gift className="h-6 w-6 text-blue-500" />}
            description={`${giftCount} total gifts`}
          />
          <MetricCard
            title="Annual Fund Likelihood"
            value={`${annualFundLikelihood}%`}
            icon={<Heart className="h-6 w-6 text-red-500" />}
            description="Probability of annual fund participation"
          />
          <MetricCard
            title="Major Gift Likelihood"
            value={`${majorGiftLikelihood}%`}
            icon={<Target className="h-6 w-6 text-purple-500" />}
            description="Probability of major gift participation"
          />
        </div>

        {/* Wealth Indicators */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Wealth Indicators</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Real Estate</span>
              </div>
              <p className="text-lg font-semibold">{realEstateValue}</p>
              <p className="text-sm text-gray-500">Properties: {donor['# Of Prop']}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <span className="font-medium">Business Revenue</span>
              </div>
              <p className="text-lg font-semibold">{businessRevenue}</p>
              <p className="text-sm text-gray-500">
                Business Affiliation: {donor['Business Affiliation']}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Summary */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Engagement Summary</h3>
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-purple-600" />
            <span className="font-medium text-purple-900">Total Engagements</span>
          </div>
          <div className="text-3xl font-bold text-purple-900 mb-4">
            {totalEngagements}
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Philanthropy</span>
              <span className="font-medium text-purple-900">{philanthropyCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Education</span>
              <span className="font-medium text-purple-900">{educationGiftCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-700">Arts</span>
              <span className="font-medium text-purple-900">{artsGiftCount}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-4">
            {donor['Last Gift Date'] && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Last Gift</p>
                  <p className="text-sm text-gray-500">
                    {donor['Last Gift Date']} - {donor['Last Gift Amount']}
                  </p>
                </div>
              </div>
            )}
            {donor['Largest Gift Date'] && (
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Largest Gift</p>
                  <p className="text-sm text-gray-500">
                    {donor['Largest Gift Date']} - {donor['Largest Gift Amount']}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-4">Recommendations</h4>
          <div className="space-y-3">
            {majorGiftLikelihood > 70 && (
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <p>High potential for major gift cultivation</p>
              </div>
            )}
            {annualFundLikelihood > 70 && (
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <p>Strong candidate for annual fund leadership</p>
              </div>
            )}
            {totalEngagements > 5 && (
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <p>High engagement level - consider board involvement</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}