"use client";

import { useState } from 'react';
import { CheckCircle, AlertCircle, Trophy, Code, Monitor, Database, Briefcase, Palette } from 'lucide-react';
import { AssessmentData } from '@/types/resume';

const CareerFeedback: React.FC<{
  assessmentData: AssessmentData;
  onRetakeAssessment: () => void;
}> = ({ assessmentData }) => {
  const [activeTab, setActiveTab] = useState<'technical' | 'soft'>('technical');

  const { results, skills } = assessmentData;
  const { overall_score, skill_scores, career_suggestions } = results;

  // Filter skills based on active tab and limit to 8
  const getFilteredSkills = () => {
    if (activeTab === 'technical') {
      const technicalSkillNames = skills.filter(skill => skill.type === 'technical').map(skill => skill.name);
      return skill_scores.filter(score => technicalSkillNames.includes(score.skill)).slice(0, 8);
    } else {
      const softSkillNames = skills.filter(skill => skill.type === 'soft').map(skill => skill.name);
      return skill_scores.filter(score => softSkillNames.includes(score.skill)).slice(0, 8);
    }
  };

  const filteredSkills = getFilteredSkills();

  const getOverallScoreStatus = () => {
    if (overall_score >= 80) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (overall_score >= 60) return { text: 'Good', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getIconForRole = (roleName: string) => {
    const role = roleName.toLowerCase();
    if (role.includes('frontend') || role.includes('web')) return <Monitor className="w-4 h-4" />;
    if (role.includes('backend')) return <Database className="w-4 h-4" />;
    if (role.includes('design')) return <Palette className="w-4 h-4" />;
    if (role.includes('intern')) return <Code className="w-4 h-4" />;
    return <Briefcase className="w-4 h-4" />;
  };

  const getMatchLevel = (matchPercent: string) => {
    const percent = parseFloat(matchPercent);
    if (percent >= 80) return 'high';
    if (percent >= 60) return 'medium';
    return 'low';
  };

  const status = getOverallScoreStatus();

  return (
    <div className="w-full mx-auto max-w-7xl">
      {/* Overall Score */}
      <div className={`p-4 sm:p-6 rounded-lg ${status.bg} border border-gray-200`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className={`w-6 h-6 sm:w-8 sm:h-8 ${status.color}`} />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{overall_score}/100</h2>
              <p className={`text-base sm:text-lg font-semibold ${status.color}`}>{status.text}</p>
            </div>
          </div>
          <div className="flex-1 w-full sm:ml-8">
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${overall_score >= 80 ? 'bg-green-500' :
                  overall_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                style={{ width: `${overall_score}%` }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Overall Career Readiness Score</p>
          </div>
        </div>
      </div>

      {/* Skill Proficiency Map and Career Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
        {/* Skill Proficiency Map */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-semibold">Skill Proficiency Map</h2>
              <p className="text-sm sm:text-base text-gray-600">Based on your assessment results</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full self-start sm:self-center">
              <CheckCircle size={16} />
              <span className="text-sm">Assessment Completed</span>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="relative flex justify-center" style={{ height: '280px' }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <svg width="260" height="260" viewBox="0 0 300 300" className="overflow-visible w-full h-full max-w-xs sm:max-w-sm">
                  {/* Grid circles */}
                  <circle cx="150" cy="150" r="120" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  <circle cx="150" cy="150" r="90" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  <circle cx="150" cy="150" r="60" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                  <circle cx="150" cy="150" r="30" fill="none" stroke="#e5e7eb" strokeWidth="1" />

                  {/* Grid lines */}
                  {Array.from({ length: filteredSkills.length }, (_, i) => {
                    const angle = (i * (360 / filteredSkills.length)) * (Math.PI / 180);
                    const x2 = 150 + Math.cos(angle - Math.PI / 2) * 120;
                    const y2 = 150 + Math.sin(angle - Math.PI / 2) * 120;
                    return (
                      <line
                        key={i}
                        x1="150"
                        y1="150"
                        x2={x2}
                        y2={y2}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Data points and labels */}
                  {filteredSkills.map((skill, index) => {
                    const angle = (index * (360 / filteredSkills.length)) * (Math.PI / 180);
                    const userRadius = (skill.score ? (skill.score / 100) * 120 : 0);

                    const userX = 150 + Math.cos(angle - Math.PI / 2) * userRadius;
                    const userY = 150 + Math.sin(angle - Math.PI / 2) * userRadius;

                    const labelX = 150 + Math.cos(angle - Math.PI / 2) * 140;
                    const labelY = 150 + Math.sin(angle - Math.PI / 2) * 140;

                    return (
                      <g key={skill.skill}>
                        {/* User score point */}
                        <circle cx={userX} cy={userY} r="4" fill="#3b82f6" />
                        {/* Label */}
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-medium fill-gray-700"
                        >
                          {skill.skill}
                        </text>
                      </g>
                    );
                  })}

                  {/* Connecting lines for user scores */}
                  {filteredSkills.length > 0 && (
                    <polygon
                      points={filteredSkills.map((skill, index) => {
                        const angle = (index * (360 / filteredSkills.length)) * (Math.PI / 180);
                        const radius = (skill.score ? (skill.score / 100) * 120 : 0);
                        const x = 150 + Math.cos(angle - Math.PI / 2) * radius;
                        const y = 150 + Math.sin(angle - Math.PI / 2) * radius;
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="rgba(59, 130, 246, 0.1)"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  )}
                </svg>

                <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-blue-500 rounded"></div>
                    <span className="text-sm">Your Skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto">
            {[
              { key: 'technical', label: 'Technical Skills', color: 'blue' },
              { key: 'soft', label: 'Soft Skills', color: 'purple' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'technical' | 'soft')}
                className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab.key
                  ? `bg-${tab.color}-100 text-${tab.color}-800`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Career Suggestions */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Career Suggestions</h3>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Suitable Roles</p>
          </div>

          <div className="space-y-3">
            {career_suggestions.suggestions.map((suggestion, index) => {
              const matchLevel = getMatchLevel(suggestion.match_percent);

              return (
                <div
                  key={index}
                  className={`group transition-all duration-200 p-3 sm:p-4 rounded-lg border ${matchLevel === 'high' ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' :
                    matchLevel === 'medium' ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' :
                      'bg-orange-50 border-orange-200 hover:bg-orange-100'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <div className={`transition-colors ${matchLevel === 'high' ? 'text-emerald-600' :
                        matchLevel === 'medium' ? 'text-amber-600' :
                          'text-orange-600'
                        }`}>
                        {getIconForRole(suggestion.role_name)}
                      </div>
                      <span className="font-medium text-gray-900 text-sm leading-relaxed">
                        {suggestion.role_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${matchLevel === 'high' ? 'bg-emerald-500' :
                        matchLevel === 'medium' ? 'bg-amber-500' :
                          'bg-orange-500'
                        }`} />
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${matchLevel === 'high' ? 'bg-emerald-100 text-emerald-800' :
                        matchLevel === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                        {suggestion.match_percent} Match
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Based on your skill assessment results
            </p>
          </div>
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mt-4 sm:mt-8">
        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" size={20} />
            <h3 className="text-lg sm:text-xl font-bold">Strengths</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {career_suggestions.strengths.map((strength, index) => (
              <div key={index} className="p-3 sm:p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">{strength.skill}</h4>
                <p className="text-green-700 text-sm">{strength.strength_point}</p>
              </div>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg p-4 sm:p-6 shadow-sm'>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-400" size={20} />
            <h3 className="text-lg sm:text-xl font-bold">Improvement Areas</h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {career_suggestions.improvement_areas.map((improvement, index) => (
              <div key={index} className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">{improvement.skill}</h4>
                <p className="text-orange-700 text-sm">{improvement.improvement_point}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Tips */}
      <div className="mt-4 sm:mt-8 p-4 sm:p-6 bg-blue-50 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-3">AI TIPS</h3>
        <p className="text-gray-700 mb-3 text-sm sm:text-base">Based on your profile, consider:</p>
        <ul className="space-y-1 text-sm text-gray-700">
          {career_suggestions.improvement_areas.slice(0, 4).map((area, index) => (
            <li key={index} className="break-words">• Focus on improving {area.skill} - {area.improvement_point}</li>
          ))}
        </ul>
      </div>

      {/* Report Actions */}
      {/* <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={downloadReport}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download size={20} />
          Download PDF Report
        </button>
        <button
          onClick={shareReport}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 size={20} />
          Share Report
        </button>
        <button
          onClick={onRetakeAssessment}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={20} />
          Take Assessment Again
        </button>
      </div> */}
    </div>
  );
};

export default CareerFeedback;